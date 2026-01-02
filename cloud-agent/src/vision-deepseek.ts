/**
 * DeepSeek Vision Module
 *
 * Uses DeepSeek's vision model for analyzing screenshots.
 * DeepSeek uses an OpenAI-compatible API format.
 * Much cheaper than Claude (~$0.14/1M vs $3/1M tokens)
 */

import { Action, VisionResult, UserProfile } from './vision.js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an AI agent that helps users apply to jobs automatically. You can see screenshots of a web browser and must decide what action to take next.

Your goal is to navigate job sites, find relevant jobs, and fill out applications on behalf of the user.

When analyzing a screenshot, you must:
1. Describe what you see on the screen
2. Identify the current state (search page, job listing, application form, etc.)
3. Decide the next action to take

Available actions:
- click: Click at specific x,y coordinates
- type: Type text (optionally at x,y coordinates first)
- scroll: Scroll up or down
- navigate: Go to a specific URL
- press: Press a key (Enter, Tab, Escape, etc.)
- wait: Wait for page to load
- done: Task is complete
- error: Cannot proceed, explain why

IMPORTANT RULES:
1. Always provide exact x,y coordinates for clicks (based on the 1280x800 viewport)
2. Be careful with form fields - click to focus before typing
3. Look for "Apply" or "Submit" buttons to complete applications
4. If you see a CAPTCHA or login wall, report it as an error
5. Never submit payment information
6. Skip jobs that require assessments or video interviews (for now)
7. After clicking an input field, use type action to enter text
8. If clicking doesn't seem to work after 2-3 tries, try a different approach

Respond in JSON format only, no markdown:
{
  "understanding": "Description of what you see",
  "action": {
    "type": "click|type|scroll|navigate|press|wait|done|error",
    "x": 640,
    "y": 400,
    "text": "text to type if applicable",
    "url": "url if navigating",
    "key": "key to press if applicable",
    "direction": "up|down for scroll",
    "amount": 300,
    "reason": "Why you're taking this action"
  },
  "confidence": 0.95
}`;

export class DeepSeekVisionAgent {
  private apiKey: string;
  private userProfile: UserProfile | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    console.log('[DeepSeekVision] Initialized with DeepSeek API');
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    console.log(`[DeepSeekVision] User profile set for: ${profile.name}`);
  }

  async analyze(
    screenshotBase64: string,
    task: string,
    currentUrl: string
  ): Promise<VisionResult> {
    const userProfileContext = this.userProfile
      ? `
USER PROFILE (use this info to fill applications):
- Name: ${this.userProfile.name}
- Email: ${this.userProfile.email}
- Phone: ${this.userProfile.phone}
- Location: ${this.userProfile.location}
- Skills: ${this.userProfile.skills.join(', ')}
- Experience: ${this.userProfile.experience}
- Education: ${this.userProfile.education}
- Desired Jobs: ${this.userProfile.desiredJobTitles.join(', ')}
- Work Type: ${this.userProfile.workType}
${this.userProfile.desiredSalary ? `- Desired Salary: ${this.userProfile.desiredSalary}` : ''}
`
      : '';

    const userPrompt = `CURRENT TASK: ${task}
CURRENT URL: ${currentUrl}
${userProfileContext}

Analyze this screenshot and decide what action to take next. Respond with JSON only.`;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[DeepSeekVision] Analyzing screenshot (attempt ${attempt + 1}/${maxRetries})`);

        const response = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: SYSTEM_PROMPT,
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: userPrompt,
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${screenshotBase64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1024,
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse JSON from response');
        }

        const parsed = JSON.parse(jsonMatch[0]) as VisionResult;

        console.log(`[DeepSeekVision] Understanding: ${parsed.understanding.substring(0, 100)}...`);
        console.log(`[DeepSeekVision] Action: ${parsed.action.type} - ${parsed.action.reason}`);

        return parsed;

      } catch (error: any) {
        lastError = error;
        console.error(`[DeepSeekVision] Error on attempt ${attempt + 1}:`, error.message);

        // Check if it's a rate limit error
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          const waitTime = 5000 * (attempt + 1);
          console.log(`[DeepSeekVision] Rate limit, waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // Wait before retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // All retries failed
    console.error('[DeepSeekVision] All attempts failed:', lastError?.message);

    return {
      understanding: 'Error analyzing screenshot after multiple attempts',
      action: {
        type: 'error',
        reason: lastError?.message || 'Unknown error after retries',
      },
      confidence: 0,
    };
  }

  async ask(
    screenshotBase64: string,
    question: string,
    currentUrl: string
  ): Promise<string> {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Current URL: ${currentUrl}\n\nQuestion: ${question}`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${screenshotBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Error processing question';
    } catch (error: any) {
      console.error('[DeepSeekVision] Error:', error);
      return 'Error processing question';
    }
  }

  clearHistory(): void {
    // DeepSeek doesn't maintain history in this implementation
  }
}

export default DeepSeekVisionAgent;
