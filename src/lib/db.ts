/**
 * Réexporte les fonctionnalités de base de données depuis app/api/db.ts
 * Cela permet l'utilisation cohérente via @/lib/db dans tout le projet
 */

import { executeQuery, pool } from '../app/api/db';

export { executeQuery, pool };

// Interface générique pour faciliter le typage des résultats de requêtes
export interface DbResult<T> {
  data: T | null;
  error: Error | null;
}

// Fonction de requête avec typage générique
export async function executeTypedQuery<T>(query: string, params: any[] = []): Promise<DbResult<T>> {
  const result = await executeQuery(query, params);
  return result as DbResult<T>;
}
