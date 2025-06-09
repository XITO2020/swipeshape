import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminMiddleware";

const handler = async (req: NextApiRequest, res: NextApiResponse, adminId: string) => {
  const { method, query, body } = req;
  
  try {
    
    switch (method) {
      case "GET":
        const commentId = query.id as string;
        
        if (commentId) {
          // Get single comment
          const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { user: { select: { name: true, email: true } } }
          });
          
          if (!comment) {
            return res.status(404).json({ error: "Commentaire non trouvé" });
          }
          
          return res.status(200).json(comment);
        } else {
          // Get all comments with filters
          const articleId = query.articleId as string;
          const whereClause = articleId ? { articleId } : {};
          
          const comments = await prisma.comment.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } }
          });
          
          return res.status(200).json(comments);
        }
        
      case "PUT":
        // Update comment (e.g., for moderation)
        const updatedComment = await prisma.comment.update({
          where: { id: body.id },
          data: {
            approved: body.approved,
            content: body.content
          },
        });
        
        return res.status(200).json(updatedComment);
        
      case "DELETE":
        // Delete comment
        const deletedComment = await prisma.comment.delete({
          where: { id: query.id as string },
        });
        
        return res.status(200).json({ success: true, comment: deletedComment });
        
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Error in admin/comments API:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

export default withAdminAuth(handler);
