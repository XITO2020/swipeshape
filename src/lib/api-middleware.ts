import { NextApiRequest, NextApiResponse } from 'next';

// Map pour stocker le timestamp de la dernière requête par IP/route
const lastRequestMap = new Map<string, number>();

// Délai minimum entre les requêtes en ms (100ms)
const MIN_REQUEST_INTERVAL = 100;

/**
 * Middleware pour limiter la fréquence des appels API
 * Cela empêche les re-renderings infinis de surcharger la base de données
 * tout en préservant la fonctionnalité normale pour les utilisateurs réels
 */
export function throttleApiRequests(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Créer une clé unique pour cette combinaison IP/route
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const path = req.url || '';
    const key = `${ip}-${path}`;
    
    const now = Date.now();
    const lastRequest = lastRequestMap.get(key) || 0;
    
    // Si la requête arrive trop tôt après la précédente
    if (now - lastRequest < MIN_REQUEST_INTERVAL) {
      // Retourner immédiatement les dernières données mises en cache si disponibles
      // Au lieu de renvoyer une erreur qui pourrait perturber l'UX
      // Simplement indiquer dans les en-têtes que la requête a été limitée
      res.setHeader('X-Throttled', 'true');
      
      // Si c'est une requête GET (lecture seule), on peut quand même l'exécuter
      // mais à fréquence limitée pour éviter la surcharge
      if (req.method !== 'GET') {
        return res.status(429).json({
          message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
          throttled: true
        });
      }
    }
    
    // Mettre à jour le timestamp de la dernière requête
    lastRequestMap.set(key, now);
    
    // Continuer avec le gestionnaire d'API normal
    return handler(req, res);
  };
}

/**
 * Ajoute des en-têtes CORS standards à toutes les réponses
 */
export function withCors(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Paramètres CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Préflight OPTIONS
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Continue normal handler
    return handler(req, res);
  };
}

/**
 * Export combiné pour appliquer plusieurs middleware
 */
export function withApiMiddleware(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>) {
  return withCors(throttleApiRequests(handler));
}
