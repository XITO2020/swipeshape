// src/lib/adminMiddleware.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'

/**
 * HOF pour protéger une Next.js API Route (Pages Router) :
 * Higher Order Function
 * - Vérifie que l’utilisateur est authentifié via Clerk.
 * - Vérifie que sessionClaims.role === "admin".
 * - Si non, renvoie 401 ou 403.
 * - Sinon, appelle le handler.
 *
 * Usage (dans un fichier sous /pages/api) :
 *
 *   import type { NextApiRequest, NextApiResponse } from 'next'
 *   import { withAdminAuth } from '@/lib/adminMiddleware'
 *
 *   async function handler(req: NextApiRequest, res: NextApiResponse) {
 *     // ... votre logique admin ...
 *     res.status(200).json({ ok: true })
 *   }
 *
 *   export default withAdminAuth(handler)
 */
export function withAdminAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => any | Promise<any>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Récupération de l’authentification Clerk
    const { userId, sessionClaims } = getAuth(req)

    // 1) Non authentifié
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    // 2) Pas admin
    if (sessionClaims?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
    }

    // 3) Tout est OK, on exécute le handler
    return handler(req, res)
  }
}
