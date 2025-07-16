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
export async function GET(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;
  // TODO: vérifier en DB si userId est abonné
  const subscribed = true;
  return NextResponse.json({ subscribed });
}

// POST: s'abonner
export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;
  // TODO: ajouter userId à la liste d'abonnés
  return NextResponse.json({ success: true });
}

// DELETE: se désabonner
export async function DELETE(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;
  // TODO: retirer userId de la liste d'abonnés
  return NextResponse.json({ success: true });
}