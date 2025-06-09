// src/pages/api/newsletter/send.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../db';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/client';

// Initialiser Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || ''
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Récupérer les paramètres de l'email
    const { subject, content, template } = req.body;
    
    if (!subject || !content) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }
    
    // Récupérer tous les abonnés à la newsletter
    const { data: subscribers, error } = await executeQuery(
      'SELECT email FROM newsletter_subscribers WHERE is_active = true',
      []
    );
    
    if (error) {
      console.error('Error fetching subscribers:', error);
      return res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
    
    if (!subscribers || subscribers.length === 0) {
      return res.status(404).json({ message: 'No subscribers found' });
    }

    // Envoyer l'email à tous les abonnés
    const messageParams = {
      from: `SwipeShape <newsletter@${process.env.MAILGUN_DOMAIN}>`,
      to: 'newsletter@swipeshape.com', // Utiliser BCC pour cacher les emails des autres destinataires
      bcc: subscribers.map((sub: any) => sub.email).join(','),
      subject: subject,
      html: content,
      text: content.replace(/<[^>]*>/g, ''), // Version texte pour les clients qui ne supportent pas HTML
    };
    
    // Configuration des options conforme au typage de Mailgun
    const emailData: any = {
      ...messageParams
    };

    // Ajouter les options de tracking sous forme de propriétés correctement typées
    emailData['o:tracking'] = 'yes' as 'yes';
    emailData['o:tracking-clicks'] = 'yes' as 'yes';
    emailData['o:tracking-opens'] = 'yes' as 'yes';

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN || '', emailData);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Newsletter sent successfully', 
      recipientCount: subscribers.length,
      mailgunResponse: result 
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return res.status(500).json({ error: 'Failed to send newsletter' });
  }
}