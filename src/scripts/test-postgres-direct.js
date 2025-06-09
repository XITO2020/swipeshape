// Test direct de connexion PostgreSQL
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Récupérer les informations de connexion
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erreur: La variable DATABASE_URL n\'est pas définie');
  process.exit(1);
}

console.log('Tentative de connexion à la base de données PostgreSQL...');
console.log('URL (partiellement masquée):', connectionString.substring(0, 20) + '...');

// Configurer le pool de connexion avec SSL
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Nécessaire pour Supabase PostgreSQL
  }
});

// Fonction pour tester la connexion et récupérer les données
async function testDatabase() {
  console.log('\n--- TEST DE CONNEXION DIRECTE POSTGRESQL ---');
  const client = await pool.connect();
  try {
    // Test de connexion basique
    console.log('✅ Connexion PostgreSQL établie');
    
    // Récupérer les programmes
    console.log('\n--- PROGRAMMES ---');
    const programsResult = await client.query('SELECT id, title, description FROM programs LIMIT 3');
    console.log(`✅ ${programsResult.rowCount} programmes récupérés:`);
    programsResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Titre: ${row.title}`);
    });
    
    // Récupérer les articles
    console.log('\n--- ARTICLES ---');
    const articlesResult = await client.query('SELECT id, title, content FROM articles LIMIT 3');
    console.log(`✅ ${articlesResult.rowCount} articles récupérés:`);
    articlesResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Titre: ${row.title}`);
    });
    
    // Liste des tables disponibles
    console.log('\n--- LISTE DES TABLES ---');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tables disponibles:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (err) {
    console.error('❌ Erreur lors des tests PostgreSQL:', err);
  } finally {
    client.release();
    console.log('\n--- TESTS TERMINÉS ---');
    pool.end();
  }
}

// Exécuter les tests
testDatabase().catch(err => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});
