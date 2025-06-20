import { useAppStore } from './store';
import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { supabase } from './supabase';

// Type pour les données utilisateur décodées du JWT
export interface DecodedToken {
  userId: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

// Hook d'authentification simplifié compatible avec les routes et composants existants
export const useAuth = () => {
  const { user, isAuthenticated, isAdmin } = useAppStore();
  
  return {
    user,
    isAuthenticated,
    isAdmin,
    // Ajoutez d'autres méthodes au besoin
  };
};

// Vérifier le JWT token d'un utilisateur depuis l'en-tête Authorization
export const verifyAuthToken = async (req: NextApiRequest): Promise<DecodedToken | null> => {
  try {
    // Récupérer le token depuis l'en-tête Authorization (Bearer token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swipeshape_default_secret') as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return null;
  }
};

// Vérifier si l'utilisateur est un administrateur
export const verifyAuthAdmin = async (req: NextApiRequest): Promise<DecodedToken | null> => {
  try {
    // Vérifier le token
    const decoded = await verifyAuthToken(req);
    if (!decoded) {
      return null;
    }

    // Vérifier si l'utilisateur est administrateur dans le token
    if (decoded.isAdmin) {
      return decoded;
    } 
    
    // Double vérification dans la base de données pour plus de sécurité
    const { data } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', decoded.userId)
      .single();

    if (data?.is_admin) {
      return { ...decoded, isAdmin: true };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la vérification des droits admin:', error);
    return null;
  }
};

// Générer un JWT token pour un utilisateur
export const generateAuthToken = (userId: string, email: string, isAdmin: boolean): string => {
  return jwt.sign(
    { userId, email, isAdmin },
    process.env.JWT_SECRET || 'swipeshape_default_secret',
    { expiresIn: '7d' } // Expire après 7 jours
  );
};

// Middleware pour vérifier que l'utilisateur est admin et renvoyer une erreur si besoin
export const requireAdmin = async (req: NextApiRequest, res: any) => {
  const adminUser = await verifyAuthAdmin(req);
  
  if (!adminUser) {
    res.status(401).json({ error: 'Non autorisé: Droits administrateur requis' });
    return null;
  }
  
  return adminUser;
};
