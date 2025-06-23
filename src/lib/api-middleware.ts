import { NextResponse } from 'next/server';

/**
 * Injecte les en-têtes CORS sur une NextResponse
 */
export function withApiMiddleware(response: NextResponse): NextResponse {
  const origin =
    process.env.NODE_ENV === 'development'
      ? '*' 
      : process.env.NEXT_PUBLIC_APP_URL || '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };

  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

/**
 * Retourne une erreur JSON formatée + CORS
 */
export function handleApiError(
  message: string,
  status: number = 500
): NextResponse {
  const res = NextResponse.json({ error: message }, { status });
  return withApiMiddleware(res);
}

// Map pour limiter le nombre de requêtes par IP+URL
const lastRequestMap = new Map<string, number>();

/**
 * Renvoie true si la requête doit être throttlée
 */
export function throttleApiRequests(
  request: Request,
  windowMs: number = 100
): boolean {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `${ip}:${request.url}`;
  const now = Date.now();
  const prev = lastRequestMap.get(key) || 0;
  if (now - prev < windowMs) {
    return true;
  }
  lastRequestMap.set(key, now);
  return false;
}
