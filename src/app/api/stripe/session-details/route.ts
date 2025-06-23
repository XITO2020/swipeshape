import { NextResponse } from 'next/server';
import { getCheckoutSession } from '@/lib/stripe';
import { executeQuery } from '../../db';
import { withApiMiddleware, corsHeaders, handleApiError } from '@/lib/api-middleware-app';

export async function GET(request: Request) {
  try {
    // Récupérer l'ID de session des paramètres de requête
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    
    if (!session_id) {
      return NextResponse.json({ error: 'ID de session manquant ou invalide' }, { status: 400 });
    }

    // 1. Récupérer les détails de la session depuis Stripe
    const session = await getCheckoutSession(session_id);
    
    if (!session) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    const programId = session.metadata?.programId;
    const userEmail = session.customer_email || session.metadata?.userEmail;

    if (!programId || !userEmail) {
      return NextResponse.json({ error: 'Informations de session incomplètes' }, { status: 400 });
    }

    // 2. Récupérer les détails de l'achat dans notre base de données
    const { data: purchases, error: purchasesError } = await executeQuery(
      `SELECT * FROM purchases 
       WHERE payment_intent_id = $1 
       OR (user_email = $2 AND program_id = $3)
       ORDER BY created_at DESC
       LIMIT 1`,
      [session.payment_intent, userEmail, programId]
    );

    if (purchasesError || !purchases || purchases.length === 0) {
      return NextResponse.json({ error: 'Achat introuvable dans la base de données' }, { status: 404 });
    }

    // 3. Récupérer les détails du programme
    const { data: programs, error: programsError } = await executeQuery(
      'SELECT * FROM programs WHERE id = $1',
      [programId]
    );

    if (programsError || !programs || programs.length === 0) {
      return NextResponse.json({ error: 'Programme introuvable' }, { status: 404 });
    }

    // 4. Retourner toutes les informations
    return withApiMiddleware(NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total ? session.amount_total / 100 : null,
        customer_email: session.customer_email
      },
      purchase: purchases[0],
      program: programs[0]
    }));

  } catch (error: any) {
    console.error('Erreur lors de la récupération des détails de la session:', error);
    return handleApiError(
      'Erreur serveur', 
      500, 
      error.message || 'Une erreur est survenue lors de la récupération des détails de la session'
    );
  }
}

// Gestion des requêtes OPTIONS (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders(), status: 200 });
}

// Gestion des autres méthodes HTTP non autorisées
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
