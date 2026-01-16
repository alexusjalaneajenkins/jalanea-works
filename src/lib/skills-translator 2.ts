/**
 * Skills Translation Engine
 *
 * Transforms retail/service experience language into professional
 * terminology for target industries. Available for Starter+ tiers.
 */

import {
  getTranslations,
  findMatchingTranslation,
  type TranslationRule
} from '@/data/translation-mappings'

// Types
export interface TranslationResult {
  original: string
  translated: string
  skills: string[]
  keywords: string[]
  confidence: number
  source: 'predefined' | 'ai'
}

export interface TranslationRequest {
  bullets: string[]
  sourceIndustry: string
  targetIndustry: string
  jobTitle?: string
  context?: string
}

export interface TranslationResponse {
  translations: TranslationResult[]
  skillsSummary: string[]
  keywordsSummary: string[]
}

/**
 * Translate bullet points using predefined mappings
 */
export function translateWithMappings(
  bullets: string[],
  sourceIndustry: string,
  targetIndustry: string
): TranslationResult[] {
  const results: TranslationResult[] = []

  for (const bullet of bullets) {
    const match = findMatchingTranslation(bullet, sourceIndustry, targetIndustry)

    if (match) {
      results.push({
        original: bullet,
        translated: match.after,
        skills: match.skillsGained,
        keywords: match.keywords,
        confidence: 0.85,
        source: 'predefined'
      })
    } else {
      // No predefined match - apply basic enhancement
      results.push(enhanceBulletPoint(bullet, sourceIndustry, targetIndustry))
    }
  }

  return results
}

/**
 * Basic bullet point enhancement when no predefined translation exists
 */
function enhanceBulletPoint(
  bullet: string,
  sourceIndustry: string,
  targetIndustry: string
): TranslationResult {
  let enhanced = bullet

  // Apply common transformations
  const transformations: [RegExp, string][] = [
    // Action verb upgrades
    [/^helped/i, 'Assisted'],
    [/^did/i, 'Executed'],
    [/^worked on/i, 'Contributed to'],
    [/^was responsible for/i, 'Managed'],
    [/^made sure/i, 'Ensured'],

    // Noun upgrades
    [/customers/gi, 'clients'],
    [/store/gi, 'facility'],
    [/shift/gi, 'operations period'],
    [/coworkers/gi, 'team members'],
    [/boss/gi, 'supervisor'],

    // Professional terminology
    [/dealt with/gi, 'addressed'],
    [/handled/gi, 'managed'],
    [/got/gi, 'achieved'],
    [/did well at/gi, 'excelled in'],
  ]

  for (const [pattern, replacement] of transformations) {
    enhanced = enhanced.replace(pattern, replacement)
  }

  // Ensure first letter is capitalized
  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1)

  // Extract potential skills from the enhanced text
  const skills = extractSkillsFromText(enhanced, targetIndustry)
  const keywords = extractKeywordsFromText(enhanced, targetIndustry)

  return {
    original: bullet,
    translated: enhanced,
    skills,
    keywords,
    confidence: 0.5, // Lower confidence for auto-enhanced
    source: 'predefined'
  }
}

/**
 * Extract skills from text based on target industry
 */
function extractSkillsFromText(text: string, targetIndustry: string): string[] {
  const skills: string[] = []
  const lowerText = text.toLowerCase()

  // Common skill patterns
  const skillPatterns: [RegExp, string][] = [
    [/team|staff|employees|members/i, 'Team Collaboration'],
    [/manag|supervis|lead|oversee/i, 'Leadership'],
    [/customer|client|guest/i, 'Customer Service'],
    [/communicat|explain|present/i, 'Communication'],
    [/problem|resolv|solution|troubleshoot/i, 'Problem Solving'],
    [/organiz|schedul|coordinat/i, 'Organization'],
    [/train|mentor|teach|onboard/i, 'Training'],
    [/data|report|analyz|track/i, 'Data Analysis'],
    [/sale|revenue|target|goal/i, 'Sales'],
    [/inventory|stock|supply/i, 'Inventory Management'],
    [/cash|payment|transaction|financial/i, 'Financial Handling'],
    [/computer|software|system|technology/i, 'Technical Skills'],
  ]

  for (const [pattern, skill] of skillPatterns) {
    if (pattern.test(lowerText) && !skills.includes(skill)) {
      skills.push(skill)
    }
  }

  return skills.slice(0, 4) // Limit to 4 skills per bullet
}

/**
 * Extract keywords from text
 */
function extractKeywordsFromText(text: string, targetIndustry: string): string[] {
  const keywords: string[] = []
  const lowerText = text.toLowerCase()

  // Industry-specific keywords to look for
  const industryKeywords: Record<string, string[]> = {
    office: ['administrative', 'scheduling', 'filing', 'correspondence', 'coordination', 'reporting'],
    tech: ['software', 'technical', 'troubleshooting', 'systems', 'database', 'support'],
    healthcare: ['patient', 'clinical', 'medical', 'compliance', 'care', 'safety'],
    finance: ['financial', 'accounting', 'budget', 'reconciliation', 'audit', 'compliance'],
    marketing: ['campaign', 'brand', 'analytics', 'engagement', 'content', 'strategy'],
    project_management: ['project', 'timeline', 'stakeholder', 'deliverable', 'milestone', 'scope']
  }

  // General professional keywords
  const generalKeywords = [
    'managed', 'coordinated', 'implemented', 'developed', 'analyzed',
    'improved', 'achieved', 'delivered', 'maintained', 'executed'
  ]

  // Check for industry keywords
  const targetKeywords = industryKeywords[targetIndustry] || []
  for (const keyword of [...targetKeywords, ...generalKeywords]) {
    if (lowerText.includes(keyword) && !keywords.includes(keyword)) {
      keywords.push(keyword)
    }
  }

  return keywords.slice(0, 5)
}

/**
 * Build AI prompt for translation
 */
export function buildTranslationPrompt(
  bullet: string,
  sourceIndustry: string,
  targetIndustry: string,
  context?: string
): string {
  return `You are a professional resume writer specializing in career transitions.

Original bullet point from ${sourceIndustry} experience:
"${bullet}"

Target industry: ${targetIndustry}
${context ? `Additional context: ${context}` : ''}

Translate this to professional language for the target industry.
Guidelines:
- Keep it truthful (same responsibility, different professional words)
- Add quantifiable metrics where reasonable (use realistic estimates)
- Use industry-standard terminology for ${targetIndustry}
- Highlight transferable skills
- Keep similar length (max 2 sentences)

Return JSON only:
{
  "translated": "New professional bullet point",
  "skills": ["skill1", "skill2", "skill3"],
  "keywords": ["keyword1", "keyword2"]
}`
}

/**
 * Translate using AI (Gemini)
 */
export async function translateWithAI(
  bullet: string,
  sourceIndustry: string,
  targetIndustry: string,
  context?: string
): Promise<TranslationResult> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey) {
    // Fallback to basic enhancement
    return enhanceBulletPoint(bullet, sourceIndustry, targetIndustry)
  }

  const prompt = buildTranslationPrompt(bullet, sourceIndustry, targetIndustry, context)

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
            maxOutputTokens: 500
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error('AI translation failed')
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('No response from AI')
    }

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      original: bullet,
      translated: result.translated,
      skills: result.skills || [],
      keywords: result.keywords || [],
      confidence: 0.9,
      source: 'ai'
    }
  } catch (error) {
    console.error('AI translation error:', error)
    // Fallback to basic enhancement
    return enhanceBulletPoint(bullet, sourceIndustry, targetIndustry)
  }
}

/**
 * Full translation function - tries predefined first, then AI
 */
export async function translateBullets(
  request: TranslationRequest
): Promise<TranslationResponse> {
  const results: TranslationResult[] = []
  const allSkills: Set<string> = new Set()
  const allKeywords: Set<string> = new Set()

  for (const bullet of request.bullets) {
    // First try predefined mapping
    const predefined = findMatchingTranslation(
      bullet,
      request.sourceIndustry,
      request.targetIndustry
    )

    if (predefined) {
      const result: TranslationResult = {
        original: bullet,
        translated: predefined.after,
        skills: predefined.skillsGained,
        keywords: predefined.keywords,
        confidence: 0.85,
        source: 'predefined'
      }
      results.push(result)
      predefined.skillsGained.forEach(s => allSkills.add(s))
      predefined.keywords.forEach(k => allKeywords.add(k))
    } else {
      // Use AI translation
      const aiResult = await translateWithAI(
        bullet,
        request.sourceIndustry,
        request.targetIndustry,
        request.context
      )
      results.push(aiResult)
      aiResult.skills.forEach(s => allSkills.add(s))
      aiResult.keywords.forEach(k => allKeywords.add(k))
    }
  }

  return {
    translations: results,
    skillsSummary: Array.from(allSkills),
    keywordsSummary: Array.from(allKeywords)
  }
}

/**
 * Get suggested skills for industry transition
 */
export function getSuggestedSkills(
  sourceIndustry: string,
  targetIndustry: string
): string[] {
  const translations = getTranslations(sourceIndustry, targetIndustry)

  const skills = new Set<string>()
  for (const translation of translations) {
    translation.skillsGained.forEach(s => skills.add(s))
  }

  return Array.from(skills)
}

export default {
  translateBullets,
  translateWithMappings,
  translateWithAI,
  getSuggestedSkills
}
