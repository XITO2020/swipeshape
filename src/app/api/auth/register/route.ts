import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { executeQuery } from '../../../../lib/db'
import { sendWelcomeEmail } from '../../../../services/email.service'
import { corsHeaders } from '../../../../lib/api-middleware-app'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // 1) Insérer l’utilisateur (exemple minimal : à adapter à votre schéma)
    const userId = uuidv4()
    const insertSql = `
      INSERT INTO users (id, email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
    `
    const { error: dbError } = await executeQuery(insertSql, [
      userId, email, password, firstName, lastName,
    ])
    if (dbError) {
      console.error('❌ register SQL error:', dbError)
      return NextResponse.json(
        { error: 'Enregistrement impossible' },
        { status: 500, headers: corsHeaders() }
      )
    }

    // 2) Envoyer l’email de bienvenue (sans bloquer le flow)
    sendWelcomeEmail(email, firstName, lastName).catch(err => {
      console.error('❌ Welcome email error:', err)
    })

    return NextResponse.json(
      { success: true, userId },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('❌ register exception:', err)
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders() })
}

// Bloquer les autres méthodes
export const GET = () =>
  NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: corsHeaders() })
export const PUT = GET
export const DELETE = GET
export const PATCH = GET
