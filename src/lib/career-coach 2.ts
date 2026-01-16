/**
 * Career Coach
 *
 * AI-powered career coaching using the OSKAR framework.
 * Available for Premium tier users.
 */

import {
  OSKAR_PHASES,
  COACHING_TOPICS,
  VALENCIA_CONTEXT,
  getPhase,
  getNextPhase,
  type OSKARPhase
} from '@/data/oskar-framework'

// Types
export interface CoachingMessage {
  id: string
  role: 'user' | 'coach'
  content: string
  timestamp: Date
  phase?: string
  topic?: string
}

export interface CoachingSession {
  id: string
  userId: string
  messages: CoachingMessage[]
  currentPhase: string
  topic?: string
  scalingScore?: number
  goals?: string[]
  actionItems?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CoachingContext {
  userName?: string
  careerGoal?: string
  currentRole?: string
  targetRole?: string
  valenciaProgram?: string
  challenges?: string[]
  strengths?: string[]
}

/**
 * Build the system prompt for the career coach
 */
export function buildCoachSystemPrompt(
  context: CoachingContext,
  currentPhase: string,
  topic?: string
): string {
  const phase = getPhase(currentPhase)

  return `You are an empathetic, supportive career coach for Jalanea Works, a job search platform for Valencia College students and graduates in Orlando, FL.

Your coaching style uses the OSKAR framework:
- O (Outcome): Help define clear, achievable goals
- S (Scaling): Assess current progress on a 1-10 scale
- K (Know-how): Identify transferable skills and resources
- A (Affirm & Action): Celebrate wins and create action plans
- R (Review): Set up accountability and track progress

CURRENT PHASE: ${phase?.name || 'Outcome'} (${phase?.description || ''})
${topic ? `CURRENT TOPIC: ${topic}` : ''}

USER CONTEXT:
${context.userName ? `- Name: ${context.userName}` : ''}
${context.careerGoal ? `- Career Goal: ${context.careerGoal}` : ''}
${context.currentRole ? `- Current/Recent Role: ${context.currentRole}` : ''}
${context.targetRole ? `- Target Role: ${context.targetRole}` : ''}
${context.valenciaProgram ? `- Valencia Program: ${context.valenciaProgram}` : ''}
${context.challenges?.length ? `- Challenges: ${context.challenges.join(', ')}` : ''}
${context.strengths?.length ? `- Strengths: ${context.strengths.join(', ')}` : ''}

ORLANDO CONTEXT:
- Major employers: ${VALENCIA_CONTEXT.majorEmployers.slice(0, 5).join(', ')}
- Growing industries: ${VALENCIA_CONTEXT.growthIndustries.join(', ')}
- Valencia resources: ${VALENCIA_CONTEXT.valenciaResources.join(', ')}

GUIDELINES:
1. Be warm, encouraging, and solution-focused
2. Ask one question at a time to keep conversations manageable
3. Use the user's name when appropriate
4. Reference Orlando job market specifics when relevant
5. Celebrate small wins and progress
6. Keep responses concise (2-3 paragraphs max)
7. Suggest specific, actionable next steps
8. Use the OSKAR phase questions as a guide
9. If the user seems stuck, help them see their progress
10. Remember: you're a coach, not a therapist - focus on career goals

${phase ? `PHASE-SPECIFIC GUIDANCE:
Questions to consider: ${phase.questions.join(' | ')}` : ''}

Respond as a supportive career coach who genuinely wants to help this Valencia graduate succeed.`
}

/**
 * Generate coaching response using Gemini
 */
export async function generateCoachResponse(
  messages: CoachingMessage[],
  context: CoachingContext,
  currentPhase: string,
  topic?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    return generateFallbackResponse(messages, currentPhase)
  }

  const systemPrompt = buildCoachSystemPrompt(context, currentPhase, topic)

  // Format conversation history
  const conversationHistory = messages.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }))

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            topP: 0.9
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
          ]
        })
      }
    )

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return generateFallbackResponse(messages, currentPhase)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return generateFallbackResponse(messages, currentPhase)
    }

    return text
  } catch (error) {
    console.error('Career coach error:', error)
    return generateFallbackResponse(messages, currentPhase)
  }
}

/**
 * Generate fallback response when AI is unavailable
 */
function generateFallbackResponse(messages: CoachingMessage[], currentPhase: string): string {
  const phase = getPhase(currentPhase)
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()

  const responses: Record<string, string[]> = {
    outcome: [
      "That's a great goal to work toward! Let me help you break it down into manageable steps. What does success look like for you in the next 30 days?",
      "I hear you. Career transitions can feel overwhelming, but you're taking the right first step by getting clear on what you want. What's most important to you in your next role?",
      "Setting clear goals is powerful. Based on what you've shared, it sounds like you're looking for a role that offers both growth and stability. Is that right?"
    ],
    scaling: [
      "Thank you for being honest about where you are. That self-awareness is actually a strength! What do you think has helped you get to this point?",
      "I appreciate you sharing that. The fact that you're here working on this shows commitment. What would need to happen to move you one point higher on that scale?",
      "That's a solid starting point. Many successful job seekers started exactly where you are now. What feels like the biggest obstacle right now?"
    ],
    knowhow: [
      "You have more skills than you might realize! Your experience in customer-facing roles translates directly to many office positions. What other experiences have taught you valuable skills?",
      "Valencia College graduates have access to some great resources. Have you connected with Career Services? They offer resume reviews and mock interviews.",
      "Let's think about your network. Sometimes opportunities come through people we already know. Who do you know who works in your target industry?"
    ],
    affirm: [
      "You're making progress! Every step forward counts, even the small ones. What's one thing you could do this week to move closer to your goal?",
      "I can see you're committed to this. Let's create an action plan that feels doable. What does your schedule look like this week?",
      "Great insight! Now let's turn that into action. What's the smallest step you could take today to build momentum?"
    ],
    review: [
      "Tracking progress helps you see how far you've come. Would you like to set a weekly check-in time to review your job search activities?",
      "Accountability is key. How would you like to celebrate when you hit your first milestone?",
      "Let's think about potential obstacles. What might get in the way of your plan, and how can you prepare for those challenges?"
    ]
  }

  const phaseResponses = responses[currentPhase] || responses.outcome
  return phaseResponses[Math.floor(Math.random() * phaseResponses.length)]
}

/**
 * Detect which OSKAR phase the conversation is in based on message content
 */
export function detectPhase(messages: CoachingMessage[]): string {
  const recentMessages = messages.slice(-5)
  const content = recentMessages.map(m => m.content.toLowerCase()).join(' ')

  // Phase detection keywords
  const phaseKeywords: Record<string, string[]> = {
    outcome: ['goal', 'want', 'achieve', 'dream', 'hope', 'looking for', 'ideal', 'success'],
    scaling: ['scale', 'rate', 'stuck', 'progress', 'where am i', 'how close', 'obstacle'],
    knowhow: ['skills', 'experience', 'strengths', 'resources', 'help', 'support', 'know'],
    affirm: ['action', 'plan', 'next step', 'do', 'start', 'this week', 'tomorrow'],
    review: ['track', 'measure', 'check in', 'follow up', 'accountability', 'celebrate']
  }

  let bestPhase = 'outcome'
  let maxMatches = 0

  for (const [phase, keywords] of Object.entries(phaseKeywords)) {
    const matches = keywords.filter(kw => content.includes(kw)).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestPhase = phase
    }
  }

  return bestPhase
}

/**
 * Extract action items from conversation
 */
export function extractActionItems(messages: CoachingMessage[]): string[] {
  const actionItems: string[] = []
  const actionPatterns = [
    /I will (.+?)(?:\.|$)/gi,
    /I'm going to (.+?)(?:\.|$)/gi,
    /I'll (.+?)(?:\.|$)/gi,
    /my plan is to (.+?)(?:\.|$)/gi,
    /I commit to (.+?)(?:\.|$)/gi
  ]

  for (const message of messages.filter(m => m.role === 'user')) {
    for (const pattern of actionPatterns) {
      const matches = message.content.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && match[1].length > 5 && match[1].length < 100) {
          actionItems.push(match[1].trim())
        }
      }
    }
  }

  return [...new Set(actionItems)].slice(0, 5)
}

/**
 * Extract scaling score from conversation
 */
export function extractScalingScore(messages: CoachingMessage[]): number | undefined {
  const patterns = [
    /I'?m at (?:a )?(\d+)/i,
    /(\d+) out of 10/i,
    /scale.+?(\d+)/i,
    /rate.+?(\d+)/i
  ]

  for (const message of messages.filter(m => m.role === 'user').reverse()) {
    for (const pattern of patterns) {
      const match = message.content.match(pattern)
      if (match && match[1]) {
        const score = parseInt(match[1])
        if (score >= 1 && score <= 10) {
          return score
        }
      }
    }
  }

  return undefined
}

/**
 * Generate initial greeting based on context
 */
export function generateGreeting(context: CoachingContext, topic?: string): string {
  const name = context.userName ? `, ${context.userName}` : ''
  const topicIntro = topic
    ? `I see you'd like to work on ${COACHING_TOPICS.find(t => t.id === topic)?.name.toLowerCase() || topic}. `
    : ''

  const greetings = [
    `Hi${name}! I'm your Career Coach, here to help you navigate your job search journey. ${topicIntro}What's on your mind today?`,
    `Welcome${name}! I'm here to support you in reaching your career goals. ${topicIntro}Let's start by understanding what you'd like to achieve.`,
    `Hello${name}! Great to connect with you. ${topicIntro}I'm curious - what would make our conversation today most valuable for you?`
  ]

  return greetings[Math.floor(Math.random() * greetings.length)]
}

/**
 * Get suggested prompts based on current phase
 */
export function getSuggestedPrompts(currentPhase: string): string[] {
  const phase = getPhase(currentPhase)
  return phase?.prompts || OSKAR_PHASES[0].prompts
}

export default {
  generateCoachResponse,
  detectPhase,
  extractActionItems,
  extractScalingScore,
  generateGreeting,
  getSuggestedPrompts,
  buildCoachSystemPrompt
}
