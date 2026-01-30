// src/app/api/admin/test-email/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware-app'
import { sendEmail } from '@/lib/emailClient'
import { corsHeaders } from '@/lib/api-middleware-app'

/**
 * POST /api/admin/test-email
 * Envoie un email de test pour valider la configuration SMTP
 */
export const POST = withAdmin(async (req: NextRequest) => {
  // 1️⃣ Récupération et validation de l'email envoyé
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const { email } = typeof body === 'object' && body !== null
    ? (body as any)
    : {}
  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Adresse email invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  // 2️⃣ Construction du contenu HTML et texte
  const now = new Date().toLocaleString('fr-FR')
  const smtpHost  = process.env.EMAIL_HOST  ?? 'Non configuré'
  const smtpPort  = process.env.EMAIL_PORT  ?? 'Non configuré'
  const smtpUser  = process.env.EMAIL_USER  ?? 'Non configuré'
  const smtpSecure= process.env.EMAIL_SECURE === 'true'
    ? 'TLS/SSL activé'
    : 'TLS/SSL désactivé'

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f8f9fa; padding: 10px; text-align: center; font-size:12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Test de configuration email</h1></div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Ceci est un email de test envoyé depuis l'interface d'administration de SwipeShape.</p>
            <ul>
              <li>Date : ${now}</li>
              <li>Serveur : ${smtpHost}</li>
              <li>Port : ${smtpPort}</li>
              <li>Utilisateur : ${smtpUser}</li>
              <li>Sécurité : ${smtpSecure}</li>
            </ul>
          </div>
          <div class="footer">&copy; ${new Date().getFullYear()} SwipeShape</div>
        </div>
      </body>
    </html>
  `

  const textContent = `
Test de configuration email

Bonjour,

Ceci est un email de test envoyé depuis l'interface d'administration de SwipeShape.

Informations techniques :
- Date : ${now}
- Serveur : ${smtpHost}
- Port : ${smtpPort}
- Utilisateur : ${smtpUser}
- Sécurité : ${smtpSecure}

© ${new Date().getFullYear()} SwipeShape
  `

  // 3️⃣ Envoi via votre emailClient
  const success = await sendEmail(
    email,
    'Test de configuration email - SwipeShape',
    htmlContent,
    textContent
  )

  if (!success) {
    return NextResponse.json(
      { error: "L'email n'a pas pu être envoyé, vérifiez la configuration SMTP" },
      { status: 500, headers: corsHeaders() }
    )
  }

  // 4️⃣ Réponse
  return NextResponse.json(
    {
      success: true,
      message: `Email de test envoyé à ${email}`
    },
    { status: 200, headers: corsHeaders() }
  )
})

/**
 * OPTIONS preflight pour CORS
 * Gardez-le public (pas besoin d'admin)
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders() })
}
