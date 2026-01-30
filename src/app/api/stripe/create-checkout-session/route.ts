// src/app/api/stripe/create-checkout-session/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { corsHeaders } from '@/lib/api-middleware-app';

// ❗️ Stripe attend 2 arguments : clé secrète + options
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

const checkoutSchema = z.object({
  priceId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json(
      { error: 'Utilisateur non authentifié' },
      { status: 401, headers: corsHeaders() }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const parse = checkoutSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.format() },
      { status: 422, headers: corsHeaders() }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: parse.data.priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: { userId },
    });

    return NextResponse.json(
      { sessionId: session.id },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur interne Stripe' },
      { status: 502, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders() });
}
