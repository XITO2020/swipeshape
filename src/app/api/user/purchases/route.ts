// src/app/api/user/purchases/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'

export async function GET(req: NextRequest) {
  // 1️⃣ Récupérer l'utilisateur via Clerk
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401, headers: corsHeaders() }
    )
  }

  // 2️⃣ Récupérer les achats pour cet utilisateur
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select(`
      id,
      programId,
      userEmail,
      createdAt,
      program ( id, name, price, description )
    `)
    // → adaptez ici si votre colonne est 'userId' ou 'userEmail'
    .eq('userEmail', userId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Erreur Supabase récup achats :', error)
    return NextResponse.json(
      { error: 'Impossible de charger vos achats' },
      { status: 500, headers: corsHeaders() }
    )
  }

  // 3️⃣ Formater et renvoyer
  const purchases = (data || []).map((p: any) => ({
    id:        p.id,
    programId: p.programId,
    userEmail: p.userEmail,
    createdAt: p.createdAt,
    program:   p.program,
  }))

  return NextResponse.json(
    { purchases },
    { status: 200, headers: corsHeaders() }
  )
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders() })
}

const handleMethodNotAllowed = (req: NextRequest) =>
  NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405, headers: corsHeaders() }
  )

export const POST   = handleMethodNotAllowed
export const PUT    = handleMethodNotAllowed
export const DELETE = handleMethodNotAllowed
export const PATCH  = handleMethodNotAllowed
