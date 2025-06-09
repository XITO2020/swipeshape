import Stripe from "stripe";
import { getProgram } from './supabase';

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

/**
 * Crée une session de paiement Stripe pour l'achat d'un programme
 * @param userEmail Email de l'utilisateur qui effectue l'achat
 * @param programId ID du programme à acheter
 * @returns URL de la session de paiement Stripe
 */
export async function createCheckoutSession(userEmail: string, programId: number) {
  // 1. Récupérer les détails du programme depuis Supabase
  const { data: program, error } = await getProgram(programId);
  
  if (error || !program) {
    console.error('Erreur lors de la récupération du programme:', error);
    throw new Error('Programme non trouvé');
  }

  // Vérifier que le programme a un prix valide
  if (!program.price || program.price <= 0) {
    throw new Error('Le programme n\'a pas de prix valide');
  }

  // 2. Créer une session Stripe avec les informations du programme
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { 
            name: program.name,
            description: program.description?.substring(0, 500) || undefined,
            images: program.image_url ? [program.image_url] : undefined
          },
          unit_amount: Math.round(program.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      programId: programId.toString(),
      userEmail: userEmail
    },
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/programs/${programId}`,
  });

  return session.url;
}

/**
 * Récupère les détails d'une session Stripe
 * @param sessionId ID de la session Stripe
 * @returns Détails de la session
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}
