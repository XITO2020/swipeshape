// src/app/api/user/verify-purchase/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { requireAuthApp } from '@/lib/auth-app'
import { checkUserCanComment } from '@/lib/db-utils-app'
import { corsHeaders, handleApiError } from '@/lib/api-middleware-app'

export async function GET(req: NextRequest) {
  // 1️⃣ Auth via Clerk
  const authError = requireAuthApp(req)
  if (authError) return authError

  // 2️⃣ Récupérer l’ID utilisateur Clerk
  const { userId } = getAuth(req)
  //ce if verifie que, pour la fonction checkUserCanComment, userId est non null (donc par soustraction un string).
  if (!userId) {
    return NextResponse.json(
      { error: 'Utilisateur non authentifié' },
      { status: 401, headers: corsHeaders() }
    )
  }

  // 3️⃣ Lire strictement le paramètre programId
  const url            = new URL(req.url)
  const programIdRaw   = url.searchParams.get('programId')

  // Si `programIdRaw` est null, on renvoie une erreur
  if (programIdRaw === null) {
    return NextResponse.json(
      { error: 'programId requis' },
      { status: 400, headers: corsHeaders() }
    )
  }

  // Ici, TS sait que programIdRaw est une `string`
  const programId = programIdRaw

  try {
    // 4️⃣ Exécution de la logique métier
    const { canComment, error } = await checkUserCanComment(userId, programId)
    if (error) throw error

    return NextResponse.json(
      { canComment },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err: any) {
    // 5️⃣ Gestion centralisée des erreurs
    return handleApiError(err, req)
  }
}
