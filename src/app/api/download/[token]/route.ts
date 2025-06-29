import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import path from 'path';
import fs from 'fs';
import { generatePDF } from '../../../../lib/pdfGenerator';
import { corsHeaders } from '../../../../lib/api-middleware-app';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Récupérer le token depuis les paramètres de route
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    if (!purchase || purchase.length === 0) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 404 });
    }

    // Vérifier le nombre de téléchargements
    const downloadCount = purchase[0].download_count || 0;
    const MAX_DOWNLOADS = 3; // Maximum 3 téléchargements par achat
    
    if (downloadCount >= MAX_DOWNLOADS) {
      return NextResponse.json({ 
        error: 'Limite de téléchargements atteinte',
        message: 'Vous avez atteint le nombre maximum de téléchargements pour ce programme'
      }, { status: 403 });
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

    // Avec l'App Router, nous devons utiliser une approche différente pour renvoyer des fichiers binaires
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
    
    return response;
    
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return NextResponse.json({ error: 'Erreur lors du téléchargement du programme' }, { status: 500 });
  }
}

// Gestion des requêtes OPTIONS (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders(), status: 200 });
}

// Gestion des méthodes HTTP non autorisées
export async function POST() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405, headers: corsHeaders() });
}

export async function PUT() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405, headers: corsHeaders() });
}

export async function DELETE() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405, headers: corsHeaders() });
}

export async function PATCH() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405, headers: corsHeaders() });
}
