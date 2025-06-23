// Script pour vérifier les variables d'environnement
require('dotenv').config();

console.log('=== Vérification des variables d\'environnement ===');

// Vérifier DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  // Masquer la partie sensible de l'URL pour la sécurité
  const maskedUrl = dbUrl.replace(/:[^:]*@/, ':****@');
  console.log('✅ DATABASE_URL est définie:', maskedUrl);
  
  try {
    // Vérifier si l'URL semble valide
    const url = new URL(dbUrl);
    console.log('✅ Structure de l\'URL valide');
    console.log('   - Protocole:', url.protocol);
    console.log('   - Hôte:', url.hostname);
    console.log('   - Port:', url.port || 'default');
    console.log('   - Chemin:', url.pathname.substring(1)); // Enlever le / initial
  } catch (error) {
    console.log('❌ DATABASE_URL n\'est pas une URL valide');
  }
} else {
  console.log('❌ DATABASE_URL n\'est pas définie');
}

// Vérifier les autres variables d'environnement importantes
const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'ADMIN_SECRET'
];

envVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} est définie`);
  } else {
    console.log(`❌ ${varName} n'est pas définie`);
  }
});

// Tester la résolution DNS pour l'hôte de la base de données
if (dbUrl) {
  const { hostname } = new URL(dbUrl);
  console.log(`\n=== Vérification de la résolution DNS pour ${hostname} ===`);
  console.log('Exécutez manuellement "nslookup ' + hostname + '" dans un autre terminal pour vérifier si le nom d\'hôte est résolvable.');
}

console.log('\nConseil: Vérifiez que votre fichier .env contient les valeurs correctes.');
console.log('Si nécessaire, créez un fichier .env.local pour surcharger les valeurs en développement.');
