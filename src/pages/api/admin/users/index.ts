// src/pages/api/admin/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérification des permissions admin
    const user = await requireAdmin(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, created_at')
        .order('email');

      if (error) throw error;
      
      return res.status(200).json(data);
    } else {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error: any) {
    console.error('Erreur API utilisateurs:', error);
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
