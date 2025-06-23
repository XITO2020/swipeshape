import { NextResponse } from 'next/server';
import { executeQuery } from '../../../db';
import { withAdminAuthApp } from '@/lib/admin-middleware-app';

/**
 * Gestion des requêtes POST pour réinitialiser le compteur de téléchargements
 */
export const POST = withAdminAuthApp(async (request: Request) => {
  try {
    const body = await request.json();
    const { purchaseId } = body;

    if (!purchaseId) {
      return NextResponse.json({ error: 'ID d\'achat manquant' }, { status: 400 });
    }

    // Réinitialiser le compteur de téléchargements
    const { data, error } = await executeQuery(
      'UPDATE purchases SET download_count = 0 WHERE id = $1 RETURNING *',
      [purchaseId]
    );

    if (error || !data || data.length === 0) {
      console.error('Erreur lors de la réinitialisation du compteur:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la réinitialisation du compteur',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Compteur de téléchargements réinitialisé avec succès',
      purchase: data[0]
    });
  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors de la réinitialisation du compteur'
    }, { status: 500 });
  }
});

/**
 * Gestion des requêtes OPTIONS pour CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

/**
 * Gestion des autres méthodes HTTP non supportées
 */
export const GET = withAdminAuthApp(async () => {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
});

export const PUT = withAdminAuthApp(async () => {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
});

export const DELETE = withAdminAuthApp(async () => {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
});

export const PATCH = withAdminAuthApp(async () => {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
});
