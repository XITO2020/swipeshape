import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { HybridAuthService } from '@/lib/hybridAuth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email et mot de passe requis' 
      });
    }

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, clerk_id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      // Si l'utilisateur a un clerk_id, suggérer d'utiliser l'authentification sociale
      if (existingUser.clerk_id) {
        return res.status(400).json({
          success: false,
          error: 'Cet email est déjà utilisé avec une authentification sociale',
          useSocialAuth: true
        });
      }
      
      return res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur dans Supabase
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        first_name: firstName || '',
        last_name: lastName || '',
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('Erreur création utilisateur:', createError);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du compte'
      });
    }

    // Générer le token JWT
    const token = HybridAuthService.generateJwtToken(
      newUser.id,
      newUser.email,
      newUser.is_admin || false
    );

    // Préparer les données utilisateur à renvoyer (sans le hash du mot de passe)
    const { password_hash, ...safeUserData } = newUser;

    // Envoyer un email de bienvenue (facultatif - à implémenter)
    // await sendWelcomeEmail(email, firstName);

    return res.status(201).json({
      success: true,
      token,
      user: safeUserData
    });
  } catch (error: any) {
    console.error('Erreur d\'enregistrement:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'enregistrement'
    });
  }
}
