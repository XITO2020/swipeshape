
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { executeQuery } from '../../../lib/db'
import { corsHeaders } from '../../../lib/api-middleware-app'

function enforceAuth(req: NextRequest, needsAdmin = false) {
  const { userId, sessionClaims } = getAuth(req)
  if (!userId) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  if (needsAdmin && sessionClaims?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403, headers: corsHeaders() }
    )
  }
  return null
}

// GET: lister les articles (tous les membres authentifiés)
export async function GET(request: NextRequest) {
  const forbidden = enforceAuth(request)
  if (forbidden) return forbidden

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
    if (date.trim()) {
      sql += ` AND created_at::date = $${params.length + 1}`
      params.push(date)
    }

    const { data: articles, error } = await executeQuery(sql, params)
    if (error) throw error
    return NextResponse.json(
      { articles },
      { headers: corsHeaders() }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// POST: créer un article (admin only)
export async function POST(request: NextRequest) {
  const forbidden = enforceAuth(request, true)
  if (forbidden) return forbidden

  try {
    const data = await request.json()
    const { userId } = getAuth(request)
    const insertSql = `
      INSERT INTO articles (title, content, author_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const { data: createdRows, error: creationError } = await executeQuery(insertSql, [data.title, data.content, userId])
    if (creationError) throw creationError
    const created = createdRows[0]
    return NextResponse.json(
      { article: created },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// PUT: mettre à jour un article (admin only)
export async function PUT(request: NextRequest) {
  const forbidden = enforceAuth(request, true)
  if (forbidden) return forbidden

  try {
    const data = await request.json()
    const updateSql = `
      UPDATE articles
      SET title = $1, content = $2
      WHERE id = $3
      RETURNING *
    `
    const { data: updatedRows, error: updateError } = await executeQuery(updateSql, [data.title, data.content, data.id])
    if (updateError) throw updateError
    const updated = updatedRows[0]
    return NextResponse.json(
      { article: updated },
      { headers: corsHeaders() }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// DELETE: supprimer un article (admin only)
export async function DELETE(request: NextRequest) {
  const forbidden = enforceAuth(request, true)
  if (forbidden) return forbidden

  try {
    const { id } = await request.json()
    await executeQuery(`DELETE FROM articles WHERE id = $1`, [id])
    return NextResponse.json({}, { status: 204, headers: corsHeaders() })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// PATCH: partiellement modifier un article (admin only)
export async function PATCH(request: NextRequest) {
  const forbidden = enforceAuth(request, true)
  if (forbidden) return forbidden

  try {
    const data = await request.json()
    const fields = []
    const params: any[] = []
    if (data.title) {
      params.push(data.title)
      fields.push(`title = $${params.length}`)
    }
    if (data.content) {
      params.push(data.content)
      fields.push(`content = $${params.length}`)
    }
    params.push(data.id)
    const updateSql = `
      UPDATE articles SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *
    `
    const { data: patchedRows, error: patchError } = await executeQuery(updateSql, params)
    if (patchError) throw patchError
    const updated = patchedRows[0]
    return NextResponse.json(
      { article: updated },
      { headers: corsHeaders() }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500, headers: corsHeaders() }
    )
  }
}