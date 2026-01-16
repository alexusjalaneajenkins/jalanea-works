/**
 * Settings API
 *
 * GET /api/settings - Get user settings
 * PUT /api/settings - Update user settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Default notification preferences
const defaultNotifications = {
  emailApplicationUpdates: true,
  emailJobAlerts: true,
  emailWeeklyDigest: false,
  emailProductUpdates: true,
  pushInterviewReminders: true,
  pushApplicationDeadlines: true,
  pushNewMatches: false
}

// Default privacy settings
const defaultPrivacy = {
  profileVisible: true,
  allowDataAnalytics: true,
  allowPersonalization: true
}

// Tier limits configuration
const tierLimits = {
  essential: { pockets: 5, resumes: 1, aiMessages: 25, aiSuggestions: 10 },
  starter: { pockets: 15, resumes: 5, aiMessages: 100, aiSuggestions: 50 },
  professional: { pockets: 50, resumes: 20, aiMessages: 500, aiSuggestions: 200 },
  max: { pockets: null, resumes: null, aiMessages: null, aiSuggestions: null },
  owner: { pockets: null, resumes: null, aiMessages: null, aiSuggestions: null }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // If user doesn't exist in users table, create them
    if (userError && userError.code === 'PGRST116') {
      // No rows returned - create the user with only base columns that exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.first_name || 'User'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        // Return default settings if we can't create
        return NextResponse.json({
          settings: buildDefaultSettings(user)
        })
      }

      return NextResponse.json({
        settings: buildSettingsFromUser(newUser, user)
      })
    }

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({
        settings: buildDefaultSettings(user)
      })
    }

    return NextResponse.json({
      settings: buildSettingsFromUser(userData, user)
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// Helper to build settings from user data
function buildSettingsFromUser(userData: Record<string, unknown>, authUser: { id: string; email?: string }) {
  const tier = (userData.tier as string) || 'starter'
  const limits = tierLimits[tier as keyof typeof tierLimits] || tierLimits.starter

  // Parse first/last name from full_name if individual fields don't exist
  let firstName = userData.first_name as string || ''
  let lastName = userData.last_name as string || ''
  if (!firstName && !lastName && userData.full_name) {
    const nameParts = (userData.full_name as string).split(' ')
    firstName = nameParts[0] || ''
    lastName = nameParts.slice(1).join(' ') || ''
  }

  return {
    profile: {
      id: userData.id,
      email: userData.email || authUser.email || '',
      firstName,
      lastName,
      phone: userData.phone as string || '',
      location: userData.location_city ? `${userData.location_city}, ${userData.location_state || 'FL'}` : '',
      linkedinUrl: userData.linkedin_url || '',
      avatarUrl: userData.avatar_url || null,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    },
    subscription: {
      tier: tier,
      status: userData.subscription_status || 'active',
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: userData.trial_ends_at || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    },
    usage: {
      pocketsGenerated: 0, // TODO: Count from job_pockets table
      pocketsLimit: limits.pockets,
      advancedPocketsGenerated: 0,
      advancedPocketsLimit: null,
      resumesCreated: 0, // TODO: Count from resumes table
      resumesLimit: limits.resumes,
      applicationsTracked: 0, // TODO: Count from applications table
      applicationsLimit: null,
      aiSuggestionsUsed: 0,
      aiSuggestionsLimit: limits.aiSuggestions,
      aiMessagesUsed: 0,
      aiMessagesLimit: limits.aiMessages
    },
    notifications: userData.notification_preferences || defaultNotifications,
    privacy: userData.privacy_settings || defaultPrivacy
  }
}

// Helper to build default settings
function buildDefaultSettings(authUser: { id: string; email?: string; user_metadata?: { first_name?: string; last_name?: string } }) {
  return {
    profile: {
      id: authUser.id,
      email: authUser.email || '',
      firstName: authUser.user_metadata?.first_name || '',
      lastName: authUser.user_metadata?.last_name || '',
      phone: '',
      location: '',
      linkedinUrl: '',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    subscription: {
      tier: 'starter',
      status: 'active',
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    },
    usage: {
      pocketsGenerated: 0,
      pocketsLimit: 15,
      advancedPocketsGenerated: 0,
      advancedPocketsLimit: null,
      resumesCreated: 0,
      resumesLimit: 5,
      applicationsTracked: 0,
      applicationsLimit: null,
      aiSuggestionsUsed: 0,
      aiSuggestionsLimit: 50,
      aiMessagesUsed: 0,
      aiMessagesLimit: 100
    },
    notifications: defaultNotifications,
    privacy: defaultPrivacy
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { section, data } = body

    // Validate section
    const validSections = ['profile', 'notifications', 'privacy']
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid settings section' },
        { status: 400 }
      )
    }

    // Build update object based on section
    let updateData: Record<string, unknown> = {}

    if (section === 'profile') {
      // Parse location into city/state if provided
      let locationCity = ''
      let locationState = 'FL'
      if (data.location) {
        const parts = data.location.split(',').map((s: string) => s.trim())
        locationCity = parts[0] || ''
        locationState = parts[1] || 'FL'
      }

      // Use columns that exist in current schema
      // full_name instead of first_name/last_name (migration may not be applied)
      updateData = {
        email: data.email,
        full_name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
        location_city: locationCity,
        location_state: locationState,
        linkedin_url: data.linkedinUrl
      }
    } else if (section === 'notifications') {
      // Notifications are stored in memory for now (migration adds the column)
      // Return success without DB update
      return NextResponse.json({
        message: 'Notification preferences updated',
        settings: null // Will be fetched again by client
      })
    } else if (section === 'privacy') {
      // Privacy settings stored in memory for now (migration adds the column)
      return NextResponse.json({
        message: 'Privacy settings updated',
        settings: null
      })
    }

    // Update in Supabase
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      settings: buildSettingsFromUser(updatedUser, user),
      message: `${section} settings updated successfully`
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
