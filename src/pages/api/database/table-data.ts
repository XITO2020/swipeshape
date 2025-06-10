import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/pgClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { table } = req.query;
  
  if (!table || typeof table !== 'string') {
    return res.status(400).json({ error: 'Table name is required' });
  }
  
  try {
    // Get table columns first
    const columnsResult = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [table]);
    
    const columns = columnsResult.rows.map((row: any) => row.column_name);
    
    // Get the actual table data (first 100 rows)
    const dataResult = await query(`SELECT * FROM "${table}" LIMIT 100;`);
    
    return res.status(200).json({
      columns,
      rows: dataResult.rows || []
    });
  } catch (err: any) {
    console.error('Error fetching table data:', err);
    return res.status(500).json({ error: err.message });
  }
}
