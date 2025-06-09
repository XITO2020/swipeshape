import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const mgClient = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: "https://api.mailgun.net",
});

export async function sendProgramPurchaseEmail(
  toEmail: string,
  programName: string,
  downloadUrl: string
) {
  const domain = process.env.MAILGUN_DOMAIN || "";

  const messageData = {
    from: `Swipeshape <no-reply@${domain}>`,
    to: [toEmail],
    subject: `Votre programme PDF "${programName}" est prêt !`,
    text: `Bonjour,\n\nMerci pour votre achat.\n\nVous pouvez télécharger votre programme en cliquant sur ce lien sécurisé (valable 7 jours et 2 téléchargements max):\n${downloadUrl}\n\nBonne lecture !\n\nL'équipe Swipeshape`,
    html: `<p>Bonjour,</p>
           <p>Merci pour votre achat.</p>
           <p>Vous pouvez télécharger votre programme en cliquant sur ce lien sécurisé (valable 7 jours et 2 téléchargements max):</p>
           <p><a href="${downloadUrl}">Télécharger mon programme</a></p>
           <p>Bonne lecture !</p>
           <p>L'équipe Swipeshape</p>`,
  };

  return mgClient.messages.create(domain, messageData);
}
