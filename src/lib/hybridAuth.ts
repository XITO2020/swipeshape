import { supabase } from './supabase';
import jwt from 'jsonwebtoken';
import { useUser } from '@clerk/nextjs';
import { useAppStore } from './store';
import { User } from '@/types';

// Type pour les données utilisateur JWT
export interface DecodedJwtToken {
  userId: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

// Service hybride d'authentification qui combine JWT et Clerk
export class HybridAuthService {
  // Générer un JWT pour l'authentification par email
  static generateJwtToken(userId: string, email: string, isAdmin: boolean): string {
    return jwt.sign(
      { userId, email, isAdmin },
      process.env.JWT_SECRET || 'swipeshape_default_secret',
      { expiresIn: '7d' }
    );
  }

  // Vérifier un JWT token
  static verifyJwtToken(token: string): DecodedJwtToken | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'swipeshape_default_secret') as DecodedJwtToken;
    } catch (error) {
      console.error('Erreur lors de la vérification du token JWT:', error);
      return null;
    }
  }

  // Synchroniser un utilisateur Clerk avec la base de données
  static async syncClerkUser(clerkUser: any): Promise<User | null> {
    if (!clerkUser) return null;

    try {
      // Vérifier si l'utilisateur existe déjà dans la base de données
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', clerkUser.primaryEmailAddress?.emailAddress)
        .single();

      if (existingUser) {
        // Mettre à jour les informations Clerk si nécessaire
        const { data: updatedUser } = await supabase
          .from('users')
          .update({
            clerk_id: clerkUser.id,
            first_name: clerkUser.firstName || existingUser.first_name,
            last_name: clerkUser.lastName || existingUser.last_name,
            avatar_url: clerkUser.imageUrl || existingUser.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .single();

        return updatedUser;
      } else {
        // Créer un nouvel utilisateur
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            email: clerkUser.primaryEmailAddress?.emailAddress,
            clerk_id: clerkUser.id,
            first_name: clerkUser.firstName || '',
            last_name: clerkUser.lastName || '',
            avatar_url: clerkUser.imageUrl || '',
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .single();

        if (error) {
          console.error('Erreur lors de la création de l\'utilisateur:', error);
          return null;
        }

        return newUser;
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation de l\'utilisateur Clerk:', error);
      return null;
    }
  }

  // Hook pour récupérer l'utilisateur actuel (JWT ou Clerk)
  static useCurrentUser() {
    const clerkUser = useUser();
    const { user, isAuthenticated, isAdmin } = useAppStore();
    const appUser = user;

    // Si l'utilisateur est connecté via Clerk, synchroniser avec notre base de données
    if (clerkUser.isSignedIn && !appUser) {
      HybridAuthService.syncClerkUser(clerkUser.user)
        .then(syncedUser => {
          if (syncedUser) {
            // Mettre à jour le store avec l'utilisateur synchronisé
            useAppStore.getState().setUser(syncedUser);
            useAppStore.getState().setAuthState(true, syncedUser.is_admin || false);
          }
        })
        .catch(err => console.error('Erreur de synchronisation utilisateur:', err));
      
      return {
        user: clerkUser.user,
        isAuthenticated: clerkUser.isSignedIn,
        isAdmin: false, // Par défaut, à mettre à jour après synchro
        isLoading: clerkUser.isLoaded,
        authType: 'clerk'
      };
    }

    // Sinon, retourner l'utilisateur du store (JWT ou déjà synchronisé)
    return {
      user: appUser,
      isAuthenticated,
      isAdmin,
      isLoading: false,
      authType: appUser?.clerk_id ? 'clerk' : 'jwt'
    };
  }
}

// Hook pratique pour utiliser l'authentification hybride
export const useHybridAuth = HybridAuthService.useCurrentUser;
