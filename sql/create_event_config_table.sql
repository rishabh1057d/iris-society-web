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

-- Only active configuration is readable directly; all writes go through the server.
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE event_config FROM PUBLIC;
REVOKE ALL ON TABLE event_config FROM anon, authenticated;
GRANT SELECT ON TABLE event_config TO anon, authenticated;

-- Allow everyone to read the active config
CREATE POLICY "Anyone can view active event config"
ON event_config FOR SELECT
USING (is_active = true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

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
  'Development sample event',
  'A sample event for testing your own local setup. Replace this configuration through the admin tools.',
  NULL,
  false,
  NULL,
  'Registration is disabled for this sample event',
  'Registration for this event is now closed. Stay tuned for future events!',
  'You have been successfully registered! We''ll reach out to you soon with more details.',
  'You are already registered for this event. See you there!',
  '{"full_name": true, "gender": true, "contact_number": true, "current_level": true, "house": true}'::jsonb,
  true
);
