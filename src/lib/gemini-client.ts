/**
 * Google Gemini AI Client
 *
 * Integrates with Google's Gemini API for AI-powered features:
 * - Job Pocket generation (Tier 1, 2, 3)
 * - Resume optimization
 * - Career coaching
 *
 * Setup:
 * 1. Get API key from https://aistudio.google.com/app/apikey
 * 2. Add GEMINI_API_KEY to .env.local
 *
 * Models:
 * - gemini-3.0-flash: Fast, for Tier 1/2 pockets (cheaper, lower latency)
 * - gemini-3.0-pro: Powerful, for Tier 3 pockets (better quality, deeper analysis)
 */

// Types
export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[]
    }
    finishReason: string
    safetyRatings: {
      category: string
      probability: string
    }[]
  }[]
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export interface GeminiError {
  error: {
    code: number
    message: string
    status: string
  }
}

export type GeminiModel = 'gemini-3.0-flash' | 'gemini-3.0-pro'

// API endpoints
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

/**
 * Generate content using Gemini
 */
export async function generateContent(
  prompt: string,
  options: {
    model?: GeminiModel
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const model = options.model || 'gemini-3.0-flash'
  const temperature = options.temperature ?? 0.7
  const maxTokens = options.maxTokens || 4096

  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`

  // Build content parts
  const contents: GeminiMessage[] = []

  // Add system prompt as first user message if provided
  if (options.systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: options.systemPrompt }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: 'I understand. I will follow these instructions.' }]
    })
  }

  // Add the main prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  })

  const body = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topP: 0.95,
      topK: 40
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json() as GeminiError
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json() as GeminiResponse

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini')
    }

    const text = data.candidates[0].content.parts
      .map(part => part.text)
      .join('')

    return text
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}

/**
 * Generate JSON response from Gemini
 */
export async function generateJSON<T>(
  prompt: string,
  options: {
    model?: GeminiModel
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}
): Promise<T> {
  const jsonSystemPrompt = `${options.systemPrompt || ''}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations.
The response must be parseable by JSON.parse().`

  const text = await generateContent(prompt, {
    ...options,
    systemPrompt: jsonSystemPrompt,
    temperature: options.temperature ?? 0.5 // Lower temp for JSON
  })

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonStr = text.trim()

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7)
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3)
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3)
  }
  jsonStr = jsonStr.trim()

  try {
    return JSON.parse(jsonStr) as T
  } catch (parseError) {
    console.error('Failed to parse Gemini JSON response:', text)
    throw new Error('Invalid JSON response from Gemini')
  }
}

// =============================================================================
// JOB POCKET GENERATION
// =============================================================================

interface JobData {
  title: string
  company: string
  location: string
  description?: string
  requirements?: string[]
  benefits?: string[]
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  valenciaMatch?: boolean
  valenciaMatchPercentage?: number
}

interface UserData {
  name: string
  resumeSummary?: string
  skills?: string[]
  education?: string
  experience?: string
}

/**
 * Generate Tier 1 Pocket using Gemini (20-second read)
 */
export async function generateTier1PocketAI(
  job: JobData,
  user: UserData
): Promise<{
  qualificationCheck: { status: string; missing: string[] }
  quickBrief: string
  talkingPoints: string[]
  likelyQuestions: string[]
  redFlags: string[]
  recommendation: 'APPLY_NOW' | 'CONSIDER' | 'SKIP'
}> {
  const prompt = `Analyze this job listing for ${user.name} and generate a quick job intelligence brief.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description || 'Not provided'}
- Requirements: ${job.requirements?.join(', ') || 'Not specified'}
- Salary: ${job.salaryMin && job.salaryMax ? `$${job.salaryMin}-$${job.salaryMax} ${job.salaryType}` : 'Not specified'}
${job.valenciaMatch ? `- Valencia College Match: ${job.valenciaMatchPercentage}%` : ''}

USER PROFILE:
- Name: ${user.name}
- Education: ${user.education || 'Not specified'}
- Experience: ${user.experience || 'Entry-level'}
- Skills: ${user.skills?.join(', ') || 'Not specified'}

Generate a JSON response with:
1. qualificationCheck: { status: "QUALIFIED" | "PARTIALLY_QUALIFIED" | "NOT_QUALIFIED", missing: [list of missing requirements] }
2. quickBrief: A 2-3 sentence summary of the opportunity (include salary, key benefits, Valencia match if applicable)
3. talkingPoints: 4-5 specific things the candidate should highlight in interviews
4. likelyQuestions: 5 interview questions they should prepare for
5. redFlags: Any concerns (empty array if none)
6. recommendation: "APPLY_NOW" | "CONSIDER" | "SKIP" based on overall fit`

  return generateJSON(prompt, {
    model: 'gemini-3.0-flash',
    systemPrompt: 'You are a career coach helping job seekers prepare for applications. Be encouraging but realistic.',
    temperature: 0.6
  })
}

/**
 * Generate Tier 2 Pocket using Gemini (90-second read)
 */
export async function generateTier2PocketAI(
  job: JobData,
  user: UserData
): Promise<{
  qualificationCheck: { status: string; missing: string[] }
  quickBrief: string
  talkingPoints: string[]
  likelyQuestions: string[]
  redFlags: string[]
  recommendation: 'APPLY_NOW' | 'CONSIDER' | 'SKIP'
  roleBreakdown: string
  whyHiring: string
  whatTheyWant: string
  cultureCheck: { score: number; notes: string }
  yourPositioning: string
}> {
  const prompt = `Provide a comprehensive job analysis for ${user.name}.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description || 'Not provided'}
- Requirements: ${job.requirements?.join(', ') || 'Not specified'}
- Benefits: ${job.benefits?.join(', ') || 'Not specified'}
- Salary: ${job.salaryMin && job.salaryMax ? `$${job.salaryMin}-$${job.salaryMax} ${job.salaryType}` : 'Not specified'}
${job.valenciaMatch ? `- Valencia College Match: ${job.valenciaMatchPercentage}%` : ''}

USER PROFILE:
- Name: ${user.name}
- Education: ${user.education || 'Not specified'}
- Experience: ${user.experience || 'Entry-level'}
- Skills: ${user.skills?.join(', ') || 'Not specified'}
- Resume Summary: ${user.resumeSummary || 'Not provided'}

Generate a JSON response with all Tier 1 fields PLUS:
- roleBreakdown: Detailed explanation of what the role involves
- whyHiring: Analysis of why the company is hiring (growth, turnover, new position)
- whatTheyWant: The ideal candidate profile based on the listing
- cultureCheck: { score: 1-10, notes: culture assessment }
- yourPositioning: Specific advice on how this candidate should position themselves`

  return generateJSON(prompt, {
    model: 'gemini-3.0-flash',
    systemPrompt: 'You are an expert career coach and job market analyst. Provide actionable, specific advice.',
    temperature: 0.6
  })
}

/**
 * Generate Tier 3 Pocket using Gemini Pro (5-10 minute read)
 */
export async function generateTier3PocketAI(
  job: JobData,
  user: UserData
): Promise<{
  // All Tier 2 fields plus:
  companyResearch: {
    overview: string
    culture: string
    recentNews: string[]
    glassdoorRating: number
    interviewProcess: string
  }
  salaryIntel: {
    marketRate: string
    negotiationTips: string[]
    totalCompEstimate: string
  }
  interviewPrep: {
    behavioralQuestions: string[]
    technicalQuestions: string[]
    questionsToAsk: string[]
    interviewTips: string[]
  }
  careerPath: {
    shortTerm: string
    mediumTerm: string
    longTerm: string
    skillsToDevlop: string[]
  }
  competitorAnalysis: string
  networkingTips: string[]
  dayInLife: string
  successMetrics: string[]
}> {
  const prompt = `Generate a comprehensive 8-page job intelligence report for ${user.name}.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Full Description: ${job.description || 'Not provided'}
- Requirements: ${job.requirements?.join('\n- ') || 'Not specified'}
- Benefits: ${job.benefits?.join(', ') || 'Not specified'}
- Salary Range: ${job.salaryMin && job.salaryMax ? `$${job.salaryMin}-$${job.salaryMax} ${job.salaryType}` : 'Not specified'}
${job.valenciaMatch ? `- Valencia College Match: ${job.valenciaMatchPercentage}% - their degree directly applies` : ''}

CANDIDATE PROFILE:
- Name: ${user.name}
- Education: ${user.education || 'Not specified'}
- Experience Level: ${user.experience || 'Entry-level'}
- Key Skills: ${user.skills?.join(', ') || 'Not specified'}
- Resume Summary: ${user.resumeSummary || 'Not provided'}

Generate a comprehensive JSON response with:

1. All Tier 1 fields (qualificationCheck, quickBrief, talkingPoints, likelyQuestions, redFlags, recommendation)
2. All Tier 2 fields (roleBreakdown, whyHiring, whatTheyWant, cultureCheck, yourPositioning)
3. companyResearch: { overview, culture, recentNews (3 items), glassdoorRating (realistic), interviewProcess }
4. salaryIntel: { marketRate, negotiationTips (5 items), totalCompEstimate }
5. interviewPrep: { behavioralQuestions (5), technicalQuestions (5), questionsToAsk (6), interviewTips (5) }
6. careerPath: { shortTerm, mediumTerm, longTerm, skillsToDevlop (5-6) }
7. competitorAnalysis: 1-2 paragraphs about similar employers
8. networkingTips: 5 specific networking strategies
9. dayInLife: 2-3 paragraph description
10. successMetrics: 5 KPIs for this role

Be specific, actionable, and realistic. This should read like a professional career consulting report.`

  return generateJSON(prompt, {
    model: 'gemini-3.0-pro', // Use Pro model for comprehensive reports
    systemPrompt: `You are a senior career consultant creating a premium job intelligence report.
Your clients pay $75/month for these insights, so make them exceptional.
Be specific to the company and role - avoid generic advice.
Include realistic Glassdoor ratings and market data for Orlando, FL.`,
    temperature: 0.7,
    maxTokens: 8192
  })
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if Gemini API is available
 */
export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4)
}

export default generateContent
