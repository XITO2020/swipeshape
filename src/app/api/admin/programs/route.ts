
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '../../../../lib/prisma';
import { corsHeaders } from '../../../../lib/api-middleware-app';

// Schéma Zod pour validation des programmes
const programSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  image_url: z.string().url().optional(),
  category: z.string().optional(),
  price: z.number().nonnegative(),
  duration_weeks: z.number().int().positive().optional(),
  level: z.string().optional(),
  featured: z.boolean().optional()
});

// Vérification du rôle admin
function enforceAdmin(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId || sessionClaims?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403, headers: corsHeaders() }
    );
  }
  return null;
}

// GET: liste des programmes
export async function GET(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const programs = await prisma.program.findMany({ orderBy: { created_at: 'desc' } });
    return NextResponse.json({ programs }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur GET programs:', err);
    return NextResponse.json(
      { error: 'Impossible de récupérer les programmes' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST: création d'un programme
export async function POST(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const parse = programSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.format() },
      { status: 422, headers: corsHeaders() }
    );
  }

  try {
    const data = parse.data;
    const program = await prisma.program.create({ data: {
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      category: data.category,
      price: data.price,
      duration_weeks: data.duration_weeks,
      level: data.level,
      featured: data.featured ?? false
    }});
    return NextResponse.json({ program }, { status: 201, headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur POST program:', err);
    return NextResponse.json(
      { error: 'Impossible de créer le programme' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// PUT: mise à jour d'un programme
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: 'ID du programme requis' },
      { status: 400, headers: corsHeaders() }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Requête JSON invalide' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const parse = programSchema.partial().safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.format() },
      { status: 422, headers: corsHeaders() }
    );
  }

  try {
    const program = await prisma.program.update({
      where: { id },
      data: parse.data as any
    });
    return NextResponse.json({ program }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur PUT program:', err);
    return NextResponse.json(
      { error: 'Impossible de mettre à jour le programme' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// DELETE: suppression d'un programme
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: 'ID du programme requis' },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur DELETE program:', err);
    return NextResponse.json(
      { error: 'Impossible de supprimer le programme' },
      { status: 500, headers: corsHeaders() }
    );
  }
}