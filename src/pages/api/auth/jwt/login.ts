import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { HybridAuthService } from '@/lib/hybridAuth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email et mot de passe requis' 
      });
    }

    // Rechercher l'utilisateur par email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email ou mot de passe invalide' 
      });
    }

    // Si l'utilisateur a un clerk_id, rediriger vers Clerk
    if (user.clerk_id) {
      return res.status(200).json({ 
        success: false, 
        error: 'Veuillez utiliser la connexion sociale pour ce compte',
        useSocialAuth: true
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email ou mot de passe invalide' 
      });
    }

    // Générer le token JWT
    const token = HybridAuthService.generateJwtToken(
      user.id, 
      user.email, 
      user.is_admin || false
    );

    // Préparer les données utilisateur à renvoyer (sans le hash du mot de passe)
    const { password_hash, ...safeUserData } = user;

    return res.status(200).json({
      success: true,
      token,
      user: safeUserData
    });
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la connexion'
    });
  }
}
