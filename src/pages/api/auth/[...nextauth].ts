// Façade de compatibilité pour les anciennes références à next-auth
// Ce fichier est maintenu pour gérer les redirections des anciennes routes auth
// mais il utilise notre système JWT personnalisé

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../utils/auth';

/**
 * Handler qui intègre notre système d'authentification JWT personnalisé
 * et assure la compatibilité avec d'anciennes routes qui utilisaient next-auth
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Rediriger vers notre API auth principale
  res.redirect(307, '/api/auth');
}
