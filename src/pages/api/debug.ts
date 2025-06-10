import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';
import { Pool } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Activer les en-têtes CORS pour toutes les requêtes
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Récupérer les infos de connexion PostgreSQL
  const connectionInfo = {
    url: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set',
    connected: !!process.env.DATABASE_URL,
    ssl: true
  };

  // Tester l'accès à différentes tables
  const testResults: Record<string, any> = {};
  const tables = ['programs', 'articles', 'comments', 'users'];
  
  for (const table of tables) {
    try {
      const { data, error } = await executeQuery(
        `SELECT COUNT(*) FROM ${table}`,
        []
      );
        
      testResults[table] = {
        success: !error,
        error: error ? (error instanceof Error ? error.message : String(error)) : null,
        count: data && data.length > 0 ? data[0].count : 0
      };
    } catch (err) {
      testResults[table] = {
        success: false,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }

  // Essayer de récupérer la structure de la table comments
  let commentsStructure = null;
  try {
    // Cette requête obtient la structure de la table comments directement depuis PostgreSQL
    const { data, error } = await executeQuery(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public' 
        AND table_name = 'comments'
      ORDER BY 
        ordinal_position
    `, []);
      
    commentsStructure = {
      data,
      success: !error,
      error: error ? (error instanceof Error ? error.message : String(error)) : null
    };
  } catch (err) {
    commentsStructure = {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }

  // Renvoyer toutes les informations collectées
  return res.status(200).json({
    connectionInfo,
    testResults,
    commentsStructure,
    timestamp: new Date().toISOString()
  });
}
