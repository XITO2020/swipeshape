// src/app/api/newsletter/schedule/route.ts
import { NextResponse } from "next/server";
import { withApiMiddleware, handleApiError } from "@/lib/api-middleware-app";
import { verifyAuthTokenApp } from "@/lib/auth-app";
import { executeQuery } from "@/lib/db";

// Méthode pour programmer l'envoi d'une newsletter
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification et les permissions admin
    const tokenData = await verifyAuthTokenApp();
    
    if (!tokenData) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    if (!tokenData.isAdmin) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { subject, content, scheduledAt } = body;
    
    if (!subject || !content || !scheduledAt) {
      return NextResponse.json(
        { error: "Sujet, contenu et date de programmation requis" }, 
        { status: 400 }
      );
    }
    
    // Vérifier que la date est dans le futur
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return NextResponse.json(
        { error: "La date programmée doit être dans le futur" }, 
        { status: 400 }
      );
    }
    
    // Enregistrer la newsletter programmée dans la base de données
    const { data, error } = await executeQuery(
      `INSERT INTO scheduled_newsletters 
       (subject, content, scheduled_at, status) 
       VALUES ($1, $2, $3, 'pending') 
       RETURNING id`,
      [subject, content, scheduledAt]
    );
    
    if (error) {
      throw new Error(`Erreur lors de l'enregistrement: ${error.message}`);
    }
    
    return withApiMiddleware(
      NextResponse.json({ 
        success: true, 
        scheduledId: data[0].id,
        scheduledAt: scheduledAt
      })
    );
  } catch (error: any) {
    console.error("Erreur lors de la programmation de la newsletter:", error);
    return handleApiError(error.message, 500);
  }
}
