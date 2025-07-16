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

// POST: planifier l'envoi d'une newsletter (admin only)
export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req, true);
  if (forbidden) return forbidden;
  const { newsletterId, sendAt } = await req.json();
  // TODO: enregistrer la planification en DB ou queue
  return NextResponse.json({ success: true });
}