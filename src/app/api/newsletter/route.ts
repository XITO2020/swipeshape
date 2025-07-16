import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { executeQuery } from "../../../lib/db";
import { corsHeaders } from "../../../lib/api-middleware-app";

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
 * GET /newsletter : liste des newsletters (tous membres authentifiés)
 */
export async function GET(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;

  try {
    const { data: newsletters, error } = await executeQuery(
      'SELECT * FROM newsletters;',
      []
    );
    if (error) throw error;
    return NextResponse.json({ newsletters }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * POST /newsletter : création (admin only)
 */
export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req, true);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const { data: createdRows, error } = await executeQuery(
      `INSERT INTO newsletters (title, content) VALUES ($1, $2) RETURNING *;`,
      [body.title, body.content]
    );
    if (error) throw error;
    return NextResponse.json(
      { newsletter: createdRows[0] },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    );
  }
}