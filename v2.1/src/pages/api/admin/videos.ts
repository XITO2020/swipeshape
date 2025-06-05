import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminMiddleware";

const handler = async (req: NextApiRequest, res: NextApiResponse, adminId: string) => {
  const { method, query, body } = req;
  
  try {
    
    switch (method) {
      case "GET":
        const videoId = query.id as string;
        
        if (videoId) {
          // Get single video
          const video = await prisma.video.findUnique({
            where: { id: videoId },
          });
          
          if (!video) {
            return res.status(404).json({ error: "Vidéo non trouvée" });
          }
          
          return res.status(200).json(video);
        } else {
          // Get all videos
          const videos = await prisma.video.findMany({
            orderBy: { createdAt: "desc" },
          });
          
          return res.status(200).json(videos);
        }
        
      case "POST":
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
        
        return res.status(201).json(newVideo);
        
      case "PUT":
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
        
        return res.status(200).json(updatedVideo);
        
      case "DELETE":
        // Delete video
        const deletedVideo = await prisma.video.delete({
          where: { id: query.id as string },
        });
        
        return res.status(200).json({ success: true, video: deletedVideo });
        
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Error in admin/videos API:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

export default withAdminAuth(handler);
