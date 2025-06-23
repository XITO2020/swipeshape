// src/app/api/newsletter/unsubscribe/route.ts
import { NextResponse } from "next/server";
import { withApiMiddleware, handleApiError } from "@/lib/api-middleware-app";
import { unsubscribe } from "@/services/newsletter.service";

// Méthode pour désabonner un utilisateur de la newsletter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: "Email requis" }, 
        { status: 400 }
      );
    }
    
    // Désabonner l'email via notre service newsletter
    const success = await unsubscribe(email);
    
    if (!success) {
      return handleApiError("Erreur lors du désabonnement", 500);
    }
    
    // Rediriger vers une page de confirmation ou retourner un succès en JSON
    if (searchParams.get('redirect') === 'true') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe-success`);
    }
    
    return withApiMiddleware(
      NextResponse.json({ success: true, message: "Désabonnement réussi" })
    );
  } catch (error: any) {
    console.error("Erreur lors du désabonnement:", error);
    return handleApiError(error.message, 500);
  }
}
