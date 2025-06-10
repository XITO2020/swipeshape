// src/lib/db-utils.ts
import { executeQuery } from '../pages/api/db';

/**
 * Vérifie si un utilisateur a le droit de commenter en fonction de ses achats.
 * Cette fonction remplace l'équivalent Supabase avec une connexion PostgreSQL directe.
 */
export const checkUserCanComment = async (userId: string, programId?: string) => {
  try {
    let queryText = `
      SELECT id, program_id 
      FROM purchases 
      WHERE user_id = $1 
      AND status = 'completed'
    `;
    
    const queryParams: any[] = [userId];
    
    if (programId) {
      // Si un programId est spécifié, vérifier que l'utilisateur a acheté ce programme spécifique
      queryText += ` AND program_id = $2`;
      queryParams.push(programId);
    }
    
    queryText += ` LIMIT 1`;
    
    const { data, error } = await executeQuery(queryText, queryParams);
    
    if (error) throw error;
    
    return { 
      canComment: data && data.length > 0, 
      error: null, 
      programIds: data?.map((p: any) => p.program_id) || [] 
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des achats:', error);
    return { canComment: false, error, programIds: [] };
  }
};
