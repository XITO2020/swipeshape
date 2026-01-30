// src/app/api/newsletter/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { unsubscribeSubscriber } from '@/services/newsletter.service';

const unsubscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  // 1. Valider et extraire la payload
  let payload: z.infer<typeof unsubscribeSchema>;
  try {
    const body = await req.json();
    payload = unsubscribeSchema.parse(body);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Requête invalide', details: err.message },
      { status: 400 }
    );
  }

  // 2. Désinscrire
  const { success, error } = await unsubscribeSubscriber(payload.email);
  if (!success) {
    return NextResponse.json(
      { error: error || 'Échec du désabonnement' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
