// src/app/api/admin/email-templates/route.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware-app'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'

// Schéma Zod pour validation des templates email
const templateSchema = z.object({
  name:    z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  type:    z.string().optional(),
})

/**
 * GET: lister tous les templates
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('EmailTemplate')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des templates', details: error.message },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      { templates: data },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('GET /email-templates error:', err)
    return NextResponse.json(
      { error: 'Impossible de récupérer les templates' },
      { status: 500, headers: corsHeaders() }
    )
  }
})

/**
 * POST: créer un nouveau template
 */
export const POST = withAdmin(async (req: NextRequest) => {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const parsed = templateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }

  try {
    const { name, subject, content, type } = parsed.data
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('EmailTemplate')
      .insert([
        { name, subject, body: content, type, createdAt: now, updatedAt: now }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du template', details: error.message },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      { template: data },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('POST /email-templates error:', err)
    return NextResponse.json(
      { error: 'Impossible d\'enregistrer le template' },
      { status: 500, headers: corsHeaders() }
    )
  }
})
