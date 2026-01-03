/**
 * AI Service for Cloud Agent
 *
 * Handles AI-powered features like Make It Work path generation.
 * Uses Google Gemini for text generation with the API key stored server-side.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Types
export interface ActionPlan {
  first24Hours: string[];
  firstWeek: string[];
  first30Days: string[];
}

export interface AlternativePath {
  title: string;
  description: string;
  whyItWorks: string;
  resumeSpin: string;
  resumeLanguage: string;
  actionPlan: ActionPlan;
}

export interface MakeItWorkResult {
  paths: AlternativePath[];
  encouragement: string;
}

export interface UserContext {
  name: string | null;
  skills: string | null;
  location: string | null;
  school: string | null;
  education?: Array<{ degree: string; school: string; year?: string }>;
  experience?: Array<{ role: string; company: string; duration?: string }>;
  certifications?: Array<{ name: string; issuer: string }>;
  targetRoles?: string[];
  workStyles?: string[];
  salary?: number;
}

/**
 * Generate alternative career paths for a user facing barriers
 */
export async function generateMakeItWorkPaths(
  goal: string,
  barriers: string[],
  userContext: UserContext
): Promise<MakeItWorkResult> {
  const systemPrompt = `You are an empowerment coach for JelaneaWorks, a platform for hard-working people who face barriers to traditional employment.

Your role is to help users find CREATIVE, ETHICAL, REAL-WORLD alternatives when traditional paths fail.

IMPORTANT GUIDELINES:
- Be grounded, respectful, empowering, and non-judgmental
- Generate REALISTIC and ACCESSIBLE paths (not pie-in-the-sky ideas)
- Focus on momentum over perfection - small wins that build
- Never suggest illegal, deceptive, or exploitative actions
- Never suggest fabricating credentials
- Emphasize honest experience, initiative, and documented work
- Consider the user's context (skills, location, situation)
- For caregivers: suggest flexible, remote, or async work options
- For homeless users: focus on immediate resources, phone-based work, library access, and shelter services

The user is trying to become: "${goal}"
Barriers they face: ${barriers.join(', ')}

USER PROFILE (use this to personalize your suggestions):
${userContext.name ? `Name: ${userContext.name}` : ''}
${userContext.location ? `Location: ${userContext.location}` : ''}
${userContext.school ? `Current/Recent School: ${userContext.school}` : ''}
${userContext.skills ? `Skills: ${userContext.skills}` : ''}
${userContext.education?.length ? `Education: ${userContext.education.map(e => `${e.degree} from ${e.school}${e.year ? ` (${e.year})` : ''}`).join('; ')}` : ''}
${userContext.experience?.length ? `Work Experience: ${userContext.experience.map(e => `${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ''}`).join('; ')}` : ''}
${userContext.certifications?.length ? `Certifications: ${userContext.certifications.map(c => `${c.name} from ${c.issuer}`).join('; ')}` : ''}
${userContext.targetRoles?.length ? `Target Roles: ${userContext.targetRoles.join(', ')}` : ''}
${userContext.workStyles?.length ? `Preferred Work Style: ${userContext.workStyles.join(', ')}` : ''}
${userContext.salary ? `Target Salary: $${userContext.salary.toLocaleString()}` : ''}

IMPORTANT:
- Use the user's actual skills, education, and experience to suggest SPECIFIC, PERSONALIZED paths.
- If they're a caregiver, suggest flexible work that fits around caregiving (remote customer service, virtual assistant, transcription, etc.)
- If they're homeless, focus on paths that don't require a permanent address: gig work, day labor apps, library-based learning, shelter job programs
- Reference their actual situation in your suggestions to make them feel seen and understood.

Generate 4-5 realistic alternative paths. For each path, provide:
1. A clear, actionable title
2. A brief description of what they'd do
3. Why this approach works (how it addresses their barriers)
4. A short resume tag (2-3 words like "Portfolio Project" or "Community Leadership")
5. A full resume bullet point they could use
6. Action steps broken into First 24 Hours, First Week, and First 30 Days

Return your response as valid JSON in this exact format:
{
  "paths": [
    {
      "title": "Start a Weekend Project",
      "description": "Build something small but real that demonstrates your skills",
      "whyItWorks": "Projects prove ability better than credentials. Hiring managers value proof of work.",
      "resumeSpin": "Personal Project",
      "resumeLanguage": "Developed and launched [project name], a [description] that [impact/result]",
      "actionPlan": {
        "first24Hours": [
          "Choose one specific problem to solve",
          "Sketch out the basic idea",
          "Set up your development environment"
        ],
        "firstWeek": [
          "Build a working prototype",
          "Get feedback from 2-3 people",
          "Document your process"
        ],
        "first30Days": [
          "Deploy or launch publicly",
          "Share on LinkedIn with a story",
          "Add to portfolio/resume"
        ]
      }
    }
  ],
  "encouragement": "A short, genuine message of encouragement for their journey"
}`;

  const prompt = `Generate alternative paths for someone who wants to become a ${goal} but faces these barriers: ${barriers.join(', ')}.

Remember: These should be REAL, PRACTICAL paths that someone could start TODAY. Not theoretical advice, but actual step-by-step alternatives that work around their specific barriers.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2500,
      },
    });

    const response = result.response.text();

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const parsed = JSON.parse(jsonMatch[0]) as MakeItWorkResult;

    // Validate the response has the expected structure
    if (!parsed.paths || !Array.isArray(parsed.paths) || parsed.paths.length === 0) {
      throw new Error('No paths generated');
    }

    console.log(`[AI Service] Generated ${parsed.paths.length} paths for goal: ${goal}`);
    return parsed;
  } catch (error) {
    console.error('[AI Service] Error generating paths:', error);
    // Return fallback paths
    return getFallbackPaths(goal, barriers);
  }
}

/**
 * Fallback paths if AI generation fails
 */
function getFallbackPaths(goal: string, barriers: string[]): MakeItWorkResult {
  const isCaregiver = barriers.some(b => b.toLowerCase().includes('caregiver') || b.toLowerCase().includes('9-5'));
  const isHomeless = barriers.some(b => b.toLowerCase().includes('homeless') || b.toLowerCase().includes('shelter'));

  const basePaths: AlternativePath[] = [
    {
      title: 'Start a Personal Project',
      description: `Build something related to ${goal} that you can show, not just tell. A small project is worth more than a long resume.`,
      whyItWorks: 'Projects demonstrate real skills. Many hiring managers value proof of work over credentials.',
      resumeSpin: 'Personal Project',
      resumeLanguage: `Developed and launched [project name], demonstrating skills in [relevant skills] with [measurable outcome]`,
      actionPlan: {
        first24Hours: [
          'Brainstorm 3 project ideas related to your goal',
          'Pick the smallest one that still proves your skills',
          'Create a simple plan or sketch'
        ],
        firstWeek: [
          'Spend 1-2 hours daily building',
          'Document your progress (screenshots, notes)',
          'Share progress update on LinkedIn'
        ],
        first30Days: [
          'Complete and deploy/launch your project',
          'Write a brief case study',
          'Add to resume and portfolio'
        ]
      }
    },
    {
      title: 'Offer Your Skills for Free (Strategically)',
      description: 'Help a local business, nonprofit, or friend with a real problem. Get testimonials and portfolio pieces.',
      whyItWorks: 'Free work becomes paid work when you have proof and referrals. It\'s easier to get hired when you can say "I did this for Company X."',
      resumeSpin: 'Freelance / Consulting',
      resumeLanguage: `Provided [service] for [client/org], resulting in [outcome/improvement]`,
      actionPlan: {
        first24Hours: [
          'List 5 people/orgs who might need help',
          'Draft a simple offer message',
          'Send 2-3 outreach messages'
        ],
        firstWeek: [
          'Follow up with those who didn\'t respond',
          'Start work with anyone who says yes',
          'Document everything you do'
        ],
        first30Days: [
          'Complete at least one project',
          'Ask for a testimonial or referral',
          'Update LinkedIn with the experience'
        ]
      }
    },
    {
      title: 'Learn in Public',
      description: 'Share your learning journey on social media. Document what you learn, build connections, attract opportunities.',
      whyItWorks: 'People hire people they know and trust. Showing your learning process builds credibility and network simultaneously.',
      resumeSpin: 'Content Creator',
      resumeLanguage: `Created educational content about [topic], building an engaged following of [number] professionals`,
      actionPlan: {
        first24Hours: [
          'Choose your platform (LinkedIn, Twitter, YouTube)',
          'Post your first "learning in public" update',
          'Follow 10 people in your target field'
        ],
        firstWeek: [
          'Post at least 3 learning updates',
          'Comment meaningfully on others\' posts',
          'Share one tip or insight you learned'
        ],
        first30Days: [
          'Build a consistent posting habit',
          'Connect with people who engage',
          'Start 2-3 genuine conversations'
        ]
      }
    },
    {
      title: 'Find a Mentor or Apprenticeship',
      description: 'Reach out to people doing what you want to do. Offer to help them in exchange for learning.',
      whyItWorks: 'Many successful people got their start through informal apprenticeships. It\'s the oldest form of career development.',
      resumeSpin: 'Apprenticeship',
      resumeLanguage: `Apprenticed under [mentor name/title], learning [skills] and contributing to [projects/outcomes]`,
      actionPlan: {
        first24Hours: [
          'Identify 5 people whose work you admire',
          'Research what they might need help with',
          'Draft a genuine, specific outreach message'
        ],
        firstWeek: [
          'Send outreach to at least 3 people',
          'Engage with their content authentically',
          'Be specific about what you can offer'
        ],
        first30Days: [
          'Follow up politely with those who didn\'t respond',
          'Start helping anyone who engages',
          'Document what you learn'
        ]
      }
    }
  ];

  // Add caregiver-specific path
  if (isCaregiver) {
    basePaths.unshift({
      title: 'Remote/Flexible Customer Service',
      description: 'Many companies hire remote customer service reps with flexible hours. Work around your caregiving schedule.',
      whyItWorks: 'Remote work eliminates commute time. Flexible schedules let you work during nap times or evenings.',
      resumeSpin: 'Remote Support',
      resumeLanguage: 'Provided customer support for [company], maintaining [X]% satisfaction while managing flexible schedule',
      actionPlan: {
        first24Hours: [
          'Create accounts on FlexJobs, Remote.co, We Work Remotely',
          'Update your LinkedIn to show "Open to Remote Work"',
          'Identify your available hours (even if they\'re irregular)'
        ],
        firstWeek: [
          'Apply to 5-10 remote customer service positions',
          'Practice common interview scenarios',
          'Set up a quiet workspace for calls'
        ],
        first30Days: [
          'Continue applying while building skills',
          'Consider certifications (many are free)',
          'Network in remote work communities'
        ]
      }
    });
  }

  // Add homeless-specific path
  if (isHomeless) {
    basePaths.unshift({
      title: 'Gig Economy Quick Start',
      description: 'Apps like DoorDash, Instacart, or TaskRabbit let you earn immediately with just a phone. No address required.',
      whyItWorks: 'Gig work provides immediate income and flexibility. You can work while pursuing longer-term goals.',
      resumeSpin: 'Independent Contractor',
      resumeLanguage: 'Managed independent delivery/service business, maintaining [X] rating while serving [X] customers',
      actionPlan: {
        first24Hours: [
          'Download DoorDash, Uber, Instacart, or TaskRabbit',
          'Complete signup (use shelter address if needed)',
          'Start background check process'
        ],
        firstWeek: [
          'Complete any required orientation',
          'Start with a few deliveries/tasks to learn',
          'Use library WiFi for job applications'
        ],
        first30Days: [
          'Build steady income stream',
          'Save for phone bill and essentials',
          'Connect with shelter job programs'
        ]
      }
    });
  }

  return {
    paths: basePaths.slice(0, 5),
    encouragement: isHomeless
      ? 'Your situation is temporary, not permanent. Every small step forward matters. Many successful people have been where you are. Keep going.'
      : isCaregiver
        ? 'Caregiving is valuable work. The skills you use every day - patience, multitasking, problem-solving - are exactly what employers need. Your path might be different, but it\'s no less valid.'
        : 'The traditional path isn\'t the only path. Every successful person found their own way. You\'re doing the same thing - finding your way. Keep going.'
  };
}
