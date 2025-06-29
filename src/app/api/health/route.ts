// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Test minimal : lire un id de programmes
    const { data, error } = await supabase
      .from('programs')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ health SQL error:', error)
      return NextResponse.json(
        { status: 'error', detail: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { status: 'ok', dbReachable: true, sample: data },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ health exception:', err)
    return NextResponse.json(
      { status: 'error', detail: err.message },
      { status: 500 }
    )
  }
}

export const POST   = () => NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
export const PUT    = POST
export const DELETE = POST
export const PATCH  = POST
