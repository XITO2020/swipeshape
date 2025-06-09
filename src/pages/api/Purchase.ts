import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { sendProgramPurchaseEmail } from "../../lib/sendProgramPurchaseEmail.ts";
import { nanoid } from "nanoid";
import dayjs from "dayjs";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
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
  let userEmail;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    // Get user email from decoded token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true }
    });
    
    if (!user?.email) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }
    
    userEmail = user.email;
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }

  const { programId } = req.body;

  try {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) return res.status(404).json({ error: "Programme introuvable" });

    const token = nanoid(32);
    const expiresAt = dayjs().add(7, "days").toDate();

    const purchase = await prisma.purchase.create({
      data: {
        userEmail: userEmail,
        programId,
        downloadToken: token,
        expiresAt,
        downloadCount: 0,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const downloadUrl = `${baseUrl}/download/${token}`;

    await sendProgramPurchaseEmail(userEmail, program.name, downloadUrl);

    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error("Erreur achat :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
