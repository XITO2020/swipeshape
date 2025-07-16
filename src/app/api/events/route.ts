
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
  const { data, error } = await executeQuery('SELECT * FROM events;', []);
  if (error) throw error;
  return NextResponse.json({ events: data }, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req, true);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { data, error } = await executeQuery(
    'INSERT INTO events (title, date) VALUES ($1, $2) RETURNING *;',
    [body.title, body.date]
  );
  if (error) throw error;
  return NextResponse.json({ event: data[0] }, { status: 201, headers: corsHeaders() });
}