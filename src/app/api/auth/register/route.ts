// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../../../../lib/db';
import { sendEmail, EmailOptions } from '../../../../services/email.service';
import { corsHeaders } from '../../../../lib/api-middleware-app';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let payload;
  try {
    payload = registerSchema.parse(await req.json());
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Données invalides', details: err.errors || err.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  const userId = uuidv4();
  const { email, password, firstName, lastName } = payload;

  // 1) Créer l'utilisateur
  const { data, error } = await executeQuery(
    `INSERT INTO users (id, email, hashed_password, first_name, last_name)
     VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5)
     RETURNING id`,
    [userId, email, password, firstName || null, lastName || null]
  );
  if (error || !data?.length) {
    console.error('Erreur création utilisateur:', error);
    return NextResponse.json(
      { error: 'Impossible de créer l’utilisateur' },
      { status: 500, headers: corsHeaders() }
    );
  }

  // 2) Envoyer l'email de bienvenue
  const opts: EmailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@swipeshape.com',
    to: email,
    subject: 'Bienvenue sur SwipeShape !',
    text: `Bonjour ${firstName || 'Utilisateur'}, merci de vous être inscrit·e sur SwipeShape !`,
    html: `<p>Bonjour <strong>${firstName || 'Utilisateur'}</strong>,</p>
           <p>Merci de vous être inscrit·e sur <em>SwipeShape</em> !</p>`,
  };
  await sendEmail(opts);

  return NextResponse.json(
    { success: true, userId: data[0].id },
    { status: 201, headers: corsHeaders() }
  );
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders() });
}
