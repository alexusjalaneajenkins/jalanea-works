/**
 * ATS (Applicant Tracking System) Optimizer
 *
 * Analyzes resumes against job descriptions to:
 * 1. Calculate an ATS compatibility score (0-100)
 * 2. Extract and match keywords
 * 3. Provide specific improvement suggestions
 * 4. Help candidates optimize for ATS parsing
 *
 * This is a core feature for helping Valencia College graduates
 * get past automated screening systems.
 */

// Types
export interface ATSAnalysis {
  score: number // 0-100 overall ATS score
  keywordMatch: {
    matched: string[]
    missing: string[]
    matchRate: number // 0-100 percentage
  }
  sections: {
    name: string
    score: number
    feedback: string
  }[]
  suggestions: ATSSuggestion[]
  formatting: {
    score: number
    issues: string[]
  }
  readability: {
    score: number
    gradeLevel: number
  }
}

export interface ATSSuggestion {
  type: 'critical' | 'important' | 'nice-to-have'
  category: 'keyword' | 'formatting' | 'content' | 'structure'
  title: string
  description: string
  example?: string
}

export interface ResumeData {
  fullText: string
  sections?: {
    contact?: string
    summary?: string
    experience?: string
    education?: string
    skills?: string
    certifications?: string
  }
  fileName?: string
}

export interface JobData {
  title: string
  company: string
  description: string
  requirements?: string[]
  preferredQualifications?: string[]
  skills?: string[]
}

// Common ATS-friendly keywords by category
const SKILL_CATEGORIES = {
  technical: [
    'microsoft office', 'excel', 'word', 'powerpoint', 'outlook',
    'google workspace', 'google docs', 'google sheets',
    'data entry', 'database', 'sql', 'crm', 'salesforce',
    'quickbooks', 'sap', 'erp', 'tableau', 'power bi',
    'html', 'css', 'javascript', 'python', 'java',
    'photoshop', 'illustrator', 'canva', 'figma'
  ],
  soft: [
    'communication', 'teamwork', 'leadership', 'problem-solving',
    'time management', 'organization', 'attention to detail',
    'customer service', 'interpersonal', 'adaptability',
    'critical thinking', 'decision making', 'conflict resolution',
    'multitasking', 'prioritization', 'collaboration'
  ],
  action: [
    'managed', 'developed', 'created', 'implemented', 'led',
    'designed', 'analyzed', 'improved', 'increased', 'reduced',
    'coordinated', 'supervised', 'trained', 'established',
    'streamlined', 'optimized', 'achieved', 'delivered',
    'launched', 'negotiated', 'resolved', 'maintained'
  ],
  certifications: [
    'certified', 'license', 'certification', 'credential',
    'degree', 'diploma', 'associate', 'bachelor', 'master',
    'cpr', 'first aid', 'osha', 'hipaa', 'pmp', 'six sigma',
    'comptia', 'cisco', 'aws', 'google certified'
  ]
}

// Valencia College specific programs to highlight
const VALENCIA_PROGRAMS = [
  'valencia college', 'associate in arts', 'associate in science',
  'as degree', 'aa degree', 'accelerated skills training',
  'healthcare', 'business administration', 'computer science',
  'hospitality', 'culinary', 'nursing', 'medical assistant',
  'dental hygiene', 'paralegal', 'accounting', 'graphic design',
  'digital media', 'cybersecurity', 'network administration'
]

/**
 * Main function: Analyze resume against a job description
 */
export function analyzeResumeATS(
  resume: ResumeData,
  job: JobData
): ATSAnalysis {
  const resumeText = resume.fullText.toLowerCase()
  const jobText = `${job.description} ${job.requirements?.join(' ') || ''} ${job.skills?.join(' ') || ''}`.toLowerCase()

  // Extract keywords from job posting
  const jobKeywords = extractKeywords(jobText)

  // Check which keywords appear in resume
  const keywordAnalysis = analyzeKeywordMatch(resumeText, jobKeywords)

  // Analyze resume sections
  const sectionAnalysis = analyzeSections(resume)

  // Check formatting issues
  const formattingAnalysis = analyzeFormatting(resume)

  // Calculate readability
  const readabilityAnalysis = analyzeReadability(resumeText)

  // Generate suggestions
  const suggestions = generateSuggestions(
    keywordAnalysis,
    sectionAnalysis,
    formattingAnalysis,
    job
  )

  // Calculate overall score
  const overallScore = calculateOverallScore(
    keywordAnalysis.matchRate,
    sectionAnalysis,
    formattingAnalysis.score,
    readabilityAnalysis.score
  )

  return {
    score: overallScore,
    keywordMatch: keywordAnalysis,
    sections: sectionAnalysis,
    suggestions,
    formatting: formattingAnalysis,
    readability: readabilityAnalysis
  }
}

/**
 * Extract important keywords from job description
 */
function extractKeywords(jobText: string): string[] {
  const keywords: Set<string> = new Set()

  // Extract technical skills
  SKILL_CATEGORIES.technical.forEach(skill => {
    if (jobText.includes(skill)) {
      keywords.add(skill)
    }
  })

  // Extract soft skills
  SKILL_CATEGORIES.soft.forEach(skill => {
    if (jobText.includes(skill)) {
      keywords.add(skill)
    }
  })

  // Extract certifications
  SKILL_CATEGORIES.certifications.forEach(cert => {
    if (jobText.includes(cert)) {
      keywords.add(cert)
    }
  })

  // Extract years of experience patterns
  const expPatterns = jobText.match(/\d+\+?\s*years?/gi) || []
  expPatterns.forEach(pattern => keywords.add(pattern.toLowerCase()))

  // Extract education requirements
  const eduKeywords = ['high school', 'ged', 'associate', 'bachelor', 'master', 'degree', 'diploma']
  eduKeywords.forEach(edu => {
    if (jobText.includes(edu)) {
      keywords.add(edu)
    }
  })

  // Extract job-specific keywords (words that appear multiple times)
  const words = jobText.split(/\s+/)
  const wordCount: Record<string, number> = {}

  words.forEach(word => {
    const cleanWord = word.replace(/[^a-z]/g, '')
    if (cleanWord.length > 4) { // Ignore short words
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1
    }
  })

  // Add words that appear 2+ times
  Object.entries(wordCount)
    .filter(([, count]) => count >= 2)
    .forEach(([word]) => keywords.add(word))

  return Array.from(keywords)
}

/**
 * Analyze keyword match between resume and job
 */
function analyzeKeywordMatch(
  resumeText: string,
  jobKeywords: string[]
): { matched: string[]; missing: string[]; matchRate: number } {
  const matched: string[] = []
  const missing: string[] = []

  jobKeywords.forEach(keyword => {
    if (resumeText.includes(keyword)) {
      matched.push(keyword)
    } else {
      missing.push(keyword)
    }
  })

  const matchRate = jobKeywords.length > 0
    ? Math.round((matched.length / jobKeywords.length) * 100)
    : 0

  return { matched, missing, matchRate }
}

/**
 * Analyze resume sections
 */
function analyzeSections(resume: ResumeData): {
  name: string
  score: number
  feedback: string
}[] {
  const sections: { name: string; score: number; feedback: string }[] = []
  const text = resume.fullText.toLowerCase()

  // Contact Information
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text)
  const hasPhone = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)
  const hasLinkedIn = text.includes('linkedin')

  let contactScore = 0
  let contactFeedback = ''

  if (hasEmail) contactScore += 40
  if (hasPhone) contactScore += 40
  if (hasLinkedIn) contactScore += 20

  if (contactScore === 100) {
    contactFeedback = 'Complete contact information with email, phone, and LinkedIn'
  } else if (contactScore >= 80) {
    contactFeedback = 'Good contact info. Consider adding LinkedIn profile'
  } else {
    contactFeedback = 'Missing contact information. Add email and phone number'
  }

  sections.push({
    name: 'Contact Information',
    score: contactScore,
    feedback: contactFeedback
  })

  // Professional Summary
  const hasSummary = text.includes('summary') ||
                     text.includes('objective') ||
                     text.includes('profile')
  const summaryScore = hasSummary ? 85 : 40

  sections.push({
    name: 'Professional Summary',
    score: summaryScore,
    feedback: hasSummary
      ? 'Has a professional summary section'
      : 'Add a professional summary highlighting your value proposition'
  })

  // Work Experience
  const hasExperience = text.includes('experience') ||
                        text.includes('employment') ||
                        text.includes('work history')
  const hasActionVerbs = SKILL_CATEGORIES.action.some(verb => text.includes(verb))
  const hasMetrics = /\d+%|\$\d+|\d+\s*(customers|clients|projects|team)/i.test(text)

  let expScore = 0
  if (hasExperience) expScore += 40
  if (hasActionVerbs) expScore += 30
  if (hasMetrics) expScore += 30

  let expFeedback = ''
  if (expScore >= 90) {
    expFeedback = 'Strong experience section with action verbs and metrics'
  } else if (expScore >= 60) {
    expFeedback = 'Good experience section. Add more quantifiable achievements'
  } else {
    expFeedback = 'Strengthen experience section with action verbs and specific results'
  }

  sections.push({
    name: 'Work Experience',
    score: expScore,
    feedback: expFeedback
  })

  // Education
  const hasEducation = text.includes('education') ||
                       text.includes('degree') ||
                       text.includes('college') ||
                       text.includes('university')
  const hasValencia = VALENCIA_PROGRAMS.some(prog => text.includes(prog))

  let eduScore = hasEducation ? 70 : 30
  if (hasValencia) eduScore += 20

  sections.push({
    name: 'Education',
    score: Math.min(100, eduScore),
    feedback: hasEducation
      ? (hasValencia ? 'Education section includes Valencia College credentials' : 'Has education section')
      : 'Add education section with degrees and relevant coursework'
  })

  // Skills
  const hasSkillsSection = text.includes('skills') || text.includes('competencies')
  const technicalSkillCount = SKILL_CATEGORIES.technical.filter(s => text.includes(s)).length

  let skillsScore = 0
  if (hasSkillsSection) skillsScore += 50
  skillsScore += Math.min(50, technicalSkillCount * 10)

  sections.push({
    name: 'Skills',
    score: skillsScore,
    feedback: skillsScore >= 70
      ? 'Good skills section with relevant competencies'
      : 'Add a dedicated skills section with technical and soft skills'
  })

  return sections
}

/**
 * Analyze formatting for ATS compatibility
 */
function analyzeFormatting(resume: ResumeData): {
  score: number
  issues: string[]
} {
  const issues: string[] = []
  let score = 100
  const text = resume.fullText

  // Check for problematic formatting

  // Tables (ATS often can't parse)
  if (text.includes('|') && (text.match(/\|/g)?.length || 0) > 5) {
    issues.push('Possible table formatting detected - ATS may not parse correctly')
    score -= 15
  }

  // Special characters
  const specialChars = text.match(/[→←↑↓★☆●○■□▪▫►◄]/g)
  if (specialChars && specialChars.length > 3) {
    issues.push('Special characters/symbols detected - use standard bullets instead')
    score -= 10
  }

  // Headers (check for standard section names)
  const standardHeaders = ['experience', 'education', 'skills', 'summary', 'contact']
  const foundHeaders = standardHeaders.filter(h => text.toLowerCase().includes(h))
  if (foundHeaders.length < 3) {
    issues.push('Use standard section headers (Experience, Education, Skills)')
    score -= 10
  }

  // Check for dates
  const hasStandardDates = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}/i.test(text) ||
                           /\d{1,2}\/\d{4}/.test(text) ||
                           /\d{4}\s*-\s*\d{4}/.test(text) ||
                           /\d{4}\s*-\s*(present|current)/i.test(text)
  if (!hasStandardDates) {
    issues.push('Add clear date ranges for experience (e.g., "Jan 2022 - Present")')
    score -= 10
  }

  // File format check
  if (resume.fileName) {
    const ext = resume.fileName.split('.').pop()?.toLowerCase()
    if (ext && !['pdf', 'docx', 'doc'].includes(ext)) {
      issues.push('Use PDF or DOCX format for best ATS compatibility')
      score -= 20
    }
  }

  // Length check (rough estimate based on character count)
  const wordCount = text.split(/\s+/).length
  if (wordCount < 200) {
    issues.push('Resume appears too short - aim for 400-700 words')
    score -= 15
  } else if (wordCount > 1500) {
    issues.push('Resume may be too long - keep to 1-2 pages')
    score -= 10
  }

  // Check for contact info at top
  const firstLines = text.substring(0, 500).toLowerCase()
  if (!(/[\w.-]+@[\w.-]+\.\w+/.test(firstLines))) {
    issues.push('Place contact information at the top of your resume')
    score -= 10
  }

  return {
    score: Math.max(0, score),
    issues
  }
}

/**
 * Analyze readability
 */
function analyzeReadability(text: string): {
  score: number
  gradeLevel: number
} {
  // Simple readability analysis based on sentence length and word complexity
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/)

  const avgSentenceLength = words.length / Math.max(1, sentences.length)
  const longWords = words.filter(w => w.length > 10).length
  const longWordRatio = longWords / Math.max(1, words.length)

  // Flesch-Kincaid-like grade level estimate
  const gradeLevel = Math.round(0.39 * avgSentenceLength + 11.8 * longWordRatio + 0.5)

  // Score (aim for 8-12 grade level for professional resumes)
  let score = 100
  if (gradeLevel < 6) {
    score = 60 // Too simple
  } else if (gradeLevel > 16) {
    score = 60 // Too complex
  } else if (gradeLevel >= 8 && gradeLevel <= 12) {
    score = 100 // Ideal
  } else {
    score = 80 // Acceptable
  }

  return {
    score,
    gradeLevel: Math.max(1, Math.min(20, gradeLevel))
  }
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(
  keywordAnalysis: { matched: string[]; missing: string[]; matchRate: number },
  sectionAnalysis: { name: string; score: number; feedback: string }[],
  formattingAnalysis: { score: number; issues: string[] },
  job: JobData
): ATSSuggestion[] {
  const suggestions: ATSSuggestion[] = []

  // Critical: Missing important keywords
  if (keywordAnalysis.matchRate < 50) {
    const topMissing = keywordAnalysis.missing.slice(0, 5)
    suggestions.push({
      type: 'critical',
      category: 'keyword',
      title: 'Add Missing Keywords',
      description: `Your resume is missing ${keywordAnalysis.missing.length} key terms from the job posting. Add these where truthful: ${topMissing.join(', ')}`,
      example: `Instead of "helped customers," try "provided customer service and resolved inquiries"`
    })
  }

  // Critical: Low section scores
  sectionAnalysis.forEach(section => {
    if (section.score < 50) {
      suggestions.push({
        type: 'critical',
        category: 'structure',
        title: `Improve ${section.name}`,
        description: section.feedback
      })
    }
  })

  // Important: Formatting issues
  formattingAnalysis.issues.forEach(issue => {
    suggestions.push({
      type: 'important',
      category: 'formatting',
      title: 'Fix Formatting Issue',
      description: issue
    })
  })

  // Important: Add metrics if missing
  if (sectionAnalysis.find(s => s.name === 'Work Experience')?.score || 0 < 80) {
    suggestions.push({
      type: 'important',
      category: 'content',
      title: 'Add Quantifiable Achievements',
      description: 'Include specific numbers and metrics in your experience section',
      example: '"Assisted 50+ customers daily" instead of "Assisted customers"'
    })
  }

  // Nice-to-have: Action verbs
  const actionVerbsUsed = SKILL_CATEGORIES.action.filter(v =>
    keywordAnalysis.matched.includes(v)
  ).length

  if (actionVerbsUsed < 5) {
    suggestions.push({
      type: 'nice-to-have',
      category: 'content',
      title: 'Use More Action Verbs',
      description: 'Start bullet points with strong action verbs like: managed, developed, created, implemented, achieved',
      example: '"Managed inventory of 500+ items" instead of "Was responsible for inventory"'
    })
  }

  // Nice-to-have: Job title match
  if (!keywordAnalysis.matched.some(k => job.title.toLowerCase().includes(k))) {
    suggestions.push({
      type: 'nice-to-have',
      category: 'keyword',
      title: 'Mirror Job Title',
      description: `Consider including "${job.title}" in your resume summary or skills section if applicable`
    })
  }

  // Nice-to-have: Company research
  suggestions.push({
    type: 'nice-to-have',
    category: 'content',
    title: 'Tailor to Company',
    description: `Research ${job.company} and mention relevant values or initiatives in your summary`
  })

  return suggestions
}

/**
 * Calculate overall ATS score
 */
function calculateOverallScore(
  keywordMatchRate: number,
  sectionAnalysis: { score: number }[],
  formattingScore: number,
  readabilityScore: number
): number {
  // Weighted scoring
  const weights = {
    keywords: 0.35,      // Keywords are critical for ATS
    sections: 0.30,      // Section completeness
    formatting: 0.20,    // ATS compatibility
    readability: 0.15    // Professional language
  }

  const avgSectionScore = sectionAnalysis.reduce((sum, s) => sum + s.score, 0) /
                         Math.max(1, sectionAnalysis.length)

  const score =
    keywordMatchRate * weights.keywords +
    avgSectionScore * weights.sections +
    formattingScore * weights.formatting +
    readabilityScore * weights.readability

  return Math.round(Math.max(0, Math.min(100, score)))
}

/**
 * Quick ATS score calculation (without full analysis)
 */
export function quickATSScore(resumeText: string, jobDescription: string): number {
  const resume = { fullText: resumeText }
  const job = { title: '', company: '', description: jobDescription }
  const analysis = analyzeResumeATS(resume, job)
  return analysis.score
}

/**
 * Get improvement priority list
 */
export function getImprovementPriority(analysis: ATSAnalysis): string[] {
  return analysis.suggestions
    .filter(s => s.type === 'critical' || s.type === 'important')
    .map(s => s.title)
}

export default analyzeResumeATS
