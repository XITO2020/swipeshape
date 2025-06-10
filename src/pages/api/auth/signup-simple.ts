// API route d'inscription simplifiée - contourne les problèmes de l'API route principale
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log pour le débogage
    console.log('API route signup-simple: Début de traitement');
    
    // Récupérer les informations
    const { email, password, userData } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Créer client Supabase avec la clé de service
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variables d\'environnement Supabase non définies');
      return res.status(500).json({ error: 'Configuration serveur incomplète' });
    }

    // Afficher les informations de débogage (sans exposer la clé complète)
    console.log(`URL: ${supabaseUrl}`);
    console.log(`ServiceKey (début): ${supabaseServiceKey.substring(0, 15)}...`);
    
    // Créer le client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Appeler l'API Supabase pour l'inscription
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmer l'email pour les tests
      user_metadata: userData || {}
    });

    console.log('Résultat inscription:', error ? 'Erreur' : 'Succès');
    
    if (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Utilisateur créé avec succès',
      user: data.user
    });
    
  } catch (error: any) {
    console.error('Exception non gérée:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}
