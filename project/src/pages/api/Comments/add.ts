import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const { content, articleId } = req.body;

  if (!content || !articleId) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
        author: { connect: { id: user.id } },
      },
    });

    return res.status(201).json({ comment });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
