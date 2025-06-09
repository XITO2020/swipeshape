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

  // Récupération des abonnés
  if (req.method === 'GET') {
    try {
      const { data, error } = await executeQuery(
        'SELECT id, email, created_at, is_active FROM newsletter_subscribers ORDER BY created_at DESC',
        []
      );
      
      if (error) {
        console.error('Error fetching subscribers:', error);
        return res.status(500).json({ error: 'Failed to fetch subscribers' });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error in subscribers API:', error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
  
  // Ajout d'un abonné (généralement géré par subscribeToNewsletter, mais ajouté ici pour complétude)
  if (req.method === 'POST') {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      
      // Vérifier si l'email existe déjà
      const { data: existingSubscriber } = await executeQuery(
        'SELECT id FROM newsletter_subscribers WHERE email = $1',
        [email]
      );
      
      if (existingSubscriber && existingSubscriber.length > 0) {
        return res.status(409).json({ error: 'Email already subscribed' });
      }
      
      // Ajouter le nouvel abonné
      const { data, error } = await executeQuery(
        'INSERT INTO newsletter_subscribers (email, is_active) VALUES ($1, true) RETURNING id',
        [email]
      );
      
      if (error) {
        throw error;
      }
      
      return res.status(201).json({ message: 'Subscriber added successfully', id: data[0].id });
    } catch (error) {
      console.error('Error adding subscriber:', error);
      return res.status(500).json({ error: 'Failed to add subscriber' });
    }
  }
  
  // Suppression d'un abonné
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Subscriber ID is required' });
      }
      
      const { error } = await executeQuery(
        'DELETE FROM newsletter_subscribers WHERE id = $1',
        [id]
      );
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({ message: 'Subscriber deleted successfully' });
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      return res.status(500).json({ error: 'Failed to delete subscriber' });
    }
  }
  
  // Pour les autres méthodes HTTP
  return res.status(405).json({ error: 'Method not allowed' });
}
