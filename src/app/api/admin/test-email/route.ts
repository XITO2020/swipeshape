import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-app';
import { EmailOptions } from '@/services/email.service';
import { sendEmail } from '@/services/email.service';

/**
 * Envoyer un email de test pour valider la configuration SMTP
 */
export async function POST(request: NextRequest) {
  // Vérifier que l'utilisateur est admin
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }
    
    // Contenu de l'email de test
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
              <h1>Test de configuration email</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p>Ceci est un email de test envoyé depuis l'interface d'administration de SwipeShape.</p>
              <p>Si vous recevez cet email, la configuration SMTP est correcte.</p>
              <p>Informations techniques:</p>
              <ul>
                <li>Date: ${new Date().toLocaleString()}</li>
                <li>Serveur: ${process.env.EMAIL_HOST || 'Non configuré'}</li>
                <li>Port: ${process.env.EMAIL_PORT || 'Non configuré'}</li>
                <li>Utilisateur: ${process.env.EMAIL_USER || 'Non configuré'}</li>
                <li>Sécurité: ${process.env.EMAIL_SECURE === 'true' ? 'TLS/SSL activé' : 'TLS/SSL désactivé'}</li>
              </ul>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SwipeShape, Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const textContent = `
      Test de configuration email
      
      Bonjour,
      
      Ceci est un email de test envoyé depuis l'interface d'administration de SwipeShape.
      Si vous recevez cet email, la configuration SMTP est correcte.
      
      Informations techniques:
      - Date: ${new Date().toLocaleString()}
      - Serveur: ${process.env.EMAIL_HOST || 'Non configuré'}
      - Port: ${process.env.EMAIL_PORT || 'Non configuré'}
      - Utilisateur: ${process.env.EMAIL_USER || 'Non configuré'}
      - Sécurité: ${process.env.EMAIL_SECURE === 'true' ? 'TLS/SSL activé' : 'TLS/SSL désactivé'}
      
      © ${new Date().getFullYear()} SwipeShape, Tous droits réservés.
    `;
    
    // Options de l'email
    const options: EmailOptions = {
      to: { email },
      subject: 'Test de configuration email - SwipeShape',
      html: htmlContent,
      text: textContent,
      from: process.env.EMAIL_FROM || 'no-reply@swipeshape.com'
    };
    
    // Envoi de l'email via notre service Nodemailer
    const success = await sendEmail(options);
    
    if (!success) {
      return NextResponse.json(
        { error: 'L\'email n\'a pas pu être envoyé, vérifiez les logs du serveur' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Email de test envoyé à ${email}`
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de test:', error);
    return NextResponse.json(
      { error: 'Impossible d\'envoyer l\'email de test', details: (error as Error).message },
      { status: 500 }
    );
  }
}
