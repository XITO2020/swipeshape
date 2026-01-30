
import { NextResponse } from 'next/server';

const mockComments = [
  { id: '1', content: 'Ceci est un commentaire de test', user_id: 'user123', user_email: 'utilisateur@test.com', created_at: '2025-06-20T14:30:00Z', article_id: 'article1', rating: 5, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user123' },
  { id: '2', content: 'Un autre commentaire pour tester', user_id: 'user456', user_email: 'autre@test.com', created_at: '2025-06-21T10:15:00Z', article_id: 'article1', rating: 4, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user456' },
  { id: '3', content: 'Commentaire sur un article différent', user_id: 'user123', user_email: 'utilisateur@test.com', created_at: '2025-06-21T11:45:00Z', article_id: 'article2', rating: 3, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user123' }
];

export async function GET(request: Request) {
  console.log('MOCK API comments GET');
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  const filtered = articleId ? mockComments.filter(c => c.article_id === articleId) : mockComments;
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  console.log('MOCK API comments POST');
  try {
    const body = await request.json();
    if (!body.user_email) return NextResponse.json({ error: 'Le champ email est requis' }, { status: 400 });
    const newComment = { id: `mock-${Date.now()}`, content: body.content||'', user_id: body.user_id||'', user_email: body.user_email, created_at: new Date().toISOString(), article_id: body.article_id||'', rating: body.rating||0, avatar_url: body.avatar_url||'' };
    return NextResponse.json(newComment, { status: 201 });
  } catch (err: any) {
    console.error('Mock comments POST error:', err);
    return NextResponse.json({ error: 'Erreur création commentaire', details: err.message }, { status: 500 });
  }
}