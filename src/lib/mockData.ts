import { Article, Program, Event, User, Video, Test, TestQuestion, UserTestResult } from '../types';

// Mock data for articles
export const mockArticles: Article[] = [
  {
    id: 1,
    title: "Comment perdre du poids sainement",
    content: "Perdre du poids n'est pas seulement une question d'esthétique, c'est aussi une démarche pour améliorer sa santé globale...",
    image_url: "/assets/images/reelles/nutrition.jpg",
    created_at: "2025-05-01T10:00:00Z",
    updated_at: "2025-05-01T10:00:00Z",
    slug: "comment-perdre-du-poids-sainement",
    author: "Sarah Dupont"
  },
  {
    id: 2,
    title: "L'importance de la récupération musculaire",
    content: "La récupération est un aspect souvent négligé de l'entraînement mais qui joue un rôle crucial...",
    image_url: "/assets/images/reelles/fente.jpg",
    created_at: "2025-05-10T14:30:00Z",
    updated_at: "2025-05-10T14:30:00Z",
    slug: "importance-recuperation-musculaire",
    author: "Marc Lefèvre"
  },
  {
    id: 3,
    title: "Les bienfaits du yoga pour la santé mentale",
    content: "Le yoga est bien plus qu'une simple activité physique, c'est une pratique globale qui apporte de nombreux bienfaits pour la santé mentale...",
    image_url: "/assets/images/reelles/sport.jpg",
    created_at: "2025-05-15T09:45:00Z",
    updated_at: "2025-05-15T09:45:00Z",
    slug: "bienfaits-yoga-sante-mentale",
    author: "Lucie Bernard"
  },
  {
    id: 4,
    title: "Nutrition: les super-aliments à intégrer dans votre quotidien",
    content: "Certains aliments se distinguent par leur densité nutritionnelle exceptionnelle...",
    image_url: "/assets/images/reelles/foodsport.jpg",
    created_at: "2025-05-20T16:15:00Z",
    updated_at: "2025-05-20T16:15:00Z",
    slug: "super-aliments-quotidien",
    author: "Julie Moreau"
  },
  {
    id: 5,
    title: "Guide pour débutants: comment commencer le fitness",
    content: "Se lancer dans le fitness peut sembler intimidant au premier abord...",
    image_url: "/assets/images/reelles/stress.jpg",
    created_at: "2025-05-25T11:20:00Z",
    updated_at: "2025-05-25T11:20:00Z",
    slug: "guide-debutants-commencer-fitness",
    author: "Thomas Simon"
  }
];

// Mock data for events
export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Atelier yoga pour débutantes",
    description: "Un atelier spécialement conçu pour les femmes débutant le yoga. Venez découvrir les bases dans une ambiance bienveillante.",
    event_date: "2025-06-15T10:00:00Z",
    image_url: "/assets/images/reelles/sport.jpg",
    location: "Centre SwipeShape, Paris 11e",
    created_at: "2025-05-01T12:00:00Z",
    updated_at: "2025-05-01T12:00:00Z"
  },
  {
    id: "2",
    title: "Conférence sur la nutrition féminine",
    description: "Une conférence interactive sur les besoins nutritionnels spécifiques des femmes à différentes étapes de leur vie.",
    event_date: "2025-06-20T18:30:00Z",
    image_url: "/assets/images/reelles/food.jpg",
    location: "Espace Bien-être, Lyon",
    created_at: "2025-05-03T09:15:00Z",
    updated_at: "2025-05-03T09:15:00Z"
  },
  {
    id: "3",
    title: "Course solidaire 'Femmes en mouvement'",
    description: "Une course de 5km accessible à toutes, dont les bénéfices seront reversés à une association soutenant les femmes en difficulté.",
    event_date: "2025-07-05T09:00:00Z",
    image_url: "/assets/images/reelles/fente.jpg",
    location: "Parc de la Tête d'Or, Lyon",
    created_at: "2025-05-10T14:30:00Z",
    updated_at: "2025-05-10T14:30:00Z"
  },
  {
    id: "4",
    title: "Journée bien-être et détox",
    description: "Une journée complète dédiée au bien-être: yoga, méditation, conseils nutrition et ateliers détox.",
    event_date: "2025-07-12T09:30:00Z",
    image_url: "/assets/images/reelles/psychology.jpg",
    location: "SwipeShape Wellness Center, Marseille",
    created_at: "2025-05-15T11:45:00Z",
    updated_at: "2025-05-15T11:45:00Z"
  }
];

// Mock data for programs
export const mockPrograms: Program[] = [
  {
    id: 1,
    title: "Programme Fitness Débutantes 8 semaines",
    description: "Programme complet pour débuter le fitness en douceur. Exercices progressifs et recommandations nutritionnelles adaptées.",
    price: 49.99,
    image_url: "/assets/images/reelles/fente.jpg",
    pdf_url: "/assets/pdfs/programme-fitness-debutantes.pdf",
    created_at: "2025-04-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Yoga Prénatal - Trimestre par trimestre",
    description: "Yoga adapté aux femmes enceintes, avec des séances spécifiques pour chaque trimestre de grossesse.",
    price: 59.99,
    image_url: "/assets/images/reelles/sport.jpg",
    pdf_url: "/assets/pdfs/yoga-prenatal.pdf",
    created_at: "2025-04-05T14:30:00Z"
  },
  {
    id: 3,
    title: "Rééquilibrage Alimentaire 30 jours",
    description: "Plan nutritionnel complet sur 30 jours avec recettes, conseils pratiques et suivi personnalisé.",
    price: 39.99,
    image_url: "/assets/images/reelles/food.jpg",
    pdf_url: "/assets/pdfs/reequilibrage-alimentaire.pdf",
    created_at: "2025-04-10T09:15:00Z"
  },
  {
    id: 4,
    title: "Nutrition équilibrée pour femmes actives",
    description: "Guide nutritionnel complet avec plans de repas adaptés aux besoins des femmes sportives.",
    price: 39.99,
    image_url: "/assets/images/reelles/foodsport.jpg",
    pdf_url: "/assets/pdfs/nutrition-femmes-actives.pdf",
    created_at: "2025-04-10T09:30:00Z"
  },
  {
    id: 5,
    title: "Renforcement musculaire et cardio intensif",
    description: "Programme avancé combinant des exercices de musculation et des séances de cardio à haute intensité pour maximiser les résultats.",
    price: 59.99,
    image_url: "/assets/images/reelles/cardio.jpg",
    pdf_url: "/assets/pdfs/renforcement-musculaire.pdf",
    created_at: "2025-04-05T15:15:00Z"
  },
  {
    id: 6,
    title: "Kit de méditation quotidienne",
    description: "Méthodes simples pour intégrer la méditation dans votre quotidien. Pratiques guidées pour réduire le stress et améliorer la concentration.",
    price: 29.99,
    image_url: "/assets/images/reelles/sleep.jpg",
    pdf_url: "/assets/pdfs/kit-meditation.pdf",
    created_at: "2025-04-20T08:15:00Z"
  }
];

// Mock data for users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "sarah.martin@example.com",
    name: "Sarah Martin",
    fullName: "Sarah Martin",
    avatar_url: "/assets/images/avatars/avatar1.jpg",
    created_at: "2025-01-10T09:00:00Z",
    role: "user"
  },
  {
    id: "2",
    email: "julie.dupont@example.com",
    name: "Julie Dupont",
    fullName: "Julie Dupont",
    avatar_url: "/assets/images/avatars/avatar2.jpg",
    created_at: "2025-02-15T14:30:00Z",
    role: "user"
  },
  {
    id: "3",
    email: "admin@swipeshape.com",
    name: "Admin SwipeShape",
    fullName: "Admin SwipeShape",
    avatar_url: "/assets/images/avatars/admin.jpg",
    created_at: "2025-01-01T00:00:00Z",
    role: "admin"
  }
];

// Mock data for videos
export const mockVideos: Video[] = [
  {
    id: "1",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Les bases du Pilates",
    created_at: "2025-03-10T10:00:00Z"
  },
  {
    id: "2",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Routine HIIT 15 minutes",
    created_at: "2025-03-15T14:30:00Z"
  },
  {
    id: "3",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Yoga pour débutantes",
    created_at: "2025-03-20T09:45:00Z"
  }
];

// Mock data for tests
export const mockTests: Test[] = [
  {
    id: 1,
    title: "Quiz: Connaissances en nutrition",
    description: "Testez vos connaissances sur les bases de la nutrition et découvrez comment améliorer votre alimentation.",
    duration_minutes: 15,
    passing_score: 70,
    max_score: 100,
    created_at: "2025-04-05T10:00:00Z"
  },
  {
    id: 2,
    title: "Évaluation de votre niveau de fitness",
    description: "Ce test vous aidera à déterminer votre niveau actuel de fitness pour choisir les programmes les mieux adaptés.",
    duration_minutes: 10,
    passing_score: 60,
    max_score: 100,
    created_at: "2025-04-10T14:30:00Z"
  }
];

// Mock data for test questions
export const mockTestQuestions: TestQuestion[] = [
  {
    id: 1,
    test_id: 1,
    question_text: "Quelle est la principale fonction des protéines ?",
    options: ["Fournir de l'énergie rapide", "Construction et réparation des tissus", "Stockage d'énergie à long terme", "Régulation de la température corporelle"],
    correct_option: 1,
    points: 10,
    created_at: "2025-04-05T10:00:00Z"
  },
  {
    id: 2,
    test_id: 1,
    question_text: "Lequel de ces aliments est la meilleure source d'oméga-3 ?",
    options: ["Poulet", "Saumon", "Riz", "Pomme de terre"],
    correct_option: 1,
    points: 10,
    created_at: "2025-04-05T10:00:00Z"
  },
  {
    id: 3,
    test_id: 2,
    question_text: "Combien de fois par semaine est-il recommandé de faire de l'exercice cardio ?",
    options: ["1-2 fois", "3-5 fois", "7 fois", "Une fois par mois"],
    correct_option: 1,
    points: 10,
    created_at: "2025-04-10T14:30:00Z"
  }
];

// Mock data for user test results
export const mockUserTestResults: UserTestResult[] = [
  {
    id: 1,
    user_id: "1",
    test_id: 1,
    score: 80,
    is_passed: true,
    completed_at: "2025-05-01T11:30:00Z",
    created_at: "2025-05-01T11:30:00Z"
  },
  {
    id: 2,
    user_id: "2",
    test_id: 2,
    score: 70,
    is_passed: true,
    completed_at: "2025-05-02T14:45:00Z",
    created_at: "2025-05-02T14:45:00Z"
  }
];
