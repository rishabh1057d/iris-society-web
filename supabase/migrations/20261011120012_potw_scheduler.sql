create function public.potw_retention_candidates() returns setof public.potw_photo_versions language sql security invoker set search_path='' as $$
  select v.* from public.potw_photo_versions v
  join public.potw_results r on r.competition_id=v.competition_id
  join public.potw_competitions c on c.id=v.competition_id
  left join public.potw_submissions winner on winner.id=r.winner_submission_id
  where v.purged_at is null and r.finalized_at<clock_timestamp()-interval '1 year'
    and v.id is distinct from winner.current_version_id and v.id is distinct from c.banner_version_id
  order by v.created_at limit 30
$$;
revoke all on function public.potw_retention_candidates() from public,anon,authenticated;
grant execute on function public.potw_retention_candidates() to service_role;

create extension if not exists pg_cron;
select cron.schedule('iris-potw-lifecycle','* * * * *','select public.potw_advance();');
select cron.schedule('iris-potw-housekeeping','17 1 * * *', $job$
  delete from public.potw_rate_limits where window_start<clock_timestamp()-interval '2 days';
  delete from cron.job_run_details where jobid in (select jobid from cron.job where jobname in ('iris-potw-lifecycle','iris-potw-housekeeping')) and end_time<clock_timestamp()-interval '30 days';
$job$);
