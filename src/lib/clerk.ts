// src/lib/clerk.ts
import { clerkClient } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/dist/types/server';

/**
 * Récupère les informations utilisateur depuis Clerk
 * @param userId ID utilisateur Clerk
 */
export async function getClerkUser(userId: string) {
  try {
    return await clerkClient.users.getUser(userId);
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur Clerk:', error);
    return null;
  }
}

/**
 * Crée ou met à jour l'utilisateur dans notre base de données à partir des données Clerk
 * @param clerkUserId ID utilisateur Clerk
 * @param userData Données utilisateur optionnelles à mettre à jour
 */
export async function syncClerkUserToDatabase(clerkUserId: string, userData?: Record<string, any>) {
  // Récupérer les données utilisateur de Clerk
  const clerkUser = await getClerkUser(clerkUserId);
  
  if (!clerkUser) {
    throw new Error('Utilisateur Clerk non trouvé');
  }
  
  // Extraire les informations pertinentes
  const userInfo = {
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    profileImageUrl: clerkUser.profileImageUrl,
    // Identifiez la méthode d'authentification
    authProvider: getAuthProvider(clerkUser),
    ...userData
  };
  
  // Ici, synchronisez avec votre base de données
  // Par exemple, utilisant Supabase, Prisma, ou une API custom
  
  return userInfo;
}

/**
 * Détermine le fournisseur d'authentification utilisé
 */
function getAuthProvider(clerkUser: any): 'google' | 'tiktok' | 'instagram' | 'email' | 'unknown' {
  const oauthAccounts = clerkUser.externalAccounts || [];
  
  for (const account of oauthAccounts) {
    if (account.provider === 'google') return 'google';
    if (account.provider === 'tiktok') return 'tiktok';
    if (account.provider === 'instagram') return 'instagram';
  }
  
  if (clerkUser.emailAddresses?.length > 0) {
    return 'email';
  }
  
  return 'unknown';
}
