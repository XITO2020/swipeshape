// src/pages/api/admin/email-templates/send-program.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { sendEmailWithAttachment } from '@/lib/brevoClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérification des permissions admin
    const user = await requireAdmin(req, res);
    if (!user) return;

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { userId, programId, subject, message } = req.body;

    if (!userId || !programId) {
      return res.status(400).json({ error: 'Utilisateur et programme requis' });
    }

    // Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer les informations du programme
    const { data: programData, error: programError } = await supabase
      .from('programs')
      .select('name, download_url, description')
      .eq('id', programId)
      .single();

    if (programError || !programData) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    // Récupérer le template d'email pour les programmes
    const { data: templateData } = await supabase
      .from('email_templates')
      .select('subject, content')
      .eq('type', 'program_delivery')
      .single();

    // Récupérer le contenu du programme (fichier PDF) depuis l'URL
    // Note: Cette partie peut nécessiter une adaptation selon la façon dont vous stockez vos fichiers
    let programBuffer;
    try {
      const response = await fetch(programData.download_url);
      if (!response.ok) throw new Error('Erreur lors du téléchargement du programme');
      const arrayBuffer = await response.arrayBuffer();
      programBuffer = Buffer.from(arrayBuffer);
    } catch (error: any) {
      return res.status(500).json({ error: `Impossible de récupérer le programme: ${error.message}` });
    }

    // Préparer le contenu de l'email
    const emailSubject = subject || 
      (templateData?.subject || `Votre programme: ${programData.name}`);
    
    const userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Client';
    
    const defaultTemplate = `
      <h1>Bonjour ${userName},</h1>
      <p>Voici votre programme <strong>${programData.name}</strong>.</p>
      <p>${programData.description || ''}</p>
      <p>${message || ''}</p>
      <p>Cordialement,<br>L'équipe SwipeShape</p>
    `;
    
    const htmlContent = templateData?.content?.replace('{{userName}}', userName)
      .replace('{{programName}}', programData.name)
      .replace('{{programDescription}}', programData.description || '')
      .replace('{{message}}', message || '') || defaultTemplate;

    const textContent = `Bonjour ${userName},\n\nVoici votre programme ${programData.name}.\n\n${programData.description || ''}\n\n${message || ''}\n\nCordialement,\nL'équipe SwipeShape`;

    // Générer un nom de fichier pour la pièce jointe
    const fileName = `${programData.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;

    // Envoyer l'email avec le programme en pièce jointe
    await sendEmailWithAttachment(
      userData.email,
      emailSubject,
      htmlContent,
      textContent,
      programBuffer,
      fileName
    );

    // Enregistrer l'envoi de l'email dans Supabase
    await supabase.from('program_emails').insert([{
      user_id: userId,
      program_id: programId,
      sent_at: new Date(),
      subject: emailSubject
    }]);

    return res.status(200).json({ success: true, message: 'Email envoyé avec succès' });

  } catch (error: any) {
    console.error('Erreur d\'envoi d\'email:', error);
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
