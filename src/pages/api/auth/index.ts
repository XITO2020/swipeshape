import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

/**
 * REMARQUE IMPORTANTE SUR LA STANDARDISATION DES API:
 * 
 * Cette API d'authentification est la seule qui continue d'utiliser
 * le client Supabase directement. Nous faisons cette exception uniquement pour
 * les fonctionnalités d'authentification car elles sont complexes à réimplémenter
 * (gestion des tokens JWT, hachage des mots de passe, etc.) et critiques pour la sécurité.
 * 
 * Toutes les autres API ont été standardisées pour utiliser executeQuery avec
 * une connexion PostgreSQL directe via DATABASE_URL.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle authentication based on request method
  if (req.method === "POST") {
    // Login or signup based on body parameters
    try {
      const { email, password, action } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }
      
      let result;
      if (action === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        result = { data, error };
        console.log("Tentative d'inscription:", email);
      } else if (action === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        result = { data, error };
        console.log("Tentative de connexion:", email);
      } else {
        return res.status(400).json({ error: "Action invalide" });
      }
      
      if (result.error) {
        console.error(`Échec de ${action === "signup" ? "l'inscription" : "la connexion"}:`, result.error);
        return res.status(401).json({ 
          error: result.error.message || "Échec de l'authentification",
          details: process.env.NODE_ENV === "development" ? result.error : undefined
        });
      }
      
      return res.status(200).json(result.data);
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      return res.status(500).json({
        error: "Erreur serveur lors de l'authentification",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
      });
    }
  } else if (req.method === "GET") {
    // Get current user
    try {
      console.log("Récupération des informations utilisateur");
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Erreur récupération utilisateur:", error);
        return res.status(401).json({ 
          error: error.message || "Non authentifié",
          details: process.env.NODE_ENV === "development" ? error : undefined
        });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Exception lors de la récupération utilisateur:", error);
      return res.status(500).json({
        error: "Erreur serveur lors de la récupération utilisateur",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
      });
    }
  } else if (req.method === "DELETE") {
    // Logout
    try {
      console.log("Tentative de déconnexion");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur de déconnexion:", error);
        return res.status(500).json({ 
          error: error.message || "Échec de la déconnexion",
          details: process.env.NODE_ENV === "development" ? error : undefined
        });
      }
      
      return res.status(200).json({ message: "Déconnecté avec succès" });
    } catch (error) {
      console.error("Exception lors de la déconnexion:", error);
      return res.status(500).json({ 
        error: "Erreur serveur lors de la déconnexion",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined 
      });
    }
  } else {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }
}
