import { sendEmail } from './brevo';

/**
 * Envoie un email de bienvenue lors de l'inscription à la newsletter
 * 
 * @param toEmail - Email de l'utilisateur
 * @param userName - Nom de l'utilisateur (optionnel)
 */
export async function sendWelcomeEmail(toEmail: string, userName: string = '') {
  // On utilise le prénom tiré de l'email si userName n'est pas fourni
  const name = userName || toEmail.split('@')[0];

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue chez SwipeShape!</h1>
          </div>
          <div class="content">
            <p>Bonjour ${name},</p>
            <p>Merci pour votre inscription à notre newsletter.</p>
            <p>Vous recevrez nos dernières actualités et offres exclusives.</p>
            <p>À très vite !</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SwipeShape, Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
    Bienvenue chez SwipeShape!
    
    Bonjour ${name},
    
    Merci pour votre inscription à notre newsletter.
    Vous recevrez nos dernières actualités et offres exclusives.
    
    À très vite !
    
    © ${new Date().getFullYear()} SwipeShape, Tous droits réservés.
  `;

  return sendEmail(
    toEmail,
    "Bienvenue dans la newsletter SwipeShape !",
    htmlContent,
    textContent,
    'SwipeShape',
    process.env.BREVO_FROM_EMAIL || 'newsletter@swipeshape.com'
  );
}
