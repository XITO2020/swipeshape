// src/utils/emails/emailUtils.ts
// Ce fichier est maintenu pour la rétrocompatibilité mais utilise désormais Nodemailer
// Il fait office de wrapper vers notre nouveau service d'email

import { 
  sendEmail as sendNodemailerEmail,
  sendWelcomeEmail as sendNodemailerWelcomeEmail,
  sendPdfEmail,
  sendNewsletter,
  EmailOptions,
  EmailRecipient
} from '@/services/email.service';
import { addSubscriber } from '@/services/newsletter.service';

/**
 * Ajoute un contact à la liste des abonnés newsletter
 * @param email - Email du contact
 * @param listId - Non utilisé, maintenu pour compatibilité
 * @param attributes - Attributs additionnels (nom, prénom, etc.)
 */
export async function addContactToList(
  email: string,
  listId?: number,
  attributes: Record<string, any> = {}
) {
  try {
    const name = attributes.firstname || attributes.FIRSTNAME || attributes.name || '';
    const response = await addSubscriber(email, name);
    console.log('Contact ajouté avec succès à la newsletter:', response);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du contact à la newsletter:', error);
    throw error;
  }
}

/**
 * Envoie un email via Nodemailer
 * @param {string|string[]} to - Adresse(s) email du/des destinataire(s)
 * @param {string} subject - Sujet de l'email
 * @param {string} htmlContent - Contenu HTML de l'email
 * @param {string} textContent - Contenu texte de l'email
 * @param {string} fromName - Nom de l'expéditeur
 * @param {string} fromEmail - Email de l'expéditeur
 * @param {Record<string, any>} [params] - Paramètres supplémentaires
 * @returns {Promise<any>} - Résultat de l'envoi
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  htmlContent: string,
  textContent: string,
  fromName: string = 'SwipeShape',
  fromEmail: string = process.env.EMAIL_FROM || 'no-reply@swipeshape.com',
  params: Record<string, any> = {}
) {
  try {
    // Formatage du from avec le nom si fourni
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
    
    // Conversion des attachments du format Brevo au format Nodemailer
    const attachments = params.attachments?.map((att: any) => ({
      filename: att.name,
      content: Buffer.from(att.content, 'base64')
    }));

    // Appel au service Nodemailer
    const emailOptions: EmailOptions = {
      to: Array.isArray(to) 
        ? to.map(email => ({ email })) 
        : { email: to },
      subject,
      html: htmlContent,
      text: textContent,
      from,
    };
    
    if (attachments?.length) {
      emailOptions.attachments = attachments;
    }
    
    const result = await sendNodemailerEmail(emailOptions);
    
    console.log('Email envoyé avec succès via Nodemailer');
    return result;
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
  try {
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
    
    // Utiliser directement notre service PDF email
    const result = await sendPdfEmail({
      to: { email: to },
      subject,
      html: htmlContent,
      text: textContent,
      from,
      attachments: [{
        filename: attachmentName,
        content: attachmentContent
      }]
    });
    
    console.log('Email avec pièce jointe envoyé avec succès');
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email avec pièce jointe:', error);
    throw error;
  }
}

// Exporter aussi les nouvelles fonctions directement du service pour faciliter la migration
export {
  sendNodemailerWelcomeEmail,
  sendPdfEmail,
  sendNewsletter
};

// Exporter un objet pour rétrocompatibilité
export default {
  sendEmail,
  sendEmailWithAttachment,
  addContactToList,
  sendWelcomeEmail: sendNodemailerWelcomeEmail
};
