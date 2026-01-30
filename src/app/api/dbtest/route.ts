
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import pg from 'pg';

export async function GET(req: NextRequest) {
  console.log('🔍 API dbtest appelée - test de connexion à la base de données');

  // Masquage de la connexion
  const dbUrl = process.env.DATABASE_URL || 'Non définie';
  const maskedDbUrl = dbUrl !== 'Non définie' ? dbUrl.replace(/:[^:]*@/, ':****@') : dbUrl;
  console.log(`🔍 DATABASE_URL = ${maskedDbUrl}`);

  try {
    // Test direct sans SSL
    console.log('🔄 Test 1: connexion directe sans SSL...');
    const testClient = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    await testClient.connect();
    await testClient.end();
    console.log('✅ Connexion directe réussie');

    // Test via pool
    console.log('🔄 Test 2: connexion via pool...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    console.log('✅ Requête SQL réussie');

    return NextResponse.json({
      status: 'ok',
      time: result.rows[0].time,
      connectionConfig: {
        host: pool.options.host || '(depuis connectionString)',
        database: pool.options.database || '(depuis connectionString)',
        port: pool.options.port || '(depuis connectionString)',
        ssl: pool.options.ssl === false ? 'disabled' : 'enabled'
      }
    });
  } catch (err: any) {
    console.error('❌ dbtest erreur:', err);
    return NextResponse.json({
      status: 'error',
      message: err.message
    }, { status: 500 });
  }
}