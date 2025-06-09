import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Middleware to verify admin access - extract as utility function
export const verifyAdminToken = (req: NextApiRequest): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies.token;
    
    if (!token) {
      reject("Non authentifié");
      return;
    }
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
      
      // Check if user is admin
      if (decoded.role !== "ADMIN") {
        reject("Non autorisé - Accès administrateur requis");
        return;
      }
      
      resolve(decoded.userId);
    } catch (error) {
      reject("Token invalide ou expiré");
    }
  });
};

// Middleware wrapper for API handlers
export const withAdminAuth = (
  handler: (req: NextApiRequest, res: NextApiResponse, adminId: string) => Promise<void | NextApiResponse<any>>
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse<any>> => {
    try {
      const adminId = await verifyAdminToken(req);
      return handler(req, res, adminId);
    } catch (error: any) {
      if (error === "Non authentifié") {
        return res.status(401).json({ error: "Non authentifié" });
      } else if (error === "Non autorisé - Accès administrateur requis") {
        return res.status(403).json({ error: "Non autorisé - Accès administrateur requis" });
      } else if (error === "Token invalide ou expiré") {
        return res.status(401).json({ error: "Token invalide ou expiré" });
      }
      
      console.error("Error in admin middleware:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  };
};
