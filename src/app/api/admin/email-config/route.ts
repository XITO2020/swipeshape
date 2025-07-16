
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { executeQuery } from '../../../../lib/db';
import { corsHeaders } from '../../../../lib/api-middleware-app';

// Schéma Zod pour validation des configs email
const configSchema = z.object({
  smtpHost: z.string().min(1),
  smtpPort: z.number().int().positive(),
  smtpUser: z.string().min(1),
  smtpPass: z.string().min(1),
  fromEmail: z.string().email(),
  replyTo: z.string().email().optional()
});

// Vérifier que l'utilisateur est admin
function enforceAdmin(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId || sessionClaims?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403, headers: corsHeaders() }
    );
  }
  return null;
}

// GET: récupérer la configuration email
export async function GET(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  const { data, error } = await executeQuery(
    'SELECT key, value FROM email_config', []
  );
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
  // convertir la liste key/value en objet
  const config: Record<string, string> = {};
  data.forEach((row: { key: string; value: string }) => {
    config[row.key] = row.value;
  });
  return NextResponse.json(
    { config },
    { headers: corsHeaders() }
  );
}

// POST: mettre à jour la configuration email
export async function POST(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const parse = configSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.format() },
      { status: 422, headers: corsHeaders() }
    );
  }

  try {
    const entries = Object.entries(parse.data);
    for (const [key, value] of entries) {
      await executeQuery(
        `INSERT INTO email_config(key, value) VALUES ($1, $2)
         ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value`,
        [key, String(value)]
      );
    }
    return NextResponse.json(
      { message: 'Configuration mise à jour' },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}