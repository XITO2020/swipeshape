// src/lib/emailClient.ts
import smtpSendEmail, { EmailOptions as SmtpEmailOptions } from '@/services/email.service'

export interface EmailRecipient {
  email: string
  name?: string
}

export interface EmailAttachmentParam {
  name: string
  content: string // base64
}

/**
 * Envoi un email (signature à 6 args pour rester compatible).
 */
export async function sendEmail(
  to: string | EmailRecipient,
  subject: string,
  html: string,
  text: string,
  fromName: string = 'SwipeShape',
  fromEmail: string = process.env.EMAIL_FROM ?? 'no-reply@swipeshape.com',
  params?: { attachments?: EmailAttachmentParam[] }
): Promise<boolean> {
  const toHeader =
    typeof to === 'string'
      ? to
      : `${to.name ? `"${to.name}" ` : ''}<${to.email}>`
  const fromHeader = fromName
    ? `"${fromName}" <${fromEmail}>`
    : fromEmail

  const options: SmtpEmailOptions = {
    from:        fromHeader,
    to:          toHeader,
    subject,
    html,
    text,
    attachments: params?.attachments?.map(att => ({
      filename: att.name,
      content:  Buffer.from(att.content, 'base64'),
    })),
  }
  return smtpSendEmail(options)
}

export async function sendWelcomeEmail(
  to: string | EmailRecipient,
  firstName: string,
  lastName?: string
): Promise<boolean> {
  const subject = 'Bienvenue sur SwipeShape'
  const html    = `<p>Bonjour ${firstName},</p><p>Merci de vous être inscrit sur SwipeShape !</p>`
  const text    = `Bonjour ${firstName},\n\nMerci de vous être inscrit sur SwipeShape !`
  return sendEmail(to, subject, html, text)
}

export async function sendPdfEmail(
  to: string | EmailRecipient,
  subject: string,
  text: string,
  html: string,
  pdfBuffer: Buffer,
  fileName: string
): Promise<boolean> {
  return sendEmail(
    to,
    subject,
    html,
    text,
    'SwipeShape',
    process.env.EMAIL_FROM!,
    { attachments: [{ name: fileName, content: pdfBuffer.toString('base64') }] }
  )
}

export async function sendNewsletter(
  recipients: EmailRecipient[],
  subject: string,
  html: string,
  text: string
): Promise<number> {
  let count = 0
  for (const r of recipients) {
    if (await sendEmail(r, subject, html, text)) {
      count++
    }
  }
  return count
}

/**
 * Compatibilité : envoi d'un email avec PDF + possibilité de surcharger fromName/fromEmail
 */
export async function sendEmailWithAttachment(
  to: string | EmailRecipient,
  subject: string,
  html: string,
  text: string,
  pdfBuffer: Buffer,
  fileName: string,
  fromName: string = 'SwipeShape',
  fromEmail: string = process.env.EMAIL_FROM ?? 'no-reply@swipeshape.com',
): Promise<boolean> {
  return sendEmail(
    to,
    subject,
    html,
    text,
    fromName,
    fromEmail,
    {
      attachments: [
        {
          name: fileName,
          content: pdfBuffer.toString('base64'),
        },
      ],
    }
  );
}


// Alias pour compatibilité avec sendProgramPurchaseEmail.ts
