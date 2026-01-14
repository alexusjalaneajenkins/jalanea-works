import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { onboardingSchema } from '@/lib/validation/onboarding'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the onboarding data from request body
    const body = await request.json()

    // Server-side validation with Zod
    const validation = onboardingSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }

    const {
      preferredLanguage,
      fullName,
      address,
      addressCoords,
      linkedInUrl,
      portfolioUrl,
      credentials,
      transportMethods,
      maxCommute,
      availability,
      specificDays,
      preferredShifts,
      salaryMin,
      salaryMax,
      challenges,
      realityContext,
    } = validation.data

    // Update profile with onboarding data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        preferred_language: preferredLanguage,
        address: address,
        address_coords: addressCoords,
        linkedin_url: linkedInUrl,
        portfolio_url: portfolioUrl,
        transport_methods: transportMethods,
        max_commute: maxCommute,
        availability: availability,
        specific_days: specificDays,
        preferred_shifts: preferredShifts,
        desired_salary_min: salaryMin,
        desired_salary_max: salaryMax,
        challenges: challenges,
        reality_context: realityContext,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Save credentials (delete old ones first, then insert new)
    if (credentials && credentials.length > 0) {
      // Delete existing credentials for this user
      await supabase
        .from('credentials')
        .delete()
        .eq('user_id', user.id)

      // Insert new credentials
      const credentialRows = credentials.map((cred: {
        school: string
        program: string
        degreeType: string
        graduationYear: string
        status: string
      }, index: number) => ({
        user_id: user.id,
        institution: cred.school === 'other' ? 'Other' : cred.school,
        credential_type: cred.degreeType === 'other' ? 'certificate' : cred.degreeType,
        program: cred.program,
        status: cred.status,
        is_primary: index === 0, // First credential is primary
        end_date: cred.graduationYear ? `${cred.graduationYear}-06-01` : null,
        valencia_credential: ['valencia', 'seminole', 'orange'].includes(cred.school),
      }))

      const { error: credentialsError } = await supabase
        .from('credentials')
        .insert(credentialRows)

      if (credentialsError) {
        console.error('Credentials insert error:', credentialsError)
        // Don't fail the whole request if credentials fail
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
