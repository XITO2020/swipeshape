import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../db';
import path from 'path';
import fs from 'fs';
import { generatePDF } from '../../../lib/pdfGenerator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Récupérer le token depuis l'URL
  const { token } = req.query;

  if (!token || Array.isArray(token)) {
    return res.status(400).json({ error: 'Token invalide' });
  }

  try {
    // Vérifier que le token est valide et n'a pas expiré
    const { data: purchase, error } = await executeQuery(
      `SELECT p.*, prog.name as program_name, prog.file_path, prog.description 
       FROM purchases p
       JOIN programs prog ON p.program_id = prog.id
       WHERE p.download_token = $1 AND p.expires_at > NOW()`,
      [token]
    );

    if (error) {
      console.error('Erreur de base de données:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!purchase || purchase.length === 0) {
      return res.status(404).json({ error: 'Token invalide ou expiré' });
    }

    // Vérifier le nombre de téléchargements
    const downloadCount = purchase[0].download_count || 0;
    const MAX_DOWNLOADS = 3; // Maximum 3 téléchargements par achat
    
    if (downloadCount >= MAX_DOWNLOADS) {
      return res.status(403).json({ 
        error: 'Limite de téléchargements atteinte',
        message: 'Vous avez atteint le nombre maximum de téléchargements pour ce programme'
      });
    }

    // Incrémenter le compteur de téléchargements
    await executeQuery(
      'UPDATE purchases SET download_count = download_count + 1 WHERE download_token = $1',
      [token]
    );

    // Préparer le fichier à envoyer
    const programInfo = purchase[0];
    let filePath = '';
    let fileName = '';
    let fileBuffer: Buffer;

    if (programInfo.file_path && fs.existsSync(path.join(process.cwd(), programInfo.file_path))) {
      // Si le fichier existe sur le serveur, l'envoyer
      filePath = path.join(process.cwd(), programInfo.file_path);
      fileName = path.basename(filePath);
      fileBuffer = fs.readFileSync(filePath);
    } else {
      // Sinon générer un PDF avec les informations du programme
      fileBuffer = await generatePDF({
        programName: programInfo.program_name,
        purchaseDate: new Date(programInfo.created_at).toLocaleDateString('fr-FR'),
        downloadLink: `${process.env.NEXT_PUBLIC_SITE_URL}/download/${token}`,
        expiryDate: new Date(programInfo.expires_at).toLocaleDateString('fr-FR')
      });
      fileName = `${programInfo.program_name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    }

    // Définir les en-têtes pour le téléchargement
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Envoyer le fichier
    return res.send(fileBuffer);
    
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return res.status(500).json({ error: 'Erreur lors du téléchargement du programme' });
  }
}
