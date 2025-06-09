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
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Logique d'enregistrement existante
    const { email, password, firstName, lastName } = req.body;
    
    // Après l'enregistrement réussi, envoyez un email de bienvenue
    try {
      // Contenu HTML de l'email de bienvenue
      const welcomeEmailContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; }
            .btn { display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur SwipeShape!</h1>
            </div>
            <div class="content">
              <p>Bonjour ${firstName},</p>
              <p>Bienvenue sur SwipeShape! Nous sommes ravis de vous compter parmi notre communauté.</p>
              <p>Avec votre compte, vous pouvez:</p>
              <ul>
                <li>Accéder à nos programmes</li>
                <li>Participer aux événements</li>
                <li>Commenter les articles</li>
                <li>Et bien plus encore!</li>
              </ul>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" class="btn">Se connecter</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SwipeShape, Tous droits réservés.</p>
              <p>Pour vous désabonner de nos mails, <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}">cliquez ici</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const emailData = {
        from: `SwipeShape <noreply@${process.env.MAILGUN_DOMAIN}>`,
        to: email,
        subject: 'Bienvenue sur SwipeShape',
        html: welcomeEmailContent
      };

      await mg.messages.create(process.env.MAILGUN_DOMAIN || '', emailData);
      console.log('Email de bienvenue envoyé avec succès à:', email);
      
    } catch (emailError) {
      // Ne pas bloquer l'enregistrement en cas d'erreur d'envoi d'email
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
    }

    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error in registration:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
