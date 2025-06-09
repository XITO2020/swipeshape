// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Use PrismaClient with type assertion to avoid TypeScript errors
const prisma = new PrismaClient() as any;

async function main() {
  // 1. Créer (ou mettre à jour) un utilisateur admin
  //    Mot de passe "Admin1234" (pré-hashé ou on peut le hacher ici)
  const hashedPassword = await bcrypt.hash("Admin1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@swipeshape.com" },
    update: {},
    create: {
      email: "admin@swipeshape.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  // 2. Créer quelques programmes demo
  await prisma.program.upsert({
    where: { id: "prog1" },
    update: {},
    create: {
      id: "prog1",
      name: "Programme Yoga Débutant",
      price: 29.99,
      fileUrl: "/assets/programs/yoga-debutant.pdf",
    },
  });

  await prisma.program.upsert({
    where: { id: "prog2" },
    update: {},
    create: {
      id: "prog2",
      name: "Programme HIIT Intensif",
      price: 39.99,
      fileUrl: "/assets/programs/hiit-intensif.pdf",
    },
  });

  await prisma.program.upsert({
    where: { id: "prog3" },
    update: {},
    create: {
      id: "prog3",
      name: "Plan Nutrition Équilibrée",
      price: 24.99,
      fileUrl: "/assets/programs/nutrition-plan.pdf",
    },
  });

  await prisma.program.upsert({
    where: { id: "prog4" },
    update: {},
    create: {
      id: "prog4",
      name: "Programme Perte de Poids 30 Jours",
      price: 49.99,
      fileUrl: "/assets/programs/perte-poids-30j.pdf",
    },
  });

  await prisma.program.upsert({
    where: { id: "prog5" },
    update: {},
    create: {
      id: "prog5",
      name: "Renforcement Musculaire Complet",
      price: 34.99,
      fileUrl: "/assets/programs/renforcement-musculaire.pdf",
    },
  });

  console.log("✅ Seed terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
