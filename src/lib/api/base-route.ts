// src/lib/api/base-route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import {
  corsHeaders,
  throttleApiRequests,
  handleApiError
} from '@/lib/api-middleware-app'

/**
 * Renvoie 405 si la méthode n'est pas autorisée.
 */
export const handleMethodNotAllowed = (req: NextRequest): NextResponse =>
  NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405, headers: corsHeaders() }
  )

/**
 * Renvoie 501 si la méthode n'est pas implémentée.
 */
export const handleNotImplemented = (req: NextRequest): NextResponse =>
  NextResponse.json(
    { error: 'Méthode non implémentée' },
    { status: 501, headers: corsHeaders() }
  )

/**
 * HOF qui applique CORS, throttling et gestion d'erreurs
 * à n'importe quel handler d'App Router (GET/POST/…).
 */
export function withBaseMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    try {
      // Limiter la fréquence des requêtes
      if (await throttleApiRequests(req)) {
        return NextResponse.json(
          { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
          { status: 429, headers: corsHeaders() }
        )
      }
      // Exécuter le handler
      return await handler(req)
    } catch (err: any) {
      // Gestion centralisée des erreurs
      return handleApiError(err, req)
    }
  }
}

/**
 * HOF pour protéger une route App Router via Clerk :
 * - Vérifie que l'utilisateur est connecté
 * - (Optionnel) vérifie un role si besoin
 * - Sinon renvoie 401
 */
export function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401, headers: corsHeaders() }
      )
    }
    return handler(req)
  }
}

/**
 * HOF pour protéger une route App Router réservée aux admins Clerk :
 * - Vérifie que l'utilisateur est connecté
 * - Vérifie sessionClaims.role === 'admin'
 * - Sinon renvoie 401 ou 403
 */
export function withAdmin(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
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
    return handler(req)
  }
}
