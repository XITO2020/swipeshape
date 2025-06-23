import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthApp } from "@/lib/admin-middleware-app";

/**
 * Gestion des requêtes GET pour obtenir des programmes (tous ou un seul)
 */
export const GET = withAdminAuthApp(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("id");
    
    if (programId) {
      // Get single program
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });
      
      if (!program) {
        return NextResponse.json({ error: "Programme non trouvé" }, { status: 404 });
      }
      
      return NextResponse.json(program);
    } else {
      // Get all programs
      const programs = await prisma.program.findMany({
        orderBy: { createdAt: "desc" },
      });
      
      return NextResponse.json(programs);
    }
  } catch (error: any) {
    console.error("Error in admin/programs API (GET):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes POST pour créer un nouveau programme
 */
export const POST = withAdminAuthApp(async (request: Request) => {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: "Nom du programme requis" }, { status: 400 });
    }
    
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
    
    return NextResponse.json(newProgram, { status: 201 });
  } catch (error: any) {
    console.error("Error in admin/programs API (POST):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes PUT pour mettre à jour un programme
 */
export const PUT = withAdminAuthApp(async (request: Request) => {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "ID du programme requis" }, { status: 400 });
    }
    
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
    
    return NextResponse.json(updatedProgram);
  } catch (error: any) {
    console.error("Error in admin/programs API (PUT):", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * Gestion des requêtes DELETE pour supprimer un programme
 */
export const DELETE = withAdminAuthApp(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("id");
    
    if (!programId) {
      return NextResponse.json({ error: "ID du programme requis" }, { status: 400 });
    }
    
    // Delete program
    const deletedProgram = await prisma.program.delete({
      where: { id: programId },
    });
    
    return NextResponse.json({ success: true, program: deletedProgram });
  } catch (error: any) {
    console.error("Error in admin/programs API (DELETE):", error);
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
