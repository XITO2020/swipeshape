import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

function enforceAuth(req: NextRequest, needsAdmin = false) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (needsAdmin && sessionClaims?.role !== "admin") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }
  return null;
}

// GET: voir l'état d'abonnement de l'utilisateur
import { supabaseAdmin } from "@/lib/supabase";
export async function GET(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const subscribed = !!data;
  return NextResponse.json({ subscribed });
}

// POST: s'abonner
export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .insert([{ user_id: userId }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE: se désabonner
export async function DELETE(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .delete()
    .eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}