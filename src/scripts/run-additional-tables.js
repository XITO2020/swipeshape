const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Get database connection details from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase PostgreSQL connection
  }
});

// Function to run a SQL query
async function runQuery(query) {
  const client = await pool.connect();
  try {
    await client.query(query);
    console.log('Query executed successfully');
  } catch (err) {
    console.error('Error executing query:', err.message);
  } finally {
    client.release();
  }
}

// Function to run SQL file
async function runSqlFile(filePath) {
  try {
    console.log(`Reading SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log('Connecting to database...');
    await runQuery(sql);
    console.log('SQL file executed successfully');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Get the SQL file path
const sqlFilePath = path.resolve(__dirname, 'create-additional-tables.sql');

// Run the script
console.log('Starting to execute SQL script...');
runSqlFile(sqlFilePath).then(() => {
  console.log('Script execution completed');
});
