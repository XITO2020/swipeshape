// src/app/api/admin/email-templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware-app'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'

/**
 * DELETE: supprimer un template par son id
 */
export const DELETE = withAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params
  if (!id) {
    return NextResponse.json(
      { error: 'ID requis' },
      { status: 400, headers: corsHeaders() }
    )
  }

  try {
    const { error } = await supabaseAdmin
      .from('EmailTemplate')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du template', details: error.message },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('DELETE /email-templates/[id] error:', err)
    return NextResponse.json(
      { error: 'Impossible de supprimer le template' },
      { status: 500, headers: corsHeaders() }
    )
  }
})
