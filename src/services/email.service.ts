/**
 * Service d'envoi d'emails simple avec Nodemailer
 * Implémentation minimaliste sans dépendances complexes
 */

import nodemailer from 'nodemailer';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Configuration du transporteur de mail
const getTransporter = () => {
  // Vérifier les variables d'environnement requises
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Configuration email incomplète. Vérifiez vos variables d\'environnement.');
    console.warn('Variables requises: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS');
    return null;
  }

  // Créer le transporteur SMTP
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Envoie un email
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return false;
    }

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@swipeshape.com';
    
    // Format des destinataires
    let to: string;
    if (Array.isArray(options.to)) {
      to = options.to.map(recipient => (
        recipient.name 
          ? `"${recipient.name}" <${recipient.email}>` 
          : recipient.email
      )).join(', ');
    } else {
      to = options.to.name 
        ? `"${options.to.name}" <${options.to.email}>` 
        : options.to.email;
    }

    // Préparation de l'email
    const mailOptions = {
      from: options.fromName 
        ? `"${options.fromName}" <${options.from || fromEmail}>` 
        : `"SwipeShape" <${options.from || fromEmail}>`,
      to,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
      replyTo: options.replyTo || fromEmail,
      attachments: options.attachments || [],
    };

    // Envoi de l'email
    console.log(`Tentative d'envoi d'email à: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès. ID de message:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

/**
 * Envoie un email de bienvenue à un nouvel utilisateur
 */
export const sendWelcomeEmail = async (
  email: string, 
  firstName: string, 
  lastName?: string
): Promise<boolean> => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
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
            <a href="${siteUrl}/login" class="btn">Se connecter</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} SwipeShape, Tous droits réservés.</p>
          <p>Pour vous désabonner de nos mails, <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}">cliquez ici</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Version texte de l'email
  const textContent = `
    Bienvenue sur SwipeShape!
    
    Bonjour ${firstName},
    
    Bienvenue sur SwipeShape! Nous sommes ravis de vous compter parmi notre communauté.
    
    Avec votre compte, vous pouvez:
    - Accéder à nos programmes
    - Participer aux événements
    - Commenter les articles
    - Et bien plus encore!
    
    Pour vous connecter: ${siteUrl}/login
    
    © ${new Date().getFullYear()} SwipeShape, Tous droits réservés.
    Pour vous désabonner, visitez: ${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}
  `;
  
  return sendEmail({
    to: { email, name: `${firstName} ${lastName || ''}`.trim() },
    subject: 'Bienvenue sur SwipeShape',
    html: welcomeEmailContent,
    text: textContent
  });
};

/**
 * Envoie un email contenant un PDF (par exemple une facture)
 */
export const sendPdfEmail = async (
  // Surcharge qui accepte soit des arguments individuels, soit un objet d'options
  emailOrOptions: string | EmailOptions,
  firstName?: string,
  subject?: string,
  message?: string,
  pdfBuffer?: Buffer,
  fileName?: string
): Promise<boolean> => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Vérifier si on reçoit un objet d'options ou des arguments individuels
  if (typeof emailOrOptions === 'object') {
    // Version avec objet d'options (nouveau style)
    return sendEmail(emailOrOptions);
  }
  
  // Version legacy avec arguments individuels
  if (!firstName || !subject || !message || !pdfBuffer || !fileName) {
    throw new Error('Paramètres manquants pour l\'envoi d\'email avec PDF');
  }

  const email = emailOrOptions;
  
  // Contenu HTML de l'email
  const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${subject}</h2>
        </div>
        <div class="content">
          <p>Bonjour ${firstName},</p>
          <p>${message}</p>
          <p>Vous trouverez en pièce jointe votre document.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} SwipeShape, Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: { email, name: firstName },
    subject,
    html: htmlContent,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};

/**
 * Envoie une newsletter
 */
export const sendNewsletter = async (
  recipients: Array<{email: string, name?: string}>,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<boolean> => {
  return sendEmail({
    to: recipients,
    subject,
    html: htmlContent,
    text: textContent
  });
};
