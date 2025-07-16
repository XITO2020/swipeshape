
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { executeQuery } from '../../../../lib/db';
import { corsHeaders } from '../../../../lib/api-middleware-app';

// Schéma Zod pour validation
const articleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.string().optional(),
  featured: z.boolean().optional()
});

// Vérification d'authentification et rôle admin
function enforceAdmin(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId || sessionClaims?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403, headers: corsHeaders() });
  }
  return null;
}

// GET: liste des articles
export async function GET(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  const { data, error } = await executeQuery(
    'SELECT id, title, slug, category, featured, created_at FROM articles ORDER BY created_at DESC',
    []
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() });
  }
  return NextResponse.json({ articles: data }, { headers: corsHeaders() });
}

// POST: création d'un nouvel article
export async function POST(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requête JSON invalide' }, { status: 400, headers: corsHeaders() });
  }

  const parse = articleSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 422, headers: corsHeaders() });
  }

  try {
    const { title, content, slug, category, featured = false } = parse.data;
    const { data, error } = await executeQuery(
      'INSERT INTO articles (title, content, slug, category, featured) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, slug, category, featured]
    );
    if (error) throw error;
    return NextResponse.json({ article: data[0] }, { status: 201, headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}