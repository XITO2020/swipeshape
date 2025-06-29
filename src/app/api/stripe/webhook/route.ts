import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../../lib/supabase';
import { nanoid } from 'nanoid';
import { sendEmail } from '../../../../utils/emails/emailUtils';

// Configurer Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Les webhooks nécessitent des données brutes
export async function POST(request: Request) {
  try {
    // 1. Récupérer le corps de la requête brute
    const rawBody = await request.text();
    
    // 2. Récupérer la signature Stripe dans les en-têtes
    const sig = request.headers.get('stripe-signature') as string;

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
      return NextResponse.json({ error: `Erreur de signature: ${err.message}` }, { status: 400 });
    }

    // 4. Traiter uniquement les paiements réussis
    if (event.type === 'checkout.session.completed') {
      // Récupérer les détails de la session de paiement
      const session = event.data.object as Stripe.Checkout.Session;
      
      await handleSuccessfulPayment(session);
    }

    // 5. Confirmer la réception du webhook
    return NextResponse.json({ received: true });
    
  } catch (error: any) {
    console.error('Erreur webhook Stripe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single();
    
    if (programError || !program) {
      throw new Error(`Programme ${programId} introuvable: ${programError?.message || 'Erreur inconnue'}`);
    }

    // 3. Générer un token de téléchargement unique
    const downloadToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire après 7 jours
    
    // 4. Enregistrer l'achat dans la base de données
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_email: userEmail,
        program_id: programId,
        payment_status: 'completed',
        payment_intent_id: session.payment_intent as string,
        download_token: downloadToken,
        expires_at: expiresAt.toISOString(),
        download_count: 0
      })
      .select('id')
      .single();
      
    if (purchaseError) {
      throw new Error(`Erreur lors de l'enregistrement de l'achat: ${purchaseError.message}`);
    }

    // 5. Récupérer l'utilisateur par email
    const { data: user } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('email', userEmail)
      .single();

    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : userEmail.split('@')[0];
    
    // 6. Construire l'URL de téléchargement
    const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/download/${downloadToken}`;
    
    // 7. Envoyer un email de confirmation avec les détails de l'achat
    const htmlContent = `
      <h1>Votre programme SwipeShape</h1>
      <p>Bonjour ${userName},</p>
      <p>Merci pour votre achat du programme <strong>${program.name}</strong>.</p>
      <p>${program.description || ''}</p>
      <p>Vous pouvez télécharger votre programme en cliquant sur ce lien:</p>
      <p><a href="${downloadUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Télécharger votre programme</a></p>
      <p>Ce lien expirera dans 7 jours, assurez-vous de télécharger votre programme avant.</p>
      <p>Cordialement,<br>L'équipe SwipeShape</p>
    `;
    
    const textContent = `
      Votre programme SwipeShape
      
      Bonjour ${userName},
      
      Merci pour votre achat du programme ${program.name}.
      
      Vous pouvez télécharger votre programme en visitant ce lien:
      ${downloadUrl}
      
      Ce lien expirera dans 7 jours, assurez-vous de télécharger votre programme avant.
      
      Cordialement,
      L'équipe SwipeShape
    `;
    
    await sendEmail(
      userEmail,
      `Votre programme: ${program.name}`,
      htmlContent,
      textContent,
      'SwipeShape',
      process.env.EMAIL_FROM || 'no-reply@swipeshape.com',
      { 
        userName: userName,
        programName: program.name,
        downloadUrl: downloadUrl
      }
    );

    console.log(`Achat traité avec succès pour ${userEmail}, programme ${programId}`);
    
  } catch (error) {
    console.error('Erreur lors du traitement du paiement réussi:', error);
    throw error;
  }
}
