import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../db';

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
    const { data: users, error: userError } = await executeQuery(
      'SELECT id, email FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );

    if (userError || !users || users.length === 0) {
      console.error('Erreur utilisateur:', userError);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const user = users[0];

    // 2. Vérifier si l'utilisateur a effectué l'achat nécessaire
    let purchaseQuerySql = `
      SELECT id, program_id 
      FROM purchases 
      WHERE user_id = $1 AND status = 'completed'
    `;
    let queryParams = [userId];
      
    // Si programId est fourni, vérifier spécifiquement cet achat
    if (shouldCheckProgramId) {
      purchaseQuerySql += ` AND program_id = $2`;
      queryParams.push(programId);
    }
    
    const { data: purchases, error: purchasesError } = await executeQuery(purchaseQuerySql, queryParams);

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
    const { data: articles, error: articleError } = await executeQuery(
      'SELECT id FROM articles WHERE id = $1 LIMIT 1',
      [articleId]
    );

    if (articleError || !articles || articles.length === 0) {
      console.error('Erreur article:', articleError);
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    const article = articles[0];

    // 4. Créer le commentaire
    const currentDate = new Date().toISOString();
    const { data: newComment, error: commentError } = await executeQuery(
      `INSERT INTO comments (content, article_id, user_id, created_at) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, content, article_id, user_id, created_at`,
      [content, articleId, userId, currentDate]
    );

    if (commentError || !newComment || newComment.length === 0) {
      console.error('Erreur création commentaire:', commentError);
      return res.status(500).json({ 
        error: 'Erreur lors de la création du commentaire',
        details: commentError instanceof Error ? commentError.message : String(commentError)
      });
    }

    // 5. Retourner le commentaire créé
    return res.status(201).json({ comment: newComment[0] });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
