// src/pages/api/article_comments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { method, query } = req;

  if (method === "GET") {
    const articleId = query.articleId as string;
    if (!articleId) {
      return res.status(400).json({ error: "ID d'article requis" });
    }
    
    try {
      // Récupérer les commentaires avec les informations de l'auteur
      // Utiliser une jointure SQL pour remplacer la fonctionnalité supabase de nested select
      const sqlQuery = `
        SELECT 
          c.id, 
          c.content, 
          c.created_at,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'avatar_url', u.avatar_url
          ) as users
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.article_id = $1
        ORDER BY c.created_at DESC
      `;
      
      const { data: comments, error } = await executeQuery(sqlQuery, [articleId]);
      
      if (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        return res.status(500).json({ 
          error: 'Erreur serveur', 
          details: error instanceof Error ? error.message : String(error) 
        });
      }
      
      return res.status(200).json(comments || []);
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return res.status(500).json({ error: 'Erreur serveur inattendue' });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
