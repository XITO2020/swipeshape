import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminMiddleware";

const handler = async (req: NextApiRequest, res: NextApiResponse, adminId: string) => {
  const { method, query, body } = req;
  
  switch (method) {
    case "GET":
      const slug = query.slug as string;
      
      if (slug) {
        // Get single article
        const article = await prisma.article.findUnique({
          where: { slug },
        });
        
        if (!article) {
          return res.status(404).json({ error: "Article non trouvé" });
        }
        
        return res.status(200).json(article);
      } else {
        // Get all articles
        const articles = await prisma.article.findMany({
          orderBy: { createdAt: "desc" },
        });
        
        return res.status(200).json(articles);
      }
        
    case "POST":
      // Create new article
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
      
      return res.status(201).json(newArticle);
      
    case "PUT":
      // Update article
      const updatedArticle = await prisma.article.update({
        where: { slug: body.slug },
        data: {
          title: body.title,
          content: body.content,
          excerpt: body.excerpt,
          published: body.published,
        },
      });
      
      return res.status(200).json(updatedArticle);
      
    case "DELETE":
      // Delete article
      const deletedArticle = await prisma.article.delete({
        where: { slug: query.slug as string },
      });
      
      return res.status(200).json({ success: true, article: deletedArticle });
      
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Error in admin/articles API:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

export default withAdminAuth(handler);
