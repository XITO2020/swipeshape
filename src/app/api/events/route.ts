
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
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
  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return NextResponse.json({ events }, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req, true);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('events')
    .insert([{ title: body.title, date: body.date }])
    .select()
    .single();
  if (error) throw error;
  return NextResponse.json({ event: data }, { status: 201, headers: corsHeaders() });
}