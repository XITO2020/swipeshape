import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { executeQuery } from '../../db';
import { withApiMiddleware, corsHeaders, handleApiError } from '@/lib/api-middleware-app';

export async function POST(request: Request) {
  try {
    // 1. Récupérer les données de la requête
    const body = await request.json();
    const { programId, email } = body;

    if (!programId || !email) {
      return NextResponse.json({ 
        error: 'Données invalides', 
        message: 'L\'ID du programme et l\'email sont requis' 
      }, { status: 400 });
    }

    // 2. Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await executeQuery(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userError || !user || user.length === 0) {
      return NextResponse.json({ 
        error: 'Utilisateur non autorisé', 
        message: 'Veuillez vous connecter pour effectuer cet achat' 
      }, { status: 401 });
    }

    // 3. Vérifier que le programme existe
    const { data: program, error: programError } = await executeQuery(
      'SELECT id, name, price FROM programs WHERE id = $1',
      [programId]
    );

    if (programError || !program || program.length === 0) {
      return NextResponse.json({ 
        error: 'Programme introuvable', 
        message: 'Le programme demandé n\'existe pas' 
      }, { status: 404 });
    }

    // 4. Créer une session de paiement Stripe
    const checkoutUrl = await createCheckoutSession(email, programId);

    // 5. Retourner l'URL de la session Stripe
    return withApiMiddleware(request, NextResponse.json({ url: checkoutUrl }));

  } catch (error: any) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    return handleApiError(
      request,
      error,
      500,
      'Une erreur est survenue lors de la création de la session de paiement'
    );
  }
}

// Gestion des requêtes OPTIONS (CORS)
export async function OPTIONS(request: Request) {
  // Créer une réponse vide
  const response = NextResponse.json({}, { status: 200 });
  // Appliquer les headers CORS
  return withApiMiddleware(request, response);
}

// Gestion des autres méthodes HTTP
export async function GET(request: Request) {
  const response = NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
  return withApiMiddleware(request, response);
}

export async function PUT(request: Request) {
  const response = NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
  return withApiMiddleware(request, response);
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
  return withApiMiddleware(request, response);
}

export async function PATCH(request: Request) {
  const response = NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
  return withApiMiddleware(request, response);
}
