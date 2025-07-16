
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { executeQuery } from '../../../../lib/db';
import { corsHeaders } from '../../../../lib/api-middleware-app';

// Schéma Zod pour la validation des commentaires
const commentSchema = z.object({
  articleId: z.string().uuid(),
  content: z.string().min(1),
  rating: z.number().min(1).max(5)
});

// Middleware pour vérifier le rôle admin
function enforceAdmin(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId || sessionClaims?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403, headers: corsHeaders() }
    );
  }
  return null;
}

// GET: liste des commentaires pour tous les articles
export async function GET(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  const { data, error } = await executeQuery(
    'SELECT id, article_id, content, rating, created_at FROM article_comments ORDER BY created_at DESC',
    []
  );
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
  return NextResponse.json(
    { comments: data },
    { headers: corsHeaders() }
  );
}

// POST: création d'un commentaire pour un article
export async function POST(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const parse = commentSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.format() },
      { status: 422, headers: corsHeaders() }
    );
  }

  try {
    const { articleId, content, rating } = parse.data;
    const { data, error } = await executeQuery(
      'INSERT INTO article_comments (article_id, content, rating) VALUES ($1, $2, $3) RETURNING *',
      [articleId, content, rating]
    );
    if (error) throw error;
    return NextResponse.json(
      { comment: data[0] },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}