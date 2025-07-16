import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { executeQuery } from "../../../../lib/db";
import { corsHeaders } from "../../../../lib/api-middleware-app";

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
      { status: 403, headers: corsHeaders() }
    );
  }
  return null;
}

/**
 * GET /newsletter/templates : liste des templates (tous membres authentifiés)
 */
export async function GET(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;

  try {
    const { data: templates, error } = await executeQuery(
      'SELECT * FROM newsletter_templates;',
      []
    );
    if (error) throw error;
    return NextResponse.json({ templates }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    );
  }
}