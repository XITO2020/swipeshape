import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If DATABASE_URL is not defined, use individual parameters
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Needed for connecting to Supabase PostgreSQL
  }
});

// Test the database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Wrapper for SQL queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
};

// Function to test the database connection
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('Database connection test successful:', result.rows[0].current_time);
    return { success: true, time: result.rows[0].current_time };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error };
  }
};

export default {
  query,
  testConnection,
  pool
};
