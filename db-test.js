// Script de test de connexion à la base de données
const { Client } = require('pg');
require('dotenv').config();

// Obtenir l'URL de connexion depuis les variables d'environnement
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Erreur: DATABASE_URL n\'est pas définie');
  process.exit(1);
}

// Afficher l'URL avec mot de passe masqué
const maskedUrl = dbUrl.replace(/:[^:]*@/, ':****@');
console.log(`🔍 Test de connexion à : ${maskedUrl}`);

// Fonction pour tester la connexion
async function testConnection(withSSL) {
  const sslConfig = withSSL ? { rejectUnauthorized: false } : false;
  
  console.log(`\n🔄 Test de connexion ${withSSL ? 'avec' : 'sans'} SSL...`);
  
  // Créer un client PostgreSQL
  const client = new Client({
    connectionString: dbUrl,
    ssl: sslConfig
  });
  
  try {
    // Tenter de se connecter
    await client.connect();
    console.log('✅ Connexion réussie!');
    
    // Tester une requête simple
    const result = await client.query('SELECT NOW() as time');
    console.log('✅ Requête SQL exécutée avec succès');
    console.log(`📊 Heure du serveur: ${result.rows[0].time}`);
    
    // Obtenir les informations sur la connexion
    console.log('\n📋 Informations sur la connexion:');
    console.log(`   - Host: ${client.host}`);
    console.log(`   - Database: ${client.database}`);
    console.log(`   - Port: ${client.port}`);
    console.log(`   - User: ${client.user}`);
    
    // Fermer la connexion
    await client.end();
    console.log('✅ Connexion fermée proprement');
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    if (error.code) {
      console.error(`   Code d'erreur: ${error.code}`);
    }
    
    try {
      // Tenter de fermer le client même s'il y a eu une erreur
      await client.end();
    } catch (e) {
      // Ignorer les erreurs lors de la fermeture
    }
    
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  console.log('\n🔧 DIAGNOSTIC DE CONNEXION À LA BASE DE DONNÉES 🔧\n');
  
  // Test sans SSL
  const noSslSuccess = await testConnection(false);
  
  // Test avec SSL (si le test sans SSL a échoué)
  if (!noSslSuccess) {
    console.log('\n⚠️ Le test sans SSL a échoué, essai avec SSL...');
    const sslSuccess = await testConnection(true);
    
    if (!sslSuccess) {
      console.log('\n❌ RÉSULTAT: Les deux méthodes de connexion ont échoué.');
      console.log('   Vérifiez vos informations de connexion et l\'accès réseau à Supabase.');
    } else {
      console.log('\n✅ RÉSULTAT: La connexion avec SSL a réussi.');
      console.log('   Pour résoudre les erreurs 500, mettez à jour db.ts pour utiliser cette configuration:');
      console.log('   ssl: { rejectUnauthorized: false }');
    }
  } else {
    console.log('\n✅ RÉSULTAT: La connexion sans SSL a réussi.');
    console.log('   Pour résoudre les erreurs 500, mettez à jour db.ts pour utiliser cette configuration:');
    console.log('   ssl: false');
  }
}

// Lancer les tests
runTests().catch(err => {
  console.error('Erreur inattendue:', err);
});
