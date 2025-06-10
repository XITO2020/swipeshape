import { addContactToList } from './brevo';
import { sendWelcomeEmail } from './sendWelcomeEmail';

export async function subscribeToNewsletter(email: string) {
  // 1. validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email invalide");
  }
  
  // 2. Ajouter à la liste Brevo
  // Utiliser l'ID de liste Brevo défini dans l'environnement ou une valeur par défaut
  const listId = process.env.BREVO_NEWSLETTER_LIST_ID ? parseInt(process.env.BREVO_NEWSLETTER_LIST_ID) : undefined;
  
  await addContactToList(email, listId, {
    NEWSLETTER_CONSENT: true,
    WEBSITE_SOURCE: 'swipeshape.com',
    SUBSCRIPTION_DATE: new Date().toISOString()
  });
  
  // 3. Envoi du mail de bienvenue
  await sendWelcomeEmail(email);
}
