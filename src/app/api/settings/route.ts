/**
 * Settings API
 *
 * GET /api/settings - Get user settings
 * PUT /api/settings - Update user settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Subscription tier type
type SubscriptionTier = 'essential' | 'starter' | 'premium' | 'unlimited'

// Mock user settings for demo
const mockSettings = {
  profile: {
    id: 'demo-user',
    email: 'alex.johnson@email.com',
    firstName: 'Alex',
    lastName: 'Johnson',
    phone: '(407) 555-0123',
    location: 'Orlando, FL',
    linkedinUrl: 'linkedin.com/in/alexjohnson',
    avatarUrl: null,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  subscription: {
    tier: 'starter' as SubscriptionTier,
    status: 'active' as const,
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false
  },
  usage: {
    pocketsGenerated: 8,
    pocketsLimit: 15,
    advancedPocketsGenerated: 0,
    advancedPocketsLimit: null, // Not available for Starter tier
    resumesCreated: 2,
    resumesLimit: 5,
    applicationsTracked: 12,
    applicationsLimit: null, // unlimited for starter
    aiSuggestionsUsed: 23,
    aiSuggestionsLimit: 50,
    aiMessagesUsed: 45,
    aiMessagesLimit: 100
  },
  notifications: {
    emailApplicationUpdates: true,
    emailJobAlerts: true,
    emailWeeklyDigest: false,
    emailProductUpdates: true,
    pushInterviewReminders: true,
    pushApplicationDeadlines: true,
    pushNewMatches: false
  },
  privacy: {
    profileVisible: true,
    allowDataAnalytics: true,
    allowPersonalization: true
  }
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

    // In production, fetch from Supabase
    // const { data: settings, error } = await supabase
    //   .from('user_settings')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .single()

    return NextResponse.json({
      settings: mockSettings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
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

    // In production, update in Supabase
    // const { data: updated, error } = await supabase
    //   .from('user_settings')
    //   .update({ [section]: data, updated_at: new Date().toISOString() })
    //   .eq('user_id', user.id)
    //   .select()
    //   .single()

    // Return updated settings
    const updatedSettings = {
      ...mockSettings,
      [section]: { ...mockSettings[section as keyof typeof mockSettings], ...data }
    }

    return NextResponse.json({
      settings: updatedSettings,
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
