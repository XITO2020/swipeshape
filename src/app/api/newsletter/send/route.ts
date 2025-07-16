
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

// POST: déclencher manuellement l'envoi d'une newsletter (admin only)
export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req, true);
  if (forbidden) return forbidden;
  const { newsletterId } = await req.json();
  // TODO: lancer l'envoi via votre service d'email
  return NextResponse.json({ success: true });
}