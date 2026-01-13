import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePasskeyRegistrationOptions } from '@/lib/auth/webauthn'
import type { Passkey } from '@/types/auth'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if user exists in auth.users
    const { data: authData } = await supabase.auth.admin.listUsers()
    const existingUser = authData?.users?.find((u) => u.email === email)

    let userId: string
    let existingPasskeys: Passkey[] = []

    if (existingUser) {
      userId = existingUser.id
      // Get existing passkeys to exclude
      const { data: passkeys } = await supabase
        .from('passkeys')
        .select('*')
        .eq('user_id', userId)

      existingPasskeys = passkeys || []
    } else {
      // Generate a temporary user ID for new registrations
      userId = crypto.randomUUID()
    }

    // Generate registration options
    const options = await generatePasskeyRegistrationOptions(
      userId,
      email,
      existingPasskeys
    )

    // Clean up old registration challenges for this user/email
    if (existingUser) {
      await supabase
        .from('auth_challenges')
        .delete()
        .eq('type', 'registration')
        .eq('user_id', userId)
    } else {
      await supabase
        .from('auth_challenges')
        .delete()
        .eq('type', 'registration')
        .eq('email', email)
    }

    // Store the challenge temporarily
    const { error: challengeError } = await supabase.from('auth_challenges').insert({
      user_id: existingUser ? userId : null,
      email: email,
      challenge: options.challenge,
      type: 'registration',
    })

    if (challengeError) {
      console.error('Failed to store challenge:', challengeError)
      return NextResponse.json(
        { error: 'Failed to initialize registration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...options,
      userId,
      isNewUser: !existingUser,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Registration options error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
