import { NextResponse } from 'next/server';
import { verifyAuthTokenApp } from '@/lib/auth-app';
import { checkUserCanComment } from '@/lib/db-utils-app';
import { withApiMiddleware, corsHeaders, handleApiError } from '@/lib/api-middleware-app';

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const token = await verifyAuthTokenApp();
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'ID du programme demandé
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    
    if (!programId) {
      return NextResponse.json({ error: 'ID du programme requis' }, { status: 400 });
    }

    // Vérifier si l'utilisateur a acheté ce programme
    const { canComment, error, programIds } = await checkUserCanComment(token.userId, programId);

    if (error) {
      console.error('Erreur lors de la vérification des achats:', error);
      return handleApiError('Erreur lors de la vérification de l\'achat', 500);
    }

    // Retourner le résultat
    return withApiMiddleware(NextResponse.json({ 
      hasPurchased: canComment,
      programIds
    }));
  } catch (error) {
    console.error('Erreur vérification achat:', error);
    return handleApiError('Erreur serveur lors de la vérification de l\'achat', 500);
  }
}

// Gestion des requêtes OPTIONS (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders(), status: 200 });
}

// Gestion des méthodes non supportées
export async function POST() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}

export async function PUT() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}

export async function DELETE() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}

export async function PATCH() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}
