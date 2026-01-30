// src/app/api/newsletter/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdmin } from '@/lib/admin-middleware-app';
import { sendEmail, EmailOptions } from '@/services/email.service';
import { getSubscribers } from '@/services/newsletter.service';
import { supabaseAdmin } from '@/lib/supabase';

const payloadSchema = z.object({
  newsletterId: z.string().uuid(),
  sendAt: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'sendAt doit être une date ISO valide' }),
});

export const POST = withAdmin(async (req: NextRequest, _adminId: string) => {
  // 1. Valider le payload
  let payload: z.infer<typeof payloadSchema>;
  try {
    payload = payloadSchema.parse(await req.json());
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Payload invalide', details: err.message },
      { status: 400 }
    );
  }

  // 2. Charger la newsletter
  const { data: newsletter, error: nlError } = await supabaseAdmin
    .from('newsletters')
    .select('id, title, content')
    .eq('id', payload.newsletterId)
    .maybeSingle();
  if (nlError || !newsletter) {
    return NextResponse.json(
      { error: 'Newsletter introuvable', details: nlError?.message },
      { status: 404 }
    );
  }

  // 3. Enregistrer la planification
  const { error: scheduleError } = await supabaseAdmin
    .from('newsletter_schedules')
    .insert([{ newsletter_id: payload.newsletterId, send_at: payload.sendAt }]);
  if (scheduleError) {
    return NextResponse.json(
      { error: 'Échec de la planification', details: scheduleError.message },
      { status: 500 }
    );
  }

  // 4. Si date passée ou immédiate, on envoie tout de suite
  const sendDate = new Date(payload.sendAt);
  let sentCount = 0;
  if (sendDate <= new Date()) {
    const subs = await getSubscribers();
    if (subs.length === 0) {
      return NextResponse.json(
        { error: 'Aucun abonné actif pour l’envoi.' },
        { status: 400 }
      );
    }

    const subject = newsletter.title || 'Newsletter SwipeShape';
    const html = newsletter.content;
    const text = html.replace(/<[^>]+>/g, '');

    for (const { email } of subs) {
      const opts: EmailOptions = {
        from: process.env.EMAIL_FROM || 'no-reply@swipeshape.com',
        to: email,
        subject,
        html,
        text,
      };
      try {
        if (await sendEmail(opts)) sentCount++;
      } catch (e) {
        console.error('Erreur envoi à', email, e);
      }
    }
  }

  return NextResponse.json(
    { success: true, scheduled: true, sentCount },
    { status: 200 }
  );
});

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
