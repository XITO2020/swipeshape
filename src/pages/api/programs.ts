// API Route pour les programmes
import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';
import { withApiMiddleware } from '@/lib/api-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {

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

// Exporter le handler avec le middleware appliqué
export default withApiMiddleware(handler);
