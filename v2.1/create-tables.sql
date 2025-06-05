-- Create articles table
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_url TEXT,
  tiktok_url TEXT,
  instagram_url TEXT,
  related_articles INTEGER[]
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT
);

-- Add permissions for public access to articles and events
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public to view articles and events
CREATE POLICY "Anyone can view articles" 
ON articles FOR SELECT 
TO PUBLIC USING (true);

CREATE POLICY "Anyone can view events" 
ON events FOR SELECT 
TO PUBLIC USING (true);

-- Only authenticated users can create articles (admin functionality)
CREATE POLICY "Authenticated users can create articles" 
ON articles FOR INSERT 
TO authenticated USING (true);

-- Only authenticated users can update or delete their own articles
CREATE POLICY "Authenticated users can update their own articles" 
ON articles FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete their own articles" 
ON articles FOR DELETE 
TO authenticated USING (true);
