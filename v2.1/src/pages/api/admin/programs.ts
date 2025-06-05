import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminMiddleware";

const handler = async (req: NextApiRequest, res: NextApiResponse, adminId: string) => {
  const { method, query, body } = req;
  
  try {
    
    switch (method) {
      case "GET":
        const programId = query.id as string;
        
        if (programId) {
          // Get single program
          const program = await prisma.program.findUnique({
            where: { id: programId },
          });
          
          if (!program) {
            return res.status(404).json({ error: "Programme non trouvé" });
          }
          
          return res.status(200).json(program);
        } else {
          // Get all programs
          const programs = await prisma.program.findMany({
            orderBy: { createdAt: "desc" },
          });
          
          return res.status(200).json(programs);
        }
        
      case "POST":
        // Create new program
        const newProgram = await prisma.program.create({
          data: {
            name: body.name,
            description: body.description || "",
            price: parseFloat(body.price) || 0,
            downloadUrl: body.downloadUrl || "",
            thumbnailUrl: body.thumbnailUrl || "",
          },
        });
        
        return res.status(201).json(newProgram);
        
      case "PUT":
        // Update program
        const updatedProgram = await prisma.program.update({
          where: { id: body.id },
          data: {
            name: body.name,
            description: body.description,
            price: parseFloat(body.price),
            downloadUrl: body.downloadUrl,
            thumbnailUrl: body.thumbnailUrl,
          },
        });
        
        return res.status(200).json(updatedProgram);
        
      case "DELETE":
        // Delete program
        const deletedProgram = await prisma.program.delete({
          where: { id: query.id as string },
        });
        
        return res.status(200).json({ success: true, program: deletedProgram });
        
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Error in admin/programs API:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

export default withAdminAuth(handler);
