import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthApp } from "@/lib/admin-middleware-app";

/**
 * Gestion des requêtes GET pour obtenir des vidéos (toutes ou une seule)
 */
export const GET = withAdminAuthApp(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");
    
    if (videoId) {
      // Get single video
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });
      
      if (!video) {
        return NextResponse.json({ error: "Vidéo non trouvée" }, { status: 404 });
      }
      
      return NextResponse.json(video);
    } else {
      // Get all videos
      const videos = await prisma.video.findMany({
        orderBy: { createdAt: "desc" },
      });
      
      return NextResponse.json(videos);
    }
  } catch (error: any) {
    console.error("Error in admin/videos API (GET):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes POST pour créer une nouvelle vidéo
 */
export const POST = withAdminAuthApp(async (request: Request) => {
  try {
    const body = await request.json();
    
    if (!body.title || !body.url) {
      return NextResponse.json({ error: "Titre et URL de la vidéo requis" }, { status: 400 });
    }
    
    // Create new video
    const newVideo = await prisma.video.create({
      data: {
        title: body.title,
        description: body.description || "",
        url: body.url,
        thumbnailUrl: body.thumbnailUrl || "",
        duration: body.duration || 0,
        published: body.published || false,
      },
    });
    
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error: any) {
    console.error("Error in admin/videos API (POST):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes PUT pour mettre à jour une vidéo
 */
export const PUT = withAdminAuthApp(async (request: Request) => {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "ID de la vidéo requis" }, { status: 400 });
    }
    
    // Update video
    const updatedVideo = await prisma.video.update({
      where: { id: body.id },
      data: {
        title: body.title,
        description: body.description,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl,
        duration: body.duration,
        published: body.published,
      },
    });
    
    return NextResponse.json(updatedVideo);
  } catch (error: any) {
    console.error("Error in admin/videos API (PUT):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes DELETE pour supprimer une vidéo
 */
export const DELETE = withAdminAuthApp(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");
    
    if (!videoId) {
      return NextResponse.json({ error: "ID de la vidéo requis" }, { status: 400 });
    }
    
    // Delete video
    const deletedVideo = await prisma.video.delete({
      where: { id: videoId },
    });
    
    return NextResponse.json({ success: true, video: deletedVideo });
  } catch (error: any) {
    console.error("Error in admin/videos API (DELETE):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes OPTIONS pour CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

/**
 * Gestion des autres méthodes HTTP non supportées
 */
export const PATCH = withAdminAuthApp(async () => {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
});
