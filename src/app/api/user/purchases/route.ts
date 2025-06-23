import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { withApiMiddleware, handleApiError } from "@/lib/api-middleware-app";

const JWT_SECRET = process.env.JWT_SECRET!;

type PurchaseWithProgram = {
  id: string;
  programId: string;
  userEmail: string;
  createdAt: Date;
  program: {
    id: string;
    name: string;
    price: number;
    description: string;
  };
};

export async function GET(request: Request) {
  try {
    // Récupérer le token depuis l'en-tête Authorization ou les cookies
    const authHeader = headers().get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : cookies().get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    // Vérifier le token JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      
      // Récupérer les achats de l'utilisateur
      const purchases = await prisma.purchase.findMany({
        where: { 
          userEmail: {
            equals: decoded.userId
          }
        },
        include: {
          program: {
            select: {
              id: true,
              name: true,
              price: true,
              description: true
            }
          }
        }
      });
      
      return withApiMiddleware(NextResponse.json({ 
        purchases: purchases.map((purchase: PurchaseWithProgram) => ({
          id: purchase.id,
          programId: purchase.programId,
          purchaseDate: purchase.createdAt,
          program: purchase.program
        }))
      }));
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return NextResponse.json({ error: "Token invalide ou erreur de serveur" }, { status: 401 });
    }
  } catch (error) {
    return handleApiError("Erreur lors de la récupération des achats", 500);
  }
}

// Gestion des requêtes OPTIONS (CORS)
export async function OPTIONS() {
  return withApiMiddleware(NextResponse.json({}, { status: 200 }));
}

// Gestion des autres méthodes HTTP
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
