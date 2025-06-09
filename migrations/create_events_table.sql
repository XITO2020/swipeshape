-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" 
  ON public.events 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert events
CREATE POLICY "Allow authenticated users to insert events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users with service_role to manage all events
CREATE POLICY "Allow service_role users full access" 
  ON public.events 
  USING (auth.role() = 'service_role');
