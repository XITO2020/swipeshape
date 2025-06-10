// API Route pour les événements
import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';
import { Event } from '@/types';
import { withApiMiddleware } from '@/lib/api-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API events endpoint called with method:', req.method);

  if (req.method === 'GET') {
    try {
      // Récupérer les paramètres de recherche
      const { search, date, upcoming } = req.query;
      console.log('Fetching events with filters:', { search, date, upcoming });
      
      // Construire la requête SQL et les paramètres
      let sqlQuery = 'SELECT * FROM events WHERE 1=1';
      const params: any[] = [];
      
      // Ajouter les filtres si nécessaire
      if (search && typeof search === 'string' && search.trim() !== '') {
        // Pour une recherche textuelle
        sqlQuery += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      if (date && typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          // Pour un filtre par date
          const dateStr = date.split('T')[0]; // Format YYYY-MM-DD
          sqlQuery += ` AND event_date >= $${params.length + 1} AND event_date < $${params.length + 2}`;
          params.push(`${dateStr}T00:00:00`);
          params.push(`${dateStr}T23:59:59`);
        }
      }
      
      // Filtre pour les événements à venir
      if (upcoming === 'true') {
        const now = new Date().toISOString();
        sqlQuery += ` AND event_date >= $${params.length + 1}`;
        params.push(now);
      }
      
      // Ordonner les résultats
      sqlQuery += ' ORDER BY event_date ASC';
      
      // Exécuter la requête
      console.log('Executing SQL query:', sqlQuery, 'with params:', params);
      const { data, error } = await executeQuery(sqlQuery, params);
      
      if (error) {
        console.error('Erreur de base de données dans API événements:', error);
        return res.status(500).json({
          error: 'Erreur lors de la récupération des événements',
          details: error instanceof Error ? error.message : String(error)
        });
      }

      console.log(`Successfully fetched ${data?.length || 0} events`);
      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Exception API événements:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur lors de la récupération des événements',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Exporter le handler avec le middleware appliqué
export default withApiMiddleware(handler);
