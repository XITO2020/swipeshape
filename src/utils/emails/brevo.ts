// src/utils/emails/brevo.ts
import * as SibApiV3Sdk from '@getbrevo/brevo';

// Configuration du client Brevo
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Configurer la clé API
const apiKey = SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';

// API contacts pour la gestion des listes et abonnés
const contactsApi = new SibApiV3Sdk.ContactsApi();

/**
 * Ajoute un contact à une liste Brevo
 * @param email - Email du contact
 * @param listId - ID de la liste (optionnel)
 * @param attributes - Attributs additionnels
 */
export async function addContactToList(
  email: string,
  listId?: number,
  attributes: Record<string, any> = {}
) {
  try {
    const createContact = new SibApiV3Sdk.CreateContact();
    createContact.email = email;
    createContact.attributes = attributes;
    
    if (listId) {
      createContact.listIds = [listId];
    }
    
    const response = await contactsApi.createContact(createContact);
    console.log('Contact ajouté avec succès à Brevo:', response);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du contact à Brevo:', error);
    throw error;
  }
}

/**
 * Envoie un email via Brevo
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} htmlContent - Contenu HTML de l'email
 * @param {string} textContent - Contenu texte de l'email
 * @param {string} fromName - Nom de l'expéditeur
 * @param {string} fromEmail - Email de l'expéditeur
 * @param {Record<string, any>} [params] - Paramètres supplémentaires
 * @returns {Promise<any>} - Réponse de l'API Brevo
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  fromName: string = 'SwipeShape',
  fromEmail: string = process.env.BREVO_FROM_EMAIL || 'no-reply@swipeshape.com',
  params: Record<string, any> = {}
) {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = Array.isArray(to) 
      ? to.map(email => ({ email })) 
      : [{ email: to }];
    
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    
    // Ajouter des tags ou autres paramètres
    if (params.tags) sendSmtpEmail.tags = params.tags;
    if (params.attachments) sendSmtpEmail.attachment = params.attachments;
    if (params.replyTo) sendSmtpEmail.replyTo = params.replyTo;

    // Envoyer l'email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email envoyé avec succès via Brevo:', response);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email via Brevo:', error);
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
  fromEmail: string = process.env.BREVO_FROM_EMAIL || 'no-reply@swipeshape.com'
) {
  const attachments = [{
    content: attachmentContent.toString('base64'),
    name: attachmentName
  }];
  
  return sendEmail(
    to,
    subject,
    htmlContent,
    textContent,
    fromName,
    fromEmail,
    { attachments }
  );
}

export default {
  sendEmail,
  sendEmailWithAttachment,
  addContactToList,
  apiInstance,
  contactsApi
};
