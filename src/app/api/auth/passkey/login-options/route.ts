import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePasskeyAuthenticationOptions } from '@/lib/auth/webauthn'
import type { Passkey } from '@/types/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email } = body as { email?: string }

    const supabase = createAdminClient()

    let userPasskeys: Passkey[] = []

    if (email) {
      // Get user's passkeys if email provided
      const { data: authData } = await supabase.auth.admin.listUsers()
      const user = authData?.users?.find((u) => u.email === email)

      if (user) {
        const { data: passkeys } = await supabase
          .from('passkeys')
          .select('*')
          .eq('user_id', user.id)

        userPasskeys = passkeys || []
      }

      if (userPasskeys.length === 0) {
        return NextResponse.json(
          { error: 'No passkeys found for this email' },
          { status: 400 }
        )
      }
    }

    // Generate authentication options
    const options = await generatePasskeyAuthenticationOptions(
      userPasskeys.length > 0 ? userPasskeys : undefined
    )

    // Clean up old authentication challenges for this email/session
    await supabase
      .from('auth_challenges')
      .delete()
      .eq('type', 'authentication')
      .or(email ? `email.eq.${email}` : 'email.is.null')

    // Store the challenge temporarily
    const { error: challengeError } = await supabase.from('auth_challenges').insert({
      email: email || null,
      challenge: options.challenge,
      type: 'authentication',
    })

    if (challengeError) {
      console.error('Failed to store challenge:', challengeError)
      return NextResponse.json(
        { error: 'Failed to initialize login' },
        { status: 500 }
      )
    }

    return NextResponse.json(options)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Login options error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
