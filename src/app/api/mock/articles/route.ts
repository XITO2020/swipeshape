
import { NextResponse } from 'next/server';

// Données fictives pour simuler la réponse de la base de données
const mockArticles = [
  { id: '1', title: 'Comment optimiser sa séance de cardio', content: '...', summary: 'Découvrez...', slug: 'comment-optimiser-seance-cardio', image_url: '/images/articles/cardio-training.jpg', author: 'Marie Dupont', created_at: '2025-05-20T14:30:00Z', updated_at: '2025-06-01T09:15:00Z', category: 'cardio', tags: ['cardio','endurance','entraînement'], featured: true },
  { id: '2', title: 'Guide de nutrition pour la prise de masse', content: '...', summary: 'Un guide...', slug: 'guide-nutrition-prise-masse', image_url: '/images/articles/nutrition-muscle.jpg', author: 'Thomas Martin', created_at: '2025-06-05T10:00:00Z', updated_at: '2025-06-10T16:45:00Z', category: 'nutrition', tags: ['nutrition','musculation','protéines'], featured: true },
  { id: '3', title: 'Les bienfaits du yoga sur le mental', content: '...', summary: 'Explorez...', slug: 'bienfaits-yoga-mental', image_url: '/images/articles/yoga-mental.jpg', author: 'Sophie Bernard', created_at: '2025-06-12T11:20:00Z', updated_at: '2025-06-15T08:30:00Z', category: 'yoga', tags: ['yoga','bien-être','méditation'], featured: false }
];

export async function GET(request: Request) {
  console.log('MOCK API articles GET');
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (slug) {
    const article = mockArticles.find(a => a.slug === slug);
    return article ? NextResponse.json(article) : NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
  }
  return NextResponse.json(mockArticles);
}