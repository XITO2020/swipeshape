import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/app/api/db'
import { corsHeaders } from '@/lib/api-middleware-app'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const date   = searchParams.get('date')   ?? ''

    let sql = `SELECT * FROM articles WHERE 1=1`
    const params: any[] = []

    if (search.trim()) {
      sql += ` AND (title ILIKE $${params.length + 1} OR content ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }
    if (date) {
      const d = new Date(date)
      if (!isNaN(d.getTime())) {
        sql += ` AND DATE(created_at) = DATE($${params.length + 1})`
        params.push(date)
      }
    }
    sql += ` ORDER BY created_at DESC;`

    const { data, error } = await executeQuery(sql, params)
    if (error) {
      console.error('❌ articles SQL error:', error)
      return NextResponse.json(
        { error: 'Impossible de récupérer les articles' },
        { status: 500, headers: corsHeaders() }
      )
    }
    return NextResponse.json(data ?? [], { status: 200, headers: corsHeaders() })
  } catch (err: any) {
    console.error('❌ articles exception:', err)
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
