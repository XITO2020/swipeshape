// src/app/api/admin/articles/route.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'        // nécessaire pour requireAdminAuth
import { executeQuery } from '@/lib/db'
import { corsHeaders } from '@/lib/api-middleware-app'
import { requireAdminAuth } from '@/lib/admin-middleware-app'

// Schéma Zod
const articleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.string().optional(),
  featured: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  // 🔒 Protection admin
  const authError = requireAdminAuth(req)
  if (authError) return authError

  // logique métier
  const { data, error } = await executeQuery(
    'SELECT id, title, slug, category, featured, created_at FROM articles ORDER BY created_at DESC',
    []
  )
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    )
  }
  return NextResponse.json(
    { articles: data },
    { headers: corsHeaders() }
  )
}

export async function POST(req: NextRequest) {
  // 🔒 Protection admin
  const authError = requireAdminAuth(req)
  if (authError) return authError

  // validation JSON
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  // validation Zod
  const parsed = articleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }

  // insertion en base
  try {
    const { title, content, slug, category, featured = false } = parsed.data
    const { data, error } = await executeQuery(
      'INSERT INTO articles (title, content, slug, category, featured) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, slug, category, featured]
    )
    if (error) throw error
    return NextResponse.json(
      { article: data[0] },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    )
  }
}
