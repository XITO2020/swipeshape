import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../db';
// Utilisation de require pour Brevo comme indiqué dans la documentation officielle
// Cela évite les problèmes de typage avec TypeScript
const brevo = require('@getbrevo/brevo');

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
      // Vérifier que les variables d'environnement sont définies
      if (!process.env.BREVO_API_KEY || !process.env.BREVO_FROM_EMAIL) {
        console.warn('Configuration Brevo incomplète. L\'email de bienvenue ne sera pas envoyé.');
        console.warn('Pour configurer Brevo, ajoutez BREVO_API_KEY et BREVO_FROM_EMAIL dans votre .env.local');
        return; // Sortir de la fonction d'envoi d'email sans erreur
      }

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
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" class="btn">Se connecter</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SwipeShape, Tous droits réservés.</p>
              <p>Pour vous désabonner de nos mails, <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}">cliquez ici</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Configuration de l'API Brevo selon la doc officielle
      let apiInstance = new brevo.TransactionalEmailsApi();
      
      // Configuration de l'authentification selon la doc officielle
      let apiKey = apiInstance.authentications['apiKey'];
      apiKey.apiKey = process.env.BREVO_API_KEY || '';
      
      // Création de l'email avec Brevo
      let sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'Bienvenue sur SwipeShape';
      sendSmtpEmail.htmlContent = welcomeEmailContent;
      sendSmtpEmail.sender = { name: 'SwipeShape', email: process.env.BREVO_FROM_EMAIL || 'no-reply@swipeshape.com' };
      sendSmtpEmail.to = [{ email: email, name: `${firstName} ${lastName}` }];
      
      console.log(`Tentative d'envoi d'email via Brevo (email expéditeur: ${process.env.BREVO_FROM_EMAIL})`);
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email de bienvenue envoyé avec succès à:', email);
      
    } catch (emailError: any) {
      // Ne pas bloquer l'enregistrement en cas d'erreur d'envoi d'email
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
      
      // Instructions de débogage pour les erreurs courantes
      if (emailError.status === 401 || emailError.response?.status === 401 || emailError.code === 'Unauthorized') {
        console.error('Erreur d\'authentification Brevo (401 Unauthorized). Vérifiez votre BREVO_API_KEY.');
        console.error('Pour configurer Brevo correctement:');
        console.error('1. Connectez-vous à votre compte Brevo (brevo.com)');
        console.error('2. Allez dans "SMTP & API" et récupérez votre clé API v3');
        console.error('3. Ajoutez cette clé dans votre fichier .env.local sous BREVO_API_KEY');
        console.error('4. Configurez également BREVO_FROM_EMAIL avec une adresse email valide');
      } else if (emailError.response?.status === 400 || emailError.code === 'Bad Request') {
        console.error('Erreur avec les données d\'email (400). Vérifiez que BREVO_FROM_EMAIL est une adresse email valide.');
      } else {
        console.error('Détails de l\'erreur Brevo:', JSON.stringify(emailError, null, 2));
      }
    }

    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error in registration:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
