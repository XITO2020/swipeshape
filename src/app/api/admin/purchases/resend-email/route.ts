
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { corsHeaders } from '@/lib/api-middleware-app';
import { z } from 'zod';

const resendSchema = z.object({
  purchaseId: z.string().uuid()
});

function enforceAdmin(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId || sessionClaims?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403, headers: corsHeaders() });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requête JSON invalide' }, { status: 400, headers: corsHeaders() });
  }

  const parse = resendSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 422, headers: corsHeaders() });
  }

  try {
    const purchase = await prisma.purchase.findUnique({ where: { id: parse.data.purchaseId } });
    if (!purchase) {
      return NextResponse.json({ error: 'Achat non trouvé' }, { status: 404, headers: corsHeaders() });
    }
    // TODO: implémenter la logique d'envoi d'email, via service email
    await prisma.purchase.update({ where: { id: purchase.id }, data: { emailedAt: new Date() } });
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur resend-email:', err);
    return NextResponse.json({ error: 'Impossible de renvoyer l\'email' }, { status: 500, headers: corsHeaders() });
  }
}