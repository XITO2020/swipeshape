// src/app/api/admin/comments/route.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-middleware-app'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'

// Schéma Zod pour la validation des commentaires
const commentSchema = z.object({
  articleId: z.string().uuid(),
  content:   z.string().min(1),
  rating:    z.number().min(1).max(5),
})

export async function GET(req: NextRequest) {
  // 🔒 Protection admin
  const authError = requireAdminAuth(req)
  if (authError) return authError

  // Récupération de tous les commentaires
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

  return NextResponse.json(
    { comments },
    { headers: corsHeaders() }
  )
}

export async function POST(req: NextRequest) {
  // 🔒 Protection admin
  const authError = requireAdminAuth(req)
  if (authError) return authError

  // Lecture du corps JSON
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  // Validation Zod
  const parsed = commentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }

  // Insertion en base
  try {
    const { articleId, content, rating } = parsed.data
    const { data: comment, error } = await supabaseAdmin
      .from('article_comments')
      .insert([{ article_id: articleId, content, rating }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { comment },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    )
  }
}
