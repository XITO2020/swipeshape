import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../db';
import { verifyAuthAdmin } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que l'utilisateur est un administrateur
  try {
    const user = await verifyAuthAdmin(req);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer tous les achats avec les détails du programme
    const { data: purchases, error } = await executeQuery(`
      SELECT 
        p.*, 
        pr.name as program_name,
        pr.price as program_price
      FROM purchases p
      LEFT JOIN programs pr ON p.program_id = pr.id
      ORDER BY p.created_at DESC
    `, []);

    if (error) {
      console.error('Erreur lors de la récupération des achats:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des achats' });
    }

    return res.status(200).json({
      success: true,
      purchases
    });
  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors de la récupération des achats'
    });
  }
}
