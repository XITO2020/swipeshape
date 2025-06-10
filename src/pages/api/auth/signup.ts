import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase avec les variables d'environnement côté serveur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, options } = req.body;
    
    // Vérification des données
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    console.log(`Tentative d'inscription pour: ${email}`);

    // Appel à Supabase côté serveur (évite CORS)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });

    if (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return res.status(400).json({ error: error.message });
    }

    // Retourner les données de l'utilisateur
    return res.status(200).json({ data });
    
  } catch (error: any) {
    console.error('Exception lors de l\'inscription:', error);
    return res.status(500).json({ error: error.message || 'Une erreur est survenue lors de l\'inscription' });
  }
}
