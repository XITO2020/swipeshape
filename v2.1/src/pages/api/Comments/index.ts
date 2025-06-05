// src/pages/api/comments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  if (method === "GET") {
    const articleId = query.articleId as string;
    if (!articleId) {
      return res.status(400).json({ error: "ID d’article requis" });
    }
    const comments = await prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(comments);
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
