import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '../../../../lib/prisma';
import { corsHeaders } from '../../../../lib/api-middleware-app';

function enforceAdmin(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId || sessionClaims?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403, headers: corsHeaders() });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const purchases = await prisma.purchase.findMany({
      include: { program: true, user: { select: { email: true, id: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ purchases }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur GET purchases:', err);
    return NextResponse.json({ error: 'Impossible de récupérer les achats' }, { status: 500, headers: corsHeaders() });
  }
}