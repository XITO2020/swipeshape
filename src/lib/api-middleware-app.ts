import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';

// Map pour stocker le timestamp de la dernière requête par IP/route
const lastRequestMap = new Map<string, number>();

// Délai minimum entre les requêtes en ms (100ms)
const MIN_REQUEST_INTERVAL = 100;

// Fonction pour obtenir l'adresse IP
export function getClientIP(request: NextRequest): string {
  // Utiliser directement les headers de la requête au lieu de la fonction headers()
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown';
}

/**
 * Middleware pour limiter la fréquence des appels API
 * Cela empêche les re-renderings infinis de surcharger la base de données
 */
export function throttleApiRequests(request: NextRequest): boolean {
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;
  const key = `${ip}-${path}`;
  
  const now = Date.now();
  const lastRequest = lastRequestMap.get(key) || 0;
  
  // Si la requête arrive trop tôt après la précédente
  if (now - lastRequest < MIN_REQUEST_INTERVAL) {
    return true; // La requête devrait être limitée
  }
  
  // Sinon, mettre à jour le timestamp de la dernière requête
  lastRequestMap.set(key, now);
  
  // Nettoyage périodique pour éviter les fuites de mémoire
  if (now % 1000 === 0) {
    // Une fois toutes les ~1000ms, nettoyer les entrées anciennes
    const expiryTime = now - 60000; // 1 minute
    for (const [mapKey, timestamp] of lastRequestMap.entries()) {
      if (timestamp < expiryTime) {
        lastRequestMap.delete(mapKey);
      }
    }
  }
  
  return false; // La requête n'est pas limitée
}

/**
 * Headers CORS pour les API routes
 */
export function corsHeaders() {
  // Récupérer l'URL de l'application depuis les variables d'environnement
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Liste des origines autorisées
  const allowedOrigins = [
    appUrl,
    'https://swipeshape.com',
    'https://www.swipeshape.com',
    // Ajouter d'autres origines si nécessaire (par exemple, domaines de staging)
  ];
  
  // En développement, autoriser localhost
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
  }
  
  // L'origine à utiliser dépend de l'en-tête Origin de la requête
  // Cette valeur sera remplacée dynamiquement dans chaque gestionnaire de route
  const origin = '*'; // Valeur par défaut, sera remplacée dynamiquement
  
  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  };
}

/**
 * Applique les règles de throttling et ajoute les headers CORS
 */
export function withApiMiddleware<T>(request: Request, response?: NextResponse<T> | Response): NextResponse<T> {
  // Si response n'est pas fourni, créer une réponse vide
  if (!response) {
    response = NextResponse.json({});
  }

  // Si response n'est pas un NextResponse, le convertir
  if (!(response instanceof NextResponse)) {
    response = NextResponse.json(response);
  }

  // Récupère les headers CORS
  const cors = corsHeaders();
  
  // Détermine l'origine autorisée en fonction de l'en-tête Origin de la requête
  let origin: string | null = null;
  try {
    origin = request.headers.get('origin');
  } catch (error) {
    console.warn("Impossible de lire l'en-tête origin", error);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Liste des origines autorisées
  const allowedOrigins = [
    appUrl,
    'https://swipeshape.com',
    'https://www.swipeshape.com',
  ];
  
  // En développement, autoriser localhost
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
  }
  
  // Si l'origine est dans la liste autorisée, on l'utilise; sinon on utilise la valeur par défaut
  if (origin && allowedOrigins.includes(origin)) {
    cors['Access-Control-Allow-Origin'] = origin;
  } else if (process.env.NODE_ENV === 'development') {
    // En développement, on est plus permissif
    cors['Access-Control-Allow-Origin'] = '*';
  } else {
    // En production, on utilise l'URL principale par défaut
    cors['Access-Control-Allow-Origin'] = appUrl;
  }
  
  // Ajoute les headers CORS de façon sécurisée
  try {
    Object.entries(cors).forEach(([key, value]) => {
      if (response instanceof NextResponse && response.headers) {
        response.headers.set(key, value);
      }
    });
  } catch (error) {
    console.error("Erreur lors de la définition des en-têtes CORS:", error);
  }
  
  return response as NextResponse<T>;
}

/**
 * Gère les erreurs de manière consistante
 */
export function handleApiError(request: Request, error: any, status = 500, customMessage?: string) {
  console.error('API Error:', error);
  const message = customMessage || (error instanceof Error ? error.message : String(error));
  
  // Créer la réponse
  const response = NextResponse.json(
    { error: 'Une erreur est survenue', details: message },
    { status }
  );
  
  // Appliquer les headers CORS en tenant compte de l'origine
  return withApiMiddleware(request, response);
}
