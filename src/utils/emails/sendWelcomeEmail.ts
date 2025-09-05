// src/utils/emails/sendWelcomeEmail.ts

import { sendWelcomeEmail as sendNodemailerWelcomeEmail } from '@/lib/emailClient'

/**
 * Envoie un email de bienvenue lors de l'inscription à la newsletter.
 *
 * @param toEmail  Email de l'utilisateur
 * @param userName Nom de l'utilisateur (optionnel)
 */
export async function sendWelcomeEmail(
  toEmail: string,
  userName: string = ''
): Promise<boolean> {
  const firstName = userName || toEmail.split('@')[0]
  // Le helper de emailClient n’attend que (to, firstName, lastName?)
  return sendNodemailerWelcomeEmail(
    toEmail,
    firstName
  )
}
