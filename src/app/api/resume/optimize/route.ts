/**
 * POST /api/resume/optimize
 *
 * Analyze a resume against a job description for ATS compatibility
 *
 * Request body:
 *   - resumeText: string (full resume text content)
 *   - jobTitle: string
 *   - jobCompany: string
 *   - jobDescription: string
 *   - jobRequirements?: string[]
 *   - jobSkills?: string[]
 *
 * Response:
 *   - score: number (0-100)
 *   - keywordMatch: { matched, missing, matchRate }
 *   - sections: { name, score, feedback }[]
 *   - suggestions: ATSSuggestion[]
 *   - formatting: { score, issues }
 *   - readability: { score, gradeLevel }
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  analyzeResumeATS,
  type ATSAnalysis,
  type ResumeData,
  type JobData
} from '@/lib/ats-optimizer'

interface OptimizeRequestBody {
  resumeText: string
  jobTitle: string
  jobCompany: string
  jobDescription: string
  jobRequirements?: string[]
  jobSkills?: string[]
  fileName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeRequestBody = await request.json()

    // Validate required fields
    if (!body.resumeText || body.resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is required and must be at least 50 characters' },
        { status: 400 }
      )
    }

    if (!body.jobDescription || body.jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Prepare resume data
    const resume: ResumeData = {
      fullText: body.resumeText,
      fileName: body.fileName
    }

    // Prepare job data
    const job: JobData = {
      title: body.jobTitle || 'Unknown Position',
      company: body.jobCompany || 'Unknown Company',
      description: body.jobDescription,
      requirements: body.jobRequirements,
      skills: body.jobSkills
    }

    // Run ATS analysis
    const analysis = analyzeResumeATS(resume, job)

    // Return full analysis
    return NextResponse.json({
      success: true,
      analysis,
      summary: {
        score: analysis.score,
        keywordMatchRate: analysis.keywordMatch.matchRate,
        criticalSuggestions: analysis.suggestions.filter(s => s.type === 'critical').length,
        importantSuggestions: analysis.suggestions.filter(s => s.type === 'important').length
      }
    })
  } catch (error) {
    console.error('Resume optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}

// GET endpoint for quick score check
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const resumeText = searchParams.get('resume')
  const jobDescription = searchParams.get('job')

  if (!resumeText || !jobDescription) {
    return NextResponse.json(
      { error: 'Both resume and job query parameters are required' },
      { status: 400 }
    )
  }

  try {
    const resume: ResumeData = { fullText: decodeURIComponent(resumeText) }
    const job: JobData = {
      title: '',
      company: '',
      description: decodeURIComponent(jobDescription)
    }

    const analysis = analyzeResumeATS(resume, job)

    return NextResponse.json({
      score: analysis.score,
      keywordMatchRate: analysis.keywordMatch.matchRate,
      topMissingKeywords: analysis.keywordMatch.missing.slice(0, 5),
      criticalIssues: analysis.suggestions
        .filter(s => s.type === 'critical')
        .map(s => s.title)
    })
  } catch (error) {
    console.error('Quick ATS check error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze' },
      { status: 500 }
    )
  }
}
