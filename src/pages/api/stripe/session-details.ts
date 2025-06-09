import { NextApiRequest, NextApiResponse } from 'next';
import { getCheckoutSession } from '../../../lib/stripe';
import { executeQuery } from '../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'ID de session manquant ou invalide' });
  }

  try {
    // 1. Récupérer les détails de la session depuis Stripe
    const session = await getCheckoutSession(session_id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session introuvable' });
    }

    const programId = session.metadata?.programId;
    const userEmail = session.customer_email || session.metadata?.userEmail;

    if (!programId || !userEmail) {
      return res.status(400).json({ error: 'Informations de session incomplètes' });
    }

    // 2. Récupérer les détails de l'achat dans notre base de données
    const { data: purchases, error: purchasesError } = await executeQuery(
      `SELECT * FROM purchases 
       WHERE payment_intent_id = $1 
       OR (user_email = $2 AND program_id = $3)
       ORDER BY created_at DESC
       LIMIT 1`,
      [session.payment_intent, userEmail, programId]
    );

    if (purchasesError || !purchases || purchases.length === 0) {
      return res.status(404).json({ error: 'Achat introuvable dans la base de données' });
    }

    // 3. Récupérer les détails du programme
    const { data: programs, error: programsError } = await executeQuery(
      'SELECT * FROM programs WHERE id = $1',
      [programId]
    );

    if (programsError || !programs || programs.length === 0) {
      return res.status(404).json({ error: 'Programme introuvable' });
    }

    // 4. Retourner toutes les informations
    return res.status(200).json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total ? session.amount_total / 100 : null,
        customer_email: session.customer_email
      },
      purchase: purchases[0],
      program: programs[0]
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des détails de la session:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors de la récupération des détails de la session'
    });
  }
}
