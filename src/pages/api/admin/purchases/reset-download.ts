import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../db';
import { verifyAuthAdmin } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { purchaseId } = req.body;

  if (!purchaseId) {
    return res.status(400).json({ error: 'ID d\'achat manquant' });
  }

  try {
    // Réinitialiser le compteur de téléchargements
    const { data, error } = await executeQuery(
      'UPDATE purchases SET download_count = 0 WHERE id = $1 RETURNING *',
      [purchaseId]
    );

    if (error || !data || data.length === 0) {
      console.error('Erreur lors de la réinitialisation du compteur:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la réinitialisation du compteur',
        details: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Compteur de téléchargements réinitialisé avec succès',
      purchase: data[0]
    });
  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors de la réinitialisation du compteur'
    });
  }
}
