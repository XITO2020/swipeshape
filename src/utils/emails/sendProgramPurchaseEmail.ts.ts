import nodemailer from "nodemailer";

// Envoi d'un e-mail avec un lien de téléchargement sécurisé via SMTP/Nodemailer
export async function sendProgramPurchaseEmail(
  toEmail: string,
  programName: string,
  downloadUrl: string
) {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;
  const secure = process.env.EMAIL_SECURE === 'true';

  if (!host || !port || !user || !pass || !from) {
    throw new Error('Configuration SMTP manquante. Vérifiez vos variables d\'environnement.');
  }

  // Création du transporter SMTP
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  // Contenu de l'e-mail
  const subject = `Votre programme PDF \"${programName}\" est prêt !`;
  const text = `Bonjour,\n\nMerci pour votre achat.\n\n` +
    `Vous pouvez télécharger votre programme en cliquant sur ce lien sécurisé ` +
    `(valable 7 jours et 2 téléchargements max) :\n${downloadUrl}\n\nBonne lecture !\n\nL'équipe Swipeshape`;
  const html = `
    <p>Bonjour,</p>
    <p>Merci pour votre achat.</p>
    <p>Vous pouvez télécharger votre programme en cliquant sur ce lien sécurisé ` +
    `<strong>(valable 7 jours et 2 téléchargements max)</strong> :</p>
    <p><a href=\"${downloadUrl}\">Télécharger mon programme</a></p>
    <p>Bonne lecture !</p>
    <p>L'équipe Swipeshape</p>
  `;

  // Envoi
  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html,
  });

  return info;
}
