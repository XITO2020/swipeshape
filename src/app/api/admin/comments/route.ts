import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { withAdminAuthApp } from "../../../../lib/admin-middleware-app";

/**
 * Gestion des requêtes GET pour obtenir des commentaires (tous ou un seul)
 */
export const GET = withAdminAuthApp(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");
    const articleId = searchParams.get("articleId");
    
    if (commentId) {
      // Get single comment
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { user: { select: { name: true, email: true } } }
      });
      
      if (!comment) {
        return NextResponse.json({ error: "Commentaire non trouvé" }, { status: 404 });
      }
      
      return NextResponse.json(comment);
    } else {
      // Get all comments with filters
      const whereClause = articleId ? { articleId } : {};
      
      const comments = await prisma.comment.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
      });
      
      return NextResponse.json(comments);
    }
  } catch (error: any) {
    console.error("Error in admin/comments API (GET):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes PUT pour mettre à jour un commentaire
 */
export const PUT = withAdminAuthApp(async (request: Request) => {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "ID du commentaire requis" }, { status: 400 });
    }
    
    // Update comment (e.g., for moderation)
    const updatedComment = await prisma.comment.update({
      where: { id: body.id },
      data: {
        approved: body.approved,
        content: body.content
      },
    });
    
    return NextResponse.json(updatedComment);
  } catch (error: any) {
    console.error("Error in admin/comments API (PUT):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes DELETE pour supprimer un commentaire
 */
export const DELETE = withAdminAuthApp(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");
    
    if (!commentId) {
      return NextResponse.json({ error: "ID du commentaire requis" }, { status: 400 });
    }
    
    // Delete comment
    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });
    
    return NextResponse.json({ success: true, comment: deletedComment });
  } catch (error: any) {
    console.error("Error in admin/comments API (DELETE):", error);
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
export const POST = withAdminAuthApp(async () => {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
});

export const PATCH = withAdminAuthApp(async () => {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
});
