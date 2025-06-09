import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle authentication based on request method
  if (req.method === "POST") {
    // Login or signup based on body parameters
    try {
      const { email, password, action } = req.body;
      
      let result;
      if (action === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        result = { data, error };
      } else if (action === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        result = { data, error };
      } else {
        return res.status(400).json({ error: "Action invalide" });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      res.status(200).json(result.data);
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      res.status(401).json({ error: "Échec de l'authentification" });
    }
  } else if (req.method === "GET") {
    // Get current user
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      res.status(200).json(data);
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
      res.status(401).json({ error: "Non authentifié" });
    }
  } else if (req.method === "DELETE") {
    // Logout
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      res.status(500).json({ error: "Échec de la déconnexion" });
    }
  } else {
    res.status(405).json({ error: "Méthode non autorisée" });
  }
}
