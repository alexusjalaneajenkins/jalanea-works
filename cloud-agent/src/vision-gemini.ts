/**
 * Gemini Vision Module with Smart Fallback
 *
 * Uses Gemini models with automatic fallback when rate limits are approached.
 * Priority: gemini-3-flash-preview → gemini-2.5-flash → gemini-2.0-flash
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { Action, VisionResult, UserProfile } from './vision.js';

// Model configuration with rate limits (requests per minute)
interface ModelConfig {
  name: string;
  rpm: number; // Requests per minute limit
  priority: number; // Lower = higher priority
}

// Models verified to work with your API key
// When approaching rate limit, we slow down instead of failing
const MODELS: ModelConfig[] = [
  { name: 'gemini-2.0-flash', rpm: 15, priority: 1 },        // Primary - proven to work
];

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

interface RateLimitTracker {
  requests: number[];  // Timestamps of recent requests
  warnings: number;    // Number of rate limit warnings received
}

export class GeminiVisionAgent {
  private client: GoogleGenerativeAI;
  private models: Map<string, GenerativeModel> = new Map();
  private currentModelIndex: number = 0;
  private rateLimits: Map<string, RateLimitTracker> = new Map();
  private userProfile: UserProfile | null = null;
  private readonly RATE_LIMIT_THRESHOLD = 0.8; // Switch at 80% capacity

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);

    // Initialize all models
    for (const config of MODELS) {
      if (!this.models.has(config.name)) {
        this.models.set(config.name, this.client.getGenerativeModel({ model: config.name }));
        this.rateLimits.set(config.name, { requests: [], warnings: 0 });
      }
    }

    console.log(`[GeminiVision] Initialized with ${this.models.size} model(s)`);
    console.log(`[GeminiVision] Primary model: ${MODELS[0].name}`);
  }

  /**
   * Get the current model, handling fallback if needed
   */
  private getCurrentModel(): { model: GenerativeModel; config: ModelConfig } {
    const config = MODELS[this.currentModelIndex];
    const model = this.models.get(config.name)!;
    return { model, config };
  }

  /**
   * Check rate limit and add delay if needed (instead of switching to unavailable models)
   */
  private async checkRateLimitAndDelay(): Promise<void> {
    const config = MODELS[this.currentModelIndex];
    const tracker = this.rateLimits.get(config.name)!;

    // Clean up old requests (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60000;
    tracker.requests = tracker.requests.filter(t => t > oneMinuteAgo);

    // Calculate current usage
    const usage = tracker.requests.length / config.rpm;

    // If approaching limit, add a delay to stay under
    if (usage >= this.RATE_LIMIT_THRESHOLD) {
      const delayMs = Math.ceil((60000 / config.rpm) * 1.5); // Wait 1.5x the interval between requests
      console.log(`[GeminiVision] ⚠️ Rate limit ${Math.round(usage * 100)}% - waiting ${delayMs}ms to stay under limit`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Keep old method name for compatibility but now it just calls the delay version
  private checkRateLimitAndSwitch(): void {
    // This is now handled asynchronously in analyze()
  }

  /**
   * Record a request for rate limiting
   */
  private recordRequest(): void {
    const config = MODELS[this.currentModelIndex];
    const tracker = this.rateLimits.get(config.name)!;
    tracker.requests.push(Date.now());
  }

  
  /**
   * Get current model status for monitoring
   */
  getModelStatus(): { model: string; usage: number; fallbacksRemaining: number } {
    const config = MODELS[this.currentModelIndex];
    const tracker = this.rateLimits.get(config.name)!;

    // Clean old requests
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = tracker.requests.filter(t => t > oneMinuteAgo).length;

    return {
      model: config.name,
      usage: Math.round((recentRequests / config.rpm) * 100),
      fallbacksRemaining: MODELS.length - this.currentModelIndex - 1
    };
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    console.log(`[GeminiVision] User profile set for: ${profile.name}`);
  }

  async analyze(
    screenshotBase64: string,
    task: string,
    currentUrl: string
  ): Promise<VisionResult> {
    // Check rate limits and delay if needed
    await this.checkRateLimitAndDelay();

    const { model, config } = this.getCurrentModel();

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

    const prompt = `${SYSTEM_PROMPT}

CURRENT TASK: ${task}
CURRENT URL: ${currentUrl}
${userProfileContext}

Analyze this screenshot and decide what action to take next. Respond with JSON only.`;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Record this request
        this.recordRequest();

        const status = this.getModelStatus();
        console.log(`[GeminiVision] Using ${status.model} (${status.usage}% capacity, ${status.fallbacksRemaining} fallbacks)`);

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: screenshotBase64,
            },
          },
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse JSON from response');
        }

        const parsed = JSON.parse(jsonMatch[0]) as VisionResult;

        console.log(`[GeminiVision] Understanding: ${parsed.understanding.substring(0, 100)}...`);
        console.log(`[GeminiVision] Action: ${parsed.action.type} - ${parsed.action.reason}`);

        return parsed;

      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error - wait and retry
        if (error.message?.includes('429') || error.message?.includes('rate') || error.message?.includes('quota')) {
          const waitTime = 5000 * (attempt + 1); // Exponential backoff: 5s, 10s, 15s
          console.log(`[GeminiVision] Rate limit hit, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        console.error(`[GeminiVision] Error on attempt ${attempt + 1}:`, error.message);

        // Wait before retry for other errors
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // All retries failed
    console.error('[GeminiVision] All attempts failed:', lastError?.message);

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
    await this.checkRateLimitAndDelay();
    const { model } = this.getCurrentModel();

    try {
      this.recordRequest();

      const result = await model.generateContent([
        `Current URL: ${currentUrl}\n\nQuestion: ${question}`,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: screenshotBase64,
          },
        },
      ]);

      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('[GeminiVision] Error:', error);
      return 'Error processing question';
    }
  }

  /**
   * Reset to primary model (call when starting a new session)
   */
  resetToPreferredModel(): void {
    this.currentModelIndex = 0;
    // Clear old rate limit data
    for (const tracker of this.rateLimits.values()) {
      tracker.requests = [];
      tracker.warnings = 0;
    }
    console.log(`[GeminiVision] Reset to primary model: ${MODELS[0].name}`);
  }

  clearHistory(): void {
    // Gemini doesn't maintain history in this implementation
  }
}

export default GeminiVisionAgent;
