import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const programs = await prisma.program.findMany({
      select: { id: true, name: true, price: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(programs);
  } catch (error) {
    console.error("Erreur récupération des programmes :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
