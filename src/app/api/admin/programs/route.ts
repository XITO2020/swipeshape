// src/app/api/admin/programs/route.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware-app'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'

// Schéma Zod pour validation des programmes
const programSchema = z.object({
  id:             z.string().uuid().optional(),
  name:           z.string().min(1),
  description:    z.string().min(1),
  image_url:      z.string().url().optional(),
  category:       z.string().optional(),
  price:          z.number().nonnegative(),
  duration_weeks: z.number().int().positive().optional(),
  level:          z.string().optional(),
  featured:       z.boolean().optional()
})

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(
      { programs: data },
      { headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('GET /programs error:', err)
    return NextResponse.json(
      { error: 'Impossible de récupérer les programmes' },
      { status: 500, headers: corsHeaders() }
    )
  }
})

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

  const parsed = programSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }

  try {
    const data = parsed.data
    const { data: program, error } = await supabaseAdmin
      .from('programs')
      .insert([{ ...data, featured: data.featured ?? false }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { program },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('POST /programs error:', err)
    return NextResponse.json(
      { error: 'Impossible de créer le programme' },
      { status: 500, headers: corsHeaders() }
    )
  }
})

export const PUT = withAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params
  if (!id) {
    return NextResponse.json(
      { error: 'ID du programme requis' },
      { status: 400, headers: corsHeaders() }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const parsed = programSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }

  try {
    const updates = parsed.data
    const { data: program, error } = await supabaseAdmin
      .from('programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { program },
      { headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('PUT /programs/[id] error:', err)
    return NextResponse.json(
      { error: 'Impossible de mettre à jour le programme' },
      { status: 500, headers: corsHeaders() }
    )
  }
})

export const DELETE = withAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params
  if (!id) {
    return NextResponse.json(
      { error: 'ID du programme requis' },
      { status: 400, headers: corsHeaders() }
    )
  }

  try {
    const { error } = await supabaseAdmin
      .from('programs')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('DELETE /programs/[id] error:', err)
    return NextResponse.json(
      { error: 'Impossible de supprimer le programme' },
      { status: 500, headers: corsHeaders() }
    )
  }
})
