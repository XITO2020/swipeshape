import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies, headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

// Fonction pour vérifier le token d'administration
export const verifyAdminToken = (request: Request): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Récupérer le token depuis l'en-tête Authorization ou les cookies
      const authHeader = headers().get('authorization');
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : cookies().get('token')?.value;
      
      if (!token) {
        reject("Non authentifié");
        return;
      }
      
      // Vérifier le token JWT
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
        
        // Vérifier si l'utilisateur est administrateur
        if (decoded.role !== "ADMIN") {
          reject("Non autorisé - Accès administrateur requis");
          return;
        }
        
        resolve(decoded.userId);
      } catch (error) {
        reject("Token invalide ou expiré");
      }
    } catch (error) {
      reject("Erreur lors de la lecture des entêtes");
    }
  });
};

// Middleware d'authentification admin pour App Router
export async function withAdminAuthApp(
  request: Request,
  handler: (request: Request, adminId: string) => Promise<Response>
): Promise<Response> {
  try {
    const adminId = await verifyAdminToken(request);
    return handler(request, adminId);
  } catch (error: any) {
    if (error === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    } else if (error === "Non autorisé - Accès administrateur requis") {
      return NextResponse.json({ error: "Non autorisé - Accès administrateur requis" }, { status: 403 });
    } else if (error === "Token invalide ou expiré") {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 401 });
    }
    
    console.error("Error in admin middleware:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
