
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '../../../../lib/prisma';
import { corsHeaders } from '../../../../lib/api-middleware-app';

const videoSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  featured: z.boolean().optional()
});

function enforceAdmin(req: NextRequest) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId || sessionClaims?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403, headers: corsHeaders() });
  }
  return null;
}

// GET: Liste ou récupération d'une vidéo
export async function GET(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('id');
    if (videoId) {
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (!video) {
        return NextResponse.json({ error: 'Vidéo non trouvée' }, { status: 404, headers: corsHeaders() });
      }
      return NextResponse.json(video, { headers: corsHeaders() });
    }
    const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ videos }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur GET videos:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders() });
  }
}

// POST: Création d'une vidéo
export async function POST(req: NextRequest) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400, headers: corsHeaders() });
  }
  const parse = videoSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 422, headers: corsHeaders() });
  }
  try {
    const data = parse.data;
    const video = await prisma.video.create({ data: {
      title: data.title,
      url: data.url,
      description: data.description,
      featured: data.featured ?? false
    }});
    return NextResponse.json({ video }, { status: 201, headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur POST video:', err);
    return NextResponse.json({ error: 'Impossible de créer la vidéo' }, { status: 500, headers: corsHeaders() });
  }
}

// DELETE: Suppression d'une vidéo
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = enforceAdmin(req);
  if (adminCheck) return adminCheck;
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400, headers: corsHeaders() });
  }
  try {
    await prisma.video.delete({ where: { id } });
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Erreur DELETE video:', err);
    return NextResponse.json({ error: 'Impossible de supprimer la vidéo' }, { status: 500, headers: corsHeaders() });
  }
}