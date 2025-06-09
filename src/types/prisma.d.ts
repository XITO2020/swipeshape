// src/types/prisma.d.ts
import { PrismaClient } from '@prisma/client';

// Re-export the Prisma namespace to add our custom types
declare global {
  namespace PrismaNamespace {
    // Define type-safe access to your Prisma models
    interface PrismaModels {
      user: any;
      program: any;
      purchase: any;
      article: any;
      comment: any;
      video: any;
    }

    interface CustomPrismaClient extends PrismaClient {
      user: PrismaClient['user'];
      program: PrismaClient['program'];
      purchase: PrismaClient['purchase'];
      article: PrismaClient['article'];
      comment: PrismaClient['comment'];
      video: PrismaClient['video'];
    }
  }
}

export {};
