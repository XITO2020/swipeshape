// src/pages/api/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

// Inscription
async function handleRegister(req: NextApiRequest, res: NextApiResponse) {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: 'user', // Default role
      },
    });
    
    // Generate token for immediate login
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    
    return res.status(201).json({ 
      message: "Compte créé avec succès",
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (e: any) {
    console.error("Registration error:", e);
    return res.status(500).json({ error: "Erreur lors de la création du compte" });
  }
}

// Connexion
async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }
  
  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    
    // Set token in both cookie and response
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`
    );

    // Don't include password in the response
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      message: "Connexion réussie",
      user: userWithoutPassword,
      token, // Return token in body for client-side storage
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Erreur lors de la connexion" });
  }
}

// Déconnexion
async function handleLogout(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", `token=; HttpOnly; Path=/; Max-Age=0`);
  return res.status(200).end();
}

// Récupérer l’utilisateur connecté
async function handleMe(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.cookies.token;
  if (!cookie) return res.status(401).json({ error: "Non authentifié" });
  try {
    const payload = jwt.verify(cookie, JWT_SECRET) as { userId: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    return res.status(200).json({ user });
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Get action from body for cleaner API calls
    const { action } = req.body;
    
    switch(action) {
      case "register":
        return handleRegister(req, res);
      case "login":
        return handleLogin(req, res);
      case "logout":
        return handleLogout(req, res);
      default:
        return res.status(400).json({ error: "Action non reconnue" });
    }
  }

  if (req.method === "GET") {
    return handleMe(req, res);
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
