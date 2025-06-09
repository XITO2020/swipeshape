import formData from 'form-data';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/client';
import { generatePDF } from './pdfGenerator';

// Initialiser Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || ''
});

export async function sendProgramPurchaseEmail(
  email: string, 
  programName: string, 
  downloadUrl: string
): Promise<boolean> {
  try {
    console.log(`Envoi d'email d'achat à ${email} pour le programme: ${programName}`);

    // Génération du PDF si le module existe
    let pdfBuffer;
    try {
      // Génération du reçu PDF
      pdfBuffer = await generatePDF({
        programName,
        purchaseDate: new Date().toLocaleDateString('fr-FR'),
        downloadLink: downloadUrl,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
      });
      console.log('PDF généré avec succès');
    } catch (pdfError) {
      console.error('Erreur lors de la génération du PDF:', pdfError);
      // Continuons sans PDF en cas d'erreur
    }
    
    // Contenu HTML de l'email d'achat
    const purchaseEmailContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; }
          .important { color: #e74c3c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Merci pour votre achat!</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Merci d'avoir acheté le programme <strong>${programName}</strong>.</p>
            <p>Vous pouvez télécharger votre programme en cliquant sur le bouton ci-dessous:</p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${downloadUrl}" class="button">Télécharger votre programme</a>
            </p>
            <p class="important">Important: Ce lien est valable pendant 7 jours et pour un nombre limité de téléchargements.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SwipeShape, Tous droits réservés.</p>
            <p>Pour toute question concernant votre achat, contactez-nous à <a href="mailto:support@swipeshape.com">support@swipeshape.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Préparer les données de l'email
    const emailData: any = {
      from: `SwipeShape <purchase@${process.env.MAILGUN_DOMAIN || 'example.com'}>`,
      to: email,
      subject: `Votre achat: ${programName}`,
      html: purchaseEmailContent
    };

    // Ajouter la pièce jointe PDF si disponible
    if (pdfBuffer) {
      emailData.attachment = {
        data: pdfBuffer,
        filename: `recu-${programName.toLowerCase().replace(/\s+/g, '-')}.pdf`
      };
    }

    // Envoyer l'email via Mailgun
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN || '', emailData);
    
    console.log('Email d\'achat envoyé avec succès:', result);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email d\'achat:', error);
    return false;
  }
}
