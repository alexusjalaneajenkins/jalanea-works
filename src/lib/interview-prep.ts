/**
 * Interview Prep Engine
 *
 * AI-powered interview preparation with practice questions,
 * answer feedback, and scheduling integration.
 */

import {
  INTERVIEW_QUESTIONS,
  QUESTION_CATEGORIES,
  INTERVIEW_TYPES,
  getRandomQuestions,
  type InterviewQuestion
} from '@/data/interview-questions'

// Types
export interface PracticeSession {
  id: string
  userId: string
  jobTitle?: string
  companyName?: string
  interviewType: string
  questions: InterviewQuestion[]
  answers: PracticeAnswer[]
  startedAt: Date
  completedAt?: Date
  overallScore?: number
}

export interface PracticeAnswer {
  questionId: string
  answer: string
  feedback?: AnswerFeedback
  recordingUrl?: string
  answeredAt: Date
}

export interface AnswerFeedback {
  score: number // 1-10
  strengths: string[]
  improvements: string[]
  revisedAnswer?: string
  tips: string[]
}

export interface InterviewSchedule {
  id: string
  userId: string
  applicationId?: string
  companyName: string
  jobTitle: string
  interviewType: string
  scheduledAt: Date
  durationMinutes: number
  location?: string
  isVirtual: boolean
  meetingLink?: string
  interviewerNames?: string[]
  notes?: string
  prepCompleted: boolean
  reminderSent: boolean
}

/**
 * Build prompt for answer feedback
 */
export function buildFeedbackPrompt(
  question: InterviewQuestion,
  answer: string,
  jobTitle?: string,
  companyName?: string
): string {
  return `You are an expert interview coach helping a Valencia College graduate prepare for job interviews.

INTERVIEW QUESTION:
"${question.question}"

Question category: ${question.category}
Difficulty: ${question.difficulty}
${jobTitle ? `Target job: ${jobTitle}` : ''}
${companyName ? `Target company: ${companyName}` : ''}

CANDIDATE'S ANSWER:
"${answer}"

TIPS FOR THIS QUESTION:
${question.tips.map(t => `- ${t}`).join('\n')}

${question.exampleAnswer ? `EXAMPLE GOOD ANSWER:\n"${question.exampleAnswer}"` : ''}

Please provide feedback in the following JSON format:
{
  "score": <number 1-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "revisedAnswer": "An improved version of their answer",
  "tips": ["specific tip 1", "specific tip 2"]
}

Feedback guidelines:
- Be encouraging but honest
- Highlight what they did well
- Give specific, actionable improvements
- The revised answer should sound natural, not robotic
- Keep tips relevant to entry-level candidates
- Consider Orlando job market context`
}

/**
 * Generate feedback for an answer using AI
 */
export async function generateAnswerFeedback(
  question: InterviewQuestion,
  answer: string,
  jobTitle?: string,
  companyName?: string
): Promise<AnswerFeedback> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey) {
    return generateFallbackFeedback(question, answer)
  }

  const prompt = buildFeedbackPrompt(question, answer, jobTitle, companyName)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        })
      }
    )

    if (!response.ok) {
      return generateFallbackFeedback(question, answer)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return generateFallbackFeedback(question, answer)
    }

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return generateFallbackFeedback(question, answer)
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      score: Math.min(10, Math.max(1, result.score || 5)),
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      revisedAnswer: result.revisedAnswer,
      tips: result.tips || []
    }
  } catch (error) {
    console.error('Feedback generation error:', error)
    return generateFallbackFeedback(question, answer)
  }
}

/**
 * Generate fallback feedback when AI is unavailable
 */
function generateFallbackFeedback(
  question: InterviewQuestion,
  answer: string
): AnswerFeedback {
  const answerLength = answer.length
  const hasSpecificExample = /when|time|example|situation/i.test(answer)
  const usesStarMethod = /situation|task|action|result/i.test(answer)
  const mentionsQuantification = /\d+|percent|increase|decrease|improve/i.test(answer)

  // Calculate basic score
  let score = 5
  if (answerLength > 100) score += 1
  if (answerLength > 200) score += 1
  if (hasSpecificExample) score += 1
  if (usesStarMethod) score += 1
  if (mentionsQuantification) score += 1
  score = Math.min(10, score)

  const strengths: string[] = []
  const improvements: string[] = []
  const tips: string[] = [...question.tips.slice(0, 2)]

  if (answerLength > 150) {
    strengths.push('Good level of detail in your response')
  } else {
    improvements.push('Consider adding more specific details or examples')
  }

  if (hasSpecificExample) {
    strengths.push('You included a specific example, which is excellent')
  } else {
    improvements.push('Try to include a specific example from your experience')
  }

  if (question.category === 'behavioral' && !usesStarMethod) {
    tips.push('For behavioral questions, use the STAR method: Situation, Task, Action, Result')
  }

  return {
    score,
    strengths,
    improvements,
    tips
  }
}

/**
 * Generate practice questions for a specific job/company
 */
export function generatePracticeQuestions(
  jobTitle?: string,
  companyName?: string,
  interviewType?: string,
  count: number = 5
): InterviewQuestion[] {
  let questions: InterviewQuestion[] = []

  // Always include common questions
  const essentialQuestions = INTERVIEW_QUESTIONS.filter(q =>
    ['tell-me-about-yourself', 'why-this-company', 'greatest-strength'].includes(q.id)
  )

  // Add behavioral questions (most common)
  const behavioralQuestions = INTERVIEW_QUESTIONS.filter(q =>
    q.category === 'behavioral'
  )

  // Add situational questions
  const situationalQuestions = INTERVIEW_QUESTIONS.filter(q =>
    q.category === 'situational'
  )

  // Combine and shuffle
  questions = [
    ...essentialQuestions.slice(0, 2),
    ...behavioralQuestions.slice(0, 2),
    ...getRandomQuestions(count - 4)
  ]

  // Remove duplicates
  const seen = new Set<string>()
  questions = questions.filter(q => {
    if (seen.has(q.id)) return false
    seen.add(q.id)
    return true
  })

  return questions.slice(0, count)
}

/**
 * Calculate prep checklist for an interview
 */
export function getInterviewPrepChecklist(
  interviewType: string,
  daysUntilInterview: number
): { task: string; priority: 'high' | 'medium' | 'low'; completed?: boolean }[] {
  const checklist = [
    { task: 'Research the company website and recent news', priority: 'high' as const },
    { task: 'Review the job description and requirements', priority: 'high' as const },
    { task: 'Prepare your "Tell me about yourself" answer', priority: 'high' as const },
    { task: 'Practice common interview questions', priority: 'high' as const },
    { task: 'Prepare 3-5 questions to ask the interviewer', priority: 'high' as const },
    { task: 'Review your resume and be ready to discuss any item', priority: 'medium' as const },
    { task: 'Plan your outfit the night before', priority: 'medium' as const },
    { task: 'Prepare examples using the STAR method', priority: 'medium' as const },
    { task: 'Research your interviewers on LinkedIn', priority: 'low' as const },
    { task: 'Practice with a friend or family member', priority: 'low' as const }
  ]

  // Add type-specific tasks
  const typeInfo = INTERVIEW_TYPES.find(t => t.id === interviewType)
  if (typeInfo) {
    typeInfo.tips.forEach(tip => {
      checklist.push({ task: tip, priority: 'medium' as const })
    })
  }

  // Add video-specific tasks
  if (interviewType === 'video') {
    checklist.unshift(
      { task: 'Test your camera and microphone', priority: 'high' as const },
      { task: 'Check your internet connection', priority: 'high' as const },
      { task: 'Set up good lighting facing you', priority: 'medium' as const }
    )
  }

  // Add in-person specific tasks
  if (interviewType === 'in-person') {
    checklist.unshift(
      { task: 'Plan your route and parking', priority: 'high' as const },
      { task: 'Print extra copies of your resume', priority: 'medium' as const }
    )
  }

  return checklist
}

/**
 * Generate questions to ask the interviewer
 */
export function getQuestionsToAsk(jobTitle?: string, companyName?: string): string[] {
  const questions = [
    'What does a typical day look like in this role?',
    'What are the biggest challenges someone in this position would face?',
    'How would you describe the team culture here?',
    'What opportunities for growth and development are available?',
    'What does success look like in this role after 90 days?',
    'What do you enjoy most about working here?',
    'How has this role evolved since it was created?',
    'What are the next steps in the interview process?',
    'Is there anything about my background that concerns you?',
    'How does this team collaborate with other departments?'
  ]

  // Shuffle and return 5
  return questions.sort(() => Math.random() - 0.5).slice(0, 5)
}

/**
 * Calculate interview readiness score
 */
export function calculateReadinessScore(
  practiceAnswers: PracticeAnswer[],
  checklistCompleted: number,
  checklistTotal: number
): { score: number; level: string; message: string } {
  // Average practice score
  const avgPracticeScore = practiceAnswers.length > 0
    ? practiceAnswers.reduce((sum, a) => sum + (a.feedback?.score || 5), 0) / practiceAnswers.length
    : 0

  // Checklist completion
  const checklistScore = checklistTotal > 0 ? (checklistCompleted / checklistTotal) * 10 : 0

  // Combined score (practice weighted more)
  const score = Math.round((avgPracticeScore * 0.6 + checklistScore * 0.4) * 10) / 10

  let level: string
  let message: string

  if (score >= 8) {
    level = 'Ready!'
    message = 'You\'re well-prepared for your interview. Go get that job!'
  } else if (score >= 6) {
    level = 'Almost There'
    message = 'Good progress! A bit more practice will boost your confidence.'
  } else if (score >= 4) {
    level = 'Keep Practicing'
    message = 'You\'re making progress. Complete more prep tasks to feel confident.'
  } else {
    level = 'Just Starting'
    message = 'Begin with the high-priority checklist items and practice common questions.'
  }

  return { score, level, message }
}

export default {
  generateAnswerFeedback,
  generatePracticeQuestions,
  getInterviewPrepChecklist,
  getQuestionsToAsk,
  calculateReadinessScore
}
