// src/app/api/newsletter/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "../../../services/email.service";
import { addSubscriber } from "../../../services/newsletter.service";
import { withApiMiddleware, handleApiError } from "../../../lib/api-middleware-app";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: "Email requis" }, 
        { status: 400 }
      );
    }
    
    // Use provided name or default to "Abonné"
    const userName = name || "Abonné";

    // Ajouter l'abonné à la base de données via notre service
    const subscriberAdded = await addSubscriber(email, userName);
    if (!subscriberAdded) {
      console.error(`Échec de l'ajout de l'email ${email} à la liste des abonnés`);
      return handleApiError("Erreur lors de l'abonnement", 500);
    }

    // Envoyer un email de confirmation d'abonnement
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const emailSent = await sendEmail({
      to: { email, name: userName },
      subject: 'Confirmation d\'abonnement à notre newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Merci de votre abonnement!</h1>
          <p>Bonjour ${userName},</p>
          <p>Vous êtes maintenant inscrit(e) à notre newsletter. Vous recevrez régulièrement nos actualités et offres exclusives.</p>
          <p>Vous pouvez vous désabonner à tout moment en cliquant sur le lien de désabonnement présent en bas de nos emails.</p>
          <p>À bientôt!</p>
          <hr>
          <p style="font-size: 12px; color: #777;">
            Pour vous désabonner, <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}">cliquez ici</a>
          </p>
        </div>
      `
    });
    
    if (!emailSent) {
      console.warn(`L'email de confirmation n'a pas pu être envoyé à ${email}. Vérifiez votre configuration SMTP.`);
    }

    return withApiMiddleware(
      NextResponse.json({ success: true })
    );
  } catch (error: any) {
    console.error(error);
    return handleApiError(error.message, 500);
  }
}

// Gestion des requêtes OPTIONS (CORS)
export async function OPTIONS() {
  return withApiMiddleware(NextResponse.json({}, { status: 200 }));
}

// Gestion des méthodes non supportées
export async function GET() {
  return withApiMiddleware(NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }));
}

export async function PUT() {
  return withApiMiddleware(NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }));
}

export async function DELETE() {
  return withApiMiddleware(NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }));
}

export async function PATCH() {
  return withApiMiddleware(NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }));
}
