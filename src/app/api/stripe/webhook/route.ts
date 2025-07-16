
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { corsHeaders } from "../../../../lib/api-middleware-app";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400, headers: corsHeaders() });
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: Traitement paiement réussi
      break;
    case "payment_intent.payment_failed":
      const intent = event.data.object as Stripe.PaymentIntent;
      // TODO: Traitement paiement échoué
      break;
    default:
      // TODO: Autres événements
      break;
  }

  return NextResponse.json({ received: true }, { status: 200, headers: corsHeaders() });
}