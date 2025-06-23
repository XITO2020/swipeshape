import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/app/api/db'
import { corsHeaders } from '@/lib/api-middleware-app'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')
    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId manquant' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const sql = `
      SELECT
        c.id,
        c.content,
        c.created_at,
        json_build_object(
          'id', u.id,
          'name', u.first_name || ' ' || u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) AS author
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.article_id = $1
      ORDER BY c.created_at DESC;
    `

    const { data, error } = await executeQuery(sql, [articleId])
    if (error) {
      console.error('❌ article_comments SQL error:', error)
      return NextResponse.json(
        { error: 'Impossible de charger les commentaires' },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json(data ?? [], { status: 200, headers: corsHeaders() })
  } catch (err: any) {
    console.error('❌ article_comments exception:', err)
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
