// src/app/api/stripe/session-details/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { corsHeaders } from '@/lib/api-middleware-app';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

const querySchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const parse = querySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.format() },
      { status: 422, headers: corsHeaders() }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(parse.data.sessionId);
    return NextResponse.json(
      { session },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur récupération session' },
      { status: 502, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders() });
}
