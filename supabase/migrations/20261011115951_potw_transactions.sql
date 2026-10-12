create schema if not exists potw_private;
revoke all on schema potw_private from public,anon,authenticated;
grant usage on schema potw_private to service_role;
-- service_role cannot read Auth tables; this narrowly scoped private lookup can.
create function potw_private.approved_identity(p_actor uuid) returns uuid language sql stable security definer set search_path='' as $$
  select e.student_id from auth.users u
    join public.potw_student_emails e on e.email=lower(u.email)
    join public.potw_students s on s.id=e.student_id and s.active
    where u.id=p_actor and u.email_confirmed_at is not null
    and exists(select 1 from auth.identities i where i.user_id=u.id and i.provider='google')
$$;
revoke all on function potw_private.approved_identity(uuid) from public,anon,authenticated;
grant execute on function potw_private.approved_identity(uuid) to service_role;

create function public.potw_identity(p_actor uuid) returns uuid language plpgsql security invoker set search_path='' as $$
declare sid uuid; existing uuid;
begin
  sid:=potw_private.approved_identity(p_actor);
  if sid is null then raise exception 'Approved IRIS membership required' using errcode='PT403'; end if;
  insert into public.potw_student_accounts(user_id,student_id) values(p_actor,sid) on conflict(user_id) do nothing;
  select student_id into existing from public.potw_student_accounts where user_id=p_actor;
  if existing<>sid then raise exception 'Account identity changed; contact IRIS' using errcode='PT403'; end if;
  return sid;
end $$;

create function public.potw_rate_limit(p_key text,p_limit integer,p_seconds integer) returns void language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  insert into public.potw_rate_limits(key,window_start,count) values(p_key,clock_timestamp(),1)
  on conflict(key) do update set
    count=case when public.potw_rate_limits.window_start <= clock_timestamp()-make_interval(secs=>p_seconds) then 1 else public.potw_rate_limits.count+1 end,
    window_start=case when public.potw_rate_limits.window_start <= clock_timestamp()-make_interval(secs=>p_seconds) then clock_timestamp() else public.potw_rate_limits.window_start end
  returning count into n;
  if n>p_limit then raise exception 'Too many requests; try again later' using errcode='PT429'; end if;
end $$;

create function public.potw_tally(p_comp uuid) returns jsonb language sql security invoker set search_path='' as $$
  select coalesce(jsonb_object_agg(id,n),'{}'::jsonb) from (
    select s.id,count(v.id)::integer n from public.potw_submissions s
    left join public.potw_votes v on v.submission_id=s.id and v.competition_id=s.competition_id
    where s.competition_id=p_comp and s.review='shortlisted' and s.state='ready' group by s.id
  ) t
$$;

create function public.potw_finalize(p_comp uuid,p_actor uuid default null,p_choice uuid default null,p_reason text default null,p_no_award boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare c public.potw_competitions; r public.potw_results; tally jsonb; top_score integer; top_ids uuid[]; finalists integer; winner uuid; outcome text;
begin
  select * into c from public.potw_competitions where id=p_comp for update;
  if c.id is null then raise exception 'Competition not found' using errcode='PT404'; end if;
  select * into r from public.potw_results where competition_id=p_comp;
  if r.competition_id is not null then return to_jsonb(r); end if;
  if c.status<>'voting_closed' or clock_timestamp()<c.voting_close_at then raise exception 'Voting has not concluded' using errcode='PT409'; end if;
  tally:=public.potw_tally(p_comp); select count(*) into finalists from jsonb_object_keys(tally);
  select max(value::integer) into top_score from jsonb_each_text(tally);
  select array_agg(key::uuid order by key) into top_ids from jsonb_each_text(tally) where value::integer=top_score;
  if finalists=1 and c.voting_skipped then winner:=top_ids[1]; outcome:='sole_finalist';
  elsif top_score>0 and cardinality(top_ids)=1 then
    winner:=top_ids[1]; outcome:='winner';
    if p_choice is not null and p_choice<>winner then raise exception 'Only the highest-scoring photo can win' using errcode='PT409'; end if;
    if p_no_award then raise exception 'A valid winning vote exists' using errcode='PT409'; end if;
  elsif p_actor is null then return null;
  else
    if length(btrim(coalesce(p_reason,'')))<5 then raise exception 'A decision reason is required' using errcode='PT400'; end if;
    if coalesce(top_score,0)>0 then
      if p_no_award or p_choice is null or not(p_choice=any(top_ids)) then raise exception 'Choose a tied top-scoring photo' using errcode='PT409'; end if;
      winner:=p_choice; outcome:='tie_break';
    elsif p_no_award then winner:=null; outcome:='no_award';
    else
      if p_choice is null or not(tally ? p_choice::text) then raise exception 'Choose a shortlisted photo or no award' using errcode='PT409'; end if;
      winner:=p_choice; outcome:='no_votes';
    end if;
  end if;
  insert into public.potw_results(competition_id,winner_submission_id,outcome,reason,tally,finalized_by)
    values(p_comp,winner,outcome,p_reason,tally,p_actor) returning * into r;
  update public.potw_competitions set status='completed',updated_at=clock_timestamp() where id=p_comp;
  insert into public.potw_audit_log(competition_id,actor_id,action,details) values(p_comp,p_actor,'finalized',jsonb_build_object('winner',winner,'outcome',outcome,'reason',p_reason));
  return to_jsonb(r);
end $$;

create function public.potw_advance(p_comp uuid default null) returns void language plpgsql security invoker set search_path='' as $$
declare c public.potw_competitions; n integer; stamp timestamptz; before_status text;
begin
  for c in select * from public.potw_competitions where (p_comp is null or id=p_comp) and status not in ('draft','completed','archived') order by id for update loop
    stamp:=clock_timestamp(); before_status:=c.status;
    if c.status='scheduled' and stamp>=c.submissions_open_at then c.status:='submissions_open'; end if;
    if c.status='submissions_open' and stamp>=c.submissions_close_at then c.status:='review'; end if;
    if c.status='review' and c.shortlist_confirmed_at is not null and stamp>=c.voting_open_at then
      select count(*) into n from public.potw_submissions where competition_id=c.id and review='shortlisted' and state='ready';
      if n>0 then
        c.locked_at:=coalesce(c.locked_at,stamp); c.voting_skipped:=(n=1);
        if n>=2 then c.status:='voting_open'; end if;
        if stamp>=c.voting_close_at then c.status:='voting_closed'; end if;
      end if;
    end if;
    if c.status='voting_open' and stamp>=c.voting_close_at then c.status:='voting_closed'; end if;
    update public.potw_competitions set status=c.status,locked_at=c.locked_at,voting_skipped=c.voting_skipped,updated_at=stamp where id=c.id and (status,locked_at,voting_skipped) is distinct from (c.status,c.locked_at,c.voting_skipped);
    if before_status<>c.status then insert into public.potw_audit_log(competition_id,action,details) values(c.id,'automatic_transition',jsonb_build_object('from',before_status,'to',c.status)); end if;
    if c.status='voting_closed' then perform public.potw_finalize(c.id); end if;
  end loop;
end $$;

create function public.potw_cast_vote(p_actor uuid,p_comp uuid,p_submission uuid) returns uuid language plpgsql security invoker set search_path='' as $$
declare sid uuid; c public.potw_competitions; entry public.potw_submissions; result uuid;
begin
  perform public.potw_advance(p_comp);
  select * into c from public.potw_competitions where id=p_comp for update;
  sid:=public.potw_identity(p_actor);
  if c.id is null then raise exception 'Competition not found' using errcode='PT404'; end if;
  if c.status<>'voting_open' or clock_timestamp()<c.voting_open_at or clock_timestamp()>=c.voting_close_at or c.voting_skipped then raise exception 'Voting is closed' using errcode='PT409'; end if;
  select * into entry from public.potw_submissions where id=p_submission and competition_id=p_comp;
  if entry.id is null or entry.review<>'shortlisted' or entry.state<>'ready' then raise exception 'Photo is not eligible' using errcode='PT400'; end if;
  if entry.student_id=sid then raise exception 'You cannot vote for your own photograph' using errcode='PT403'; end if;
  perform public.potw_rate_limit('vote:'||sid,20,60);
  insert into public.potw_votes(competition_id,student_id,submission_id,actor_id) values(p_comp,sid,p_submission,p_actor) returning id into result;
  return result;
exception when unique_violation then raise exception 'You have already voted' using errcode='PT409';
end $$;

create function public.potw_edit_submission(p_actor uuid,p_id uuid,p_title text,p_caption text,p_withdraw boolean default false) returns void language plpgsql security invoker set search_path='' as $$
declare entry public.potw_submissions; c public.potw_competitions; sid uuid;
begin
  select * into entry from public.potw_submissions where id=p_id;
  if entry.id is null then raise exception 'Submission not found' using errcode='PT404'; end if;
  perform public.potw_advance(entry.competition_id);
  select * into c from public.potw_competitions where id=entry.competition_id for update;
  sid:=public.potw_identity(p_actor);
  if sid<>entry.student_id then raise exception 'Submission access denied' using errcode='PT403'; end if;
  if c.status<>'submissions_open' or c.locked_at is not null or clock_timestamp()>=c.submissions_close_at then raise exception 'Submissions are locked' using errcode='PT409'; end if;
  perform public.potw_rate_limit('mutation:'||sid,20,60);
  update public.potw_submissions set title=case when p_withdraw then title else p_title end,caption=case when p_withdraw then caption else p_caption end,state=case when p_withdraw then 'withdrawn' else state end,review='pending',rejection_reason=null,updated_at=clock_timestamp() where id=p_id;
end $$;

create function public.potw_create_upload(p_actor uuid,p_comp uuid,p_purpose text,p_bytes bigint,p_type text,p_title text,p_caption text,p_budget bigint)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare sid uuid; c public.potw_competitions; u public.potw_upload_sessions; occupied bigint; n integer; upload_id uuid:=gen_random_uuid(); expected uuid;
begin
  -- Serialize reservations before competition locks to keep quota enforcement atomic.
  perform pg_advisory_xact_lock(47190001);
  perform public.potw_advance(p_comp);
  select * into c from public.potw_competitions where id=p_comp for update;
  if c.id is null then raise exception 'Competition not found' using errcode='PT404'; end if;
  if p_purpose='submission' then
    sid:=public.potw_identity(p_actor);
    if c.status<>'submissions_open' or c.locked_at is not null or clock_timestamp()>=c.submissions_close_at then raise exception 'Submissions are closed' using errcode='PT409'; end if;
    select current_version_id into expected from public.potw_submissions where competition_id=p_comp and student_id=sid;
    select count(*) into n from public.potw_upload_sessions where student_id=sid and created_at>=clock_timestamp()-interval '1 day';
    if n>=5 then raise exception 'Daily upload limit reached' using errcode='PT429'; end if;
  elsif p_purpose='banner' then
    if c.locked_at is not null or c.status in ('completed','archived','voting_closed') then raise exception 'Competition is locked' using errcode='PT409'; end if;
  else raise exception 'Invalid upload purpose' using errcode='PT400'; end if;
  perform public.potw_rate_limit('mutation:'||coalesce(sid,p_actor),20,60);
  update public.potw_upload_sessions set status='expired' where status in ('pending','processing') and expires_at<clock_timestamp() and (lease_until is null or lease_until<clock_timestamp());
  select coalesce(sum(bytes),0) into occupied from public.potw_photo_versions where purged_at is null;
  select occupied+coalesce(sum(case when status='complete' then declared_bytes else reserved_bytes end),0) into occupied from public.potw_upload_sessions where cleanup_at is null;
  if occupied+2*p_bytes+6291456>p_budget then raise exception 'Storage budget reached; contact IRIS' using errcode='PT429'; end if;
  insert into public.potw_upload_sessions(id,competition_id,student_id,actor_id,purpose,staging_key,declared_bytes,reserved_bytes,content_type,title,caption,expected_version_id,expires_at)
    values(upload_id,p_comp,sid,p_actor,p_purpose,'staging/'||upload_id,p_bytes,2*p_bytes+6291456,p_type,p_title,p_caption,expected,
      least(clock_timestamp()+interval '5 minutes',case when p_purpose='submission' then c.submissions_close_at else clock_timestamp()+interval '5 minutes' end)) returning * into u;
  return to_jsonb(u);
exception when unique_violation then raise exception 'An upload is already pending; complete it or wait for expiration' using errcode='PT409';
end $$;

create function public.potw_claim_upload(p_actor uuid,p_id uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare u public.potw_upload_sessions; c public.potw_competitions;
begin
  select * into u from public.potw_upload_sessions where id=p_id;
  if u.id is null or u.actor_id<>p_actor then raise exception 'Upload not found' using errcode='PT404'; end if;
  select * into c from public.potw_competitions where id=u.competition_id for update;
  select * into u from public.potw_upload_sessions where id=p_id for update;
  if u.purpose='submission' and public.potw_identity(p_actor)<>u.student_id then raise exception 'Upload ownership changed' using errcode='PT403'; end if;
  if u.status='complete' then return to_jsonb(u); end if;
  if u.expires_at<=clock_timestamp() or u.status in ('failed','expired') then raise exception 'Upload expired; choose the photo again' using errcode='PT409'; end if;
  if u.purpose='submission' and (c.status<>'submissions_open' or clock_timestamp()>=c.submissions_close_at or c.locked_at is not null) then raise exception 'Submissions are closed' using errcode='PT409'; end if;
  if u.status='processing' and u.lease_until>clock_timestamp() then raise exception 'Upload is already processing' using errcode='PT409'; end if;
  u.lease_id:=gen_random_uuid();
  update public.potw_upload_sessions set status='processing',lease_id=u.lease_id,processing_versions=array_append(processing_versions,u.lease_id),lease_until=clock_timestamp()+interval '2 minutes' where id=p_id returning * into u;
  return to_jsonb(u);
end $$;

create function public.potw_complete_upload(p_actor uuid,p_id uuid,p_lease uuid,p_photo jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare u public.potw_upload_sessions; c public.potw_competitions; entry public.potw_submissions; version uuid:=p_lease;
begin
  select * into u from public.potw_upload_sessions where id=p_id;
  if u.id is null or u.actor_id<>p_actor then raise exception 'Upload not found' using errcode='PT404'; end if;
  select * into c from public.potw_competitions where id=u.competition_id for update;
  select * into u from public.potw_upload_sessions where id=p_id for update;
  if u.status='complete' then return to_jsonb(u); end if;
  if u.status<>'processing' or u.lease_id<>p_lease or u.lease_until<=clock_timestamp() then raise exception 'Processing lease expired' using errcode='PT409'; end if;
  if u.purpose='submission' then
    if public.potw_identity(p_actor)<>u.student_id then raise exception 'Upload ownership changed' using errcode='PT403'; end if;
    if c.status<>'submissions_open' or c.locked_at is not null or clock_timestamp()>=c.submissions_close_at then raise exception 'Submissions are closed' using errcode='PT409'; end if;
    select * into entry from public.potw_submissions where competition_id=c.id and student_id=u.student_id for update;
    if entry.current_version_id is distinct from u.expected_version_id then raise exception 'Submission changed during upload' using errcode='PT409'; end if;
    if entry.id is null then
      insert into public.potw_submissions(competition_id,student_id,created_by,title,caption) values(c.id,u.student_id,p_actor,u.title,u.caption) returning * into entry;
    end if;
  elsif c.locked_at is not null or c.status in ('completed','archived','voting_closed') then raise exception 'Competition is locked' using errcode='PT409'; end if;
  if (p_photo->>'bytes')::bigint>u.reserved_bytes-u.declared_bytes then raise exception 'Processed image exceeds reserved storage' using errcode='PT400'; end if;
  insert into public.potw_photo_versions(id,competition_id,submission_id,created_by,original_key,display_key,thumbnail_key,bytes,width,height,sha256,ai_evidence)
    values(version,c.id,entry.id,p_actor,p_photo->>'original_key',p_photo->>'display_key',p_photo->>'thumbnail_key',(p_photo->>'bytes')::bigint,(p_photo->>'width')::integer,(p_photo->>'height')::integer,p_photo->>'sha256',p_photo->'ai_evidence');
  if u.purpose='submission' then
    update public.potw_submissions set title=u.title,caption=u.caption,state='ready',review='pending',rejection_reason=null,current_version_id=version,updated_at=clock_timestamp() where id=entry.id;
  else update public.potw_competitions set banner_version_id=version,updated_at=clock_timestamp() where id=c.id; end if;
  update public.potw_upload_sessions set status='complete',version_id=version where id=p_id returning * into u;
  return to_jsonb(u);
end $$;

create function public.potw_admin_roster(p_actor uuid,p_rows jsonb) returns integer language plpgsql security invoker set search_path='' as $$
declare item jsonb; sid uuid; existing uuid; n integer:=0;
begin
  perform pg_advisory_xact_lock(47190002);
  for item in select value from jsonb_array_elements(p_rows) loop
    insert into public.potw_students(student_id,display_name,approved_by) values(item->>'student_id',item->>'display_name',p_actor)
    on conflict(student_id) do update set display_name=excluded.display_name returning id into sid;
    select student_id into existing from public.potw_student_emails where email=item->>'email';
    if existing is not null and existing<>sid then raise exception 'Email already belongs to another student' using errcode='PT409'; end if;
    insert into public.potw_student_emails(email,student_id) values(item->>'email',sid) on conflict(email) do nothing;
    n:=n+1;
  end loop;
  insert into public.potw_audit_log(actor_id,action,details) values(p_actor,'roster_import',jsonb_build_object('rows',n));
  return n;
end $$;

create function public.potw_admin_action(p_actor uuid,p_action text,p_comp uuid,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare c public.potw_competitions; target text; n integer; sid uuid;
begin
  -- Admin authorization is enforced by requireAdmin before this service-only RPC.
  perform pg_advisory_xact_lock(47190003);
  if p_action='revoke_student' or p_action='approve_student' then
    update public.potw_students set active=(p_action='approve_student') where id=(p_data->>'student_id')::uuid returning id into sid;
    if sid is null then raise exception 'Student not found' using errcode='PT404'; end if;
    insert into public.potw_audit_log(actor_id,action,details) values(p_actor,p_action,jsonb_build_object('student',sid)); return jsonb_build_object('success',true);
  end if;
  if p_action='create' then
    insert into public.potw_competitions(theme,description,rules,submissions_open_at,submissions_close_at,voting_open_at,voting_close_at,featured,created_by)
      values(p_data->>'theme',p_data->>'description',p_data->>'rules',(p_data->>'submissions_open_at')::timestamptz,(p_data->>'submissions_close_at')::timestamptz,(p_data->>'voting_open_at')::timestamptz,(p_data->>'voting_close_at')::timestamptz,(p_data->>'featured')::boolean,p_actor) returning * into c;
  else
    perform public.potw_advance(p_comp);
    select * into c from public.potw_competitions where id=p_comp for update;
    if c.id is null then raise exception 'Competition not found' using errcode='PT404'; end if;
    if p_action='update' then
      if c.locked_at is not null or c.status in ('voting_closed','completed','archived') then raise exception 'Competition is locked' using errcode='PT409'; end if;
      if c.status<>'draft' and ((p_data->>'submissions_open_at')::timestamptz<>c.submissions_open_at or (p_data->>'submissions_close_at')::timestamptz<>c.submissions_close_at) then raise exception 'Use manual submission transitions to change published submission deadlines' using errcode='PT409'; end if;
      if (p_data->>'banner_version_id') is not null and not exists(select 1 from public.potw_photo_versions where id=(p_data->>'banner_version_id')::uuid and competition_id=c.id and submission_id is null and purged_at is null) then raise exception 'Invalid banner' using errcode='PT400'; end if;
      if c.published_at is not null and (p_data->>'featured')::boolean then update public.potw_competitions set featured=false where featured and published_at is not null and id<>c.id; end if;
      update public.potw_competitions set theme=p_data->>'theme',description=p_data->>'description',rules=p_data->>'rules',submissions_open_at=(p_data->>'submissions_open_at')::timestamptz,submissions_close_at=(p_data->>'submissions_close_at')::timestamptz,voting_open_at=(p_data->>'voting_open_at')::timestamptz,voting_close_at=(p_data->>'voting_close_at')::timestamptz,featured=(p_data->>'featured')::boolean,banner_version_id=(p_data->>'banner_version_id')::uuid,shortlist_confirmed_at=null,updated_at=clock_timestamp() where id=c.id;
    elsif p_action='review' then
      if c.status<>'review' or c.locked_at is not null or clock_timestamp()>=c.voting_open_at then raise exception 'Review is locked; adjust the voting schedule first' using errcode='PT409'; end if;
      target:=p_data->>'review'; if target not in ('pending','shortlisted','rejected') then raise exception 'Invalid review status' using errcode='PT400'; end if;
      update public.potw_submissions set review=target,rejection_reason=p_data->>'reason' where id=(p_data->>'submission_id')::uuid and competition_id=c.id and state='ready';
      if not found then raise exception 'Eligible submission not found' using errcode='PT404'; end if;
      update public.potw_competitions set shortlist_confirmed_at=null where id=c.id;
    elsif p_action='confirm_shortlist' then
      if c.status<>'review' or c.locked_at is not null or clock_timestamp()>=c.voting_open_at then raise exception 'Shortlist confirmation is closed' using errcode='PT409'; end if;
      select count(*) into n from public.potw_submissions where competition_id=c.id and state='ready' and review='shortlisted';
      if n=0 then raise exception 'Shortlist at least one photograph' using errcode='PT409'; end if;
      update public.potw_competitions set shortlist_confirmed_at=clock_timestamp(),voting_skipped=(n=1) where id=c.id;
    elsif p_action='finalize' then return public.potw_finalize(c.id,p_actor,(p_data->>'submission_id')::uuid,p_data->>'reason',coalesce((p_data->>'no_award')::boolean,false));
    elsif p_action='transition' then
      target:=p_data->>'target';
      if target='scheduled' and c.status='draft' then
        if c.featured then update public.potw_competitions set featured=false where featured and published_at is not null and id<>c.id; end if;
        update public.potw_competitions set status='scheduled',published_at=clock_timestamp() where id=c.id;
      elsif target='submissions_open' and c.status='scheduled' and clock_timestamp()<c.submissions_close_at then update public.potw_competitions set status=target,submissions_open_at=least(clock_timestamp(),submissions_open_at) where id=c.id;
      elsif target='review' and c.status='submissions_open' then update public.potw_competitions set status=target,submissions_close_at=clock_timestamp() where id=c.id;
      elsif target='voting_open' and c.status='review' and c.shortlist_confirmed_at is not null and clock_timestamp()<c.voting_close_at then update public.potw_competitions set voting_open_at=greatest(clock_timestamp(),submissions_close_at) where id=c.id;
      elsif target='voting_closed' and ((c.status='voting_open') or (c.status='review' and c.locked_at is not null and c.voting_skipped)) then update public.potw_competitions set status=target,voting_close_at=clock_timestamp() where id=c.id;
      elsif target='voting_closed' and c.status='review' and c.shortlist_confirmed_at is null then update public.potw_competitions set status=target,voting_close_at=greatest(clock_timestamp(),voting_open_at+interval '1 microsecond') where id=c.id;
      elsif target='archived' and c.status='completed' then update public.potw_competitions set status=target where id=c.id;
      else raise exception 'Transition is not permitted' using errcode='PT409'; end if;
      if c.status<>'draft' and length(btrim(coalesce(p_data->>'reason','')))<5 then raise exception 'Manual transitions need a reason' using errcode='PT400'; end if;
    else raise exception 'Unknown admin action' using errcode='PT400'; end if;
  end if;
  insert into public.potw_audit_log(competition_id,actor_id,action,details) values(c.id,p_actor,p_action,p_data-'caption'-'description');
  perform public.potw_advance(c.id);
  select * into c from public.potw_competitions where id=c.id;
  return to_jsonb(c);
end $$;

do $$ declare f record; begin
  for f in select oid::regprocedure signature from pg_proc where pronamespace='public'::regnamespace and proname like 'potw_%' loop
    execute format('revoke all on function %s from public,anon,authenticated',f.signature);
    execute format('grant execute on function %s to service_role',f.signature);
  end loop;
end $$;
