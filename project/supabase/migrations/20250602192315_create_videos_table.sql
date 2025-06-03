-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- Could be an IPFS CID or a direct URL
  thumbnail_url TEXT, -- Could be an IPFS CID or a direct URL
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Enable Row Level Security for videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos table

-- Allow public read access to all videos
CREATE POLICY "Anyone can view videos"
  ON videos
  FOR SELECT
  TO public
  USING (true);

-- Allow admin users to perform all operations on videos
CREATE POLICY "Admins can manage videos"
  ON videos
  FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%admin%')
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%admin%');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_videos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_videos_updated_at
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_videos_updated_at_column();
