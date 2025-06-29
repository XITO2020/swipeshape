// src/app/api/newsletter/send/route.ts
import { NextResponse } from "next/server";
import { sendNewsletter } from "../../../../services/email.service";
import { withApiMiddleware, handleApiError } from "../../../../lib/api-middleware-app";
import { requireAuthApp } from "../../../../lib/auth-app";
import { getSubscribersFromDatabase } from "../../../../services/newsletter.service";

// Méthode pour envoyer une newsletter immédiatement
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification et les permissions admin
    const user = await requireAuthApp(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { subject, content } = body;
    
    if (!subject || !content) {
      return NextResponse.json(
        { error: "Sujet et contenu requis" }, 
        { status: 400 }
      );
    }
    
    // Récupération des abonnés actifs
    const subscribers = await getSubscribersFromDatabase();
    
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: "Aucun abonné actif trouvé" }, 
        { status: 404 }
      );
    }
    
    // Format des destinataires pour Nodemailer
    const recipients = subscribers.map(sub => ({
      email: sub.email,
      name: sub.name || undefined
    }));
    
    // Génération d'une version texte à partir du HTML (simplifié)
    const textContent = content.replace(/<[^>]*>?/gm, '');
    
    // Envoi de la newsletter via notre service Nodemailer
    const emailSent = await sendNewsletter(
      recipients,
      subject,
      content,
      textContent
    );
    
    if (!emailSent) {
      return NextResponse.json(
        { error: "Échec de l'envoi de la newsletter. Vérifiez votre configuration SMTP." }, 
        { status: 500 }
      );
    }
    
    return withApiMiddleware(
      NextResponse.json({ 
        success: true, 
        recipientCount: recipients.length 
      })
    );
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la newsletter:", error);
    return handleApiError(error.message, 500);
  }
}
