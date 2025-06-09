/*
  # Initial Schema for Swipe-Shape

  1. New Tables
    - `programs` - Stores fitness program details
      - `id` (serial, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `price` (numeric, not null)
      - `image_url` (text, not null)
      - `pdf_url` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `articles` - Stores blog articles
      - `id` (serial, primary key)
      - `title` (text, not null)
      - `content` (text, not null)
      - `author` (text, not null)
      - `image_url` (text)
      - `tiktok_url` (text)
      - `instagram_url` (text)
      - `related_articles` (integer array)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `comments` - Stores user comments and ratings
      - `id` (serial, primary key)
      - `user_id` (uuid, references auth.users)
      - `user_email` (text, not null)
      - `content` (text, not null)
      - `rating` (integer, not null)
      - `created_at` (timestamptz, default now())
    
    - `newsletters` - Stores newsletter subscriptions
      - `id` (serial, primary key)
      - `email` (text, unique, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all data
    - Add policies for authenticated users to create their own comments
    - Add policies for admin users to manage all data
*/

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  tiktok_url TEXT,
  instagram_url TEXT,
  related_articles INTEGER[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Create policies for programs
CREATE POLICY "Anyone can read programs" 
  ON programs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert programs" 
  ON programs 
  FOR INSERT 
  TO authenticated 
  USING (auth.jwt() ->> 'email' LIKE '%admin%');

CREATE POLICY "Only admins can update programs" 
  ON programs 
  FOR UPDATE 
  TO authenticated 
  USING (auth.jwt() ->> 'email' LIKE '%admin%');

CREATE POLICY "Only admins can delete programs" 
  ON programs 
  FOR DELETE 
  TO authenticated 
  USING (auth.jwt() ->> 'email' LIKE '%admin%');

-- Create policies for articles
CREATE POLICY "Anyone can read articles" 
  ON articles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert articles" 
  ON articles 
  FOR INSERT 
  TO authenticated 
  USING (auth.jwt() ->> 'email' LIKE '%admin%');

CREATE POLICY "Only admins can update articles" 
  ON articles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.jwt() ->> 'email' LIKE '%admin%');

CREATE POLICY "Only admins can delete articles" 
  ON articles 
  FOR DELETE 
  TO authenticated 
  USING (auth.jwt() ->> 'email' LIKE '%admin%');

-- Create policies for comments
CREATE POLICY "Anyone can read comments" 
  ON comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert their own comments" 
  ON comments 
  FOR INSERT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON comments 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON comments 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create policies for newsletters
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON newsletters 
  FOR INSERT 
  USING (true);

CREATE POLICY "Only admins can read newsletters" 
  ON newsletters 
  FOR SELECT 
  TO authenticated 
  USING (auth.jwt() ->> 'email' LIKE '%admin%');

-- Insert sample data for programs
INSERT INTO programs (title, description, price, image_url, pdf_url)
VALUES 
  (
    'Lean & Toned 8-Week Program',
    'Transform your body with our comprehensive 8-week program designed specifically for women who want to build lean muscle and reduce body fat. This program includes progressive strength training routines, HIIT cardio sessions, and detailed nutrition guidelines.',
    29.99,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://example.com/lean-toned-program.pdf'
  ),
  (
    'Strong Curves Workout Guide',
    'Build a stronger, shapelier lower body with our Strong Curves program. This 12-week guide focuses on glute development and overall lower body strength, with detailed exercise instructions, progression plans, and nutritional advice.',
    34.99,
    'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://example.com/strong-curves-guide.pdf'
  ),
  (
    'Full Body Strength & Confidence',
    'Gain strength, confidence, and a toned physique with our comprehensive full-body program. This 10-week guide includes strength training routines, mobility work, and progressive overload techniques to help you build muscle and boost your confidence.',
    39.99,
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    'https://example.com/strength-confidence-program.pdf'
  );

-- Insert sample articles
INSERT INTO articles (title, content, author, image_url, created_at)
VALUES 
  (
    'How to Build Lean Muscle Without Bulking Up',
    '<p>Many women avoid strength training because they fear getting "bulky," but building lean muscle is actually the key to achieving that toned, defined look. This article breaks down the science behind muscle building for women and provides practical tips for your training routine.</p><h2>The Science of Muscle Building</h2><p>Women naturally have lower levels of testosterone than men, which makes it much harder to build large, bulky muscles. Instead, strength training helps women develop lean, defined muscles that create shape and definition.</p><h2>Key Training Principles</h2><ul><li>Focus on compound movements like squats, deadlifts, and push-ups</li><li>Use moderate weights with higher repetitions (10-15 reps)</li><li>Incorporate progressive overload by gradually increasing weights</li><li>Include 2-3 strength training sessions per week</li><li>Complement with HIIT or steady-state cardio</li></ul><p>Remember, building lean muscle also increases your metabolic rate, helping you burn more calories even at rest!</p>',
    'Sarah Johnson',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB