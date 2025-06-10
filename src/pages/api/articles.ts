// API Route pour les articles
import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';
import { withApiMiddleware } from '@/lib/api-middleware';

// Utilisation du middleware pour limiter les appels excessifs
async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'GET') {
    try {
      // Récupérer les paramètres de recherche
      const { search, date } = req.query;
      
      let query = `SELECT * FROM articles WHERE 1=1`;
      const params: any[] = [];
      
      // Ajouter les filtres si nécessaire
      if (search && typeof search === 'string' && search.trim() !== '') {
        query += ` AND (title ILIKE $${params.length + 1} OR content ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      if (date && typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          query += ` AND DATE(created_at) = DATE($${params.length + 1})`;
          params.push(date);
        }
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const { data, error } = await executeQuery(query, params);

      if (error) {
        console.error('Erreur API articles:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des articles' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Exception API articles:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération des articles' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Exporter le handler avec le middleware appliqué
export default withApiMiddleware(handler);
