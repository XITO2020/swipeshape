// src/utils/emails/sendAdminNotification.ts
import createTransport from 'nodemailer';

const transporter = createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true = TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envoie une notification email aux admins à chaque nouvel achat.
 */
export async function sendAdminNotification(
  adminEmails: string[],
  buyerEmail: string,
  programName: string
): Promise<void> {
  const fromDomain = process.env.SMTP_FROM_DOMAIN || process.env.SMTP_HOST;

  await transporter.sendMail({
    from:    `Swipeshape <no-reply@${fromDomain}>`,
    to:      adminEmails.join(','),
    subject: `Nouveau programme acheté : ${programName}`,
    text:    `Un nouvel achat a été effectué par ${buyerEmail} pour le programme "${programName}".`,
    html:    `<p>Un nouvel achat a été effectué par <strong>${buyerEmail}</strong> pour le programme "<em>${programName}</em>".</p>`,
  });
}
