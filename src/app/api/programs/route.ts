// src/app/api/programs/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialisation du client Supabase en mode server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ API programmes error:', error)
      return NextResponse.json(
        { error: 'Impossible de récupérer les programmes' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('❌ programmes exception:', err)
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Autoriser simplement la méthode OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export const POST   = () => NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
export const PUT    = POST
export const DELETE = POST
export const PATCH  = POST
