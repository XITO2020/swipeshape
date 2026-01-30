// src/utils/emails/emailUtils.ts

import {
  sendEmail       as sendNodemailerEmail,
  sendWelcomeEmail,
  sendPdfEmail,
  sendNewsletter,
  sendEmailWithAttachment as sendClientWithAttachment,
  EmailRecipient,
  EmailAttachmentParam,
} from '@/lib/emailClient'
import { addSubscriber } from '@/services/newsletter.service'

/**
 * Ajoute un contact à la newsletter (compatibilité).
 */
export async function addContactToList(
  email: string,
  _listId?: any,
  attributes: Record<string, any> = {}
) {
  const name = attributes.firstname || attributes.name || ''
  return addSubscriber(email, name)
}

/**
 * Envoie un email à un seul destinataire.
 */
export async function sendEmail(
  to: string | EmailRecipient,
  subject: string,
  html: string,
  text: string,
  fromName = 'SwipeShape',
  fromEmail = process.env.EMAIL_FROM || 'no-reply@swipeshape.com',
  attachmentsParams?: EmailAttachmentParam[],
): Promise<boolean> {
  // Normalisation du destinataire unique
  const normalized: EmailRecipient = 
    typeof to === 'string'
      ? { email: to }
      : to

  return sendNodemailerEmail(
    normalized,
    subject,
    html,
    text,
    fromName,
    fromEmail,
    { attachments: attachmentsParams }
  )
}

/**
 * Envoie un email à plusieurs destinataires.
 */
export async function sendBulkEmail(
  to: Array<string | EmailRecipient>,
  subject: string,
  html: string,
  text: string,
  fromName?: string,
  fromEmail?: string,
): Promise<number> {
  // Construire un tableau de EmailRecipient
  const recipients: EmailRecipient[] = to.map(item =>
    typeof item === 'string'
      ? { email: item }
      : item
  )
  return sendNewsletter(
    recipients,
    subject,
    html,
    text
  )
}

/**
 * Envoie un email de bienvenue (uniquement un seul destinataire).
 */
export const sendWelcomeEmailSingle = sendWelcomeEmail

/**
 * Envoie un email avec pièce jointe (PDF).
 * Délègue à votre fonction client qui accepte 8 arguments.
 */
export async function sendEmailWithAttachment(
  to: string | EmailRecipient,
  subject: string,
  html: string,
  text: string,
  pdfBuffer: Buffer,
  fileName: string,
  fromName = 'SwipeShape',
  fromEmail = process.env.EMAIL_FROM || 'no-reply@swipeshape.com',
): Promise<boolean> {
  // on délègue strictement la signature attendue
  return sendClientWithAttachment(
    to,
    subject,
    html,
    text,
    pdfBuffer,
    fileName,
    fromName,
    fromEmail
  )
}
