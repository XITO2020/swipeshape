import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const mgClient = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: "https://api.mailgun.net",
});

/**
 * Envoie une notification par email aux admins lors d'un nouvel achat
 *
 * @param adminEmails - Liste des emails admins
 * @param buyerEmail - Email de l'acheteur
 * @param programName - Nom du programme acheté
 */
export async function sendAdminNotification(
  adminEmails: string[],
  buyerEmail: string,
  programName: string
) {
  const domain = process.env.MAILGUN_DOMAIN || "";

  const messageData = {
    from: `Swipeshape <no-reply@${domain}>`,
    to: adminEmails,
    subject: `Nouveau programme acheté : ${programName}`,
    text: `Un nouvel achat vient d'être effectué par ${buyerEmail} pour le programme "${programName}".`,
    html: `<p>Un nouvel achat vient d'être effectué par <strong>${buyerEmail}</strong> pour le programme "<em>${programName}</em>".</p>`,
  };

  return mgClient.messages.create(domain, messageData);
}
