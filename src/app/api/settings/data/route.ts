/**
 * User Data Export API
 *
 * GET /api/settings/data - Download all user data
 * DELETE /api/settings/data - Delete account and all data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // In production, gather all user data from various tables
    // const [resumes, applications, pockets, settings] = await Promise.all([
    //   supabase.from('resumes').select('*').eq('user_id', user.id),
    //   supabase.from('applications').select('*').eq('user_id', user.id),
    //   supabase.from('job_pockets').select('*').eq('user_id', user.id),
    //   supabase.from('user_settings').select('*').eq('user_id', user.id)
    // ])

    // Mock user data export
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      },
      profile: {
        firstName: 'Alex',
        lastName: 'Johnson',
        location: 'Orlando, FL',
        phone: '(407) 555-0123'
      },
      resumes: [
        {
          id: '1',
          name: 'My Resume',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString()
        }
      ],
      applications: [
        {
          id: '1',
          jobTitle: 'Administrative Assistant',
          company: 'Orlando Health',
          status: 'interviewing',
          appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      savedJobs: [],
      jobPockets: [],
      settings: {
        notifications: {
          emailApplicationUpdates: true,
          emailJobAlerts: true
        },
        privacy: {
          profileVisible: true
        }
      }
    }

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="jalanea-works-data-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In production, this would:
    // 1. Cancel any active subscriptions
    // 2. Delete all user data from all tables
    // 3. Delete the user's auth account
    // 4. Send confirmation email

    // const deletions = await Promise.all([
    //   supabase.from('resumes').delete().eq('user_id', user.id),
    //   supabase.from('applications').delete().eq('user_id', user.id),
    //   supabase.from('job_pockets').delete().eq('user_id', user.id),
    //   supabase.from('saved_jobs').delete().eq('user_id', user.id),
    //   supabase.from('user_settings').delete().eq('user_id', user.id)
    // ])
    //
    // await supabase.auth.admin.deleteUser(user.id)

    // For demo, just return success
    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been deleted'
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
