// src/app/api/stripe/webhook/route.ts
import Stripe from 'stripe';
import { NextResponse, type NextRequest } from 'next/server';
import { corsHeaders } from '@/lib/api-middleware-app';

// Vérifier l'existence des variables d'environnement
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Lire le corps brut en tant que texte
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Stripe signature header is missing' },
        { status: 400, headers: corsHeaders() }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed.', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Traiter ici les différents types d'événements Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Session checkout terminée :', session.id);
        break;
      }
      // Ajoutez d'autres événements si besoin
      default:
        console.log(`ℹ️ Événement Stripe non géré : ${event.type}`);
    }

    // Toujours retourner 200 pour confirmer la réception
    return NextResponse.json(
      { received: true },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    { status: 200, headers: corsHeaders() }
  );
}
