import { NextResponse } from 'next/server';

// Données fictives pour simuler la réponse de la base de données
const mockPrograms = [
  {
    id: '1',
    title: 'Programme de Cardio Intensif',
    description: 'Un programme d\'entraînement cardio de 4 semaines pour améliorer votre endurance',
    image_url: '/images/programs/cardio.jpg',
    level: 'intermédiaire',
    duration_weeks: 4,
    created_at: '2025-05-15T10:00:00Z',
    updated_at: '2025-06-10T14:30:00Z',
    category: 'cardio',
    price: 29.99,
    featured: true
  },
  {
    id: '2',
    title: 'Musculation pour Débutants',
    description: 'Apprenez les bases de la musculation avec ce programme complet de 6 semaines',
    image_url: '/images/programs/strength-beginner.jpg',
    level: 'débutant',
    duration_weeks: 6,
    created_at: '2025-04-20T09:15:00Z',
    updated_at: '2025-06-05T16:45:00Z',
    category: 'musculation',
    price: 19.99,
    featured: false
  },
  {
    id: '3',
    title: 'Yoga et Flexibilité',
    description: 'Améliorez votre souplesse et votre bien-être avec ce programme de yoga de 8 semaines',
    image_url: '/images/programs/yoga.jpg',
    level: 'tous niveaux',
    duration_weeks: 8,
    created_at: '2025-06-01T11:30:00Z',
    updated_at: '2025-06-15T08:20:00Z',
    category: 'yoga',
    price: 24.99,
    featured: true
  }
];

export async function GET(request: Request) {
  console.log('MOCK API programs appelée avec GET');
  
  // Récupérer l'URL de la requête pour extraire les paramètres
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    // Rechercher un programme par ID
    const program = mockPrograms.find(p => p.id === id);
    if (program) {
      return NextResponse.json(program);
    } else {
      return NextResponse.json({ error: 'Programme non trouvé' }, { status: 404 });
    }
  }
  
  // Retourner tous les programmes
  return NextResponse.json(mockPrograms);
}
