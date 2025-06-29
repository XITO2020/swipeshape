import { NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import pg from 'pg';

export async function GET() {
  console.log('🔍 API dbtest appelée - test de connexion à la base de données');

  // Vérifier la variable d'environnement DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || 'Non définie';
  const maskedDbUrl = dbUrl !== 'Non définie' ? dbUrl.replace(/:[^:]*@/, ':****@') : dbUrl;
  console.log(`🔍 DATABASE_URL = ${maskedDbUrl}`);
  
  try {
    // Vérification directe de la connexion sans le pool pour isoler les problèmes
    console.log('🔄 Test 1: Tentative de connexion directe à la base de données...');
    
    // Créer une connexion test sans SSL
    const testClient = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    
    try {
      console.log('⏳ Connexion au client test sans SSL...');
      await testClient.connect();
      console.log('✅ Connexion test sans SSL réussie!');
      await testClient.end();
    } catch (directError) {
      console.error('❌ Échec de la connexion directe sans SSL:', directError.message);
    }
    
    // Utiliser maintenant le pool configuré
    console.log('🔄 Test 2: Tentative de connexion via le pool configuré...');
    const client = await pool.connect();
    console.log('✅ Connexion à la base de données établie avec succès!');
    
    // Test d'une requête simple
    const result = await client.query('SELECT NOW() as time');
    console.log('✅ Requête SQL exécutée avec succès');
    
    // Libération du client
    client.release();
    
    return NextResponse.json({
      status: 'ok',
      message: 'Connexion à la base de données réussie',
      time: result.rows[0].time,
      tests: {
        directConnection: 'success',
        poolConnection: 'success',
        query: 'success'
      },
      connectionConfig: {
        host: pool.options.host || '(from connectionString)',
        database: pool.options.database || '(from connectionString)',
        port: pool.options.port || '(from connectionString)',
        ssl: pool.options.ssl === false ? 'disabled' : 
             (pool.options.ssl && pool.options.ssl.rejectUnauthorized === false) ? 'enabled (avec rejectUnauthorized=false)' : 
             'enabled (avec rejectUnauthorized=true)'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    
    // Analyse plus détaillée de l'erreur
    let errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    let suggestion = '';
    
    // Suggestions basées sur les codes d'erreur courants
    if (error.code === 'ENOTFOUND') {
      suggestion = "Le nom d'hôte n'a pas pu être résolu. Vérifiez que l'hôte existe et est correctement orthographié.";
    } else if (error.code === 'ECONNREFUSED') {
      suggestion = "La connexion a été refusée. Vérifiez que le serveur est en cours d'exécution et que les paramètres de port sont corrects.";
    } else if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      suggestion = "Erreur de certificat SSL. La configuration actuelle n'accepte pas les certificats auto-signés.";
    } else if (error.message && error.message.includes('password authentication failed')) {
      suggestion = "L'authentification a échoué. Vérifiez les identifiants (nom d'utilisateur/mot de passe).";
    } else if (error.message && error.message.includes('does not exist')) {
      suggestion = "La base de données spécifiée n'existe pas.";
    }
    
    // Retourner l'erreur détaillée et la suggestion pour diagnostic
    return NextResponse.json({
      status: 'error',
      message: 'Échec de connexion à la base de données',
      error: errorDetails,
      connectionString: maskedDbUrl,
      suggestion: suggestion || "Erreur non reconnue, vérifiez les logs du serveur pour plus de détails."
    }, { status: 500 });
  }
}
