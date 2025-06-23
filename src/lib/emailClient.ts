// src/lib/brevoClient.ts
// Ce fichier est maintenu pour la compatibilité avec le code existant
// mais utilise désormais le service Nodemailer au lieu de Brevo SDK

import { 
  sendEmail as sendNodemailerEmail,
  sendWelcomeEmail,
  sendPdfEmail,
  sendNewsletter,
  EmailOptions,
  EmailRecipient
} from '@/services/email.service';

// Exporter un objet factice pour compatibilité avec l'ancien code
const dummyApiInstance = {
  sendTransacEmail: async () => {
    console.warn('DEPRECATED: ne plus utiliser apiInstance.sendTransacEmail directement');
    console.warn('Utilisez sendEmail() à la place');
    return { messageId: 'dummy-id-' + Date.now() };
  }
};

// Exporter l'instance API factice
export default dummyApiInstance;

/**
 * Envoie un email via Nodemailer
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} htmlContent - Contenu HTML de l'email
 * @param {string} textContent - Contenu texte de l'email
 * @param {string} fromName - Nom de l'expéditeur
 * @param {string} fromEmail - Email de l'expéditeur
 * @param {Record<string, any>} [params] - Paramètres supplémentaires
 * @returns {Promise<any>} - Confirmation d'envoi
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  fromName: string = 'SwipeShape',
  fromEmail: string = process.env.EMAIL_FROM || 'no-reply@swipeshape.com',
  params: Record<string, any> = {}
) {
  try {
    // Format de destination attendu par notre service
    const toRecipient: EmailRecipient = { email: to };
    
    // Configurer l'expéditeur avec le format correct
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
    
    // Transformer les pièces jointes au format Nodemailer
    const attachments = params.attachments?.map((att: any) => ({
      filename: att.name,
      content: Buffer.from(att.content, 'base64')
    }));
    
    // Préparer les options d'envoi
    const options: EmailOptions = {
      to: toRecipient,
      subject,
      html: htmlContent,
      text: textContent,
      from
    };
    
    // Ajouter les pièces jointes si présentes
    if (attachments?.length) {
      options.attachments = attachments;
    }

    // Envoyer l'email via notre service Nodemailer
    const success = await sendNodemailerEmail(options);
    
    // Format de réponse similaire à l'ancien pour compatibilité
    console.log('Email envoyé avec succès via Nodemailer');
    return { success, messageId: 'nodemailer-' + Date.now() };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

/**
 * Envoie un email avec pièce jointe
 */
export async function sendEmailWithAttachment(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  attachmentContent: Buffer,
  attachmentName: string,
  fromName: string = 'SwipeShape',
  fromEmail: string = process.env.EMAIL_FROM || 'no-reply@swipeshape.com'
) {
  // Utiliser la fonction sendEmail pour maintenir la compatibilité
  return sendEmail(
    to,
    subject,
    htmlContent,
    textContent,
    fromName,
    fromEmail,
    { 
      attachments: [{
        content: attachmentContent.toString('base64'),
        name: attachmentName
      }] 
    }
  );
}

// Réexporter les fonctions du service email pour permettre une migration progressive
export {
  sendWelcomeEmail,
  sendPdfEmail,
  sendNewsletter
};
