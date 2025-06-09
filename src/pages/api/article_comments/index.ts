// src/pages/api/article_comments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Configuration de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          id, 
          content, 
          created_at, 
          users(id, name, email, avatar_url)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      return res.status(200).json(comments);
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return res.status(500).json({ error: 'Erreur serveur inattendue' });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
