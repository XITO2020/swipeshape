import { PrismaClient } from "@prisma/client";

// Variable permettant de choisir si on utilise PostgreSQL directement ou Supabase
const USE_POSTGRES = process.env.USE_POSTGRES === 'true';

// Création conditionnelle du client Prisma
const prisma = USE_POSTGRES ? new PrismaClient() : null;

// Exporter une interface compatible pour permettre la substitution future
export default prisma;

// Log pour indiquer le mode utilisé
console.log(`Base de données : ${USE_POSTGRES ? 'PostgreSQL direct' : 'Supabase'} est utilisé`);
