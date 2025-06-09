import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { executeQuery } from '../db';
import { sendProgramPurchaseEmail } from '../../../lib/sendProgramPurchaseEmail';
import { nanoid } from 'nanoid';

// Configurer Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Configurer l'API pour recevoir des données brutes
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // 1. Récupérer le corps de la requête brute
    const rawBody = await buffer(req);
    
    // 2. Récupérer la signature Stripe dans les en-têtes
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    
    // 3. Vérifier la signature
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Erreur de signature: ${err.message}`);
      return res.status(400).json({ error: `Erreur de signature: ${err.message}` });
    }

    // 4. Traiter uniquement les paiements réussis
    if (event.type === 'checkout.session.completed') {
      // Récupérer les détails de la session de paiement
      const session = event.data.object as Stripe.Checkout.Session;
      
      await handleSuccessfulPayment(session);
    }

    // 5. Confirmer la réception du webhook
    return res.status(200).json({ received: true });
    
  } catch (error: any) {
    console.error('Erreur webhook Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Traite un paiement réussi
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    // 1. Récupérer les métadonnées de la session
    const programId = session.metadata?.programId;
    const userEmail = session.customer_email || session.metadata?.userEmail;
    
    if (!programId || !userEmail) {
      throw new Error('Métadonnées de session incomplètes');
    }

    // 2. Récupérer les informations du programme
    const { data: program, error: programError } = await executeQuery(
      'SELECT * FROM programs WHERE id = $1',
      [programId]
    );

    if (programError || !program || program.length === 0) {
      throw new Error(`Programme ${programId} introuvable`);
    }

    // 3. Générer un token de téléchargement unique
    const downloadToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire après 7 jours
    
    // 4. Enregistrer l'achat dans la base de données
    const { data: purchase, error: purchaseError } = await executeQuery(
      `INSERT INTO purchases 
       (user_email, program_id, payment_status, payment_intent_id, download_token, expires_at, download_count) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [
        userEmail, 
        programId, 
        'completed', 
        session.payment_intent as string, 
        downloadToken, 
        expiresAt.toISOString(),
        0 // Nombre initial de téléchargements
      ]
    );

    if (purchaseError) {
      throw new Error(`Erreur lors de l'enregistrement de l'achat: ${purchaseError}`);
    }

    // 5. Construire l'URL de téléchargement
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/download/${downloadToken}`;

    // 6. Envoyer l'email avec le PDF
    await sendProgramPurchaseEmail(
      userEmail,
      program[0].name,
      downloadUrl
    );

    console.log(`Achat traité avec succès pour ${userEmail}, programme ${programId}`);
    
  } catch (error) {
    console.error('Erreur lors du traitement du paiement réussi:', error);
    throw error;
  }
}
