import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware-app'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'
import { sendEmail } from '@/lib/emailClient'

const resendSchema = z.object({
  purchaseId: z.string().uuid()
})

export const POST = withAdmin(async (req: NextRequest) => {
  // 1️⃣ Lecture du body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  // 2️⃣ Validation Zod
  const parsed = resendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }
  const { purchaseId } = parsed.data

  // 3️⃣ Récupération de l’achat
  const { data: purchase, error: fetchError } = await supabaseAdmin
    .from('purchases')
    .select(`
      id,
      userId,
      programId,
      createdAt,
      user:userId(email),
      program:programId(name)
    `)
    .eq('id', purchaseId)
    .maybeSingle()

  if (fetchError || !purchase) {
    return NextResponse.json(
      { error: "Achat introuvable ou erreur BDD" },
      { status: 404, headers: corsHeaders() }
    )
  }

  // 4️⃣ Envoi de l’email
  try {
    const to          = purchase.user[0]?.email!
    const programName = purchase.program[0]?.name!
    const subject     = `Confirmation de votre achat SwipeShape`
    const htmlContent = `
      <p>Bonjour,</p>
      <p>Merci pour votre achat du programme <strong>${programName}</strong> !</p>
      <p>Vous pouvez accéder à votre contenu via votre tableau de bord.</p>
      <p>&copy; ${new Date().getFullYear()} SwipeShape</p>
    `
    const textContent = `
Bonjour,
Merci pour votre achat du programme ${programName} !
Vous pouvez accéder à votre contenu via votre tableau de bord.
© ${new Date().getFullYear()} SwipeShape
    `.trim()

    await sendEmail(
      to,
      subject,
      htmlContent,
      textContent,
      'SwipeShape',
      process.env.EMAIL_FROM || 'no-reply@swipeshape.com'
    )

    return NextResponse.json(
      { success: true, message: `Email renvoyé à ${to}` },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('Erreur envoi resend-email:', err)
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email", details: err.message },
      { status: 500, headers: corsHeaders() }
    )
  }
})
