import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '../../../../../lib/prisma';
import { corsHeaders } from '../../../../../lib/api-middleware-app';

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  if (!id) {
    return NextResponse.json(
      { error: 'ID requis' },
      { status: 400, headers: corsHeaders() }
    );
  }
  try {
    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404, headers: corsHeaders() }
      );
    }
    await prisma.emailTemplate.delete({ where: { id } });
    return NextResponse.json(
      { success: true },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error('Erreur DELETE template:', err);
    return NextResponse.json(
      { error: 'Impossible de supprimer le template' },
      { status: 500, headers: corsHeaders() }
    );
  }
}