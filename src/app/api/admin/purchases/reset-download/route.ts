import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware-app'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'
import { sendEmail } from '@/lib/emailClient'

const resetSchema = z.object({
  purchaseId: z.string().uuid()
})

export const POST = withAdmin(async (req: NextRequest) => {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const parsed = resetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 422, headers: corsHeaders() }
    )
  }
  const { purchaseId } = parsed.data

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

  try {
    const to          = purchase.user[0]?.email!
    const programName = purchase.program[0]?.name!
    const subject     = `Lien de téléchargement réinitialisé - SwipeShape`
    const htmlContent = `
      <p>Bonjour,</p>
      <p>Votre lien de téléchargement pour <strong>${programName}</strong> a été réinitialisé.</p>
      <p>Rendez-vous sur votre espace client pour télécharger à nouveau.</p>
      <p>&copy; ${new Date().getFullYear()} SwipeShape</p>
    `
    const textContent = `
Bonjour,
Votre lien de téléchargement pour ${programName} a été réinitialisé.
Rendez-vous sur votre espace client pour télécharger à nouveau.
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
      { success: true, message: `Lien renvoyé à ${to}` },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('Erreur reset-download:', err)
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email", details: err.message },
      { status: 500, headers: corsHeaders() }
    )
  }
})
