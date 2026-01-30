// src/app/api/admin/comments/route.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin }       from '@/lib/admin-middleware-app'
import { supabaseAdmin }   from '@/lib/supabase'
import { corsHeaders }     from '@/lib/api-middleware-app'

// Schéma Zod pour la validation des commentaires
const commentSchema = z.object({
  articleId: z.string().uuid(),
  content:   z.string().min(1),
  rating:    z.number().min(1).max(5),
})

/**
 * GET: liste des commentaires
 * Protégé automatiquement par withAdmin
 */
export const GET = withAdmin(async (req: NextRequest) => {
  const { data: comments, error } = await supabaseAdmin
    .from('article_comments')
    .select('id, article_id, content, rating, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    )
  }
  return NextResponse.json({ comments }, { headers: corsHeaders() })
})

/**
 * POST: création d'un commentaire
 * Protégé automatiquement par withAdmin
 */
export const POST = withAdmin(async (req: NextRequest) => {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const parsed = commentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }

  const { articleId, content, rating } = parsed.data
  const { data: comment, error } = await supabaseAdmin
    .from('article_comments')
    .insert([{ article_id: articleId, content, rating }])
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    )
  }
  return NextResponse.json({ comment }, { status: 201, headers: corsHeaders() })
})
