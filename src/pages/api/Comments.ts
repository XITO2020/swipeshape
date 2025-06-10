import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API comments endpoint called with method:', req.method);
  
  // Enable CORS headers for all requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Gérer la méthode GET (récupérer les commentaires)
  if (req.method === 'GET') {
    try {
      console.log('Fetching comments from database using direct PostgreSQL connection');
      
      // Récupérer le filtre par article si fourni
      const { articleId } = req.query;
      
      let query = 'SELECT * FROM comments WHERE 1=1';
      const params: any[] = [];
      
      // Appliquer le filtre par article si fourni
      if (articleId && typeof articleId === 'string') {
        query += ' AND article_id = $1';
        params.push(articleId);
      }
      
      // Ajouter le tri par date de création
      query += ' ORDER BY created_at DESC';
      
      // Exécuter la requête via le pool PostgreSQL
      const { data, error } = await executeQuery(query, params);
      
      if (error) {
        console.error('Database error fetching comments:', error);
        return res.status(500).json({ 
          error: 'Erreur lors du chargement des commentaires',
          details: error.message
        });
      }
      
      console.log(`Returning ${data?.length || 0} comments from database`);
      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Exception in comments API:', error);
      return res.status(500).json({ 
        error: 'Erreur lors du chargement des commentaires',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } 
  // Gérer la méthode POST (créer un commentaire)
  else if (req.method === 'POST') {
    try {
      const { content, user_id, user_email, rating, avatar_url, article_id } = req.body;
      console.log('Creating new comment:', req.body);
      
      // Valider les champs requis
      if (!user_email) {
        return res.status(400).json({ error: 'Le champ email est requis' });
      }
      
      // Construire la requête d'insertion
      const query = `
        INSERT INTO comments 
        (content, user_id, user_email, rating, avatar_url, article_id, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        RETURNING *
      `;
      
      const params = [
        content || '',
        user_id || null,
        user_email,
        rating || 5,
        avatar_url || null,
        article_id || null
      ];
      
      // Exécuter l'insertion via le pool PostgreSQL
      const { data, error } = await executeQuery(query, params);
      
      if (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({ 
          error: 'Erreur lors de la création du commentaire',
          details: error.message
        });
      }
      
      const newComment = data?.[0];
      return res.status(201).json(newComment);
    } catch (error) {
      console.error('Exception in POST comments API:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la création du commentaire',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } 
  // Gérer les autres méthodes
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}
