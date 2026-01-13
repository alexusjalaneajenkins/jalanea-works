import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test the connection by getting the current timestamp from Supabase
    const { data, error } = await supabase.rpc('now')

    if (error) {
      // If RPC doesn't exist, try a simple auth check instead
      const { data: authData, error: authError } = await supabase.auth.getSession()

      if (authError) {
        return NextResponse.json(
          { success: false, error: authError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Supabase connection successful',
        hasSession: !!authData.session,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      serverTime: data,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
