import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/auth-app';
import { prisma } from '../../../../lib/prisma';

/**
 * Récupérer tous les templates d'email
 */
export async function GET(request: NextRequest) {
  // Vérifier que l'utilisateur est admin
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    // Récupérer tous les templates depuis la DB
    const templates = await prisma.emailTemplate.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les templates' },
      { status: 500 }
    );
  }
}

/**
 * Créer ou mettre à jour un template d'email
 */
export async function POST(request: NextRequest) {
  // Vérifier que l'utilisateur est admin
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const data = await request.json();

    // Valider les données requises
    if (!data.name || !data.subject || !data.content) {
      return NextResponse.json(
        { error: 'Les champs nom, sujet et contenu sont requis' },
        { status: 400 }
      );
    }

    let template;

    // Mise à jour ou création selon la présence d'un ID
    if (data.id) {
      // Mise à jour
      template = await prisma.emailTemplate.update({
        where: {
          id: data.id
        },
        data: {
          name: data.name,
          subject: data.subject,
          content: data.content,
          type: data.type || 'custom'
        }
      });
    } else {
      // Création
      template = await prisma.emailTemplate.create({
        data: {
          name: data.name,
          subject: data.subject,
          content: data.content,
          type: data.type || 'custom'
        }
      });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du template:', error);
    return NextResponse.json(
      { error: 'Impossible d\'enregistrer le template' },
      { status: 500 }
    );
  }
}
