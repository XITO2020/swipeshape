-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    slug TEXT NOT NULL UNIQUE
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    pdf_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add some sample data to articles
INSERT INTO articles (title, content, author, image_url, slug)
VALUES 
    ('Comment perdre du poids sainement', 'Perdre du poids n''est pas seulement une question d''esthétique, c''est aussi une démarche pour améliorer sa santé globale...', 'Sarah Dupont', '/assets/images/reelles/nutrition.jpg', 'comment-perdre-du-poids-sainement'),
    ('L''importance de la récupération musculaire', 'La récupération est un aspect souvent négligé de l''entraînement mais qui joue un rôle crucial...', 'Sophie Martin', '/assets/images/reelles/fente.jpg', 'importance-recuperation-musculaire');

-- Add some sample data to events
INSERT INTO events (title, description, event_date, location, image_url)
VALUES 
    ('Atelier yoga pour débutantes', 'Un atelier spécialement conçu pour les femmes débutant le yoga. Venez découvrir les bases dans une ambiance bienveillante.', '2025-07-15 10:00:00+02', 'Centre SwipeShape, Paris 11e', '/assets/images/reelles/sport.jpg'),
    ('Conférence sur la nutrition féminine', 'Une conférence interactive sur les besoins nutritionnels spécifiques des femmes à différentes étapes de leur vie.', '2025-07-20 18:30:00+02', 'Espace Bien-être, Lyon', '/assets/images/reelles/food.jpg');

-- Add some sample data to programs
INSERT INTO programs (title, description, price, pdf_url, image_url)
VALUES 
    ('Programme Fitness Débutantes 8 semaines', 'Programme complet pour débuter le fitness en douceur. Exercices progressifs et recommandations nutritionnelles adaptées.', 49.99, '/assets/pdfs/programme-debutante.pdf', '/assets/images/reelles/fente.jpg'),
    ('Yoga Prénatal - Trimestre par trimestre', 'Yoga adapté aux femmes enceintes, avec des séances spécifiques pour chaque trimestre de grossesse.', 59.99, '/assets/pdfs/yoga-prenatal.pdf', '/assets/images/reelles/sport.jpg');
