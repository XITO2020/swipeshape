import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../db';
import { verifyAuthAdmin } from '../../../../lib/auth';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import PDFDocument from 'pdfkit';

// Initialiser Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || ''
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que l'utilisateur est un administrateur
  try {
    const user = await verifyAuthAdmin(req);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { purchaseId } = req.body;

  if (!purchaseId) {
    return res.status(400).json({ error: 'ID d\'achat manquant' });
  }

  try {
    // Récupérer les détails de l'achat et du programme
    const { data: purchases, error: purchaseError } = await executeQuery(`
      SELECT 
        p.*,
        pr.name as program_name,
        pr.price,
        pr.description,
        pr.category
      FROM purchases p
      LEFT JOIN programs pr ON p.program_id = pr.id
      WHERE p.id = $1
    `, [purchaseId]);

    if (purchaseError || !purchases || purchases.length === 0) {
      console.error('Erreur lors de la récupération de l\'achat:', purchaseError);
      return res.status(404).json({ error: 'Achat introuvable' });
    }

    const purchase = purchases[0];
    const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/download/${purchase.download_token}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://swipeshape.com';

    // Générer le PDF de facture
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Facture - SwipeShape - ${purchase.program_name}`,
        Author: 'SwipeShape',
      }
    });

    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

    // Entête de la facture
    doc.fontSize(25).text('FACTURE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`SwipeShape`, { align: 'left' });
    doc.fontSize(10).text(`contact@swipeshape.com`, { align: 'left' });
    doc.fontSize(10).text(`www.swipeshape.com`, { align: 'left' });
    doc.moveDown();

    // Informations client
    doc.fontSize(10).text(`Client: ${purchase.user_email}`, { align: 'left' });
    doc.fontSize(10).text(`Date: ${new Date(purchase.created_at).toLocaleDateString('fr-FR')}`, { align: 'left' });
    doc.fontSize(10).text(`Facture #: ${purchase.id.slice(0, 8).toUpperCase()}`, { align: 'left' });
    doc.moveDown();

    // Détails de l'achat
    doc.fontSize(12).text('Détails de l\'achat', { underline: true });
    doc.moveDown(0.5);
    
    // Tableau des produits
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidth = (doc.page.width - 100) / 3;
    
    // En-têtes de colonnes
    doc.fontSize(10)
       .text('Programme', tableLeft, tableTop)
       .text('Description', tableLeft + colWidth, tableTop, { width: colWidth })
       .text('Prix', tableLeft + 2 * colWidth, tableTop);
    
    doc.moveTo(tableLeft, tableTop + 15)
       .lineTo(tableLeft + 3 * colWidth, tableTop + 15)
       .stroke();
    
    // Données du tableau
    const rowY = tableTop + 25;
    doc.fontSize(10)
       .text(purchase.program_name, tableLeft, rowY)
       .text(purchase.description?.substring(0, 100) + '...', tableLeft + colWidth, rowY, { width: colWidth })
       .text(`${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(purchase.amount)}`, tableLeft + 2 * colWidth, rowY);
    
    doc.moveDown(2);
    
    // Total
    doc.fontSize(10).text(`Total: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(purchase.amount)}`, { align: 'right' });
    doc.moveDown();
    
    // Lien de téléchargement et instructions
    doc.moveDown();
    doc.fontSize(12).text('Instructions de téléchargement', { underline: true });
    doc.fontSize(10).text('Votre programme est disponible au téléchargement via le lien ci-dessous:');
    
    // Correction pour le typage du lien URL dans PDFKit
    doc.fontSize(10)
       .fillColor('blue')
       .text(downloadUrl, { link: downloadUrl, underline: true })
       .fillColor('black');
       
    doc.fontSize(10).text(`Ce lien est personnel et limité à ${purchase.download_limit} téléchargements.`);
    doc.fontSize(10).text('Pour toute question, contactez-nous à support@swipeshape.com');
    
    // Pied de page
    doc.fontSize(8).text('Merci de votre achat - SwipeShape', 50, doc.page.height - 50, { align: 'center' });
    
    // Finaliser le PDF
    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      let finalBuffer: Buffer;
      doc.on('end', () => {
        finalBuffer = Buffer.concat(chunks);
        resolve(finalBuffer);
      });
    });

    // Construire l'email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #f05a94; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Merci pour votre achat!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Bonjour,</p>
          <p>Merci d'avoir acheté <strong>${purchase.program_name}</strong>.</p>
          <p>Votre facture est jointe à cet email au format PDF.</p>
          <p>Vous pouvez télécharger votre programme via le lien ci-dessous:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="background-color: #f05a94; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Télécharger mon programme</a>
          </div>
          <p style="font-size: 14px; color: #777;">
            Ce lien est personnel et limité à ${purchase.download_limit} téléchargements. Veuillez le conserver précieusement.
          </p>
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
          <p>Cordialement,<br />L'équipe SwipeShape</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          <p>&copy; 2023 SwipeShape. Tous droits réservés.</p>
          <p>
            <a href="${siteUrl}" style="color: #f05a94; text-decoration: none;">www.swipeshape.com</a>
          </p>
        </div>
      </div>
    `;

    // Options pour l'email
    const messageParams = {
      from: `SwipeShape <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: purchase.user_email,
      subject: `Merci pour votre achat - ${purchase.program_name}`,
      html: emailHtml,
      text: emailHtml.replace(/<[^>]*>/g, ''),
      attachment: [{
        data: pdfBuffer,
        filename: `facture-swipeshape-${purchase.id.slice(0, 8)}.pdf`,
        contentType: 'application/pdf'
      }]
    };

    // Envoyer l'email via Mailgun
    await mg.messages.create(process.env.MAILGUN_DOMAIN || '', messageParams);

    return res.status(200).json({
      success: true,
      message: 'Email renvoyé avec succès',
      emailSentTo: purchase.user_email
    });
  } catch (error: any) {
    console.error('Erreur serveur lors du renvoi de l\'email:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors du renvoi de l\'email'
    });
  }
}
