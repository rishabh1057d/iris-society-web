create function public.potw_storage_usage() returns jsonb language sql security invoker set search_path='' as $$
  select jsonb_build_object(
    'bytes',(select coalesce(sum(bytes),0) from public.potw_photo_versions where purged_at is null),
    'reserved',(select coalesce(sum(case when status='complete' then declared_bytes else reserved_bytes end),0) from public.potw_upload_sessions where cleanup_at is null)
  )
$$;
revoke all on function public.potw_storage_usage() from public,anon,authenticated;
grant execute on function public.potw_storage_usage() to service_role;
