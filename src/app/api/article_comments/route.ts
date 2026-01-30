
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '../../../lib/api-middleware-app'

function enforceAuth(req: NextRequest, needsAdmin = false) {
  const { userId, sessionClaims } = getAuth(req)
  if (!userId) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  if (needsAdmin && sessionClaims?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403, headers: corsHeaders() }
    )
  }
  return null
}

// GET: lister les commentaires d'un article (tous les membres authentifiés)
export async function GET(request: NextRequest) {
  const forbidden = enforceAuth(request)
  if (forbidden) return forbidden

  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')
    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId manquant' },
        { status: 400, headers: corsHeaders() }
      )
    }
    const { data: comments, error } = await supabaseAdmin
      .from('article_comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json(
      { comments },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// POST: ajouter un commentaire (tous les membres authentifiés)
export async function POST(request: NextRequest) {
  const forbidden = enforceAuth(request)
  if (forbidden) return forbidden

  try {
    const data = await request.json()
    const { userId } = getAuth(request)
    const insertSql = `
      INSERT INTO article_comments (article_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const { data: created, error } = await supabaseAdmin
      .from('article_comments')
      .insert([{ article_id: data.articleId, user_id: userId, content: data.content }])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(
      { comment: created },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// PUT: mettre à jour un commentaire (admin only)
export async function PUT(request: NextRequest) {
  const forbidden = enforceAuth(request, true)
  if (forbidden) return forbidden

  try {
    const data = await request.json()
    const updateSql = `
      UPDATE article_comments
      SET content = $1
      WHERE id = $2
      RETURNING *
    `
    const { data: updated, error } = await supabaseAdmin
      .from('article_comments')
      .update({ content: data.content })
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(
      { comment: updated },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// DELETE: supprimer un commentaire (admin only)
export async function DELETE(request: NextRequest) {
  const forbidden = enforceAuth(request, true)
  if (forbidden) return forbidden

  try {
    const { id } = await request.json()
    const { error } = await supabaseAdmin
      .from('article_comments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({}, { status: 204, headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// PATCH: partiellement modifier un commentaire (admin only)
export async function PATCH(request: NextRequest) {
  const forbidden = enforceAuth(request, true)
  if (forbidden) return forbidden

  try {
    const data = await request.json()
    const updateSql = `
      UPDATE article_comments SET content = $1 WHERE id = $2 RETURNING *
    `
    const { data: updated, error } = await supabaseAdmin
      .from('article_comments')
      .update({ content: data.content })
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(
      { comment: updated },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}