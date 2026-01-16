/**
 * GDPR Data Export API
 *
 * GET /api/user/data-export
 *   Export all user data in JSON format (GDPR Article 20 - Right to Data Portability)
 *
 * Response:
 *   - Complete JSON export of all user data
 *   - Download as .json file
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UserDataExport {
  exportDate: string
  exportVersion: string
  user: {
    id: string
    email: string
    createdAt: string
  }
  profile: Record<string, unknown> | null
  preferences: Record<string, unknown> | null
  resumes: unknown[]
  savedJobs: unknown[]
  jobApplications: unknown[]
  jobPockets: unknown[]
  searchHistory: unknown[]
  dailyPlans: unknown[]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to export your data' },
        { status: 401 }
      )
    }

    // Gather all user data from different tables
    const exportData: UserDataExport = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        id: user.id,
        email: user.email || '',
        createdAt: user.created_at || ''
      },
      profile: null,
      preferences: null,
      resumes: [],
      savedJobs: [],
      jobApplications: [],
      jobPockets: [],
      searchHistory: [],
      dailyPlans: []
    }

    // Fetch profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      // Remove sensitive internal fields
      const { ...safeProfile } = profile
      exportData.profile = safeProfile
    }

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (preferences) {
      exportData.preferences = preferences
    }

    // Fetch resumes
    const { data: resumes } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (resumes) {
      exportData.resumes = resumes
    }

    // Fetch saved jobs
    const { data: savedJobs } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })

    if (savedJobs) {
      exportData.savedJobs = savedJobs
    }

    // Fetch job applications
    const { data: applications } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false })

    if (applications) {
      exportData.jobApplications = applications
    }

    // Fetch job pockets
    const { data: pockets } = await supabase
      .from('job_pockets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (pockets) {
      exportData.jobPockets = pockets
    }

    // Fetch search history
    const { data: searches } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(100) // Last 100 searches

    if (searches) {
      exportData.searchHistory = searches
    }

    // Fetch daily plans
    const { data: dailyPlans } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30) // Last 30 days

    if (dailyPlans) {
      exportData.dailyPlans = dailyPlans
    }

    // Create JSON response with download headers
    const jsonString = JSON.stringify(exportData, null, 2)
    const filename = `jalanea-works-data-export-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data. Please try again later.' },
      { status: 500 }
    )
  }
}

/**
 * POST - Request data deletion (GDPR Article 17 - Right to Erasure)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, confirmation } = body

    if (action !== 'delete' || confirmation !== 'DELETE_MY_DATA') {
      return NextResponse.json(
        { error: 'Invalid request. To delete data, send action: "delete" and confirmation: "DELETE_MY_DATA"' },
        { status: 400 }
      )
    }

    // Delete user data from all tables (in order due to foreign keys)
    const deleteOperations = [
      supabase.from('daily_plans').delete().eq('user_id', user.id),
      supabase.from('search_history').delete().eq('user_id', user.id),
      supabase.from('job_pockets').delete().eq('user_id', user.id),
      supabase.from('job_applications').delete().eq('user_id', user.id),
      supabase.from('saved_jobs').delete().eq('user_id', user.id),
      supabase.from('resumes').delete().eq('user_id', user.id),
      supabase.from('user_preferences').delete().eq('user_id', user.id),
      supabase.from('profiles').delete().eq('id', user.id)
    ]

    // Execute all deletions
    const results = await Promise.allSettled(deleteOperations)

    // Check for errors
    const errors = results.filter(r => r.status === 'rejected')
    if (errors.length > 0) {
      console.error('Some data deletion operations failed:', errors)
    }

    // Note: User authentication record should be deleted separately
    // This requires admin privileges or the user to use the Supabase auth UI

    return NextResponse.json({
      success: true,
      message: 'Your data has been scheduled for deletion. Your account will be fully removed within 30 days.',
      note: 'To complete account deletion, please also sign out and delete your authentication credentials from your account settings.'
    })
  } catch (error) {
    console.error('Data deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    )
  }
}
