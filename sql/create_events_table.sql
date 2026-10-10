-- SQL migration to create the event_registrations table
-- Run this in the Supabase SQL editor or via psql using the service role

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email text NOT NULL,
  full_name text NOT NULL,
  gender text,
  contact_number text,
  current_level text,
  house text,
  event_name text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_email, event_name)
);

COMMENT ON TABLE public.event_registrations IS 'Event registrations for IRIS society';

-- Registration PII is accessible only through authenticated server routes.
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.event_registrations FROM PUBLIC;
REVOKE ALL ON TABLE public.event_registrations FROM anon, authenticated;

-- If the table already exists, run this to add the event_name column:
-- ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS event_name text;
-- ALTER TABLE public.event_registrations DROP CONSTRAINT IF EXISTS event_registrations_student_email_key;
-- ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_email_event_unique UNIQUE (student_email, event_name);

-- Create storage bucket for event posters (run once in Supabase SQL editor):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-posters', 'event-posters', true) ON CONFLICT DO NOTHING;
-- CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'event-posters');
-- Poster uploads use the admin API and service role; do not grant blanket
-- authenticated-user INSERT, UPDATE, or DELETE policies for this bucket.
