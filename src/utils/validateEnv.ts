/**
 * Utilitaire de validation des variables d'environnement
 * Permet de vérifier que toutes les variables requises sont définies
 * et affiche des messages d'erreur clairs en cas de problème
 */

type EnvVariable = {
  name: string;
  required: boolean;
  description: string;
  category: 'email' | 'auth' | 'database' | 'payment' | 'app';
  format?: RegExp;
  formatDescription?: string;
};

// Définition des variables d'environnement requises
const requiredEnvVariables: EnvVariable[] = [
  // Variables d'application
  { name: 'NEXT_PUBLIC_APP_URL', required: true, description: 'URL de l\'application', category: 'app' },
  { name: 'NODE_ENV', required: false, description: 'Environnement (development, production)', category: 'app' },
  
  // Variables d'authentification
  { name: 'JWT_SECRET', required: true, description: 'Clé secrète pour JWT', category: 'auth',
    format: /.{32,}/, formatDescription: 'Au moins 32 caractères' },
  { name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', required: true, description: 'Clé publique Clerk', category: 'auth' },
  { name: 'CLERK_SECRET_KEY', required: true, description: 'Clé secrète Clerk', category: 'auth' },
  
  // Variables de la base de données
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'URL Supabase', category: 'database' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Clé anonyme Supabase', category: 'database' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Clé de service Supabase', category: 'database' },
  { name: 'DATABASE_URL', required: true, description: 'URL de la base de données', category: 'database' },
  
  // Variables pour les emails (Nodemailer)
  { name: 'EMAIL_HOST', required: true, description: 'Hôte SMTP', category: 'email' },
  { name: 'EMAIL_PORT', required: true, description: 'Port SMTP', category: 'email' },
  { name: 'EMAIL_USER', required: true, description: 'Utilisateur SMTP', category: 'email' },
  { name: 'EMAIL_PASS', required: true, description: 'Mot de passe SMTP', category: 'email' },
  { name: 'EMAIL_FROM', required: true, description: 'Adresse d\'expéditeur des emails', category: 'email',
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, formatDescription: 'Format d\'email valide' },
  { name: 'EMAIL_SECURE', required: false, description: 'Connexion SMTP sécurisée (true/false)', category: 'email' },
  
  // Variables pour Stripe
  { name: 'STRIPE_SECRET_KEY', required: true, description: 'Clé secrète Stripe', category: 'payment',
    format: /^sk_(test|live)_[a-zA-Z0-9]+$/, formatDescription: 'Format de clé Stripe valide' },
  { name: 'STRIPE_PUBLISHABLE_KEY', required: true, description: 'Clé publique Stripe', category: 'payment',
    format: /^pk_(test|live)_[a-zA-Z0-9]+$/, formatDescription: 'Format de clé Stripe valide' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: true, description: 'Secret webhook Stripe', category: 'payment',
    format: /^whsec_[a-zA-Z0-9]+$/, formatDescription: 'Format de secret webhook valide' },
  
  // Variables d'administration
  { name: 'ADMIN_EMAIL', required: true, description: 'Email administrateur', category: 'app',
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, formatDescription: 'Format d\'email valide' },
  { name: 'ADMIN_SECRET', required: true, description: 'Secret pour l\'API d\'administration', category: 'app',
    format: /.{8,}/, formatDescription: 'Au moins 8 caractères' },
];

/**
 * Vérifie si une variable d'environnement est définie et respecte le format requis
 */
function validateEnvVariable(variable: EnvVariable): { isValid: boolean; error?: string } {
  const value = process.env[variable.name];
  
  // Vérifier si la variable est définie
  if (!value && variable.required) {
    return { 
      isValid: false, 
      error: `La variable ${variable.name} n'est pas définie (${variable.description})`
    };
  }

  // Si la variable n'est pas requise et n'est pas définie, c'est valide
  if (!value && !variable.required) {
    return { isValid: true };
  }

  // Vérifier le format si un format est défini
  if (value && variable.format && !variable.format.test(value)) {
    return { 
      isValid: false, 
      error: `La variable ${variable.name} ne respecte pas le format attendu: ${variable.formatDescription}`
    };
  }

  return { isValid: true };
}

/**
 * Vérifie toutes les variables d'environnement requises
 * @returns Un objet contenant les erreurs par catégorie
 */
export function validateEnvironment(): { 
  isValid: boolean; 
  errors: Record<string, string[]>;
  warnings: string[];
} {
  const errors: Record<string, string[]> = {
    email: [],
    auth: [],
    database: [],
    payment: [],
    app: [],
  };
  const warnings: string[] = [];
  let isValid = true;

  // Vérifier chaque variable
  for (const variable of requiredEnvVariables) {
    const validation = validateEnvVariable(variable);
    if (!validation.isValid) {
      isValid = false;
      if (validation.error) {
        errors[variable.category].push(validation.error);
      }
    }
  }

  // Vérifications supplémentaires spécifiques
  const nodeEnv = process.env.NODE_ENV;
  
  // JWT_SECRET ne devrait pas être une valeur par défaut en production
  if (nodeEnv === 'production' && 
      process.env.JWT_SECRET === 'a2a210765bcbe89bae8f691b344697093b867dec2159f0a02ac4819fa93c32221b573599165b7801e89692499b3b7ccddf794ac9bf02b0802011b2b3483d7c4b') {
    warnings.push("JWT_SECRET utilise la valeur par défaut en production, ce qui est un risque de sécurité.");
  }
  
  // Vérifier que EMAIL_SECURE est correctement configuré pour la production
  if (nodeEnv === 'production' && process.env.EMAIL_SECURE !== 'true') {
    warnings.push("EMAIL_SECURE devrait être défini à 'true' en production pour une connexion SMTP sécurisée.");
  }

  // Vérifier que les clés Stripe ne sont pas en mode test en production
  if (nodeEnv === 'production' && process.env.STRIPE_SECRET_KEY?.startsWith('sk_test')) {
    warnings.push("Vous utilisez une clé secrète Stripe de test en production.");
  }

  return { isValid, errors, warnings };
}

/**
 * Affiche les résultats de validation dans la console
 */
export function logEnvironmentValidation(): void {
  console.log("Validation des variables d'environnement...");
  const { isValid, errors, warnings } = validateEnvironment();
  
  if (isValid && warnings.length === 0) {
    console.log("✅ Toutes les variables d'environnement sont correctement configurées");
    return;
  }
  
  // Afficher les erreurs par catégorie
  for (const category in errors) {
    if (errors[category].length > 0) {
      console.error(`\n❌ Erreurs dans la catégorie ${category}:`);
      errors[category].forEach(error => console.error(`  - ${error}`));
    }
  }
  
  // Afficher les avertissements
  if (warnings.length > 0) {
    console.warn("\n⚠️ Avertissements:");
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (!isValid) {
    console.error("\n❌ La configuration des variables d'environnement est incomplète ou incorrecte");
    console.error("Veuillez corriger les erreurs ci-dessus avant de lancer l'application en production");
  } else if (warnings.length > 0) {
    console.warn("\n⚠️ L'application peut fonctionner mais certaines configurations pourraient être améliorées");
  }
}

// Exporter une fonction pour utiliser dans _app.js ou server.js
export default function initializeEnvironment() {
  if (process.env.NODE_ENV !== 'development') {
    logEnvironmentValidation();
  }
}
