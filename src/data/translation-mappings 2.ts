/**
 * Skills Translation Mappings
 *
 * Predefined translations for common retail/service experience
 * to professional/office/tech language.
 */

export interface TranslationRule {
  before: string
  after: string
  skillsGained: string[]
  keywords: string[]
}

export interface IndustryTranslations {
  [key: string]: TranslationRule[]
}

/**
 * Source industries that users commonly transition from
 */
export const SOURCE_INDUSTRIES = [
  { value: 'retail', label: 'Retail', icon: '🛒' },
  { value: 'food_service', label: 'Food Service / Restaurant', icon: '🍽️' },
  { value: 'customer_service', label: 'Customer Service', icon: '📞' },
  { value: 'warehouse', label: 'Warehouse / Logistics', icon: '📦' },
  { value: 'hospitality', label: 'Hospitality / Hotel', icon: '🏨' },
  { value: 'healthcare_entry', label: 'Healthcare (Entry Level)', icon: '🏥' }
] as const

/**
 * Target industries users want to transition to
 */
export const TARGET_INDUSTRIES = [
  { value: 'office', label: 'Office / Administrative', icon: '🏢' },
  { value: 'tech', label: 'Technology / IT', icon: '💻' },
  { value: 'healthcare', label: 'Healthcare', icon: '⚕️' },
  { value: 'finance', label: 'Finance / Banking', icon: '💰' },
  { value: 'marketing', label: 'Marketing / Sales', icon: '📈' },
  { value: 'project_management', label: 'Project Management', icon: '📋' }
] as const

/**
 * Translation mappings from source to target industries
 */
export const TRANSLATIONS: Record<string, Record<string, TranslationRule[]>> = {
  // Retail to Office
  retail_to_office: {
    management: [
      {
        before: 'Managed team of associates during shifts',
        after: 'Supervised cross-functional team members, coordinating daily operations and delegating tasks to optimize workflow efficiency',
        skillsGained: ['Team Leadership', 'Operations Management', 'Delegation', 'Workflow Optimization'],
        keywords: ['supervised', 'coordinating', 'operations', 'workflow']
      },
      {
        before: 'Opened and closed store',
        after: 'Managed facility operations including security protocols, cash reconciliation, and daily reporting procedures',
        skillsGained: ['Operations Management', 'Security Compliance', 'Financial Reconciliation'],
        keywords: ['facility operations', 'security protocols', 'reconciliation']
      },
      {
        before: 'Trained new employees',
        after: 'Developed and delivered onboarding training programs, mentoring new team members on company policies and best practices',
        skillsGained: ['Training & Development', 'Mentorship', 'Knowledge Transfer'],
        keywords: ['onboarding', 'training programs', 'mentoring']
      }
    ],
    customer_facing: [
      {
        before: 'Handled customer complaints',
        after: 'Resolved escalated customer concerns through active listening and problem-solving, achieving 95%+ satisfaction rate',
        skillsGained: ['Conflict Resolution', 'Customer Relations', 'Problem Solving', 'De-escalation'],
        keywords: ['resolved', 'escalated', 'satisfaction rate', 'problem-solving']
      },
      {
        before: 'Helped customers find products',
        after: 'Provided consultative assistance to clients, assessing needs and recommending solutions to meet their requirements',
        skillsGained: ['Consultative Selling', 'Needs Assessment', 'Client Relations'],
        keywords: ['consultative', 'assessing needs', 'recommending solutions']
      },
      {
        before: 'Answered customer questions',
        after: 'Served as primary point of contact for inquiries, providing accurate information and ensuring positive customer experiences',
        skillsGained: ['Communication', 'Customer Service', 'Product Knowledge'],
        keywords: ['point of contact', 'inquiries', 'customer experience']
      }
    ],
    operations: [
      {
        before: 'Worked cash register',
        after: 'Processed high-volume financial transactions with 99.9% accuracy; performed daily cash reconciliation and reporting',
        skillsGained: ['Financial Accuracy', 'Cash Handling', 'POS Systems', 'Attention to Detail'],
        keywords: ['financial transactions', 'accuracy', 'reconciliation', 'reporting']
      },
      {
        before: 'Stocked shelves',
        after: 'Managed inventory replenishment and merchandising, optimizing stock levels to reduce shrinkage by 15%',
        skillsGained: ['Inventory Management', 'Loss Prevention', 'Merchandising', 'Process Optimization'],
        keywords: ['inventory', 'merchandising', 'optimizing', 'shrinkage']
      },
      {
        before: 'Did inventory counts',
        after: 'Conducted systematic inventory audits, reconciling discrepancies and maintaining accurate stock records in database systems',
        skillsGained: ['Inventory Auditing', 'Data Entry', 'Reconciliation', 'Database Management'],
        keywords: ['inventory audits', 'reconciling', 'database systems']
      }
    ]
  },

  // Retail to Tech
  retail_to_tech: {
    customer_facing: [
      {
        before: 'Handled customer complaints',
        after: 'Provided Tier 1 technical support, troubleshooting issues and escalating complex problems following established protocols',
        skillsGained: ['Technical Support', 'Troubleshooting', 'Issue Escalation', 'Protocol Adherence'],
        keywords: ['technical support', 'troubleshooting', 'escalating', 'protocols']
      },
      {
        before: 'Helped customers with electronics',
        after: 'Delivered end-user technical assistance, diagnosing hardware/software issues and implementing solutions',
        skillsGained: ['Technical Assistance', 'Hardware Troubleshooting', 'Software Support'],
        keywords: ['technical assistance', 'diagnosing', 'hardware', 'software']
      },
      {
        before: 'Answered phone calls',
        after: 'Managed multi-channel support communications via phone, email, and chat, maintaining detailed ticket documentation',
        skillsGained: ['Multi-channel Support', 'Ticket Management', 'Documentation'],
        keywords: ['multi-channel', 'support communications', 'ticket documentation']
      }
    ],
    operations: [
      {
        before: 'Used POS system',
        after: 'Operated enterprise software systems for transaction processing, inventory management, and reporting',
        skillsGained: ['Enterprise Software', 'System Navigation', 'Data Processing'],
        keywords: ['enterprise software', 'transaction processing', 'reporting']
      },
      {
        before: 'Processed returns and exchanges',
        after: 'Executed complex transaction workflows, applying business rules and documenting exceptions in tracking systems',
        skillsGained: ['Workflow Execution', 'Business Rules', 'Exception Handling'],
        keywords: ['transaction workflows', 'business rules', 'tracking systems']
      }
    ]
  },

  // Food Service to Office
  food_service_to_office: {
    management: [
      {
        before: 'Supervised kitchen staff',
        after: 'Led team of 5-10 employees in fast-paced environment, ensuring quality standards and meeting operational deadlines',
        skillsGained: ['Team Leadership', 'Quality Assurance', 'Deadline Management'],
        keywords: ['led team', 'quality standards', 'operational deadlines']
      },
      {
        before: 'Managed shift operations',
        after: 'Oversaw daily operations including staff scheduling, resource allocation, and performance monitoring',
        skillsGained: ['Operations Management', 'Scheduling', 'Resource Allocation'],
        keywords: ['daily operations', 'scheduling', 'resource allocation']
      }
    ],
    customer_facing: [
      {
        before: 'Took customer orders',
        after: 'Processed client requests accurately, ensuring clear communication and timely delivery of services',
        skillsGained: ['Order Processing', 'Client Communication', 'Service Delivery'],
        keywords: ['client requests', 'communication', 'service delivery']
      },
      {
        before: 'Handled difficult customers',
        after: 'Managed challenging client interactions with professionalism, de-escalating situations while maintaining service standards',
        skillsGained: ['Conflict Resolution', 'Professional Communication', 'Client Retention'],
        keywords: ['challenging interactions', 'de-escalating', 'service standards']
      }
    ],
    operations: [
      {
        before: 'Balanced cash drawer',
        after: 'Performed daily financial reconciliation with 100% accuracy, preparing end-of-day reports for management review',
        skillsGained: ['Financial Reconciliation', 'Reporting', 'Accuracy'],
        keywords: ['financial reconciliation', 'accuracy', 'reports', 'management']
      },
      {
        before: 'Managed food inventory',
        after: 'Maintained inventory control systems, tracking supplies, forecasting needs, and managing vendor relationships',
        skillsGained: ['Inventory Control', 'Forecasting', 'Vendor Management'],
        keywords: ['inventory control', 'forecasting', 'vendor relationships']
      }
    ]
  },

  // Customer Service to Tech
  customer_service_to_tech: {
    support: [
      {
        before: 'Answered customer calls',
        after: 'Provided first-line technical support via multi-channel communication, resolving 50+ tickets daily',
        skillsGained: ['Technical Support', 'Multi-channel Communication', 'Ticket Resolution'],
        keywords: ['technical support', 'multi-channel', 'tickets', 'resolving']
      },
      {
        before: 'Resolved customer issues',
        after: 'Diagnosed and resolved technical issues using knowledge base resources and escalation procedures',
        skillsGained: ['Troubleshooting', 'Knowledge Base Navigation', 'Issue Resolution'],
        keywords: ['diagnosed', 'resolved', 'knowledge base', 'escalation']
      },
      {
        before: 'Documented customer interactions',
        after: 'Maintained detailed CRM records, documenting customer interactions, issue resolution, and follow-up requirements',
        skillsGained: ['CRM Systems', 'Documentation', 'Data Entry'],
        keywords: ['CRM', 'documenting', 'records', 'follow-up']
      }
    ],
    communication: [
      {
        before: 'Explained products to customers',
        after: 'Communicated technical concepts to non-technical users, translating complex information into understandable terms',
        skillsGained: ['Technical Communication', 'User Education', 'Information Translation'],
        keywords: ['technical concepts', 'non-technical users', 'translating']
      },
      {
        before: 'Handled email inquiries',
        after: 'Managed written technical correspondence, providing clear documentation and step-by-step instructions',
        skillsGained: ['Technical Writing', 'Email Management', 'Documentation'],
        keywords: ['technical correspondence', 'documentation', 'instructions']
      }
    ]
  },

  // Warehouse to Logistics/Tech
  warehouse_to_tech: {
    operations: [
      {
        before: 'Picked and packed orders',
        after: 'Executed order fulfillment workflows using WMS software, maintaining 99%+ accuracy rate',
        skillsGained: ['WMS Systems', 'Order Fulfillment', 'Process Accuracy'],
        keywords: ['WMS', 'order fulfillment', 'accuracy rate', 'workflows']
      },
      {
        before: 'Operated forklift',
        after: 'Certified in equipment operation, following safety protocols and maintaining compliance with OSHA standards',
        skillsGained: ['Equipment Operation', 'Safety Compliance', 'OSHA Standards'],
        keywords: ['certified', 'safety protocols', 'compliance', 'OSHA']
      },
      {
        before: 'Loaded trucks',
        after: 'Coordinated logistics operations, optimizing load sequences and ensuring on-time dispatch for shipments',
        skillsGained: ['Logistics Coordination', 'Load Optimization', 'Dispatch Management'],
        keywords: ['logistics', 'optimizing', 'dispatch', 'shipments']
      }
    ],
    data: [
      {
        before: 'Scanned barcodes',
        after: 'Processed inventory data using scanning technology, maintaining real-time tracking accuracy in database systems',
        skillsGained: ['Data Processing', 'Inventory Tracking', 'Database Systems'],
        keywords: ['inventory data', 'tracking', 'database systems', 'real-time']
      },
      {
        before: 'Counted inventory',
        after: 'Conducted cycle counts and inventory audits, analyzing discrepancies and implementing corrective actions',
        skillsGained: ['Inventory Auditing', 'Data Analysis', 'Process Improvement'],
        keywords: ['cycle counts', 'audits', 'analyzing', 'corrective actions']
      }
    ]
  },

  // Hospitality to Office
  hospitality_to_office: {
    customer_facing: [
      {
        before: 'Checked guests in and out',
        after: 'Managed client onboarding and offboarding processes, ensuring smooth transitions and proper documentation',
        skillsGained: ['Client Onboarding', 'Process Management', 'Documentation'],
        keywords: ['client onboarding', 'offboarding', 'transitions', 'documentation']
      },
      {
        before: 'Handled guest complaints',
        after: 'Resolved client concerns with diplomacy and professionalism, turning negative experiences into positive outcomes',
        skillsGained: ['Client Relations', 'Conflict Resolution', 'Reputation Management'],
        keywords: ['resolved', 'diplomacy', 'professionalism', 'positive outcomes']
      },
      {
        before: 'Made reservations',
        after: 'Coordinated scheduling and resource allocation using booking systems, managing complex calendars and availability',
        skillsGained: ['Scheduling', 'Resource Allocation', 'Calendar Management'],
        keywords: ['scheduling', 'resource allocation', 'booking systems', 'calendar']
      }
    ],
    operations: [
      {
        before: 'Managed front desk',
        after: 'Served as primary point of contact for facility operations, coordinating between departments and external stakeholders',
        skillsGained: ['Reception Management', 'Cross-functional Coordination', 'Stakeholder Communication'],
        keywords: ['point of contact', 'coordinating', 'departments', 'stakeholders']
      },
      {
        before: 'Processed payments',
        after: 'Administered financial transactions and billing procedures, ensuring accuracy and compliance with company policies',
        skillsGained: ['Financial Administration', 'Billing', 'Compliance'],
        keywords: ['financial transactions', 'billing', 'accuracy', 'compliance']
      }
    ]
  }
}

/**
 * Get translation key for source/target combination
 */
export function getTranslationKey(source: string, target: string): string {
  return `${source}_to_${target}`
}

/**
 * Get all translations for a source/target combination
 */
export function getTranslations(source: string, target: string): TranslationRule[] {
  const key = getTranslationKey(source, target)
  const categoryTranslations = TRANSLATIONS[key]

  if (!categoryTranslations) {
    return []
  }

  // Flatten all categories into single array
  return Object.values(categoryTranslations).flat()
}

/**
 * Find matching translation for a bullet point
 */
export function findMatchingTranslation(
  bulletPoint: string,
  source: string,
  target: string
): TranslationRule | null {
  const translations = getTranslations(source, target)

  // Simple keyword matching
  const lowerBullet = bulletPoint.toLowerCase()

  for (const translation of translations) {
    const lowerBefore = translation.before.toLowerCase()

    // Check if bullet contains key phrases from the "before" text
    const beforeWords = lowerBefore.split(' ').filter(w => w.length > 3)
    const matchCount = beforeWords.filter(word => lowerBullet.includes(word)).length

    // If more than 40% of significant words match, consider it a match
    if (matchCount / beforeWords.length > 0.4) {
      return translation
    }
  }

  return null
}

/**
 * Get available target industries for a source
 */
export function getAvailableTargets(source: string): string[] {
  const availableTargets: string[] = []

  for (const key of Object.keys(TRANSLATIONS)) {
    if (key.startsWith(`${source}_to_`)) {
      const target = key.replace(`${source}_to_`, '')
      availableTargets.push(target)
    }
  }

  return availableTargets
}

export default TRANSLATIONS
