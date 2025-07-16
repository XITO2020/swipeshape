
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { corsHeaders } from "../../../../lib/api-middleware-app";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" });

const querySchema = z.object({ sessionId: z.string().min(1) });

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401, headers: corsHeaders() });
  }

  const url = new URL(req.url);
  const parse = querySchema.safeParse({ sessionId: url.searchParams.get("sessionId") });
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 422, headers: corsHeaders() });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(parse.data.sessionId);
    return NextResponse.json({ session }, { status: 200, headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Impossible de récupérer la session" }, { status: 502, headers: corsHeaders() });
  }
}