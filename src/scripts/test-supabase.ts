/**
 * Script pour tester la connexion à Supabase
 * Exécutez ce script avec : npx ts-node src/scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Récupérer les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// TEST 1: Avec la clé anonyme
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// TEST 2: Avec la clé de service (pour diagnostiquer les problèmes de permissions)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('=== TEST DE CONNEXION SUPABASE ===');
console.log('URL:', supabaseUrl);
console.log('Anon Key (premiers caractères):', supabaseAnonKey.substring(0, 15) + '...');
console.log('Service Key (premiers caractères):', supabaseServiceKey.substring(0, 15) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

// Créer les clients Supabase pour tests
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n=== TESTS AVEC LA CLÉ ANONYME ===');
    console.log('\n1. Test de connexion basique avec clé anonyme...');
    const { data, error } = await supabaseAnon.from('articles').select('id').limit(1);
    
    if (error) {
      console.error('❌ Erreur lors du test avec clé anonyme:', error);
      
      // Si échec avec clé anonyme, on teste avec la clé de service
      console.log('\n=== TESTS AVEC LA CLÉ DE SERVICE (Bypass sécurité) ===');
      console.log('\n1. Test de connexion avec clé service...');
      const { data: serviceData, error: serviceError } = await supabaseService.from('articles').select('id').limit(1);
      
      if (serviceError) {
        console.error('❌ Erreur même avec la clé de service:', serviceError);
        console.log('→ Problème de connexion à la base de données ou les tables n\'existent pas');
      } else {
        console.log('✅ Connexion avec clé de service réussie!');
        console.log('→ Problème de PERMISSIONS pour la clé anonyme');
        console.log('Données reçues avec clé service:', serviceData);
        
        // Si la clé de service fonctionne, tester les autres tables avec celle-ci
        testTablesWithServiceKey();
      }
    } else {
      console.log('✅ Connexion avec clé anonyme réussie!');
      console.log('Données reçues:', data);
      
      // Si la clé anonyme fonctionne, tester les autres tables avec celle-ci
      await testTablesWithAnonKey();
    }
  } catch (e) {
    console.error('❌ Erreur générale:', e);
  }
}

// Test des tables avec la clé anonyme
async function testTablesWithAnonKey() {
  try {
    // Tester d'autres tables
    console.log('\n2. Test accès à la table users avec clé anonyme...');
    const { data: users, error: usersError } = await supabaseAnon.from('users').select('id').limit(1);
    
    if (usersError) {
      console.error('❌ Erreur avec la table users:', usersError);
    } else {
      console.log('✅ Accès à la table users OK');
      console.log('Données reçues:', users);
    }
    
    console.log('\n3. Test accès à la table comments avec clé anonyme...');
    const { data: comments, error: commentsError } = await supabaseAnon.from('comments').select('id').limit(1);
    
    if (commentsError) {
      console.error('❌ Erreur avec la table comments:', commentsError);
    } else {
      console.log('✅ Accès à la table comments OK');
      console.log('Données reçues:', comments);
    }
    
    console.log('\n4. Test accès à la table videos avec clé anonyme...');
    const { data: videos, error: videosError } = await supabaseAnon.from('videos').select('id').limit(1);
    
    if (videosError) {
      console.error('❌ Erreur avec la table videos:', videosError);
    } else {
      console.log('✅ Accès à la table videos OK');
      console.log('Données reçues:', videos);
    }
    
    console.log('\n5. Test accès à la table programs avec clé anonyme...');
    const { data: programs, error: programsError } = await supabaseAnon.from('programs').select('id').limit(1);
    
    if (programsError) {
      console.error('❌ Erreur avec la table programs:', programsError);
    } else {
      console.log('✅ Accès à la table programs OK');
      console.log('Données reçues:', programs);
    }
  } catch (e) {
    console.error('❌ Erreur dans les tests avec clé anonyme:', e);
  }
}

// Test des tables avec la clé de service
async function testTablesWithServiceKey() {
  try {
    // Tester d'autres tables
    console.log('\n2. Test accès à la table users avec clé de service...');
    const { data: users, error: usersError } = await supabaseService.from('users').select('id').limit(1);
    
    if (usersError) {
      console.error('❌ Erreur avec la table users:', usersError);
    } else {
      console.log('✅ Accès à la table users OK');
      console.log('Données reçues:', users);
    }
    
    console.log('\n3. Test accès à la table comments avec clé de service...');
    const { data: comments, error: commentsError } = await supabaseService.from('comments').select('id').limit(1);
    
    if (commentsError) {
      console.error('❌ Erreur avec la table comments:', commentsError);
    } else {
      console.log('✅ Accès à la table comments OK');
      console.log('Données reçues:', comments);
    }
    
    console.log('\n4. Test accès à la table videos avec clé de service...');
    const { data: videos, error: videosError } = await supabaseService.from('videos').select('id').limit(1);
    
    if (videosError) {
      console.error('❌ Erreur avec la table videos:', videosError);
    } else {
      console.log('✅ Accès à la table videos OK');
      console.log('Données reçues:', videos);
    }
    
    console.log('\n5. Test accès à la table programs avec clé de service...');
    const { data: programs, error: programsError } = await supabaseService.from('programs').select('id').limit(1);
    
    if (programsError) {
      console.error('❌ Erreur avec la table programs:', programsError);
    } else {
      console.log('✅ Accès à la table programs OK');
      console.log('Données reçues:', programs);
    }
  } catch (e) {
    console.error('❌ Erreur dans les tests avec clé de service:', e);
  }
}

// Exécuter le test
testConnection().then(() => {
  console.log('\n=== FIN DU TEST ===');
}).catch(err => {
  console.error('Erreur globale:', err);
});
