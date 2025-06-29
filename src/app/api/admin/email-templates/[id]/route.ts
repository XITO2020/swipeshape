import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '../../../../../lib/auth-app';
import { prisma } from '../../../../../lib/prisma';

/**
 * Supprimer un template d'email par son ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier que l'utilisateur est admin
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = params;
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID du template requis' },
      { status: 400 }
    );
  }

  try {
    // Vérifier que le template existe
    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le template
    await prisma.emailTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    return NextResponse.json(
      { error: 'Impossible de supprimer le template' },
      { status: 500 }
    );
  }
}
