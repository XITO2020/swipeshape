
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdmin } from '@/lib/admin-middleware-app';
import { sendEmail, EmailOptions } from '@/services/email.service';
import { getSubscribers } from '@/services/newsletter.service';
import { supabaseAdmin } from '@/lib/supabase';

const payloadSchema = z.object({
  newsletterId: z.string().uuid(),
});

export const POST = withAdmin(async (req: NextRequest) => {
  let payload: { newsletterId: string };
  try {
    payload = payloadSchema.parse(await req.json());
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Payload invalide', details: err.message },
      { status: 400 }
    );
  }

  const { data: newsletter, error: nlError } = await supabaseAdmin
    .from('newsletters')
    .select('id, title, content')
    .eq('id', payload.newsletterId)
    .maybeSingle();
  if (nlError || !newsletter) {
    return NextResponse.json(
      { error: 'Newsletter introuvable' },
      { status: 404 }
    );
  }

  const subs = await getSubscribers();
  if (subs.length === 0) {
    return NextResponse.json(
      { error: 'Aucun abonné actif' },
      { status: 400 }
    );
  }

  const subject = newsletter.title;
  const html = newsletter.content;
  const text = html.replace(/<[^>]+>/g, '');

  let sentCount = 0;
  for (const { email } of subs) {
    const options: EmailOptions = {
      from: process.env.EMAIL_FROM!,
      to: email,
      subject,
      html,
      text,
    };
    if (await sendEmail(options)) sentCount++;
  }

  return NextResponse.json(
    { success: true, sentCount, total: subs.length },
    { status: 200 }
  );
});

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
