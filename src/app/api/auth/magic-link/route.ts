import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Use inviteUserByEmail for new users (sends email automatically)
    // or generateLink + custom email for existing users
    const { data: authData } = await supabase.auth.admin.listUsers()
    const existingUser = authData?.users?.find((u) => u.email === email)

    if (!existingUser) {
      // Invite new user - this sends an email automatically
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      })

      if (inviteError) {
        console.error('Failed to invite user:', inviteError)
        return NextResponse.json(
          { error: 'Failed to send magic link' },
          { status: 500 }
        )
      }
    } else {
      // For existing users, generate magic link
      // Note: This uses Supabase's built-in email if SMTP is configured
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
        },
      })

      if (linkError) {
        console.error('Failed to generate magic link:', linkError)
        return NextResponse.json(
          { error: 'Failed to send magic link' },
          { status: 500 }
        )
      }

      // If SMTP is not configured in Supabase, you would need to send the email manually here
      // For now, we'll return the link for development/testing purposes
      if (process.env.NODE_ENV === 'development') {
        console.log('Magic link for testing:', linkData.properties.action_link)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for the login link!',
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
