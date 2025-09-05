// src/lib/auth-app.ts

import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/api-middleware-app'

/**
 * Vérifie que l’utilisateur est authentifié via Clerk.
 * Si non, renvoie NextResponse 401.
 * Sinon retourne null pour poursuivre la requête.
 */
export function requireAuthApp(req: NextRequest): NextResponse | null {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401, headers: corsHeaders() }
    )
  }
  return null
}

/**
 * Vérifie que l’utilisateur est admin Clerk.
 * - Non authentifié        ⇒ 401
 * - Authentifié sans rôle “admin” ⇒ 403
 * - Sinon retourne null.
 */
export function requireAdminAuthApp(req: NextRequest): NextResponse | null {
  const { userId, sessionClaims } = getAuth(req)
  if (!userId) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401, headers: corsHeaders() }
    )
  }
  if (sessionClaims?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403, headers: corsHeaders() }
    )
  }
  return null
}
