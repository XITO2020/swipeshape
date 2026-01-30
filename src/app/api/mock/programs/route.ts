
import { NextResponse } from 'next/server';

const mockPrograms = [
  { id: '1', title: 'Programme de Cardio Intensif', description: '...', image_url: '/images/programs/cardio.jpg', level: 'intermédiaire', duration_weeks: 4, created_at: '2025-05-15T10:00:00Z', updated_at: '2025-06-10T14:30:00Z', category: 'cardio', price: 29.99, featured: true },
  { id: '2', title: 'Musculation pour Débutants', description: '...', image_url: '/images/programs/strength-beginner.jpg', level: 'débutant', duration_weeks: 6, created_at: '2025-04-20T09:15:00Z', updated_at: '2025-06-05T16:45:00Z', category: 'musculation', price: 19.99, featured: false },
  { id: '3', title: 'Yoga et Flexibilité', description: '...', image_url: '/images/programs/yoga.jpg', level: 'tous niveaux', duration_weeks: 8, created_at: '2025-06-01T11:30:00Z', updated_at: '2025-06-15T08:20:00Z', category: 'yoga', price: 24.99, featured: true }
];

export async function GET(request: Request) {
  console.log('MOCK API programs GET');
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const program = mockPrograms.find(p => p.id === id);
    return program ? NextResponse.json(program) : NextResponse.json({ error: 'Programme non trouvé' }, { status: 404 });
  }
  return NextResponse.json(mockPrograms);
}