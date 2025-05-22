/*
  # Create purchases and update comments system
  
  1. New Tables
    - `programs`: Store fitness programs
    - `purchases`: Track user program purchases
  
  2. Security
    - Enable RLS on purchases table
    - Add policies for purchases
    - Update comment policies to require purchase
  
  3. Changes
    - Restrict commenting to users who have purchased programs
*/

-- Create programs table first
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image_url TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    program_id integer REFERENCES programs NOT NULL,
    created_at timestamptz DEFAULT now(),
    payment_status text NOT NULL CHECK (payment_status IN ('completed', 'refunded')),
    UNIQUE(user_id, program_id)
);

-- Enable RLS on purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Purchases policies
CREATE POLICY "Users can view their own purchases"
    ON purchases
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert purchases"
    ON purchases
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    user_email TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    avatar_url TEXT,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on comments if not already enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Update comments policies
DROP POLICY IF EXISTS "Anyone can create comments" ON comments;
DROP POLICY IF EXISTS "Users can manage their own comments" ON comments;

CREATE POLICY "Only customers can create comments"
    ON comments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM purchases
            WHERE purchases.user_id = auth.uid()
            AND purchases.payment_status = 'completed'
        )
    );

CREATE POLICY "Anyone can view comments"
    ON comments
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Add basic program policy
CREATE POLICY "Anyone can view programs"
    ON programs
    FOR SELECT
    TO PUBLIC
    USING (true);