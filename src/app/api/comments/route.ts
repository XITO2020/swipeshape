
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
  const { data: comments, error } = await supabaseAdmin
    .from('comments')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return NextResponse.json({ comments }, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const forbidden = enforceAuth(req);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { userId } = getAuth(req);
  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert([{ content: body.content, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return NextResponse.json({ comment: data }, { status: 201, headers: corsHeaders() });
}

export async function DELETE(req: NextRequest) {
  const forbidden = enforceAuth(req, true);
  if (forbidden) return forbidden;
  const { id } = await req.json();
  const { error } = await supabaseAdmin
    .from('comments')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}