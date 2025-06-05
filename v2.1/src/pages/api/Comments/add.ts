import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  const { content, articleId } = req.body;

  if (!content || !articleId) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        purchases: {
          select: { programId: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifie si l'utilisateur a effectué un achat
    const hasPurchased = user.purchases.length > 0;

    if (!hasPurchased) {
      return res.status(403).json({ error: 'Accès refusé : aucun achat trouvé' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        article: { connect: { id: articleId } },
        author: { connect: { id: userId } },
      },
    });

    return res.status(201).json({ comment });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
