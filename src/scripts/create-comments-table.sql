-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id UUID, -- Can be NULL for anonymous comments or linked to auth.users
    user_email TEXT, -- Email of the commenter
    user_name TEXT, -- Name of the commenter
    content TEXT NOT NULL, -- Comment body
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Optional rating (1-5 stars)
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE, -- Optional reference to article
    avatar_url TEXT, -- URL to user's avatar image
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
-- Anyone can read comments
CREATE POLICY "Anyone can read comments" 
  ON comments 
  FOR SELECT 
  USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert their own comments" 
  ON comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" 
  ON comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" 
  ON comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert sample comments
INSERT INTO comments (user_email, user_name, content, rating, article_id, created_at)
VALUES 
    ('sophie@example.com', 'Sophie Martin', 'Cet article m''a beaucoup aidé à comprendre les principes de base de la nutrition. Merci !', 5, 1, NOW() - INTERVAL '3 DAYS'),
    ('claire@example.com', 'Claire Dubois', 'Très instructif, j''aimerais voir plus de contenus comme celui-ci', 4, 1, NOW() - INTERVAL '2 DAYS'),
    ('marie@example.com', 'Marie Lambert', 'Les conseils sur la récupération m''ont vraiment aidée avec mon programme d''entraînement', 5, 2, NOW() - INTERVAL '1 DAY');
