import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Exécute une requête SQL et renvoie les lignes ou l'erreur
 */
export async function executeQuery(
  query: string,
  params: any[] = []
): Promise<{ data: any[]; error: Error | null }> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return { data: result.rows, error: null };
  } catch (error: any) {
    return { data: [], error };
  } finally {
    client.release();
  }
}
