-- Apply to an existing Supabase project before deploying the secured API.
-- Direct clients may read only the active event configuration. Registration
-- records and all writes are server-only via the service-role client.

BEGIN;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.event_registrations FROM PUBLIC;
REVOKE ALL ON TABLE public.event_registrations FROM anon, authenticated;

ALTER TABLE public.event_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.event_config FROM PUBLIC;
REVOKE ALL ON TABLE public.event_config FROM anon, authenticated;
GRANT SELECT ON TABLE public.event_config TO anon, authenticated;

-- Trigger execution needs no public RPC permissions.
ALTER FUNCTION public.update_event_config_updated_at() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.update_event_config_updated_at() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can modify event config" ON public.event_config;
DROP POLICY IF EXISTS "Anyone can view active event config" ON public.event_config;
CREATE POLICY "Anyone can view active event config"
  ON public.event_config FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Remove the sample's broad poster-bucket policies, without touching
-- same-named policies for unrelated storage buckets.
DO $$
DECLARE policy_record record;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname IN ('Authenticated upload', 'Authenticated update', 'Authenticated delete')
      AND (coalesce(qual, '') LIKE '%event-posters%'
        OR coalesce(with_check, '') LIKE '%event-posters%')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', policy_record.policyname);
  END LOOP;
END $$;

COMMIT;
