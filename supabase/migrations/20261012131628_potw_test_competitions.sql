-- Existing competitions remain production records. Preview entries share no results or featured state.
alter table public.potw_competitions add column is_test boolean not null default false;
drop index public.potw_one_featured;
create unique index potw_one_featured on public.potw_competitions(is_test) where featured and published_at is not null;

create or replace function public.potw_admin_action(p_actor uuid,p_action text,p_comp uuid,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
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
    insert into public.potw_competitions(theme,description,rules,submissions_open_at,submissions_close_at,voting_open_at,voting_close_at,featured,created_by,is_test)
      values(p_data->>'theme',p_data->>'description',p_data->>'rules',(p_data->>'submissions_open_at')::timestamptz,(p_data->>'submissions_close_at')::timestamptz,(p_data->>'voting_open_at')::timestamptz,(p_data->>'voting_close_at')::timestamptz,(p_data->>'featured')::boolean,p_actor,coalesce((p_data->>'is_test')::boolean,false)) returning * into c;
  else
    perform public.potw_advance(p_comp);
    select * into c from public.potw_competitions where id=p_comp for update;
    if c.id is null then raise exception 'Competition not found' using errcode='PT404'; end if;
    if p_action='update' then
      if c.locked_at is not null or c.status in ('voting_closed','completed','archived') then raise exception 'Competition is locked' using errcode='PT409'; end if;
      if c.status<>'draft' and ((p_data->>'submissions_open_at')::timestamptz<>c.submissions_open_at or (p_data->>'submissions_close_at')::timestamptz<>c.submissions_close_at) then raise exception 'Use manual submission transitions to change published submission deadlines' using errcode='PT409'; end if;
      if (p_data->>'banner_version_id') is not null and not exists(select 1 from public.potw_photo_versions where id=(p_data->>'banner_version_id')::uuid and competition_id=c.id and submission_id is null and purged_at is null) then raise exception 'Invalid banner' using errcode='PT400'; end if;
      if c.published_at is not null and (p_data->>'featured')::boolean then update public.potw_competitions set featured=false where featured and published_at is not null and id<>c.id and is_test=c.is_test; end if;
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
        if c.featured then update public.potw_competitions set featured=false where featured and published_at is not null and id<>c.id and is_test=c.is_test; end if;
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
