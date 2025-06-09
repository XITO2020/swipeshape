// Utilitaire de connexion à la base de données pour les API routes
import { Pool } from 'pg';

// Récupérer les informations de connexion depuis les variables d'environnement
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erreur: La variable DATABASE_URL n\'est pas définie');
  throw new Error('DATABASE_URL is not defined');
}

// Configurer le pool de connexion avec SSL
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Nécessaire pour Supabase PostgreSQL
  }
});

// Exporter une fonction qui exécute une requête SQL
export async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return { data: result.rows, error: null };
  } catch (error) {
    console.error('❌ Erreur d\'exécution de la requête SQL:', error);
    return { data: null, error: error };
  } finally {
    client.release();
  }
}
