/**
 * Script d'initialisation de l'application
 * Ce script est exécuté au démarrage de l'application pour vérifier
 * que tout est correctement configuré avant de démarrer le serveur
 */

import { logEnvironmentValidation } from './validateEnv';
import { PrismaClient } from '@prisma/client';

/**
 * Initialise l'application et vérifie que tout est correctement configuré
 * @returns true si l'initialisation s'est bien passée, false sinon
 */
export async function initializeApp(): Promise<boolean> {
  try {
    console.log('🚀 Initialisation de l\'application SwipeShape...');
    
    // 1. Vérification des variables d'environnement
    console.log('\n📋 Vérification des variables d\'environnement...');
    logEnvironmentValidation();
    
    // 2. Vérification de la connexion à la base de données
    if (process.env.NODE_ENV !== 'test') {
      console.log('\n🔌 Test de la connexion à la base de données...');
      try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log('✅ Connexion à la base de données établie avec succès');
        await prisma.$disconnect();
      } catch (error) {
        console.error('❌ Erreur de connexion à la base de données:', error);
        return false;
      }
    }
    
    // 3. Initialisation du service email
    console.log('\n✉️ Initialisation du service email...');
    try {
      // Juste vérifier que les variables sont définies
      const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;
      if (EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS && EMAIL_FROM) {
        console.log('✅ Configuration email validée');
      } else {
        console.warn('⚠️ Configuration email incomplète');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du service email:', error);
    }
    
    console.log('\n✨ Initialisation terminée avec succès!');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de l\'application:', error);
    return false;
  }
}
