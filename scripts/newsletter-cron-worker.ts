// scripts/newsletter-cron-worker.ts
// Script Node.js à lancer en cron ou via un scheduler (ex: PM2, GitHub Actions, Vercel Cron, etc.)
// Il envoie toutes les newsletters planifiées dont la date d'envoi est passée et non encore envoyées.

import { createClient } from '@supabase/supabase-js';
import { sendNewsletter } from '../src/services/email.service';
import { getSubscribersFromDatabase } from '../src/services/newsletter.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log(`[${new Date().toISOString()}] Démarrage du worker newsletter...`);
  // 1. Récupérer toutes les planifications à envoyer (non envoyées, send_at <= now)
  const { data: schedules, error } = await supabase
    .from('newsletter_schedules')
    .select('id, newsletter_id, send_at, sent_at')
    .is('sent_at', null)
    .lte('send_at', new Date().toISOString());
  if (error) {
    console.error('Erreur récupération des planifications:', error);
    process.exit(1);
  }
  if (!schedules || schedules.length === 0) {
    console.log('Aucune newsletter à envoyer.');
    process.exit(0);
  }
  for (const schedule of schedules) {
    // 2. Récupérer la newsletter associée
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', schedule.newsletter_id)
      .maybeSingle();
    if (newsletterError || !newsletter) {
      console.error('Newsletter introuvable pour la planification:', schedule.id);
      continue;
    }
    // 3. Récupérer les abonnés
    const subscribers = await getSubscribersFromDatabase();
    if (!subscribers.length) {
      console.warn('Aucun abonné actif pour l’envoi de la newsletter planifiée:', schedule.id);
      continue;
    }
    // 4. Envoyer la newsletter
    const subject = newsletter.title || 'Newsletter SwipeShape';
    const htmlContent = newsletter.content;
    const textContent = htmlContent.replace(/<[^>]+>/g, '');
    const recipients = subscribers.map(sub => ({ email: sub.email, name: sub.name }));
    const sent = await sendNewsletter(recipients, subject, htmlContent, textContent);
    if (sent) {
      // 5. Marquer comme envoyée
      await supabase
        .from('newsletter_schedules')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', schedule.id);
      console.log(`Newsletter ${newsletter.id} envoyée à ${recipients.length} abonnés (planif ${schedule.id}).`);
    } else {
      console.error('Erreur lors de l’envoi de la newsletter planifiée:', schedule.id);
    }
  }
  process.exit(0);
}

(async () => {
  try {
    await run();
  } catch (e) {
    console.error('Erreur fatale worker:', e);
    if (e instanceof Error && e.stack) {
      console.error('Stack:', e.stack);
    }
    process.exit(1);
  }
})();
