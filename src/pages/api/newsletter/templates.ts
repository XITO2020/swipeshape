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

  // Récupération des templates
  if (req.method === 'GET') {
    try {
      const { data, error } = await executeQuery(
        'SELECT id, name, subject, content, created_at FROM newsletter_templates ORDER BY created_at DESC',
        []
      );
      
      if (error) {
        console.error('Error fetching templates:', error);
        return res.status(500).json({ error: 'Failed to fetch templates' });
      }
      
      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Error in templates API:', error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
  
  // Création d'un template
  if (req.method === 'POST') {
    try {
      const { name, subject, content } = req.body;
      
      if (!name || !subject || !content) {
        return res.status(400).json({ error: 'Name, subject and content are required' });
      }
      
      const { data, error } = await executeQuery(
        'INSERT INTO newsletter_templates (name, subject, content) VALUES ($1, $2, $3) RETURNING id',
        [name, subject, content]
      );
      
      if (error) {
        throw error;
      }
      
      return res.status(201).json({ message: 'Template created successfully', id: data[0].id });
    } catch (error) {
      console.error('Error creating template:', error);
      return res.status(500).json({ error: 'Failed to create template' });
    }
  }
  
  // Suppression d'un template
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
      }
      
      const { error } = await executeQuery(
        'DELETE FROM newsletter_templates WHERE id = $1',
        [id]
      );
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      return res.status(500).json({ error: 'Failed to delete template' });
    }
  }
  
  // Pour les autres méthodes HTTP
  return res.status(405).json({ error: 'Method not allowed' });
}
