
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { executeQuery } from '../../../lib/db';
import { corsHeaders } from '../../../lib/api-middleware-app';

function enforceAuth(req: NextRequest, needsAdmin = false) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (needsAdmin && sessionClaims?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403, headers: corsHeaders() }
    );
  }
  return null;
}

export async function GET(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;
  const { data, error } = await executeQuery('SELECT * FROM videos;', []);
  if (error) throw error;
  return NextResponse.json({ videos: data }, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req, true);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { data, error } = await executeQuery(
    'INSERT INTO videos (url, title) VALUES ($1, $2) RETURNING *;',
    [body.url, body.title]
  );
  if (error) throw error;
  return NextResponse.json({ video: data[0] }, { status: 201, headers: corsHeaders() });
}