import { NextApiRequest, NextApiResponse } from 'next';
import { createCheckoutSession } from '../../../lib/stripe';
import { executeQuery } from '../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // 1. Récupérer les données de la requête
    const { programId, email } = req.body;

    if (!programId || !email) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        message: 'L\'ID du programme et l\'email sont requis' 
      });
    }

    // 2. Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await executeQuery(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userError || !user || user.length === 0) {
      return res.status(401).json({ 
        error: 'Utilisateur non autorisé', 
        message: 'Veuillez vous connecter pour effectuer cet achat' 
      });
    }

    // 3. Vérifier que le programme existe
    const { data: program, error: programError } = await executeQuery(
      'SELECT id, name, price FROM programs WHERE id = $1',
      [programId]
    );

    if (programError || !program || program.length === 0) {
      return res.status(404).json({ 
        error: 'Programme introuvable', 
        message: 'Le programme demandé n\'existe pas' 
      });
    }

    // 4. Créer une session de paiement Stripe
    const checkoutUrl = await createCheckoutSession(email, programId);

    // 5. Retourner l'URL de la session Stripe
    return res.status(200).json({ url: checkoutUrl });

  } catch (error: any) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      message: error.message || 'Une erreur est survenue lors de la création de la session de paiement' 
    });
  }
}
