import { NextResponse } from 'next/server';

// Données fictives pour simuler la réponse de la base de données
const mockComments = [
  {
    id: '1',
    content: 'Ceci est un commentaire de test',
    user_id: 'user123',
    user_email: 'utilisateur@test.com',
    created_at: '2025-06-20T14:30:00Z',
    article_id: 'article1',
    rating: 5,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user123'
  },
  {
    id: '2',
    content: 'Un autre commentaire pour tester',
    user_id: 'user456',
    user_email: 'autre@test.com',
    created_at: '2025-06-21T10:15:00Z',
    article_id: 'article1',
    rating: 4,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user456'
  },
  {
    id: '3',
    content: 'Commentaire sur un article différent',
    user_id: 'user123',
    user_email: 'utilisateur@test.com',
    created_at: '2025-06-21T11:45:00Z',
    article_id: 'article2',
    rating: 3,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user123'
  }
];

export async function GET(request: Request) {
  console.log('MOCK API comments appelée avec GET');
  
  // Récupérer l'URL de la requête pour extraire les paramètres
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  
  let filteredComments = mockComments;
  
  // Filtrer par articleId si spécifié
  if (articleId) {
    filteredComments = mockComments.filter(comment => comment.article_id === articleId);
    console.log(`Filtrage des commentaires par articleId: ${articleId}`);
  }
  
  return NextResponse.json(filteredComments);
}

export async function POST(request: Request) {
  console.log('MOCK API comments appelée avec POST');
  
  try {
    // Récupérer les données du body
    const body = await request.json();
    
    // Validation minimale
    if (!body.user_email) {
      return NextResponse.json({ error: 'Le champ email est requis' }, { status: 400 });
    }
    
    // Créer un nouveau commentaire fictif
    const newComment = {
      id: `mock-${Date.now()}`,
      content: body.content || 'Contenu du commentaire',
      user_id: body.user_id || 'user-mock',
      user_email: body.user_email,
      created_at: new Date().toISOString(),
      article_id: body.article_id || 'article-mock',
      rating: body.rating || 5,
      avatar_url: body.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.user_email}`
    };
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Erreur lors du traitement de la requête POST:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création du commentaire',
      details: error.message
    }, { status: 500 });
  }
}
