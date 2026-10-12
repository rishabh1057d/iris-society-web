create function pg_temp.expect_error(p_sql text,p_code text) returns void language plpgsql as $$
begin
  begin execute p_sql; exception when others then
    if sqlstate=p_code then return; end if;
    raise exception 'Expected %, received %: %',p_code,sqlstate,sqlerrm;
  end;
  raise exception 'Expected % but statement succeeded: %',p_code,p_sql;
end $$;

do $$ begin
  if has_table_privilege('anon','public.potw_students','SELECT') or has_table_privilege('authenticated','public.potw_votes','SELECT') then raise exception 'Private table grants exposed'; end if;
  if has_function_privilege('authenticated','public.potw_cast_vote(uuid,uuid,uuid)','EXECUTE') or has_function_privilege('anon','potw_private.approved_identity(uuid)','EXECUTE') then raise exception 'Privileged functions exposed'; end if;
end $$;
set local role service_role;
select public.potw_identity('10000000-0000-4000-8000-000000000001');
select public.potw_identity('10000000-0000-4000-8000-000000000003');
select pg_temp.expect_error($q$select public.potw_identity('10000000-0000-4000-8000-000000000004')$q$,'PT403');
update public.potw_competitions set voting_open_at=clock_timestamp()+interval '1 hour' where id='30000000-0000-4000-8000-000000000001';
select pg_temp.expect_error($q$select public.potw_cast_vote('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002')$q$,'PT409');
update public.potw_competitions set voting_open_at=clock_timestamp()-interval '1 hour' where id='30000000-0000-4000-8000-000000000001';
select pg_temp.expect_error($q$select public.potw_cast_vote('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001')$q$,'PT403');
select public.potw_cast_vote('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002');
select pg_temp.expect_error($q$select public.potw_cast_vote('10000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002')$q$,'PT409');
select pg_temp.expect_error($q$select public.potw_edit_submission('10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002','Stolen','',false)$q$,'PT403');
select pg_temp.expect_error($q$select public.potw_edit_submission('10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','Locked','',false)$q$,'PT409');
select pg_temp.expect_error($q$select public.potw_admin_action('10000000-0000-4000-8000-000000000001','review','30000000-0000-4000-8000-000000000001','{"submission_id":"40000000-0000-4000-8000-000000000001","review":"rejected"}')$q$,'PT409');

-- Unique leader auto-publication and idempotency.
update public.potw_competitions set voting_open_at=clock_timestamp()-interval '2 days',voting_close_at=clock_timestamp()-interval '1 day' where id='30000000-0000-4000-8000-000000000001';
select public.potw_advance('30000000-0000-4000-8000-000000000001');
do $$ begin
  if (select winner_submission_id from public.potw_results where competition_id='30000000-0000-4000-8000-000000000001')<>'40000000-0000-4000-8000-000000000002'::uuid then raise exception 'Wrong automatic winner'; end if;
end $$;
select public.potw_finalize('30000000-0000-4000-8000-000000000001');
select pg_temp.expect_error($q$select public.potw_cast_vote('10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001')$q$,'PT409');

-- Ownership, limits and upload replacement preserve the previous entry until commit.
do $$ declare u jsonb; claimed jsonb; entry_id uuid; first_version uuid; again jsonb; begin
  u:=public.potw_create_upload('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','submission',1024,'image/jpeg','Upload A','Caption',8000000000);
  perform pg_temp.expect_error(format('select public.potw_claim_upload(%L,%L)','10000000-0000-4000-8000-000000000002',u->>'id'),'PT404');
  perform pg_temp.expect_error($q$select public.potw_create_upload('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','submission',1024,'image/jpeg','Duplicate','',8000000000)$q$,'PT409');
  claimed:=public.potw_claim_upload('10000000-0000-4000-8000-000000000001',(u->>'id')::uuid);
  first_version:=(claimed->>'lease_id')::uuid;
  perform public.potw_complete_upload('10000000-0000-4000-8000-000000000001',(u->>'id')::uuid,first_version,jsonb_build_object('original_key','fixture/original1','display_key','fixture/display1','thumbnail_key','fixture/t1','bytes',2048,'width',100,'height',100,'sha256','fixture','ai_evidence','[]'::jsonb));
  select id into entry_id from public.potw_submissions where competition_id='30000000-0000-4000-8000-000000000002' and student_id='20000000-0000-4000-8000-000000000001';
  again:=public.potw_create_upload('10000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000002','submission',1024,'image/jpeg','Replacement','',8000000000);
  if (again->>'expected_version_id')::uuid<>first_version then raise exception 'Replacement lost previous version'; end if;
  if (select current_version_id from public.potw_submissions where id=entry_id)<>first_version then raise exception 'Pending replacement changed accepted entry'; end if;
  claimed:=public.potw_claim_upload('10000000-0000-4000-8000-000000000003',(again->>'id')::uuid);
  perform public.potw_complete_upload('10000000-0000-4000-8000-000000000003',(again->>'id')::uuid,(claimed->>'lease_id')::uuid,jsonb_build_object('original_key','fixture/original2','display_key','fixture/display2','thumbnail_key','fixture/t2','bytes',2048,'width',100,'height',100,'sha256','fixture','ai_evidence','[]'::jsonb));
  if (select count(*) from public.potw_submissions where competition_id='30000000-0000-4000-8000-000000000002')<>1 then raise exception 'Duplicate student submission'; end if;
  perform public.potw_edit_submission('10000000-0000-4000-8000-000000000001',entry_id,'Replacement','',true);
  if (select title from public.potw_submissions where id=entry_id)<>'Replacement' then raise exception 'Withdrawal removed metadata'; end if;
end $$;
reset role;

-- Ties and no-votes require a decision. Single-finalist publication is delayed.
do $$ declare cid uuid; sid uuid; result jsonb; begin
  cid:=gen_random_uuid();
  insert into public.potw_competitions(id,theme,description,rules,status,submissions_open_at,submissions_close_at,voting_open_at,voting_close_at,published_at,shortlist_confirmed_at)
    values(cid,'Sole finalist','Test','Test','review',clock_timestamp()-interval '3 days',clock_timestamp()-interval '2 days',clock_timestamp()-interval '1 day',clock_timestamp()+interval '1 day',clock_timestamp(),clock_timestamp());
  insert into public.potw_submissions(competition_id,student_id,created_by,title,review) values(cid,'20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Sole','shortlisted') returning id into sid;
  perform public.potw_advance(cid);
  if exists(select 1 from public.potw_results where competition_id=cid) then raise exception 'Sole finalist published early'; end if;
  perform pg_temp.expect_error(format('select public.potw_cast_vote(%L,%L,%L)','10000000-0000-4000-8000-000000000002',cid,sid),'PT409');
  update public.potw_competitions set voting_close_at=clock_timestamp()-interval '1 hour' where id=cid;
  perform public.potw_advance(cid);
  if (select outcome from public.potw_results where competition_id=cid)<>'sole_finalist' then raise exception 'Sole finalist missing'; end if;
  cid:=gen_random_uuid();
  insert into public.potw_competitions(id,theme,description,rules,status,submissions_open_at,submissions_close_at,voting_open_at,voting_close_at,published_at)
    values(cid,'No votes','Test','Test','voting_closed',clock_timestamp()-interval '4 days',clock_timestamp()-interval '3 days',clock_timestamp()-interval '2 days',clock_timestamp()-interval '1 day',clock_timestamp());
  result:=public.potw_finalize(cid);
  if result is not null then raise exception 'No votes auto-finalized'; end if;
  result:=public.potw_finalize(cid,'10000000-0000-4000-8000-000000000001',null,'No shortlisted entries',true);
  if result->>'outcome'<>'no_award' then raise exception 'No-award decision failed'; end if;
end $$;
do $$ declare cid uuid; a uuid; b uuid; decision jsonb; begin
  cid:=gen_random_uuid();
  insert into public.potw_competitions(id,theme,description,rules,status,submissions_open_at,submissions_close_at,voting_open_at,voting_close_at,published_at,shortlist_confirmed_at,locked_at)
    values(cid,'Tie fixture','Test','Test','voting_open',clock_timestamp()-interval '3 days',clock_timestamp()-interval '2 days',clock_timestamp()-interval '1 day',clock_timestamp()+interval '1 day',clock_timestamp(),clock_timestamp(),clock_timestamp());
  insert into public.potw_submissions(competition_id,student_id,created_by,title,review) values(cid,'20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Tie A','shortlisted') returning id into a;
  insert into public.potw_submissions(competition_id,student_id,created_by,title,review) values(cid,'20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Tie B','pending') returning id into b;
  perform pg_temp.expect_error(format('select public.potw_cast_vote(%L,%L,%L)','10000000-0000-4000-8000-000000000001',cid,b),'PT400');
  perform pg_temp.expect_error(format('select public.potw_cast_vote(%L,%L,%L)','10000000-0000-4000-8000-000000000001',cid,'40000000-0000-4000-8000-000000000002'),'PT400');
  update public.potw_submissions set review='shortlisted' where id=b;
  perform public.potw_cast_vote('10000000-0000-4000-8000-000000000001',cid,b);
  perform public.potw_cast_vote('10000000-0000-4000-8000-000000000002',cid,a);
  update public.potw_competitions set voting_close_at=clock_timestamp()-interval '1 second' where id=cid;
  perform public.potw_advance(cid);
  if exists(select 1 from public.potw_results where competition_id=cid) then raise exception 'Tie finalized without admin'; end if;
  perform pg_temp.expect_error(format('select public.potw_finalize(%L,%L,%L,%L,false)',cid,'10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002','Wrong competition winner'),'PT409');
  decision:=public.potw_finalize(cid,'10000000-0000-4000-8000-000000000001',a,'Admin tie-break fixture',false);
  if decision->>'outcome'<>'tie_break' then raise exception 'Tie-break failed'; end if;
  cid:=gen_random_uuid();
  insert into public.potw_competitions(id,theme,description,rules,status,submissions_open_at,submissions_close_at,voting_open_at,voting_close_at)
    values(cid,'No-vote choice','Test','Test','voting_closed',clock_timestamp()-interval '4 days',clock_timestamp()-interval '3 days',clock_timestamp()-interval '2 days',clock_timestamp()-interval '1 day');
  insert into public.potw_submissions(competition_id,student_id,created_by,title,review) values(cid,'20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','No votes A','shortlisted') returning id into a;
  insert into public.potw_submissions(competition_id,student_id,created_by,title,review) values(cid,'20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','No votes B','shortlisted');
  if public.potw_finalize(cid) is not null then raise exception 'No-vote winner chosen automatically'; end if;
  decision:=public.potw_finalize(cid,'10000000-0000-4000-8000-000000000001',a,'Explicit no-votes choice',false);
  if decision->>'outcome'<>'no_votes' then raise exception 'No-votes choice failed'; end if;
  update public.potw_students set active=false where id='20000000-0000-4000-8000-000000000002';
  perform pg_temp.expect_error($q$select public.potw_identity('10000000-0000-4000-8000-000000000002')$q$,'PT403');
end $$;
-- Saving featured drafts must not hide the published competition.
do $$ declare published uuid; draft jsonb; payload jsonb; begin
  published:=gen_random_uuid();
  insert into public.potw_competitions(id,theme,description,rules,status,featured,published_at,submissions_open_at,submissions_close_at,voting_open_at,voting_close_at)
    values(published,'Current featured','Test','Test','scheduled',true,clock_timestamp(),clock_timestamp()+interval '1 day',clock_timestamp()+interval '2 days',clock_timestamp()+interval '3 days',clock_timestamp()+interval '4 days');
  payload:=jsonb_build_object('theme','Next featured','description','Test','rules','Test','featured',true,'submissions_open_at',clock_timestamp()+interval '5 days','submissions_close_at',clock_timestamp()+interval '6 days','voting_open_at',clock_timestamp()+interval '7 days','voting_close_at',clock_timestamp()+interval '8 days');
  draft:=public.potw_admin_action('10000000-0000-4000-8000-000000000001','create',null,payload);
  if not (select featured from public.potw_competitions where id=published) then raise exception 'Draft hid current featured competition'; end if;
  perform public.potw_admin_action('10000000-0000-4000-8000-000000000001','transition',(draft->>'id')::uuid,'{"target":"scheduled"}');
  if (select featured from public.potw_competitions where id=published) then raise exception 'Publication did not switch featured competition'; end if;
end $$;
select pg_temp.expect_error($q$select public.potw_create_upload('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','submission',1024,'image/jpeg','Late','',8000000000)$q$,'PT409');
select pg_temp.expect_error($q$select public.potw_create_upload('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','banner',1024,'image/jpeg','Budget','',1)$q$,'PT429');
select pg_temp.expect_error($q$update public.potw_votes set student_id=student_id$q$,'P0001');
select pg_temp.expect_error($q$delete from public.potw_results$q$,'P0001');
-- Retention removes replaced versions after one year, never the winner's current image.
do $$ declare entry public.potw_submissions; begin
  select * into entry from public.potw_submissions where competition_id='30000000-0000-4000-8000-000000000002';
  insert into public.potw_results(competition_id,winner_submission_id,outcome,tally,finalized_at)
    values(entry.competition_id,entry.id,'winner','{}',clock_timestamp()-interval '2 years');
  if exists(select 1 from public.potw_retention_candidates() where id=entry.current_version_id) then raise exception 'Winner image selected for purge'; end if;
  if not exists(select 1 from public.potw_retention_candidates() where submission_id=entry.id and id<>entry.current_version_id) then raise exception 'Old replacement missing from retention'; end if;
end $$;
do $$ declare usage jsonb; actual bigint; begin
  usage:=public.potw_storage_usage();
  select coalesce(sum(bytes),0) into actual from public.potw_photo_versions where purged_at is null;
  if (usage->>'bytes')::bigint<>actual then raise exception 'Storage total is incorrect'; end if;
end $$;
select 'POTW transactional assertions passed' as result;
