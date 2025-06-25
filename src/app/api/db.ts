// src/app/api/db.ts
import { Pool } from 'pg';

// On exporte `pool` pour que si vous en avez besoin ailleurs,
// vous puissiez faire `import { pool } from './db'`.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Exécute une requête SQL et renvoie { data, error }
 */
export async function executeQuery(
  query: string,
  params: any[] = []
): Promise<{ data: any[]; error: Error | null }> {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return { data: result.rows, error: null };
  } catch (err: any) {
    console.error('Error executing query:', err);
    return { data: [], error: err };
  } finally {
    client?.release();
  }
}
