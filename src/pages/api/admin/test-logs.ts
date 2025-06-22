import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Type pour les logs de test
type TestLog = {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'error';
  result_id?: string;
}

// Extension du client Prisma pour permettre l'accès au modèle test_logs
interface CustomPrismaClient extends PrismaClient {
  test_logs: {
    findMany: (args?: { orderBy?: any }) => Promise<TestLog[]>;
  };
}

const prisma = new PrismaClient() as CustomPrismaClient;

// Vérifie si l'utilisateur est un admin factice
const isFakeAdmin = (req: NextApiRequest): boolean => {
  const apiKey = req.headers['x-api-key'];
  return apiKey === 'TEST_ADMIN_KEY_FOR_PREPRODUCTION';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier l'authentification admin
  if (!isFakeAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Seulement accepter les requêtes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Récupérer les logs de test, triés par date (plus récent en premier)
    const logs = await prisma.test_logs.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });

    return res.status(200).json({ logs });
  } catch (error: any) {
    console.error('Error fetching test logs:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch test logs', 
      details: error?.message || String(error)
    });
  }
}
