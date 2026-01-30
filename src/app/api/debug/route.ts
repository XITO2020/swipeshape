import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '../../../lib/api-middleware-app';

export async function GET(req: NextRequest) {
  console.log('API debug appelée');
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_SECRET: !!process.env.ADMIN_SECRET,
    JWT_SECRET: !!process.env.JWT_SECRET,
  };
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString(), environment: envInfo },
    { headers: corsHeaders() }
  );
}
