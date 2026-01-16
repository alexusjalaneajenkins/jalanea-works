/**
 * Interview Questions Database
 *
 * Common interview questions organized by category and industry,
 * with tips and example answers for Valencia College graduates.
 */

export interface InterviewQuestion {
  id: string
  question: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string[]
  exampleAnswer?: string
  followUps?: string[]
  industries?: string[]
}

export interface QuestionCategory {
  id: string
  name: string
  icon: string
  description: string
}

/**
 * Question Categories
 */
export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: 'behavioral',
    name: 'Behavioral',
    icon: '🧠',
    description: 'Questions about past experiences and how you handled situations'
  },
  {
    id: 'situational',
    name: 'Situational',
    icon: '🎭',
    description: 'Hypothetical scenarios to assess problem-solving'
  },
  {
    id: 'technical',
    name: 'Technical',
    icon: '💻',
    description: 'Questions about skills and technical knowledge'
  },
  {
    id: 'cultural',
    name: 'Cultural Fit',
    icon: '🤝',
    description: 'Questions about values and work style'
  },
  {
    id: 'background',
    name: 'Background',
    icon: '📋',
    description: 'Questions about your experience and qualifications'
  },
  {
    id: 'motivation',
    name: 'Motivation',
    icon: '🎯',
    description: 'Questions about your goals and interest in the role'
  }
]

/**
 * Common Interview Questions
 */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // Background Questions
  {
    id: 'tell-me-about-yourself',
    question: 'Tell me about yourself.',
    category: 'background',
    difficulty: 'easy',
    tips: [
      'Keep it to 2 minutes max',
      'Focus on relevant experience',
      'End with why you\'re interested in this role',
      'Use the Present-Past-Future formula'
    ],
    exampleAnswer: 'I recently graduated from Valencia College with a degree in Business Administration. During my studies, I worked part-time at Target where I developed strong customer service and team collaboration skills. I\'m now looking to transition into an administrative role where I can apply my organizational skills and attention to detail. This position excites me because it combines my customer service background with my interest in business operations.',
    followUps: ['What are you most proud of?', 'Why did you choose this field?']
  },
  {
    id: 'why-this-company',
    question: 'Why do you want to work for our company?',
    category: 'motivation',
    difficulty: 'medium',
    tips: [
      'Research the company beforehand',
      'Mention specific things you admire',
      'Connect their values to yours',
      'Reference recent news or achievements'
    ],
    exampleAnswer: 'I\'ve been following your company\'s growth in Orlando, and I\'m impressed by your commitment to community involvement and employee development. The values you emphasize—integrity, innovation, and teamwork—align with what I learned at Valencia College. I\'m particularly excited about your recent expansion into healthcare technology, as that\'s an area I\'m passionate about.',
    followUps: ['What do you know about our products/services?']
  },
  {
    id: 'greatest-strength',
    question: 'What is your greatest strength?',
    category: 'background',
    difficulty: 'easy',
    tips: [
      'Choose a strength relevant to the job',
      'Provide a specific example',
      'Quantify results if possible',
      'Be confident but not arrogant'
    ],
    exampleAnswer: 'My greatest strength is my ability to stay calm under pressure. In my previous role at a busy retail store during holiday seasons, I consistently handled high-volume customer interactions while maintaining a positive attitude. My manager specifically recognized me for de-escalating difficult situations, and I received three customer commendations in one quarter.',
    followUps: ['Can you give another example?', 'How did you develop this strength?']
  },
  {
    id: 'greatest-weakness',
    question: 'What is your greatest weakness?',
    category: 'background',
    difficulty: 'medium',
    tips: [
      'Choose a real but not critical weakness',
      'Show self-awareness',
      'Explain what you\'re doing to improve',
      'Don\'t say "I work too hard" or similar clichés'
    ],
    exampleAnswer: 'I sometimes struggle with delegating tasks because I want to ensure quality. However, I\'ve been working on this by setting clearer expectations when assigning work and checking in at milestones rather than micromanaging. In my last team project at Valencia, I practiced this approach and found it actually improved outcomes while reducing my stress.',
    followUps: ['How has this affected your work?', 'What progress have you made?']
  },

  // Behavioral Questions (STAR Method)
  {
    id: 'conflict-resolution',
    question: 'Tell me about a time you had a conflict with a coworker. How did you handle it?',
    category: 'behavioral',
    difficulty: 'medium',
    tips: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Focus on the resolution, not the drama',
      'Show emotional intelligence',
      'Emphasize what you learned'
    ],
    exampleAnswer: 'At my previous job, a coworker and I disagreed about how to organize the stockroom. Instead of escalating, I suggested we each try our method for a week and compare results. After testing both approaches, we actually combined elements from each and created a system that was better than either original idea. We ended up becoming good collaborators after that.',
    followUps: ['What would you do differently?', 'How do you prevent conflicts?']
  },
  {
    id: 'difficult-customer',
    question: 'Describe a time you dealt with a difficult customer or client.',
    category: 'behavioral',
    difficulty: 'medium',
    tips: [
      'Stay professional in your description',
      'Focus on the solution',
      'Show empathy for the customer',
      'Highlight the positive outcome'
    ],
    exampleAnswer: 'A customer came in upset because their order was wrong. I listened actively, apologized sincerely, and immediately offered to fix the issue. While resolving it, I discovered our system had a bug. I reported it to management, which prevented similar issues for other customers. The original customer left satisfied and even complimented my service to my manager.'
  },
  {
    id: 'mistake-recovery',
    question: 'Tell me about a mistake you made at work and how you handled it.',
    category: 'behavioral',
    difficulty: 'hard',
    tips: [
      'Be honest about the mistake',
      'Focus on your response, not blame',
      'Explain what you learned',
      'Show how you prevented future mistakes'
    ],
    exampleAnswer: 'I once scheduled two employees for the same shift by accident. When I realized my error, I immediately contacted both employees, apologized, and offered solutions. One agreed to come in early, and I stayed late myself to cover the gap. After that, I created a double-check system for scheduling and never made that mistake again.'
  },
  {
    id: 'teamwork-example',
    question: 'Give an example of a time you worked effectively as part of a team.',
    category: 'behavioral',
    difficulty: 'easy',
    tips: [
      'Highlight collaboration',
      'Explain your specific contribution',
      'Show respect for team members',
      'Mention the team\'s success'
    ],
    exampleAnswer: 'During a group project at Valencia, we had to create a marketing plan. I took the initiative to organize our meetings and create a shared document for tracking progress. When one team member was struggling with their section, I helped them brainstorm ideas without taking over. We earned an A on the project, and the professor highlighted our collaboration as exemplary.'
  },
  {
    id: 'leadership-example',
    question: 'Describe a time when you showed leadership.',
    category: 'behavioral',
    difficulty: 'medium',
    tips: [
      'Leadership doesn\'t require a title',
      'Show initiative and influence',
      'Explain your decision-making',
      'Highlight positive outcomes'
    ],
    exampleAnswer: 'When our team lead was out sick during a busy shift, I stepped up to coordinate the team even though I wasn\'t a supervisor. I created a quick task list, assigned responsibilities based on each person\'s strengths, and made sure everyone took their breaks. We actually exceeded our sales goal that day, and my manager later thanked me for keeping things running smoothly.'
  },

  // Situational Questions
  {
    id: 'tight-deadline',
    question: 'How would you handle a situation where you have multiple urgent deadlines?',
    category: 'situational',
    difficulty: 'medium',
    tips: [
      'Show prioritization skills',
      'Mention communication with stakeholders',
      'Be realistic about limitations',
      'Demonstrate time management'
    ],
    exampleAnswer: 'I would first assess each deadline\'s true urgency and importance. Then I\'d communicate with stakeholders about realistic timelines. I\'d focus on high-impact tasks first while keeping others updated on progress. If needed, I\'d ask for help or negotiate extensions rather than deliver poor-quality work.'
  },
  {
    id: 'disagreement-manager',
    question: 'What would you do if you disagreed with your manager\'s decision?',
    category: 'situational',
    difficulty: 'hard',
    tips: [
      'Show respect for authority',
      'Emphasize professional communication',
      'Be willing to accept decisions',
      'Know when to escalate appropriately'
    ],
    exampleAnswer: 'I would first make sure I fully understood their reasoning by asking clarifying questions. If I still had concerns, I\'d request a private conversation to share my perspective respectfully, backed by facts or data. Ultimately, if they maintained their decision, I\'d support it professionally and do my best to make it successful.'
  },

  // Cultural Fit
  {
    id: 'work-style',
    question: 'How would you describe your work style?',
    category: 'cultural',
    difficulty: 'easy',
    tips: [
      'Be honest and specific',
      'Relate it to the role',
      'Show flexibility',
      'Mention collaboration'
    ],
    exampleAnswer: 'I\'m organized and detail-oriented, but also adaptable when priorities shift. I like to start my day by reviewing my task list and setting clear goals. I work well independently but also value collaboration—I find that checking in with teammates often leads to better solutions than working in isolation.'
  },
  {
    id: 'stress-handling',
    question: 'How do you handle stress and pressure?',
    category: 'cultural',
    difficulty: 'medium',
    tips: [
      'Give specific strategies',
      'Provide an example',
      'Show self-awareness',
      'Emphasize staying productive'
    ],
    exampleAnswer: 'I handle stress by staying organized and breaking big tasks into smaller steps. When things get hectic, I take a moment to prioritize and focus on what\'s most important. During finals week at Valencia while working part-time, I created a detailed schedule and took short breaks to stay fresh. I actually performed better under that pressure because I was so focused.'
  },

  // Motivation
  {
    id: 'five-year-goals',
    question: 'Where do you see yourself in five years?',
    category: 'motivation',
    difficulty: 'medium',
    tips: [
      'Show ambition but be realistic',
      'Align with company growth',
      'Focus on skill development',
      'Show commitment to the field'
    ],
    exampleAnswer: 'In five years, I\'d like to have developed expertise in this role and taken on additional responsibilities. I\'m interested in eventually moving into a leadership position where I can mentor others. I see this company as a place where I can grow long-term, and I\'m excited about the career paths you offer.'
  },
  {
    id: 'why-leaving',
    question: 'Why are you leaving your current job? / Why did you leave your last job?',
    category: 'motivation',
    difficulty: 'hard',
    tips: [
      'Stay positive—never badmouth employers',
      'Focus on growth opportunities',
      'Be honest but diplomatic',
      'Connect it to this opportunity'
    ],
    exampleAnswer: 'I\'m grateful for what I learned at my previous job, but I\'m ready for new challenges and growth opportunities. I want to apply my skills in a different environment where I can continue developing professionally. This role particularly interests me because it would let me build on my experience while learning new skills.'
  },
  {
    id: 'salary-expectations',
    question: 'What are your salary expectations?',
    category: 'motivation',
    difficulty: 'hard',
    tips: [
      'Research market rates beforehand',
      'Give a range rather than a specific number',
      'Consider total compensation',
      'Be flexible but know your minimum'
    ],
    exampleAnswer: 'Based on my research and experience, I\'m looking for something in the range of $35,000 to $42,000 annually. However, I\'m flexible and open to discussing the total compensation package, including benefits and growth opportunities. What\'s most important to me is finding the right fit.'
  }
]

/**
 * Interview Types
 */
export const INTERVIEW_TYPES = [
  {
    id: 'phone',
    name: 'Phone Screen',
    icon: '📞',
    duration: '15-30 min',
    description: 'Initial screening call with recruiter or HR',
    tips: [
      'Find a quiet location',
      'Have your resume in front of you',
      'Smile while talking—it affects your tone',
      'Prepare questions about the role'
    ]
  },
  {
    id: 'video',
    name: 'Video Interview',
    icon: '💻',
    duration: '30-60 min',
    description: 'Virtual interview via Zoom, Teams, or similar',
    tips: [
      'Test your technology beforehand',
      'Choose a clean, professional background',
      'Look at the camera, not the screen',
      'Dress professionally from head to toe'
    ]
  },
  {
    id: 'in-person',
    name: 'In-Person Interview',
    icon: '🏢',
    duration: '45-90 min',
    description: 'Face-to-face interview at the company location',
    tips: [
      'Arrive 10-15 minutes early',
      'Bring extra copies of your resume',
      'Firm handshake and eye contact',
      'Plan your route and parking ahead'
    ]
  },
  {
    id: 'panel',
    name: 'Panel Interview',
    icon: '👥',
    duration: '60-90 min',
    description: 'Interview with multiple interviewers at once',
    tips: [
      'Address each panelist by name',
      'Make eye contact with everyone',
      'Direct your answer to who asked, but include others',
      'Prepare extra questions for different perspectives'
    ]
  },
  {
    id: 'technical',
    name: 'Technical Interview',
    icon: '⚙️',
    duration: '60-120 min',
    description: 'Assessment of technical skills and problem-solving',
    tips: [
      'Review core concepts for the role',
      'Think out loud while problem-solving',
      'Ask clarifying questions',
      'It\'s okay to say "I don\'t know"'
    ]
  }
]

/**
 * Get questions by category
 */
export function getQuestionsByCategory(categoryId: string): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter(q => q.category === categoryId)
}

/**
 * Get random questions for practice
 */
export function getRandomQuestions(count: number = 5): InterviewQuestion[] {
  const shuffled = [...INTERVIEW_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get questions by difficulty
 */
export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter(q => q.difficulty === difficulty)
}

export default INTERVIEW_QUESTIONS
