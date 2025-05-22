/*
  # Add avatar support to profiles

  1. New Tables
    - Create `profiles` table if it doesn't exist
      - `id` (uuid, primary key, references auth.users)
      - `avatar_url` (text, nullable)
      - `updated_at` (timestamp with time zone)
  
  2. Changes
    - Add `avatar_url` column to `comments` table
  
  3. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to manage their own profiles
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add avatar_url to comments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE comments ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create trigger to create profile on user creation
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'create_profile_on_auth_user_created'
  ) THEN
    CREATE TRIGGER create_profile_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_user();
  END IF;
END $$;

-- Create profiles for existing users
INSERT INTO profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;