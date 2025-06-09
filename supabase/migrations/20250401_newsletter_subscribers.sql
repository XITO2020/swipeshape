-- Create newsletter_subscribers table
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_active BOOLEAN DEFAULT true,
  last_email_sent TIMESTAMP WITH TIME ZONE,
  unsubscribe_token UUID DEFAULT uuid_generate_v4()
);

-- Create RLS policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Allow public to subscribe" ON newsletter_subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow updates only through service role
CREATE POLICY "Allow service role to update" ON newsletter_subscribers
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create function to handle unsubscribe
CREATE OR REPLACE FUNCTION unsubscribe_newsletter(token UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE newsletter_subscribers
  SET is_active = false
  WHERE unsubscribe_token = token;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
