-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create test_questions table for individual questions in tests
CREATE TABLE IF NOT EXISTS test_questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of possible answers
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_test_results table to track test completion
CREATE TABLE IF NOT EXISTS user_test_results (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    answers JSONB, -- Storing user answers
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, test_id) -- Each user can have only one result per test
);

-- Insert sample data
-- Sample users
INSERT INTO users (email, name, avatar_url)
VALUES 
    ('sophie@example.com', 'Sophie Martin', '/assets/avatars/sophie.jpg'),
    ('claire@example.com', 'Claire Dubois', '/assets/avatars/claire.jpg');

-- Sample videos
INSERT INTO videos (title, description, video_url, thumbnail_url, duration, category)
VALUES 
    ('Introduction au Yoga', 'Une introduction complète pour les débutantes en yoga', 'https://youtu.be/example1', '/assets/thumbnails/yoga-intro.jpg', 1200, 'yoga'),
    ('Routine de 15 minutes pour débutantes', 'Routine rapide et efficace pour commencer la journée', 'https://youtu.be/example2', '/assets/thumbnails/routine-15min.jpg', 900, 'fitness'),
    ('Nutrition: les bases', 'Les principes fondamentaux d''une alimentation équilibrée', 'https://youtu.be/example3', '/assets/thumbnails/nutrition.jpg', 1800, 'nutrition');

-- Sample tests
INSERT INTO tests (title, description, difficulty)
VALUES 
    ('Quiz Nutrition Basique', 'Testez vos connaissances sur les principes de base de la nutrition', 'easy'),
    ('Évaluation Fitness', 'Évaluez vos connaissances sur les exercices et techniques de fitness', 'medium');

-- Sample test questions
INSERT INTO test_questions (test_id, question, options, correct_answer, explanation, points)
VALUES 
    (1, 'Quelle est la principale source d''énergie pour le corps?', '["Protéines", "Lipides", "Glucides", "Vitamines"]', 'Glucides', 'Les glucides sont la principale source d''énergie pour le corps et le cerveau', 1),
    (1, 'Combien de litres d''eau devrait-on boire par jour en moyenne?', '["0.5 litre", "1 litre", "1.5-2 litres", "3-4 litres"]', '1.5-2 litres', 'La recommandation générale est de 1.5 à 2 litres d''eau par jour, variable selon l''individu et son activité', 1),
    (2, 'Quel exercice est considéré comme un exercice composé?', '["Curl biceps", "Extension triceps", "Squat", "Élévation latérale"]', 'Squat', 'Le squat est un exercice composé qui fait travailler plusieurs groupes musculaires simultanément', 2);
