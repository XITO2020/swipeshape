import PDFDocument from 'pdfkit';

interface PdfData {
  programName: string;
  purchaseDate: string;
  downloadLink: string;
  expiryDate: string;
}

export async function generatePDF(data: PdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Créer un nouveau document PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Reçu - ${data.programName}`,
          Author: 'SwipeShape',
        }
      });

      // Préparer le buffer pour stocker le PDF
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // En-tête du document avec logo (si disponible)
      try {
        doc.image('public/logo.png', {
          fit: [150, 150],
          align: 'center',
        });
      } catch (e) {
        // Continuer sans logo si l'image n'est pas disponible
        console.warn('Logo non trouvé, continuons sans image');
        doc.fontSize(24).text('SwipeShape', { align: 'center' });
      }
      
      // Titre
      doc.moveDown(2)
        .fontSize(20)
        .text('Reçu d\'achat', { align: 'center' });
      
      // Date d'émission
      doc.moveDown(1)
        .fontSize(12)
        .text(`Date: ${data.purchaseDate}`, { align: 'right' });
      
      // Informations sur l'achat
      doc.moveDown(2)
        .fontSize(16)
        .text('Détails de l\'achat');
      
      doc.moveDown(1)
        .fontSize(14)
        .text(`Programme: ${data.programName}`);
      
      // Informations sur le téléchargement
      doc.moveDown(2)
        .fontSize(16)
        .text('Informations de téléchargement');
      
      doc.moveDown(1)
        .fontSize(12)
        .text(`Lien de téléchargement: ${data.downloadLink}`);
      
      doc.moveDown(0.5)
        .fontSize(12)
        .text(`Date d'expiration du lien: ${data.expiryDate}`);
      
      // Note importante
      doc.moveDown(2)
        .fontSize(12)
        .fillColor('red')
        .text('Important: Ce lien est valable pendant 7 jours et pour un nombre limité de téléchargements.', 
          { align: 'center' });
      
      // Pied de page
      doc.moveDown(4)
        .fontSize(10)
        .fillColor('black')
        .text(`© ${new Date().getFullYear()} SwipeShape, Tous droits réservés.`, 
          { align: 'center' });
      
      doc.moveDown(0.5)
        .fontSize(10)
        .text('Pour toute question concernant votre achat, contactez-nous à support@swipeshape.com', 
          { align: 'center' });
      
      // Finaliser le document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
