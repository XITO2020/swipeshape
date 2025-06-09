import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { executeQuery } from '../db';

// Configuration de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Get token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  // Verify JWT token
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    userId = decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Token invalide: userId manquant' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }

  const { content, articleId, programId } = req.body;

  if (!content || !articleId) {
    return res.status(400).json({ error: 'Données manquantes' });
  }
  
  // Validation du programId (optionnel pour la rétrocompatibilité)
  const shouldCheckProgramId = !!programId;

  try {
    // 1. Récupérer les informations de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Erreur utilisateur:', userError);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // 2. Vérifier si l'utilisateur a effectué l'achat nécessaire
    let purchaseQuery = supabase
      .from('purchases')
      .select('id, program_id')
      .eq('user_id', userId)
      .eq('status', 'completed');
      
    // Si programId est fourni, vérifier spécifiquement cet achat
    if (shouldCheckProgramId) {
      purchaseQuery = purchaseQuery.eq('program_id', programId);
    }
    
    const { data: purchases, error: purchasesError } = await purchaseQuery;

    if (purchasesError) {
      console.error('Erreur vérification achats:', purchasesError);
      return res.status(500).json({ error: 'Erreur lors de la vérification des achats' });
    }

    // Vérifier si l'achat requis a été effectué
    const hasPurchased = purchases && purchases.length > 0;
    if (!hasPurchased) {
      // Message différent selon si on vérifie un programme spécifique ou tout achat
      const message = shouldCheckProgramId
        ? 'Vous devez acheter ce programme spécifique pour commenter cet article'
        : 'Vous devez acheter un programme pour pouvoir commenter';
        
      return res.status(403).json({
        error: 'Accès refusé',
        message
      });
    }

    // 3. Vérifier que l'article existe
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      console.error('Erreur article:', articleError);
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // 4. Créer le commentaire
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([
        {
          content,
          article_id: articleId,
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (commentError) {
      console.error('Erreur création commentaire:', commentError);
      return res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
    }

    // 5. Retourner le commentaire créé
    return res.status(201).json({ comment });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
