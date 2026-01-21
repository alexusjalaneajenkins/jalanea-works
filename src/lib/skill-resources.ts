/**
 * Skill Resources Database
 *
 * Maps common job skills to learning resources with free alternatives.
 * Used by the pocket generator to provide actionable skill gap recommendations.
 */

export interface SkillResource {
  skill: string
  category: 'software' | 'certification' | 'experience' | 'soft-skill'
  learnTime: string
  resourceTitle: string
  resourceUrl?: string
  freeAlternative: string
  whyItMatters: string
}

// Database of skill to resource mappings
const SKILL_RESOURCES: Record<string, SkillResource> = {
  // Office Software
  'excel': {
    skill: 'Excel',
    category: 'software',
    learnTime: '2-4 hours',
    resourceTitle: 'Excel Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/excel-essential-training-microsoft-365',
    freeAlternative: 'YouTube: "Excel Tutorial for Beginners" by Kevin Stratvert',
    whyItMatters: 'Required for data analysis and reporting tasks'
  },
  'microsoft excel': {
    skill: 'Microsoft Excel',
    category: 'software',
    learnTime: '2-4 hours',
    resourceTitle: 'Excel Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/excel-essential-training-microsoft-365',
    freeAlternative: 'YouTube: "Excel Tutorial for Beginners" by Kevin Stratvert',
    whyItMatters: 'Required for data analysis and reporting tasks'
  },
  'word': {
    skill: 'Microsoft Word',
    category: 'software',
    learnTime: '1-2 hours',
    resourceTitle: 'Word Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/word-essential-training-microsoft-365',
    freeAlternative: 'YouTube: "Microsoft Word Tutorial for Beginners"',
    whyItMatters: 'Used for creating professional documents and reports'
  },
  'powerpoint': {
    skill: 'PowerPoint',
    category: 'software',
    learnTime: '2-3 hours',
    resourceTitle: 'PowerPoint Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/powerpoint-essential-training-microsoft-365',
    freeAlternative: 'YouTube: "PowerPoint Tutorial for Beginners"',
    whyItMatters: 'Required for presentations and visual communication'
  },
  'outlook': {
    skill: 'Outlook',
    category: 'software',
    learnTime: '1 hour',
    resourceTitle: 'Outlook Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/outlook-essential-training-microsoft-365',
    freeAlternative: 'YouTube: "Microsoft Outlook Tutorial for Beginners"',
    whyItMatters: 'Essential for professional email and calendar management'
  },
  'microsoft office': {
    skill: 'Microsoft Office',
    category: 'software',
    learnTime: '4-6 hours',
    resourceTitle: 'Microsoft 365 Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/microsoft-365-essential-training',
    freeAlternative: 'YouTube: "Microsoft Office Tutorial for Beginners"',
    whyItMatters: 'Core productivity suite used in most office environments'
  },
  'google workspace': {
    skill: 'Google Workspace',
    category: 'software',
    learnTime: '2-3 hours',
    resourceTitle: 'Google Workspace Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/google-workspace-essential-training',
    freeAlternative: 'YouTube: "Google Workspace Tutorial for Beginners"',
    whyItMatters: 'Cloud-based productivity suite used by many organizations'
  },

  // Healthcare Systems
  'epic': {
    skill: 'Epic EHR',
    category: 'software',
    learnTime: '4-8 hours',
    resourceTitle: 'Epic Training (employer-provided)',
    freeAlternative: 'YouTube: "Epic EHR Overview" videos',
    whyItMatters: 'Primary electronic health records system in healthcare'
  },
  'emr': {
    skill: 'EMR Systems',
    category: 'software',
    learnTime: '3-5 hours',
    resourceTitle: 'Electronic Medical Records Training',
    freeAlternative: 'YouTube: "EMR Basics for Healthcare Workers"',
    whyItMatters: 'Required for patient documentation and care coordination'
  },
  'ehr': {
    skill: 'EHR Systems',
    category: 'software',
    learnTime: '3-5 hours',
    resourceTitle: 'Electronic Health Records Training',
    freeAlternative: 'YouTube: "EHR Basics for Healthcare Workers"',
    whyItMatters: 'Required for patient documentation and care coordination'
  },
  'medical terminology': {
    skill: 'Medical Terminology',
    category: 'certification',
    learnTime: '10-20 hours',
    resourceTitle: 'Medical Terminology Course - Coursera',
    resourceUrl: 'https://www.coursera.org/learn/medical-terminology',
    freeAlternative: 'YouTube: "Medical Terminology Made Easy" series',
    whyItMatters: 'Essential for communication in healthcare settings'
  },
  'hipaa': {
    skill: 'HIPAA Compliance',
    category: 'certification',
    learnTime: '2-3 hours',
    resourceTitle: 'HIPAA Training Certification',
    resourceUrl: 'https://www.hipaaexams.com/',
    freeAlternative: 'HHS.gov: Free HIPAA training resources',
    whyItMatters: 'Required for handling protected health information'
  },
  'banner': {
    skill: 'Banner System',
    category: 'software',
    learnTime: '2-4 hours',
    resourceTitle: 'Banner Student Information System Training',
    freeAlternative: 'YouTube: "Banner Basics for Administrative Staff"',
    whyItMatters: 'Required for student registration and records management'
  },
  'banner system': {
    skill: 'Banner System',
    category: 'software',
    learnTime: '2-4 hours',
    resourceTitle: 'Banner Student Information System Training',
    freeAlternative: 'YouTube: "Banner Basics for Administrative Staff"',
    whyItMatters: 'Required for student registration and records management'
  },

  // CRM & Business Systems
  'salesforce': {
    skill: 'Salesforce',
    category: 'software',
    learnTime: '6-10 hours',
    resourceTitle: 'Salesforce Trailhead (Free Official Training)',
    resourceUrl: 'https://trailhead.salesforce.com/',
    freeAlternative: 'Salesforce Trailhead - completely free',
    whyItMatters: 'Industry-leading CRM used for customer management'
  },
  'crm': {
    skill: 'CRM Systems',
    category: 'software',
    learnTime: '3-5 hours',
    resourceTitle: 'CRM Fundamentals - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/crm-fundamentals',
    freeAlternative: 'YouTube: "CRM Basics for Beginners"',
    whyItMatters: 'Essential for managing customer relationships and data'
  },
  'quickbooks': {
    skill: 'QuickBooks',
    category: 'software',
    learnTime: '4-6 hours',
    resourceTitle: 'QuickBooks Online Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/quickbooks-online-essential-training',
    freeAlternative: 'YouTube: "QuickBooks Tutorial for Beginners"',
    whyItMatters: 'Standard accounting software for small businesses'
  },

  // Technical Skills
  'data entry': {
    skill: 'Data Entry',
    category: 'experience',
    learnTime: '1-2 hours',
    resourceTitle: 'Data Entry Skills Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/learning-data-entry',
    freeAlternative: 'TypingTest.com for speed practice + YouTube tutorials',
    whyItMatters: 'Required for accurate and efficient data processing'
  },
  'typing': {
    skill: 'Typing Speed',
    category: 'experience',
    learnTime: '2-4 weeks practice',
    resourceTitle: 'Typing.com (Free typing practice)',
    resourceUrl: 'https://www.typing.com/',
    freeAlternative: 'Typing.com - completely free',
    whyItMatters: 'Most roles require 40+ WPM for efficient work'
  },
  'sql': {
    skill: 'SQL',
    category: 'software',
    learnTime: '8-15 hours',
    resourceTitle: 'SQL Essential Training - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/sql-essential-training',
    freeAlternative: 'freeCodeCamp: SQL Tutorial on YouTube (4 hours)',
    whyItMatters: 'Required for database queries and data analysis'
  },
  'python': {
    skill: 'Python',
    category: 'software',
    learnTime: '20-40 hours',
    resourceTitle: 'Python for Everybody - Coursera',
    resourceUrl: 'https://www.coursera.org/specializations/python',
    freeAlternative: 'freeCodeCamp: Python Tutorial on YouTube',
    whyItMatters: 'Popular programming language for automation and analysis'
  },

  // Soft Skills (with proof point suggestions)
  'communication': {
    skill: 'Communication Skills',
    category: 'soft-skill',
    learnTime: '2-3 hours',
    resourceTitle: 'Communication Foundations - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/communication-foundations',
    freeAlternative: 'YouTube: "Effective Communication Skills" by TED talks',
    whyItMatters: 'Essential for collaboration and customer interactions'
  },
  'customer service': {
    skill: 'Customer Service',
    category: 'soft-skill',
    learnTime: '2-4 hours',
    resourceTitle: 'Customer Service Foundations - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/customer-service-foundations',
    freeAlternative: 'YouTube: "Customer Service Training" videos',
    whyItMatters: 'Core skill for any customer-facing role'
  },
  'problem solving': {
    skill: 'Problem Solving',
    category: 'soft-skill',
    learnTime: '2-3 hours',
    resourceTitle: 'Critical Thinking and Problem Solving - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/critical-thinking',
    freeAlternative: 'YouTube: "Problem Solving Skills" TED talks',
    whyItMatters: 'Required for independent decision-making'
  },
  'time management': {
    skill: 'Time Management',
    category: 'soft-skill',
    learnTime: '1-2 hours',
    resourceTitle: 'Time Management Fundamentals - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/time-management-fundamentals',
    freeAlternative: 'YouTube: "Time Management Tips" by productivity experts',
    whyItMatters: 'Essential for meeting deadlines and handling multiple tasks'
  },
  'teamwork': {
    skill: 'Teamwork',
    category: 'soft-skill',
    learnTime: '1-2 hours',
    resourceTitle: 'Teamwork Foundations - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/teamwork-foundations',
    freeAlternative: 'YouTube: "Effective Team Collaboration" videos',
    whyItMatters: 'Critical for collaborative work environments'
  },
  'leadership': {
    skill: 'Leadership',
    category: 'soft-skill',
    learnTime: '3-5 hours',
    resourceTitle: 'Leadership Foundations - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/leadership-foundations',
    freeAlternative: 'YouTube: "Leadership Skills" TED talks',
    whyItMatters: 'Important for career growth and team management'
  },
  'attention to detail': {
    skill: 'Attention to Detail',
    category: 'soft-skill',
    learnTime: '1-2 hours',
    resourceTitle: 'Developing Your Attention to Detail - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/developing-your-attention-to-detail',
    freeAlternative: 'Practice: Proofreading exercises and data verification drills',
    whyItMatters: 'Required for accuracy in documentation and data work'
  },
  'organization': {
    skill: 'Organization',
    category: 'soft-skill',
    learnTime: '1-2 hours',
    resourceTitle: 'Getting Organized - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/getting-organized',
    freeAlternative: 'YouTube: "Organization Tips for Professionals"',
    whyItMatters: 'Essential for managing workload and priorities'
  },

  // Certifications
  'cpr': {
    skill: 'CPR Certification',
    category: 'certification',
    learnTime: '4 hours',
    resourceTitle: 'American Red Cross CPR/AED Certification',
    resourceUrl: 'https://www.redcross.org/take-a-class/cpr',
    freeAlternative: 'Some employers provide free CPR training',
    whyItMatters: 'Required for healthcare and many customer-facing roles'
  },
  'first aid': {
    skill: 'First Aid Certification',
    category: 'certification',
    learnTime: '4 hours',
    resourceTitle: 'American Red Cross First Aid Certification',
    resourceUrl: 'https://www.redcross.org/take-a-class/first-aid',
    freeAlternative: 'Some employers provide free First Aid training',
    whyItMatters: 'Required for emergency response capabilities'
  },
  'notary': {
    skill: 'Notary Public',
    category: 'certification',
    learnTime: '2-4 hours + exam',
    resourceTitle: 'State Notary Public Certification',
    freeAlternative: 'Check your state\'s Secretary of State website for requirements',
    whyItMatters: 'Adds value for document processing roles'
  },

  // Scheduling & Administrative
  'scheduling': {
    skill: 'Scheduling',
    category: 'software',
    learnTime: '1-2 hours',
    resourceTitle: 'Calendar Management - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/calendar-management',
    freeAlternative: 'YouTube: "Calendar Management Tips" + practice with Google Calendar',
    whyItMatters: 'Essential for coordinating appointments and meetings'
  },
  'calendar management': {
    skill: 'Calendar Management',
    category: 'software',
    learnTime: '1-2 hours',
    resourceTitle: 'Calendar Management - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/calendar-management',
    freeAlternative: 'YouTube: "Calendar Management Tips" + practice with Google Calendar',
    whyItMatters: 'Essential for coordinating appointments and meetings'
  },
  'phone etiquette': {
    skill: 'Professional Phone Etiquette',
    category: 'soft-skill',
    learnTime: '1 hour',
    resourceTitle: 'Phone-Based Customer Service - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/phone-based-customer-service',
    freeAlternative: 'YouTube: "Professional Phone Etiquette" training videos',
    whyItMatters: 'Required for roles with phone-based communication'
  },
  'multitasking': {
    skill: 'Multitasking',
    category: 'soft-skill',
    learnTime: '1-2 hours',
    resourceTitle: 'Multitasking Tips - LinkedIn Learning',
    resourceUrl: 'https://www.linkedin.com/learning/managing-multiple-priorities',
    freeAlternative: 'YouTube: "How to Multitask Effectively"',
    whyItMatters: 'Essential for high-volume work environments'
  }
}

// Common aliases for skill matching
const SKILL_ALIASES: Record<string, string> = {
  'ms excel': 'excel',
  'ms word': 'word',
  'ms powerpoint': 'powerpoint',
  'ms outlook': 'outlook',
  'ms office': 'microsoft office',
  'office suite': 'microsoft office',
  'office 365': 'microsoft office',
  'microsoft 365': 'microsoft office',
  'google docs': 'google workspace',
  'google sheets': 'google workspace',
  'google drive': 'google workspace',
  'gsuite': 'google workspace',
  'g suite': 'google workspace',
  'electronic health records': 'ehr',
  'electronic medical records': 'emr',
  'ehr systems': 'ehr',
  'emr systems': 'emr',
  'crm software': 'crm',
  'customer relationship management': 'crm',
  'basic life support': 'cpr',
  'bls': 'cpr',
  'detail oriented': 'attention to detail',
  'detail-oriented': 'attention to detail',
  'organizational skills': 'organization',
  'verbal communication': 'communication',
  'written communication': 'communication',
  'interpersonal skills': 'communication',
  'people skills': 'communication',
  'phone skills': 'phone etiquette',
  'telephone skills': 'phone etiquette',
  'appointment scheduling': 'scheduling',
  'multi-tasking': 'multitasking',
  'multi tasking': 'multitasking'
}

/**
 * Get learning resource for a skill
 */
export function getSkillResource(skill: string): SkillResource | null {
  const normalizedSkill = skill.toLowerCase().trim()

  // Check direct match
  if (SKILL_RESOURCES[normalizedSkill]) {
    return SKILL_RESOURCES[normalizedSkill]
  }

  // Check aliases
  const aliasKey = SKILL_ALIASES[normalizedSkill]
  if (aliasKey && SKILL_RESOURCES[aliasKey]) {
    return {
      ...SKILL_RESOURCES[aliasKey],
      skill: skill // Keep original skill name
    }
  }

  // Partial match - find any resource that contains the skill
  for (const [key, resource] of Object.entries(SKILL_RESOURCES)) {
    if (key.includes(normalizedSkill) || normalizedSkill.includes(key)) {
      return {
        ...resource,
        skill: skill // Keep original skill name
      }
    }
  }

  return null
}

/**
 * Generate a generic resource for unknown skills
 */
export function generateGenericResource(skill: string): SkillResource {
  return {
    skill,
    category: 'experience',
    learnTime: '2-4 hours',
    resourceTitle: `${skill} Training Resources`,
    freeAlternative: `YouTube: Search "${skill} tutorial for beginners"`,
    whyItMatters: `Required skill mentioned in job posting`
  }
}

/**
 * Get resources for multiple skills
 */
export function getSkillResources(skills: string[]): SkillResource[] {
  return skills.map(skill => {
    const resource = getSkillResource(skill)
    return resource || generateGenericResource(skill)
  })
}

/**
 * Determine skill gap priority based on context
 */
export function determineSkillPriority(
  skill: string,
  isRequired: boolean,
  mentionCount: number
): 'critical' | 'helpful' | 'nice-to-have' {
  const normalizedSkill = skill.toLowerCase()

  // Critical: Required skills or frequently mentioned
  if (isRequired || mentionCount >= 3) {
    return 'critical'
  }

  // Critical: Core job skills
  const coreSkills = ['excel', 'communication', 'customer service', 'data entry', 'typing']
  if (coreSkills.some(core => normalizedSkill.includes(core))) {
    return 'critical'
  }

  // Helpful: Mentioned twice or is a certification
  if (mentionCount === 2) {
    return 'helpful'
  }

  const resource = getSkillResource(skill)
  if (resource?.category === 'certification') {
    return 'helpful'
  }

  // Nice to have: Everything else
  return 'nice-to-have'
}

export default SKILL_RESOURCES
