import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPasskeyRegistration } from '@/lib/auth/webauthn'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'

export async function POST(request: Request) {
  try {
    const { credential, email } = (await request.json()) as {
      credential: RegistrationResponseJSON
      email: string
    }

    if (!credential || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the stored challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('auth_challenges')
      .select('*')
      .eq('email', email)
      .eq('type', 'registration')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      )
    }

    // Verify the registration response
    const verification = await verifyPasskeyRegistration(
      credential,
      challenge.challenge
    )

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    const { registrationInfo } = verification

    // Create user if doesn't exist
    let userId: string

    const { data: authData } = await supabase.auth.admin.listUsers()
    const existingUser = authData?.users?.find((u) => u.email === email)

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user with a random password (they'll use passkey)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm since they verified via passkey
        user_metadata: {
          auth_method: 'passkey',
        },
      })

      if (createError || !newUser.user) {
        console.error('Failed to create user:', createError)
        return NextResponse.json(
          { error: 'Failed to create account' },
          { status: 500 }
        )
      }

      userId = newUser.user.id
    }

    // Store the passkey credential
    const { error: insertError } = await supabase.from('passkeys').insert({
      user_id: userId,
      credential_id: registrationInfo.credential.id,
      public_key: Buffer.from(registrationInfo.credential.publicKey).toString('base64url'),
      counter: registrationInfo.credential.counter,
      device_type: registrationInfo.credentialDeviceType,
      backed_up: registrationInfo.credentialBackedUp,
      transports: credential.response.transports || [],
    })

    if (insertError) {
      console.error('Failed to store passkey:', insertError)
      return NextResponse.json(
        { error: 'Failed to store passkey' },
        { status: 500 }
      )
    }

    // Clean up the used challenge
    await supabase
      .from('auth_challenges')
      .delete()
      .eq('id', challenge.id)

    // Generate a session for the user
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (sessionError) {
      console.error('Failed to generate session:', sessionError)
      // User is created, but session failed - they can log in with passkey
      return NextResponse.json({
        success: true,
        message: 'Passkey registered! Please log in.',
        needsLogin: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      redirectUrl: session.properties?.action_link,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Registration error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
