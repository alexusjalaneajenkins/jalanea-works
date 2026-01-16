/**
 * Interview Prep API
 *
 * POST /api/interview-prep - Start practice session or submit answer
 * GET /api/interview-prep - Get questions and interview types
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateAnswerFeedback,
  generatePracticeQuestions,
  getInterviewPrepChecklist,
  getQuestionsToAsk
} from '@/lib/interview-prep'
import {
  INTERVIEW_QUESTIONS,
  QUESTION_CATEGORIES,
  INTERVIEW_TYPES
} from '@/data/interview-questions'

/**
 * POST - Practice session operations
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'start_session': {
        const { jobTitle, companyName, interviewType, questionCount = 5 } = body

        // Generate practice questions
        const questions = generatePracticeQuestions(
          jobTitle,
          companyName,
          interviewType,
          questionCount
        )

        // Get prep checklist
        const checklist = getInterviewPrepChecklist(interviewType || 'video', 7)

        // Get questions to ask
        const questionsToAsk = getQuestionsToAsk(jobTitle, companyName)

        return NextResponse.json({
          sessionId: crypto.randomUUID(),
          questions,
          checklist,
          questionsToAsk,
          interviewType: interviewType || 'video'
        })
      }

      case 'submit_answer': {
        const { questionId, answer, jobTitle, companyName } = body

        // Find the question
        const question = INTERVIEW_QUESTIONS.find(q => q.id === questionId)
        if (!question) {
          return NextResponse.json(
            { error: 'Question not found' },
            { status: 404 }
          )
        }

        // Generate feedback
        const feedback = await generateAnswerFeedback(
          question,
          answer,
          jobTitle,
          companyName
        )

        return NextResponse.json({
          questionId,
          feedback
        })
      }

      case 'get_checklist': {
        const { interviewType, daysUntil = 7 } = body
        const checklist = getInterviewPrepChecklist(interviewType, daysUntil)

        return NextResponse.json({ checklist })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Interview prep error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get interview prep resources
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const difficulty = searchParams.get('difficulty')

  let questions = INTERVIEW_QUESTIONS

  // Filter by category
  if (category) {
    questions = questions.filter(q => q.category === category)
  }

  // Filter by difficulty
  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty)
  }

  return NextResponse.json({
    questions,
    categories: QUESTION_CATEGORIES,
    interviewTypes: INTERVIEW_TYPES,
    totalQuestions: INTERVIEW_QUESTIONS.length
  })
}
