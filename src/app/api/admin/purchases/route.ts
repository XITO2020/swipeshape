import { NextResponse } from 'next/server';
import { executeQuery } from '../../db';
import { withAdminAuthApp } from '@/lib/admin-middleware-app';

/**
 * Gestion des requêtes GET pour obtenir tous les achats avec les détails du programme
 */
export const GET = withAdminAuthApp(async (request: Request) => {
  try {
    // Récupérer tous les achats avec les détails du programme
    const { data: purchases, error } = await executeQuery(`
      SELECT 
        p.*, 
        pr.name as program_name,
        pr.price as program_price
      FROM purchases p
      LEFT JOIN programs pr ON p.program_id = pr.id
      ORDER BY p.created_at DESC
    `, []);

    if (error) {
      console.error('Erreur lors de la récupération des achats:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des achats' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      purchases
    });
  } catch (error) {
    console.error('Erreur serveur lors de la récupération des achats:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur lors de la récupération des achats' 
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
export const POST = withAdminAuthApp(async () => {
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
