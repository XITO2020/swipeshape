// src/services/email.service.ts
import createTransport from 'nodemailer';
import type { Options, MailOptions } from 'nodemailer/lib/smtp-transport';

// Création du transporteur SMTP
const transporter = createTransport(
  {
    host:   process.env.EMAIL_HOST!,
    port:   parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  } as Options
);

/**
 * Type des options qu'on passe à sendEmail()
 */
export type EmailOptions = MailOptions;

/**
 * Envoie un email. Retourne `true` si succès, `false` sinon.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail(options);
    return true;
  } catch (err: any) {
    console.error('Erreur envoi email :', err.message);
    return false;
  }
}

export default sendEmail;
