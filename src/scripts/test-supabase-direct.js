// Script de test direct pour Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Afficher les variables d'environnement (masquées partiellement)
console.log('--- CONFIGURATION ---');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 
            process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 'NON DÉFINIE');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'NON DÉFINIE');
console.log('DATABASE_URL:', process.env.DATABASE_URL ?
            process.env.DATABASE_URL.substring(0, 20) + '...' : 'NON DÉFINIE');

// Initialiser le client Supabase avec les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erreur: Variables d\'environnement Supabase manquantes.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('✅ Client Supabase initialisé');

// Fonction pour tester la connexion
async function testConnection() {
  console.log('\n--- TEST DE CONNEXION ---');
  try {
    // Vérification simple que le client est connecté
    const { data: connectionTest, error: connectionError } = await supabase.from('_hello').select('*');
    
    if (connectionError) {
      if (connectionError.code === 'PGRST116') {
        // Cette erreur est normale car la table _hello n'existe pas, mais confirme que la connexion fonctionne
        console.log('✅ Connexion à Supabase réussie (erreur attendue sur table inexistante)');
      } else {
        console.error('❌ Erreur de connexion:', connectionError);
      }
    } else {
      console.log('✅ Connexion établie');
    }
  } catch (err) {
    console.error('❌ Exception lors du test de connexion:', err);
  }
}

// Fonction pour récupérer les programmes
async function getPrograms() {
  console.log('\n--- RÉCUPÉRATION DES PROGRAMMES ---');
  try {
    const { data, error, status } = await supabase.from('programs').select('*').limit(3);
    
    console.log('Code de statut:', status);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des programmes:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Aucun programme trouvé. Vérifiez que la table contient des données.');
      return;
    }
    
    console.log(`✅ ${data.length} programme(s) récupéré(s): `);
    data.forEach(program => {
      console.log(`- ID: ${program.id}, Nom: ${program.title}`);
    });
  } catch (err) {
    console.error('❌ Exception lors de la récupération des programmes:', err);
  }
}

// Fonction pour récupérer les articles
async function getArticles() {
  console.log('\n--- RÉCUPÉRATION DES ARTICLES ---');
  try {
    const { data, error, status } = await supabase.from('articles').select('*').limit(3);
    
    console.log('Code de statut:', status);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des articles:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Aucun article trouvé. Vérifiez que la table contient des données.');
      return;
    }
    
    console.log(`✅ ${data.length} article(s) récupéré(s): `);
    data.forEach(article => {
      console.log(`- ID: ${article.id}, Titre: ${article.title}`);
    });
  } catch (err) {
    console.error('❌ Exception lors de la récupération des articles:', err);
  }
}

// Exécution des tests
async function runTests() {
  try {
    await testConnection();
    await getPrograms();
    await getArticles();
    console.log('\n--- TESTS TERMINÉS ---');
  } catch (err) {
    console.error('❌ Erreur dans les tests:', err);
  }
}

runTests();
