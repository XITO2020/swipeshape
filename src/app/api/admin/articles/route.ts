import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthApp } from "@/lib/admin-middleware-app";
import { withApiMiddleware, handleApiError } from "@/lib/api-middleware-app";

// Handler pour les requêtes GET
export async function GET(request: Request) {
  return withAdminAuthApp(request, async (req: Request, adminId: string) => {
    try {
      const { searchParams } = new URL(request.url);
      const slug = searchParams.get('slug');
      
      if (slug) {
        // Récupérer un article spécifique
        const article = await prisma.article.findUnique({
          where: { slug },
        });
        
        if (!article) {
          return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
        }
        
        return withApiMiddleware(NextResponse.json(article));
      } else {
        // Récupérer tous les articles
        const articles = await prisma.article.findMany({
          orderBy: { createdAt: "desc" },
        });
        
        return withApiMiddleware(NextResponse.json(articles));
      }
    } catch (error: any) {
      console.error("Error in admin/articles API GET:", error);
      return handleApiError("Erreur serveur", 500);
    }
  });
}

// Handler pour les requêtes POST
export async function POST(request: Request) {
  return withAdminAuthApp(request, async (req: Request, adminId: string) => {
    try {
      const body = await req.json();
      
      // Créer un nouvel article
      const newArticle = await prisma.article.create({
        data: {
          title: body.title,
          content: body.content,
          slug: body.slug,
          excerpt: body.excerpt || "",
          published: body.published || false,
          authorId: body.authorId,
        },
      });
      
      return withApiMiddleware(NextResponse.json(newArticle, { status: 201 }));
    } catch (error: any) {
      console.error("Error in admin/articles API POST:", error);
      return handleApiError("Erreur serveur", 500);
    }
  });
}

// Handler pour les requêtes PUT
export async function PUT(request: Request) {
  return withAdminAuthApp(request, async (req: Request, adminId: string) => {
    try {
      const body = await req.json();
      
      // Mettre à jour un article
      const updatedArticle = await prisma.article.update({
        where: { slug: body.slug },
        data: {
          title: body.title,
          content: body.content,
          excerpt: body.excerpt,
          published: body.published,
        },
      });
      
      return withApiMiddleware(NextResponse.json(updatedArticle));
    } catch (error: any) {
      console.error("Error in admin/articles API PUT:", error);
      return handleApiError("Erreur serveur", 500);
    }
  });
}

// Handler pour les requêtes DELETE
export async function DELETE(request: Request) {
  return withAdminAuthApp(request, async (req: Request, adminId: string) => {
    try {
      const { searchParams } = new URL(request.url);
      const slug = searchParams.get('slug');
      
      if (!slug) {
        return NextResponse.json({ error: "Slug requis" }, { status: 400 });
      }
      
      // Supprimer un article
      const deletedArticle = await prisma.article.delete({
        where: { slug },
      });
      
      return withApiMiddleware(NextResponse.json({ success: true, article: deletedArticle }));
    } catch (error: any) {
      console.error("Error in admin/articles API DELETE:", error);
      return handleApiError("Erreur serveur", 500);
    }
  });
}

// Handler pour les requêtes OPTIONS (CORS)
export async function OPTIONS() {
  return withApiMiddleware(NextResponse.json({}, { status: 200 }));
}
