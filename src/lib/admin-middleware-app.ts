// src/lib/admin-middleware-app.ts
import { NextResponse, type NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { corsHeaders } from './api-middleware-app'

/**
 * Vérifie que l'utilisateur est authentifié et a le rôle "admin".
 * - Si non authentifié  ⇒ 401
 * - Si pas admin        ⇒ 403
 * - Sinon retourne null (on peut continuer).
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
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

/**
 * HOF pour envelopper un handler (GET, POST, etc.) :
 * - On appelle d'abord requireAdminAuth
 * - Si ça renvoie une NextResponse, on la renvoie directement
 * - Sinon on exécute le handler original
 *
 * Usage :
 *   export const GET = withAdmin(async req => { … })
 */
export function withAdmin<
  Handler extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>
>(
  handler: Handler
): (req: NextRequest, ...rest: Parameters<Handler> extends [any, ...infer R] ? R : []) => Promise<NextResponse> {
  return async (req, ...rest) => {
    const authError = requireAdminAuth(req)
    if (authError) return authError
    return handler(req, ...rest)
  }
}
