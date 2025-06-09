import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    const { articleId } = req.query;

    if (typeof articleId !== 'string') {
      return res.status(400).json({ error: 'articleId manquant ou invalide' });
    }

    try {
      const comments = await prisma.comment.findMany({
        where: { articleId },
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors du chargement des commentaires' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}
