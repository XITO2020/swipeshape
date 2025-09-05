// src/app/api/admin/videos/route.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware-app'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'

// Schéma Zod pour validation des vidéos
const videoSchema = z.object({
  id:          z.string().uuid().optional(),
  title:       z.string().min(1),
  url:         z.string().url(),
  description: z.string().optional(),
  featured:    z.boolean().optional()
})

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('id')

    if (videoId) {
      const { data: video, error } = await supabaseAdmin
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Vidéo non trouvée' },
          { status: 404, headers: corsHeaders() }
        )
      }
      return NextResponse.json(video, { headers: corsHeaders() })
    }

    const { data: videos, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(
      { videos },
      { headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('GET /videos error:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
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
      { error: 'JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const parsed = videoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }

  try {
    const data = parsed.data
    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .insert([{ ...data, featured: data.featured ?? false }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { video },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('POST /videos error:', err)
    return NextResponse.json(
      { error: 'Impossible de créer la vidéo' },
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
      { error: 'ID requis' },
      { status: 400, headers: corsHeaders() }
    )
  }

  try {
    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('DELETE /videos/[id] error:', err)
    return NextResponse.json(
      { error: 'Impossible de supprimer la vidéo' },
      { status: 500, headers: corsHeaders() }
    )
  }
})
