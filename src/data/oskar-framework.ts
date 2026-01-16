/**
 * OSKAR Coaching Framework
 *
 * A solution-focused coaching model used in the Career Coach feature.
 *
 * O - Outcome: What do you want to achieve?
 * S - Scaling: Where are you now on a scale of 1-10?
 * K - Know-how: What resources and strengths do you have?
 * A - Affirm & Action: What's working? What will you do next?
 * R - Review: How will you track progress?
 */

export interface OSKARPhase {
  id: 'outcome' | 'scaling' | 'knowhow' | 'affirm' | 'review'
  name: string
  description: string
  emoji: string
  questions: string[]
  prompts: string[]
  examples: string[]
}

export const OSKAR_PHASES: OSKARPhase[] = [
  {
    id: 'outcome',
    name: 'Outcome',
    description: 'Define what you want to achieve',
    emoji: '🎯',
    questions: [
      'What would you like to focus on today?',
      'What would be the ideal outcome for you?',
      'If this conversation is successful, what will be different?',
      'What does success look like for you in 3 months?'
    ],
    prompts: [
      'Help me think about what I want to achieve',
      'I want to transition to a new career',
      'I need help setting realistic job search goals',
      'I\'m not sure what kind of job I want'
    ],
    examples: [
      'I want to land an entry-level office job within 60 days',
      'I want to transition from retail to tech support',
      'I want to find a job that pays at least $40k with benefits'
    ]
  },
  {
    id: 'scaling',
    name: 'Scaling',
    description: 'Assess where you are now',
    emoji: '📊',
    questions: [
      'On a scale of 1-10, how close are you to your goal right now?',
      'What made you choose that number instead of a lower one?',
      'What would move you one point higher on the scale?',
      'What\'s the biggest obstacle keeping you from a 10?'
    ],
    prompts: [
      'Help me honestly assess where I am',
      'I feel stuck and need perspective',
      'I don\'t know if I\'m making progress',
      'Everything feels overwhelming'
    ],
    examples: [
      'I\'m at a 4 - I have a resume but haven\'t applied anywhere yet',
      'I\'m at a 6 - I\'ve had some interviews but no offers',
      'I\'m at a 2 - I don\'t even know where to start'
    ]
  },
  {
    id: 'knowhow',
    name: 'Know-How',
    description: 'Identify your resources and strengths',
    emoji: '💪',
    questions: [
      'What skills from your past experience transfer to your goal?',
      'What resources do you have available to help you?',
      'Who in your network could support you?',
      'What has worked for you in similar situations before?'
    ],
    prompts: [
      'Help me identify my transferable skills',
      'I don\'t think I have relevant experience',
      'I need to figure out my strengths',
      'What resources should I be using?'
    ],
    examples: [
      'I have customer service skills from retail that apply to office work',
      'I can access free courses through Valencia College',
      'My neighbor works at a company I\'d like to apply to'
    ]
  },
  {
    id: 'affirm',
    name: 'Affirm & Action',
    description: 'Celebrate progress and plan next steps',
    emoji: '✅',
    questions: [
      'What\'s already working well for you?',
      'What small step could you take this week?',
      'What would be the first sign that things are improving?',
      'How confident are you that you can take this action?'
    ],
    prompts: [
      'Help me create an action plan',
      'I need motivation to keep going',
      'I keep procrastinating on applications',
      'I don\'t know what to do next'
    ],
    examples: [
      'This week I\'ll apply to 3 jobs and update my LinkedIn',
      'Tomorrow I\'ll practice my elevator pitch for 10 minutes',
      'I\'ll reach out to one networking contact before Friday'
    ]
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Track progress and adjust approach',
    emoji: '🔄',
    questions: [
      'How will you know you\'re making progress?',
      'When would you like to check in on your progress?',
      'What might get in the way, and how will you handle it?',
      'What support do you need to stay on track?'
    ],
    prompts: [
      'Help me set up accountability',
      'I keep setting goals but not following through',
      'I need a way to measure my progress',
      'I want to reflect on what I\'ve accomplished'
    ],
    examples: [
      'I\'ll track applications in a spreadsheet and review weekly',
      'I\'ll celebrate when I get my first interview',
      'If I miss a day, I\'ll add an extra application the next day'
    ]
  }
]

/**
 * Coaching session topics/areas
 */
export const COACHING_TOPICS = [
  {
    id: 'job_search',
    name: 'Job Search Strategy',
    icon: '🔍',
    description: 'Find and apply to the right jobs',
    relatedPhases: ['outcome', 'affirm']
  },
  {
    id: 'resume_help',
    name: 'Resume & Application',
    icon: '📄',
    description: 'Improve your application materials',
    relatedPhases: ['knowhow', 'affirm']
  },
  {
    id: 'interview_prep',
    name: 'Interview Preparation',
    icon: '🎤',
    description: 'Prepare for upcoming interviews',
    relatedPhases: ['knowhow', 'affirm', 'review']
  },
  {
    id: 'career_direction',
    name: 'Career Direction',
    icon: '🧭',
    description: 'Explore career options and paths',
    relatedPhases: ['outcome', 'scaling', 'knowhow']
  },
  {
    id: 'confidence',
    name: 'Confidence & Motivation',
    icon: '💫',
    description: 'Build confidence and stay motivated',
    relatedPhases: ['scaling', 'affirm', 'review']
  },
  {
    id: 'work_life',
    name: 'Work-Life Balance',
    icon: '⚖️',
    description: 'Navigate challenges and balance priorities',
    relatedPhases: ['outcome', 'scaling']
  }
]

/**
 * Valencia-specific coaching context
 */
export const VALENCIA_CONTEXT = {
  institution: 'Valencia College',
  location: 'Orlando, FL',
  majorEmployers: [
    'AdventHealth',
    'Orlando Health',
    'Walt Disney World',
    'Universal Orlando',
    'Lockheed Martin',
    'Siemens Energy',
    'Electronic Arts',
    'Deloitte',
    'KPMG',
    'Orange County Government'
  ],
  growthIndustries: [
    'Healthcare',
    'Technology',
    'Hospitality & Tourism',
    'Aerospace & Defense',
    'Clean Energy',
    'Financial Services'
  ],
  valenciaResources: [
    'Career Services',
    'Job Placement Assistance',
    'Alumni Network',
    'Continuing Education',
    'Industry Certifications',
    'Internship Programs'
  ]
}

/**
 * Get phase by ID
 */
export function getPhase(phaseId: string): OSKARPhase | undefined {
  return OSKAR_PHASES.find(p => p.id === phaseId)
}

/**
 * Get next phase in sequence
 */
export function getNextPhase(currentPhaseId: string): OSKARPhase | undefined {
  const currentIndex = OSKAR_PHASES.findIndex(p => p.id === currentPhaseId)
  if (currentIndex >= 0 && currentIndex < OSKAR_PHASES.length - 1) {
    return OSKAR_PHASES[currentIndex + 1]
  }
  return undefined
}

/**
 * Get random question for a phase
 */
export function getRandomQuestion(phaseId: string): string {
  const phase = getPhase(phaseId)
  if (!phase) return ''
  return phase.questions[Math.floor(Math.random() * phase.questions.length)]
}

export default OSKAR_PHASES
