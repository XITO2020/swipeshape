import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import path from 'path';
import fs from 'fs';
import { generatePDF } from '../../../../lib/pdfGenerator';
import { corsHeaders } from '../../../../lib/api-middleware-app';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;
  if (!token) {
    return NextResponse.json(
      { error: 'Token invalide' },
      { status: 400, headers: corsHeaders() }
    );
  }
  try {
    const { data: purchase, error } = await executeQuery(
      `SELECT p.*, prog.name as program_name, prog.file_path, prog.description
       FROM purchases p
       JOIN programs prog ON p.program_id = prog.id
       WHERE p.download_token = $1 AND p.expires_at > NOW()`,
      [token]
    );
    if (error || !purchase.length) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const info = purchase[0];
    const downloads = info.download_count || 0;
    if (downloads >= 3) {
      return NextResponse.json(
        {
          error: 'Limite de téléchargements atteinte',
          message: 'Vous avez atteint le nombre maximum de téléchargements'
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    await executeQuery(
      'UPDATE purchases SET download_count = download_count + 1 WHERE download_token = $1',
      [token]
    );

    let buffer: Buffer;
    let filename: string;
    const filePath = info.file_path && path.join(process.cwd(), info.file_path);
    if (filePath && fs.existsSync(filePath)) {
      buffer = fs.readFileSync(filePath);
      filename = path.basename(filePath);
    } else {
      buffer = await generatePDF({
        programName: info.program_name,
        purchaseDate: new Date(info.created_at).toLocaleDateString('fr-FR'),
        downloadLink: `${process.env.NEXT_PUBLIC_SITE_URL}/download/${token}`,
        expiryDate: new Date(info.expires_at).toLocaleDateString('fr-FR')
      });
      filename = `${info.program_name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        ...corsHeaders()
      }
    });
  } catch (err: any) {
    console.error('download erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du programme' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders() });
}

export const POST = () =>
  NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405, headers: corsHeaders() });
export const PUT = POST;
export const DELETE = POST;
export const PATCH = POST;
