import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
// Note: Nous utilisons process.env pour vérifier l'environnement de développement

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Utiliser la clé de service (service_role) pour les opérations côté serveur
// Cette clé a plus de permissions que la clé anonyme (anon)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Utiliser la clé anonyme comme fallback (pour tester)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Désactiver temporairement la vérification de certificat SSL pour le développement uniquement
// IMPORTANT: Ceci n'est pas recommandé en production!
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('⚠️ SSL verification disabled for development');
}

// Débogage approfondi des clés pour voir si elles sont chargées correctement
console.log('Débogage des clés API:');
console.log(`- URL Supabase: ${supabaseUrl}`);
console.log(`- Service key disponible: ${!!supabaseServiceKey}`);
console.log(`- Service key longueur: ${supabaseServiceKey.length}`);
console.log(`- Service key début: ${supabaseServiceKey.substring(0, 20)}...`);
console.log(`- Service key JWT format correct: ${supabaseServiceKey.split('.').length === 3 ? 'Oui' : 'Non'}`);
console.log(`- Anon key disponible: ${!!supabaseAnonKey}`);
console.log(`- Anon key début: ${supabaseAnonKey.substring(0, 20)}...`);

// UTILISER UNIQUEMENT LA CLÉ DE SERVICE pour les opérations d'auth côté serveur
const keyToUse = supabaseServiceKey;
console.log('UTILISATION DE LA CLÉ DE SERVICE POUR L\'AUTHENTIFICATION');

// Configurer Supabase avec les options avancées
const supabase = createClient(supabaseUrl, keyToUse, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Vérifier que le client est bien initialisé
console.log(`Supabase client créé avec URL: ${supabaseUrl}`);
console.log(`Clé utilisée: ${keyToUse === supabaseServiceKey ? 'Service Role Key' : 'Anon Key'}`);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, ...data } = req.body;

  try {
    let result;
    
    // Route the request to the appropriate Supabase auth function
    switch (action) {
      case 'signUp':
        console.log('Processing signup for:', data.email);
        // Assurer que les données sont au bon format pour Supabase
        console.log('SignUp data received:', JSON.stringify(data));
        try {
          // Déboguer la structure des options reçues
          console.log('Structure options avant correction:', JSON.stringify(data.options));
          
          // Dans la requête client, options est déjà un objet qui contient une propriété options
          // On doit donc désemboîter pour éviter {options: {options: {...}}}
          const userMetadata = data.options?.options?.data || {};
          
          result = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: userMetadata
            }
          });
          
          console.log('Signup result from Supabase:', JSON.stringify(result));
          
          // Vérifier si l'inscription a réussi
          if (result.error) {
            console.error('Supabase signup error:', result.error);
          } else if (result.data && result.data.user) {
            console.log('User created successfully with ID:', result.data.user.id);
          }
        } catch (err) {
          console.error('Exception during signup:', err);
          throw err;
        }
        break;
        
      case 'signIn':
        console.log('Processing signin for:', data.email);
        // Assurer que les données sont au bon format pour Supabase
        try {
          result = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });
          console.log('Signin result from Supabase:', JSON.stringify(result));
          
          // Vérifier si la connexion a réussi
          if (result.error) {
            console.error('Supabase signin error:', result.error);
          } else if (result.data && result.data.user) {
            console.log('User signed in successfully with ID:', result.data.user.id);
          }
        } catch (err) {
          console.error('Exception during signin:', err);
          throw err;
        }
        break;
        
      case 'signOut':
        result = await supabase.auth.signOut();
        break;
        
      case 'resetPassword':
        result = await supabase.auth.resetPasswordForEmail(data.email);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`Error in supabase-auth (${action}):`, error);
    // Amélioration des logs d'erreur
    console.log('Error details:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    
    // Détection des erreurs spécifiques
    let statusCode = 500;
    let errorMessage = error.message;
    
    // Gérer les cas particuliers
    if (error.message?.includes('User already registered')) {
      statusCode = 409; // Conflict
      errorMessage = 'Cet email est déjà utilisé';
    } else if (error.message?.includes('Invalid login credentials')) {
      statusCode = 401; // Unauthorized
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.message?.includes('rate limited')) {
      statusCode = 429; // Too Many Requests
      errorMessage = 'Trop de tentatives, veuillez réessayer plus tard';
    }
    
    return res.status(statusCode).json({ 
      error: errorMessage, 
      cause: error.cause ? JSON.stringify(error.cause) : null,
      originalError: error.message
    });
  }
}
