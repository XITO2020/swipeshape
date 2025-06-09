import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // Get token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  
  // Verify JWT token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    // Get user purchases
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
    
    return res.status(200).json({ 
      purchases: purchases.map((purchase: PurchaseWithProgram) => ({
        id: purchase.id,
        programId: purchase.programId,
        purchaseDate: purchase.createdAt,
        program: purchase.program
      }))
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return res.status(401).json({ error: "Token invalide ou erreur de serveur" });
  }
}
