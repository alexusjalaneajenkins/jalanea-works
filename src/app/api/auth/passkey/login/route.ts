import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPasskeyAuthentication } from '@/lib/auth/webauthn'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import type { Passkey } from '@/types/auth'

export async function POST(request: Request) {
  try {
    const { credential } = (await request.json()) as {
      credential: AuthenticationResponseJSON
    }

    if (!credential) {
      return NextResponse.json(
        { error: 'Missing credential' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find the passkey by credential ID
    const { data: passkey, error: passkeyError } = await supabase
      .from('passkeys')
      .select('*')
      .eq('credential_id', credential.id)
      .single()

    if (passkeyError || !passkey) {
      return NextResponse.json(
        { error: 'Passkey not found' },
        { status: 400 }
      )
    }

    // Get the user's email to find the matching challenge
    const { data: userData } = await supabase.auth.admin.getUserById(passkey.user_id)
    const userEmail = userData.user?.email

    // Get a valid challenge (filtered by user email if available)
    let challengeQuery = supabase
      .from('auth_challenges')
      .select('*')
      .eq('type', 'authentication')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (userEmail) {
      challengeQuery = challengeQuery.eq('email', userEmail)
    }

    const { data: challenge, error: challengeError } = await challengeQuery.single()

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      )
    }

    // Verify the authentication response
    const verification = await verifyPasskeyAuthentication(
      credential,
      challenge.challenge,
      passkey as Passkey
    )

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    // Update the passkey counter (prevents replay attacks)
    await supabase
      .from('passkeys')
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', passkey.id)

    // Clean up the used challenge
    await supabase
      .from('auth_challenges')
      .delete()
      .eq('id', challenge.id)

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      )
    }

    // Generate a magic link for seamless session creation
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      },
    })

    if (linkError) {
      console.error('Failed to generate session link:', linkError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Extract the token from the magic link for direct session creation
    const url = new URL(linkData.properties.action_link)
    const token = url.searchParams.get('token')
    const type = url.searchParams.get('type')

    return NextResponse.json({
      success: true,
      token,
      type,
      redirectUrl: '/auth/callback',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Login error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
