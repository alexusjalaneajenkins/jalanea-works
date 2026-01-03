/**
 * Make It Work Service
 *
 * AI-powered service that generates alternative career paths
 * for users facing barriers to traditional employment.
 *
 * "If the system doesn't open the door, build a door."
 */

import { generateWithRouting, TASK_COMPLEXITY_MAP } from './aiModelRouter';

// Add makeItWork to the complexity map (complex task)
TASK_COMPLEXITY_MAP['makeItWork'] = 'complex';

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
  resumeSpin: string; // Short tag like "Portfolio Project" or "Freelance Experience"
  resumeLanguage: string; // Full resume bullet point
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

The user is trying to become: "${goal}"
Barriers they face: ${barriers.join(', ')}
${userContext.name ? `Name: ${userContext.name}` : ''}
${userContext.skills ? `Skills: ${userContext.skills}` : ''}
${userContext.location ? `Location: ${userContext.location}` : ''}
${userContext.school ? `School/Program: ${userContext.school}` : ''}

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

Remember: These should be REAL, PRACTICAL paths that someone could start TODAY. Not theoretical advice, but actual step-by-step alternatives.`;

  try {
    const response = await generateWithRouting(
      'makeItWork' as keyof typeof TASK_COMPLEXITY_MAP,
      prompt,
      {
        system: systemPrompt,
        temperature: 0.7,
        maxTokens: 2500,
      }
    );

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const result = JSON.parse(jsonMatch[0]) as MakeItWorkResult;

    // Validate the response has the expected structure
    if (!result.paths || !Array.isArray(result.paths) || result.paths.length === 0) {
      throw new Error('No paths generated');
    }

    return result;
  } catch (error) {
    console.error('[MakeItWork] Error generating paths:', error);

    // Return fallback paths if AI fails
    return getFallbackPaths(goal, barriers);
  }
}

/**
 * Fallback paths if AI generation fails
 */
function getFallbackPaths(goal: string, barriers: string[]): MakeItWorkResult {
  return {
    paths: [
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
    ],
    encouragement: 'The traditional path isn\'t the only path. Every successful person found their own way. You\'re doing the same thing - finding your way. Keep going.'
  };
}

/**
 * Get motivational quote for loading states
 */
export function getMakeItWorkQuote(): string {
  const quotes = [
    "If the system doesn't open the door, build a door.",
    "Your path doesn't have to look like anyone else's.",
    "Hard work finds a way.",
    "Every expert was once a beginner who refused to quit.",
    "The only impossible journey is the one you never begin.",
    "Your circumstances don't define your potential.",
    "Make it work. Make it happen. Make it count.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
