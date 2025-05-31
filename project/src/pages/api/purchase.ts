import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../lib/prisma";
import { sendProgramPurchaseEmail } from "../../lib/sendProgramPurchaseEmail.ts";
import { nanoid } from "nanoid";
import dayjs from "dayjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const { programId } = req.body;

  try {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) return res.status(404).json({ error: "Programme introuvable" });

    const token = nanoid(32);
    const expiresAt = dayjs().add(7, "days").toDate();

    const purchase = await prisma.purchase.create({
      data: {
        userEmail: session.user.email,
        programId,
        downloadToken: token,
        expiresAt,
        downloadCount: 0,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const downloadUrl = `${baseUrl}/download/${token}`;

    await sendProgramPurchaseEmail(session.user.email, program.name, downloadUrl);

    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error("Erreur achat :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
