// API Route pour les programmes
import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await executeQuery(`
        SELECT * FROM programs 
        ORDER BY created_at DESC
      `);

      if (error) {
        console.error('Erreur API programmes:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des programmes' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Exception API programmes:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération des programmes' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
