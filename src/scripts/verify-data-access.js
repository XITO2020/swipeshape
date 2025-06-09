const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Get database connection details from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const connectionString = process.env.DATABASE_URL;

console.log('DATABASE CONNECTION CHECK');
console.log('========================');
console.log('Checking Supabase API client...');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'Not found'}`);

console.log('\nChecking PostgreSQL direct connection...');
console.log(`Connection string: ${connectionString ? connectionString.substring(0, 25) + '...' : 'Not found'}`);

// Test Supabase API client
async function testSupabaseAPI() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or API key not found');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('\n1. ARTICLES TABLE');
    console.log('----------------');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*');
    
    if (articlesError) {
      console.error('Error fetching articles:', articlesError.message);
    } else {
      console.log(`Found ${articles.length} articles`);
      if (articles.length > 0) {
        console.log('First article:', articles[0].title);
      }
    }
    
    console.log('\n2. EVENTS TABLE');
    console.log('----------------');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*');
    
    if (eventsError) {
      console.error('Error fetching events:', eventsError.message);
    } else {
      console.log(`Found ${events.length} events`);
      if (events.length > 0) {
        console.log('First event:', events[0].title);
      }
    }
    
    console.log('\n3. PROGRAMS TABLE');
    console.log('----------------');
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('*');
    
    if (programsError) {
      console.error('Error fetching programs:', programsError.message);
    } else {
      console.log(`Found ${programs.length} programs`);
      if (programs.length > 0) {
        console.log('First program:', programs[0].title);
      }
    }
    
    return !articlesError && !eventsError && !programsError;
  } catch (error) {
    console.error('Error testing Supabase API:', error.message);
    return false;
  }
}

// Test PostgreSQL direct connection
async function testPostgresConnection() {
  if (!connectionString) {
    console.error('PostgreSQL connection string not found');
    return false;
  }
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // Test connection
    const client = await pool.connect();
    try {
      console.log('\nPostgreSQL Direct Connection Test:');
      
      // List all tables in public schema
      const tableRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log(`\nFound ${tableRes.rowCount} tables in public schema:`);
      tableRes.rows.forEach((row, i) => {
        console.log(`${i+1}. ${row.table_name}`);
      });
      
      // Check articles table
      console.log('\nChecking articles table:');
      try {
        const articlesRes = await client.query('SELECT COUNT(*) FROM articles');
        console.log(`Articles count: ${articlesRes.rows[0].count}`);
        
        const articlesDataRes = await client.query('SELECT * FROM articles LIMIT 1');
        if (articlesDataRes.rows.length > 0) {
          console.log('First article title:', articlesDataRes.rows[0].title);
        }
      } catch (err) {
        console.error('Error checking articles table:', err.message);
      }
      
      // Check events table
      console.log('\nChecking events table:');
      try {
        const eventsRes = await client.query('SELECT COUNT(*) FROM events');
        console.log(`Events count: ${eventsRes.rows[0].count}`);
        
        const eventsDataRes = await client.query('SELECT * FROM events LIMIT 1');
        if (eventsDataRes.rows.length > 0) {
          console.log('First event title:', eventsDataRes.rows[0].title);
        }
      } catch (err) {
        console.error('Error checking events table:', err.message);
      }
      
      // Check programs table
      console.log('\nChecking programs table:');
      try {
        const programsRes = await client.query('SELECT COUNT(*) FROM programs');
        console.log(`Programs count: ${programsRes.rows[0].count}`);
        
        const programsDataRes = await client.query('SELECT * FROM programs LIMIT 1');
        if (programsDataRes.rows.length > 0) {
          console.log('First program title:', programsDataRes.rows[0].title);
        }
      } catch (err) {
        console.error('Error checking programs table:', err.message);
      }
      
      return true;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    return false;
  }
}

// Run tests
async function run() {
  console.log('\nTesting Supabase API client...');
  const apiSuccess = await testSupabaseAPI();
  console.log(`\nSupabase API client test ${apiSuccess ? 'PASSED' : 'FAILED'}`);
  
  console.log('\nTesting PostgreSQL direct connection...');
  const pgSuccess = await testPostgresConnection();
  console.log(`\nPostgreSQL direct connection test ${pgSuccess ? 'PASSED' : 'FAILED'}`);
  
  console.log('\nSUMMARY');
  console.log('=======');
  console.log(`Supabase API client: ${apiSuccess ? '✅ Working' : '❌ Not working'}`);
  console.log(`PostgreSQL connection: ${pgSuccess ? '✅ Working' : '❌ Not working'}`);
  
  if (!apiSuccess) {
    console.log('\nTo fix Supabase API client issues:');
    console.log('1. Check that your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct in .env.local');
    console.log('2. Verify that your Supabase project is active');
    console.log('3. Check that you have network connectivity to Supabase');
  }
  
  if (!pgSuccess) {
    console.log('\nTo fix PostgreSQL direct connection issues:');
    console.log('1. Check that your DATABASE_URL is correct in .env.local');
    console.log('2. Verify that your database password is correct');
    console.log('3. Ensure your IP is allowed in Supabase database settings');
  }
}

run();
