// src/pages/api/newsletter.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sendWelcomeEmail } from "@/utils/emails/sendWelcomeEmail";
import { EMAIL_LIST } from "@/constants";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email requis" });
  }
  
  // Use provided name or default to "Abonné"
  const userName = name || "Abonné";

  try {
    // Par défaut, on envoie un email de bienvenue avec le nom d'utilisateur
    await sendWelcomeEmail(email, userName);

    // Ajouter à la liste EMAIL_LIST.NEWSLETTER (si vous utilisez une liste locale ou API externe)
    console.log(`Email ${email} added to ${EMAIL_LIST.NEWSLETTER} list`);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
