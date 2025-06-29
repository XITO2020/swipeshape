/**
 * Service de gestion des newsletters
 */
import { executeQuery } from '../lib/db';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  is_active: boolean;
}

export interface NewsletterTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  created_at: string;
}

/**
 * Récupère la liste des abonnés à la newsletter depuis la base de données
 */
export async function getSubscribersFromDatabase(): Promise<Subscriber[]> {
  try {
    const query = `
      SELECT * FROM newsletter_subscribers 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `;
    
    const subscribers = await executeQuery<Subscriber[]>({ query });
    return subscribers || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnés:', error);
    return [];
  }
}

/**
 * Ajoute un nouvel abonné à la newsletter
 */
export async function addSubscriber(email: string, name?: string): Promise<boolean> {
  try {
    // Vérifier si l'email existe déjà
    const checkQuery = `
      SELECT id FROM newsletter_subscribers 
      WHERE email = ?
    `;
    
    const existingSubscriber = await executeQuery<any[]>({ 
      query: checkQuery,
      values: [email]
    });
    
    if (existingSubscriber && existingSubscriber.length > 0) {
      // L'email existe déjà, réactiver si nécessaire
      const updateQuery = `
        UPDATE newsletter_subscribers 
        SET is_active = 1, name = COALESCE(?, name) 
        WHERE email = ?
      `;
      
      await executeQuery({ 
        query: updateQuery,
        values: [name || null, email]
      });
      
      return true;
    }
    
    // Nouvel abonné
    const insertQuery = `
      INSERT INTO newsletter_subscribers (email, name, is_active) 
      VALUES (?, ?, 1)
    `;
    
    await executeQuery({ 
      query: insertQuery,
      values: [email, name || null]
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un abonné:', error);
    return false;
  }
}

/**
 * Désabonne un email de la newsletter
 */
export async function unsubscribe(email: string): Promise<boolean> {
  try {
    const query = `
      UPDATE newsletter_subscribers 
      SET is_active = 0 
      WHERE email = ?
    `;
    
    await executeQuery({ 
      query,
      values: [email]
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return false;
  }
}

/**
 * Récupère la liste des templates de newsletter
 */
export async function getNewsletterTemplates(): Promise<NewsletterTemplate[]> {
  try {
    const query = `
      SELECT * FROM newsletter_templates 
      ORDER BY created_at DESC
    `;
    
    const templates = await executeQuery<NewsletterTemplate[]>({ query });
    return templates || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return [];
  }
}

/**
 * Récupère un template de newsletter par son ID
 */
export async function getTemplateById(id: string): Promise<NewsletterTemplate | null> {
  try {
    const query = `
      SELECT * FROM newsletter_templates 
      WHERE id = ?
    `;
    
    const templates = await executeQuery<NewsletterTemplate[]>({ 
      query,
      values: [id]
    });
    
    return templates && templates.length > 0 ? templates[0] : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du template:', error);
    return null;
  }
}

/**
 * Crée un nouveau template de newsletter
 */
export async function createTemplate(
  name: string,
  subject: string,
  content: string
): Promise<boolean> {
  try {
    const query = `
      INSERT INTO newsletter_templates (name, subject, content) 
      VALUES (?, ?, ?)
    `;
    
    await executeQuery({ 
      query,
      values: [name, subject, content]
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    return false;
  }
}

/**
 * Met à jour un template de newsletter existant
 */
export async function updateTemplate(
  id: string,
  name: string,
  subject: string,
  content: string
): Promise<boolean> {
  try {
    const query = `
      UPDATE newsletter_templates 
      SET name = ?, subject = ?, content = ? 
      WHERE id = ?
    `;
    
    await executeQuery({ 
      query,
      values: [name, subject, content, id]
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du template:', error);
    return false;
  }
}

/**
 * Supprime un template de newsletter
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    const query = `
      DELETE FROM newsletter_templates 
      WHERE id = ?
    `;
    
    await executeQuery({ 
      query,
      values: [id]
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    return false;
  }
}
