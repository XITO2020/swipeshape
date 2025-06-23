import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/app/api/db'
import { corsHeaders } from '@/lib/api-middleware-app'

export async function GET(request: NextRequest) {
  try {
    const sql = `SELECT * FROM programs ORDER BY created_at DESC;`
    const { data, error } = await executeQuery(sql, [])
    if (error) {
      console.error('❌ programmes SQL error:', error)
      return NextResponse.json(
        { error: 'Impossible de récupérer les programmes' },
        { status: 500, headers: corsHeaders() }
      )
    }
    return NextResponse.json(data ?? [], { status: 200, headers: corsHeaders() })
  } catch (err: any) {
    console.error('❌ programmes exception:', err)
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders() })
}
export const POST   = () => NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: corsHeaders() })
export const PUT    = POST
export const DELETE = POST
export const PATCH  = POST
