-- Event Configuration Table
CREATE TABLE event_config (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_description TEXT NOT NULL,
  poster_image TEXT,
  registration_open BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMPTZ,
  deadline_text TEXT,
  closed_message TEXT,
  success_message TEXT,
  already_registered_message TEXT,
  form_fields JSONB DEFAULT '{"full_name": true, "gender": true, "contact_number": true, "current_level": true, "house": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create a partial unique index to ensure only one active config
CREATE UNIQUE INDEX idx_event_config_active 
ON event_config (is_active) 
WHERE is_active = true;

-- Add RLS policies
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the active config
CREATE POLICY "Anyone can view active event config"
ON event_config FOR SELECT
USING (is_active = true);

-- Only authenticated users can modify (you can restrict further to admin emails if needed)
CREATE POLICY "Authenticated users can modify event config"
ON event_config FOR ALL
USING (auth.role() = 'authenticated');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamp
CREATE TRIGGER update_event_config_updated_at
  BEFORE UPDATE ON event_config
  FOR EACH ROW
  EXECUTE FUNCTION update_event_config_updated_at();

-- Insert the current config as seed data
INSERT INTO event_config (
  event_name,
  event_description,
  poster_image,
  registration_open,
  registration_deadline,
  deadline_text,
  closed_message,
  success_message,
  already_registered_message,
  form_fields,
  is_active
) VALUES (
  'The Rishabh''s Event',
  'Register for The Director''s Spectrum — a team-based videography competition by IRIS Society x Pixel N Panels.',
  'https://fcsckgoncwylmtdxfofo.supabase.co/storage/v1/object/public/event-posters/event_poster_1772084760751.png',
  true,
  '2026-03-20T18:29:00.000Z'::timestamptz,
  'Registration closes on 20th March 2026',
  'Registration for this event is now closed. Stay tuned for future events!',
  'You have been successfully registered! We''ll reach out to you soon with more details.',
  'You are already registered for this event. See you there!',
  '{"full_name": true, "gender": true, "contact_number": true, "current_level": true, "house": true}'::jsonb,
  true
);