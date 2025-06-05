import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const mgClient = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: "https://api.mailgun.net",
});

/**
 * Envoie un email de bienvenue lors de l'inscription à la newsletter
 *
 * @param toEmail - Email de l'utilisateur
 * @param userName - Nom de l'utilisateur
 */
export async function sendWelcomeEmail(toEmail: string, userName: string) {
  const domain = process.env.MAILGUN_DOMAIN || "";

  const messageData = {
    from: `Swipeshape <no-reply@${domain}>`,
    to: [toEmail],
    subject: "Bienvenue dans la newsletter Swipeshape !",
    text: `Bonjour ${userName},\n\nMerci pour votre inscription à notre newsletter.\n\nÀ très vite !\n\nL'équipe Swipeshape`,
    html: `<p>Bonjour ${userName},</p>
           <p>Merci pour votre inscription à notre newsletter.</p>
           <p>À très vite !</p>
           <p>L'équipe Swipeshape</p>`,
  };

  return mgClient.messages.create(domain, messageData);
}
