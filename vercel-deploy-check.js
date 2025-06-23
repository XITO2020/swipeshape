#!/usr/bin/env node

/**
 * Script de vérification pré-déploiement pour Vercel
 * Vérifie que tout est correctement configuré avant le déploiement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Vérification de la configuration pour le déploiement Vercel...\n');

// Fichiers nécessaires
const requiredFiles = [
  '.env.production',
  'vercel.json',
  '.vercelignore',
];

// Vérifier la présence des fichiers requis
console.log('📁 Vérification des fichiers de configuration...');
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)));

if (missingFiles.length > 0) {
  console.error(`❌ Fichiers manquants : ${missingFiles.join(', ')}`);
} else {
  console.log('✅ Tous les fichiers de configuration sont présents');
}

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances...');
try {
  execSync('npm ls next', { stdio: 'pipe' });
  console.log('✅ Next.js est correctement installé');
} catch (error) {
  console.error('❌ Problème avec la dépendance Next.js');
}

// Vérifier le build
console.log('\n🛠️  Test de compilation...');
try {
  console.log('🔄 Compilation du projet (cela peut prendre un moment)...');
  execSync('npm run build --no-color', { stdio: 'pipe' });
  console.log('✅ Compilation réussie - le projet est prêt pour le déploiement');
} catch (error) {
  console.error('❌ La compilation a échoué. Corrigez les erreurs avant le déploiement.');
  console.error('   Vous pouvez exécuter "npm run build" pour voir les erreurs détaillées');
}

// Conseils pour le déploiement
console.log('\n🚀 Prêt pour le déploiement sur Vercel');
console.log('1. Committez tous vos changements');
console.log('2. Poussez vers votre dépôt Git');
console.log('3. Connectez-vous à Vercel et suivez les instructions du fichier README-DEPLOY.md\n');
