import { addContactToList } from './emailUtils';
import { sendWelcomeEmail } from './sendWelcomeEmail';

export async function subscribeToNewsletter(email: string) {
  // 1. validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email invalide");
  }
  
  // 2. Ajouter à la liste des abonnés via notre service newsletter
  // La variable listId est maintenue pour compatibilité mais n'est plus nécessaire avec notre implémentation
  const listId = process.env.NEWSLETTER_LIST_ID ? parseInt(process.env.NEWSLETTER_LIST_ID) : undefined;
  
  await addContactToList(email, listId, {
    NEWSLETTER_CONSENT: true,
    WEBSITE_SOURCE: 'swipeshape.com',
    SUBSCRIPTION_DATE: new Date().toISOString()
  });
  
  // 3. Envoi du mail de bienvenue
  await sendWelcomeEmail(email);
}
