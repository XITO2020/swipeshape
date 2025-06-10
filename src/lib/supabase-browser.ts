// Client Supabase côté navigateur pour tester l'authentification directe
import { createClient } from '@supabase/supabase-js';

// Utiliser les clés publiques disponibles côté client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas définies!');
}

// Client seulement avec la clé anonyme
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Fonction d'inscription directe (contourne l'API route)
export const directSignUp = async (email: string, password: string, userData = {}) => {
  try {
    console.log('Test: Inscription directe avec le client navigateur');
    const result = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    console.log('Résultat inscription directe:', result);
    return result;
  } catch (error) {
    console.error('Erreur inscription directe:', error);
    return { data: null, error };
  }
};
