import React, { useRef, useEffect } from 'react';

interface EmailPreviewProps {
  subject: string;
  content: string;
  previewData?: Record<string, string>;
}

/**
 * Composant de prévisualisation d'email
 * Affiche un aperçu en temps réel d'un modèle d'email avec des données de test
 */
const EmailPreview: React.FC<EmailPreviewProps> = ({ subject, content, previewData = {} }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    if (!iframeRef.current) return;
    
    // Remplacer les balises modèles par des données de test
    let processedContent = content;
    
    // Données par défaut pour les balises courantes
    const defaultData = {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://swipeshape.com',
      currentYear: new Date().getFullYear().toString(),
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://swipeshape.com'}/unsubscribe?email=user@example.com`,
      firstName: 'Jean',
      lastName: 'Dupont',
      name: 'Jean Dupont',
      email: 'user@example.com',
      invoiceNumber: 'INV-2023-001',
      invoiceDate: new Date().toLocaleDateString(),
      amount: '99,00€',
      downloadLink: '#',
      resetLink: '#',
      expiryTime: '24 heures'
    };
    
    // Combiner les données par défaut avec les données fournies
    const mergedData = { ...defaultData, ...previewData };
    
    // Remplacer toutes les balises par leurs valeurs
    Object.entries(mergedData).forEach(([key, value]) => {
      processedContent = processedContent.replace(
        new RegExp(`{{${key}}}`, 'g'), 
        value.toString()
      );
    });
    
    // Style de base pour l'email
    const baseStyle = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      </style>
    `;
    
    // Structure complète de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        ${baseStyle}
      </head>
      <body>
        <div style="max-width: 100%; margin: 0 auto;">
          ${processedContent}
        </div>
      </body>
      </html>
    `;
    
    // Mettre à jour le contenu de l'iframe
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(emailHtml);
      iframeDoc.close();
    }
  }, [subject, content, previewData]);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">À: user@example.com</div>
            <div className="font-medium">{subject}</div>
          </div>
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Aperçu
          </div>
        </div>
      </div>
      
      <iframe 
        ref={iframeRef}
        title="Email preview"
        className="w-full bg-white"
        style={{ height: '500px', border: 'none' }}
      />
    </div>
  );
};

export default EmailPreview;
