import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/admin-middleware-app'
import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/lib/api-middleware-app'

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('purchases')
      .select(`
        id,
        userId,
        programId,
        createdAt,
        updatedAt,
        program:programId(id, name, price),
        user:userId(id, email)
      `)
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json(
      { purchases: data },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('GET /purchases error:', err)
    return NextResponse.json(
      { error: 'Impossible de récupérer les achats' },
      { status: 500, headers: corsHeaders() }
    )
  }
})
