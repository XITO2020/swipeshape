import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthToken } from '../../../lib/auth';
import { checkUserCanComment } from '../../../lib/supabase';
import Cors from 'cors';

// Initialisation du middleware CORS
const cors = Cors({
  methods: ['GET', 'OPTIONS'],
});

// Helper pour exécuter le middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Exécuter le middleware CORS
  await runMiddleware(req, res, cors);

  // Vérifier la méthode HTTP
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification
    const token = await verifyAuthToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Récupérer l'ID du programme demandé
    const { programId } = req.query;
    
    if (!programId) {
      return res.status(400).json({ error: 'ID du programme requis' });
    }

    // Vérifier si l'utilisateur a acheté ce programme
    const { canComment, error, programIds } = await checkUserCanComment(token.userId, programId.toString());

    if (error) {
      console.error('Erreur lors de la vérification des achats:', error);
      return res.status(500).json({ error: 'Erreur lors de la vérification de l\'achat' });
    }

    // Retourner le résultat
    return res.status(200).json({ 
      hasPurchased: canComment,
      programIds
    });

  } catch (error) {
    console.error('Erreur vérification achat:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la vérification de l\'achat' });
  }
}
