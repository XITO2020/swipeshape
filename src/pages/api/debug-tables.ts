import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Debug API: Checking PostgreSQL tables structure');
    
    // List all tables
    const { data: tables, error: tablesError } = await executeQuery(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
      []
    );
    
    if (tablesError) {
      console.error('Error listing tables:', tablesError);
      return res.status(500).json({ error: tablesError instanceof Error ? tablesError.message : String(tablesError) });
    }
    
    // Get columns for comments table
    const { data: columns, error: columnsError } = await executeQuery(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'comments'`,
      []
    );
    
    if (columnsError) {
      console.error('Error getting comments table columns:', columnsError);
      return res.status(500).json({ 
        error: columnsError instanceof Error ? columnsError.message : String(columnsError),
        tables: tables 
      });
    }
    
    // Try to get a sample row
    const { data: sample, error: sampleError } = await executeQuery(
      `SELECT * FROM comments LIMIT 1`,
      []
    );
      
    // Return all the collected information
    return res.status(200).json({
      tables: tables,
      commentsColumns: columns,
      sample: sample,
      sampleError: sampleError ? (sampleError instanceof Error ? sampleError.message : String(sampleError)) : null
    });
  } catch (err) {
    console.error('Unexpected error in debug-tables API:', err);
    return res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
