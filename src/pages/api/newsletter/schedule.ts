import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subject, content, scheduledAt } = req.body;
    
    if (!subject || !content || !scheduledAt) {
      return res.status(400).json({ error: 'Subject, content, and scheduledAt are required' });
    }
    
    // Vérifier que la date est dans le futur
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled date must be in the future' });
    }
    
    // Enregistrer la newsletter programmée
    const { data, error } = await executeQuery(
      'INSERT INTO scheduled_newsletters (subject, content, scheduled_at, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [subject, content, scheduledAt, 'pending']
    );
    
    if (error) {
      throw error;
    }
    
    return res.status(201).json({ 
      message: 'Newsletter scheduled successfully',
      id: data[0].id,
      scheduledAt
    });
  } catch (error) {
    console.error('Error scheduling newsletter:', error);
    return res.status(500).json({ error: 'Failed to schedule newsletter' });
  }
}
