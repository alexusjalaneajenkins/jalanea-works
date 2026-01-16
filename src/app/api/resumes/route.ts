/**
 * Resumes API
 *
 * GET /api/resumes - Get all resumes for the current user
 * POST /api/resumes - Create a new resume
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock resume data for demo
const mockResume = {
  id: '1',
  userId: 'demo-user',
  name: 'My Resume',
  template: 'modern',
  contact: {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@email.com',
    phone: '(407) 555-0123',
    location: 'Orlando, FL',
    linkedin: 'linkedin.com/in/alexjohnson'
  },
  summary: 'Dedicated customer service professional with 3+ years of experience in fast-paced retail environments. Known for exceptional communication skills, problem-solving abilities, and a commitment to providing outstanding customer experiences. Seeking to leverage my skills in a professional office setting.',
  experience: [
    {
      id: '1',
      company: 'Target',
      title: 'Guest Service Team Lead',
      location: 'Orlando, FL',
      startDate: '2022-06',
      isCurrent: true,
      description: '',
      highlights: [
        'Led a team of 8 associates to deliver exceptional guest experiences, achieving 95% satisfaction scores',
        'Trained and mentored new team members on company policies, procedures, and service standards',
        'Resolved complex customer issues and complaints, maintaining composure in high-pressure situations',
        'Managed daily operations including scheduling, inventory, and cash handling procedures'
      ]
    },
    {
      id: '2',
      company: 'Publix Super Markets',
      title: 'Customer Service Clerk',
      location: 'Orlando, FL',
      startDate: '2020-08',
      endDate: '2022-05',
      isCurrent: false,
      description: '',
      highlights: [
        'Provided friendly, efficient service to 100+ customers daily at checkout and customer service desk',
        'Processed returns, exchanges, and special orders accurately and efficiently',
        'Maintained clean and organized work area, contributing to positive store appearance',
        'Recognized as Employee of the Month twice for exceptional customer service'
      ]
    }
  ],
  education: [
    {
      id: '1',
      school: 'Valencia College',
      degree: 'Associate of Arts',
      field: 'Business Administration',
      location: 'Orlando, FL',
      graduationDate: '2024-05',
      gpa: '3.6',
      honors: "Dean's List"
    }
  ],
  skills: [
    { id: '1', name: 'Customer Service' },
    { id: '2', name: 'Team Leadership' },
    { id: '3', name: 'Problem Solving' },
    { id: '4', name: 'Microsoft Office' },
    { id: '5', name: 'Communication' },
    { id: '6', name: 'Cash Handling' },
    { id: '7', name: 'POS Systems' },
    { id: '8', name: 'Conflict Resolution' },
    { id: '9', name: 'Time Management' },
    { id: '10', name: 'Bilingual (Spanish)' }
  ],
  certifications: [],
  projects: [],
  atsScore: 78,
  lastUpdated: new Date().toISOString(),
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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
    // const { data: resumes, error } = await supabase
    //   .from('resumes')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .order('updated_at', { ascending: false })

    // For now, return mock data
    return NextResponse.json({
      resumes: [mockResume]
    })
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Create new resume
    const now = new Date().toISOString()
    const newResume = {
      id: Date.now().toString(),
      userId: user.id,
      name: body.name || 'My Resume',
      template: body.template || 'modern',
      contact: body.contact || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: ''
      },
      summary: body.summary || '',
      experience: body.experience || [],
      education: body.education || [],
      skills: body.skills || [],
      certifications: body.certifications || [],
      projects: body.projects || [],
      createdAt: now,
      lastUpdated: now
    }

    // In production, insert into Supabase
    // const { data, error } = await supabase
    //   .from('resumes')
    //   .insert(newResume)
    //   .select()
    //   .single()

    return NextResponse.json({
      resume: newResume
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating resume:', error)
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    )
  }
}
