
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '../../../../lib/prisma';
import { corsHeaders } from '../../../../lib/api-middleware-app';

const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  type: z.string().optional()
});

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

export async function GET(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;
  try {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ templates }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur GET templates:', err);
    return NextResponse.json(
      { error: 'Impossible de récupérer les templates' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'JSON invalide' },
      { status: 400, headers: corsHeaders() }
    );
  }
  const parse = templateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.format() },
      { status: 422, headers: corsHeaders() }
    );
  }
  try {
    const template = await prisma.emailTemplate.create({ data: parse.data as any });
    return NextResponse.json({ template }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur POST template:', err);
    return NextResponse.json(
      { error: 'Impossible d\'enregistrer le template' },
      { status: 500, headers: corsHeaders() }
    );
  }
}