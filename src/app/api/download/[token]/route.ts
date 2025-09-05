// src/app/api/download/[token]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = params.token
  // Ici on suppose que `token` est en fait un `programId`.
  // Si c'est un autre type de jeton (purchaseId, etc.), adapte la logique ci-dessous.
  const programId = token

  // Vérifier que l'utilisateur a bien acheté ce programme
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .eq('status', 'completed')
    .single()

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Récupérer le programme pour accéder au fichier
  const { data: program, error: programError } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single()

  if (programError || !program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 })
  }

  // Ajuste selon le nom réel du champ (ici on suppose fileUrl)
  const fileRelativePath = (program as any).fileUrl || (program as any).file_url
  if (!fileRelativePath) {
    return NextResponse.json({ error: 'No file associated' }, { status: 500 })
  }

  const filePath = path.join(process.cwd(), 'public', fileRelativePath)
  try {
    const fileBuffer = await fs.promises.readFile(filePath)
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
      },
    })
  } catch (err) {
    console.error('File read error:', err)
    return NextResponse.json({ error: 'File not available' }, { status: 500 })
  }
}
