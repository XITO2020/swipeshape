import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../../../lib/api-middleware-app';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase.from('programs').select('id').limit(1);
    if (error) throw error;
    return NextResponse.json(
      { status: 'ok', dbReachable: true, sample: data },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error('health erreur:', err);
    return NextResponse.json(
      { status: 'error', detail: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export const POST = () =>
  NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405, headers: corsHeaders() });
export const PUT = POST;
export const DELETE = POST;
export const PATCH = POST;
