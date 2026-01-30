// src/lib/api-middleware-app.ts
import { NextResponse, NextRequest } from 'next/server'

// Map pour stocker le timestamp de la dernière requête par IP/route
const lastRequestMap = new Map<string, number>()
const MIN_REQUEST_INTERVAL = 100 // ms

export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  return forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
}

export function throttleApiRequests(request: NextRequest): boolean {
  const ip   = getClientIP(request)
  const path = request.nextUrl.pathname
  const key  = `${ip}-${path}`
  const now  = Date.now()
  const last = lastRequestMap.get(key) || 0

  if (now - last < MIN_REQUEST_INTERVAL) return true
  lastRequestMap.set(key, now)

  // nettoyage occasionnel
  if (now % 1000 === 0) {
    const expiry = now - 60_000
    for (const [k, ts] of lastRequestMap.entries()) {
      if (ts < expiry) lastRequestMap.delete(k)
    }
  }
  return false
}

export function corsHeaders() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const allowed = [
    appUrl,
    'https://swipeshape.com',
    'https://www.swipeshape.com',
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:3000', 'http://localhost:5173']
      : [])
  ]
  const origin = '*' // on override dynamiquement plus bas

  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  }
}

export function withApiMiddleware<T>(
  request: Request,
  response?: NextResponse<T> | Response
): NextResponse<T> {
  let res = response
    ? response instanceof NextResponse
      ? response
      : NextResponse.json(response)
    : NextResponse.json({})

  const cors = corsHeaders()
  const originHeader = (request as any).headers?.get?.('origin') as string | null
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const allowedOrigins = [
    appUrl,
    'https://swipeshape.com',
    'https://www.swipeshape.com',
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:3000', 'http://localhost:5173']
      : [])
  ]

  cors['Access-Control-Allow-Origin'] =
    originHeader && allowedOrigins.includes(originHeader)
      ? originHeader
      : process.env.NODE_ENV === 'development'
      ? '*'
      : appUrl

  for (const [k, v] of Object.entries(cors)) {
    res.headers.set(k, v)
  }

  return res
}

export function handleApiError(
  request: Request,
  error: any,
  status = 500,
  customMessage?: string
) {
  console.error('API Error:', error)
  const message =
    customMessage || (error instanceof Error ? error.message : String(error))
  const res = NextResponse.json(
    { error: 'Une erreur est survenue', details: message },
    { status }
  )
  return withApiMiddleware(request, res)
}
