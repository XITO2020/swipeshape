const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Get database connection details from environment variables
const connectionString = process.env.DATABASE_URL;

console.log('Using connection string (partially masked for security):');
if (connectionString) {
  // Masquer la chaîne de connexion pour la sécurité mais montrer le début pour vérifier
  const maskedString = connectionString.substring(0, 30) + '...[masked]';
  console.log(maskedString);
} else {
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

async function checkTables() {
  const client = await pool.connect();
  try {
    console.log('🔍 CHECKING TABLES DATA 🔍');
    console.log('========================');
    
    // Check articles table
    console.log('\n📝 ARTICLES TABLE:');
    const articlesResult = await client.query('SELECT COUNT(*) FROM articles');
    const articlesCount = parseInt(articlesResult.rows[0].count);
    console.log(`Found ${articlesCount} articles`);
    
    if (articlesCount === 0) {
      console.log('❌ ARTICLES TABLE IS EMPTY!');
    } else {
      console.log('✅ ARTICLES TABLE HAS DATA');
      const articlesData = await client.query('SELECT id, title, created_at FROM articles');
      console.log('Sample articles:');
      articlesData.rows.forEach((row, i) => {
        console.log(`  ${i+1}. ID: ${row.id}, Title: ${row.title}, Created: ${row.created_at}`);
      });
    }
    
    // Check events table
    console.log('\n🎟️ EVENTS TABLE:');
    const eventsResult = await client.query('SELECT COUNT(*) FROM events');
    const eventsCount = parseInt(eventsResult.rows[0].count);
    console.log(`Found ${eventsCount} events`);
    
    if (eventsCount === 0) {
      console.log('❌ EVENTS TABLE IS EMPTY!');
    } else {
      console.log('✅ EVENTS TABLE HAS DATA');
      const eventsData = await client.query('SELECT id, title, event_date FROM events');
      console.log('Sample events:');
      eventsData.rows.forEach((row, i) => {
        console.log(`  ${i+1}. ID: ${row.id}, Title: ${row.title}, Date: ${row.event_date}`);
      });
    }
    
    // Check programs table
    console.log('\n🏋️ PROGRAMS TABLE:');
    const programsResult = await client.query('SELECT COUNT(*) FROM programs');
    const programsCount = parseInt(programsResult.rows[0].count);
    console.log(`Found ${programsCount} programs`);
    
    if (programsCount === 0) {
      console.log('❌ PROGRAMS TABLE IS EMPTY!');
    } else {
      console.log('✅ PROGRAMS TABLE HAS DATA');
      const programsData = await client.query('SELECT id, title, price FROM programs');
      console.log('Sample programs:');
      programsData.rows.forEach((row, i) => {
        console.log(`  ${i+1}. ID: ${row.id}, Title: ${row.title}, Price: ${row.price}`);
      });
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`Articles: ${articlesCount > 0 ? '✅ HAS DATA' : '❌ EMPTY'}`);
    console.log(`Events: ${eventsCount > 0 ? '✅ HAS DATA' : '❌ EMPTY'}`);
    console.log(`Programs: ${programsCount > 0 ? '✅ HAS DATA' : '❌ EMPTY'}`);
    
  } catch (err) {
    console.error('Error executing query:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
checkTables().catch(console.error);
