import { sendWelcomeEmail as sendNodemailerWelcomeEmail } from '@/services/email.service';

/**
 * Envoie un email de bienvenue lors de l'inscription à la newsletter
 * 
 * @param toEmail - Email de l'utilisateur
 * @param userName - Nom de l'utilisateur (optionnel)
 */
export async function sendWelcomeEmail(toEmail: string, userName: string = '') {
  // On utilise directement le service Nodemailer maintenant
  return sendNodemailerWelcomeEmail(
    toEmail, 
    userName || toEmail.split('@')[0], // Prénom (utilisez le début de l'email si pas de nom)
    '' // Pas de nom de famille
  );
}
