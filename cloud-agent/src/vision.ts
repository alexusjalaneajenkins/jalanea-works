/**
 * Claude AI Vision Module with Smart Model Routing
 *
 * Automatically selects the cheapest model that can handle each task:
 * - Haiku ($0.00025/1K): Simple clicks, basic navigation, clear buttons
 * - Sonnet 3.5 ($0.003/1K): Form filling, text extraction, moderate complexity
 * - Sonnet 4 ($0.003/1K): Complex reasoning, ambiguous situations, multi-step planning
 *
 * Includes rate limiting, fallback, and cost tracking.
 */

import Anthropic from '@anthropic-ai/sdk';

export interface Action {
  type: 'click' | 'type' | 'scroll' | 'navigate' | 'press' | 'wait' | 'done' | 'error';
  x?: number;
  y?: number;
  text?: string;
  url?: string;
  key?: string;
  direction?: 'up' | 'down';
  amount?: number;
  reason: string;
  // NEW: Element selector for better accuracy
  selector?: string;
  elementDescription?: string;
}

export interface VisionResult {
  understanding: string;
  action: Action;
  confidence: number;
  // NEW: Which model was used
  modelUsed?: string;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  resumeText: string;
  skills: string[];
  experience: string;
  education: string;
  desiredJobTitles: string[];
  desiredSalary?: string;
  workType: 'remote' | 'hybrid' | 'onsite' | 'any';
}

// Model tiers with capabilities and costs
interface ModelTier {
  name: string;
  rpm: number;
  costPer1kTokens: number;
  complexity: 'simple' | 'medium' | 'complex';
  description: string;
}

// Models ordered by cost (cheapest first for smart routing)
// Using verified model names from Anthropic API
const MODEL_TIERS: ModelTier[] = [
  {
    name: 'claude-3-haiku-20240307',
    rpm: 100,
    costPer1kTokens: 0.00025,
    complexity: 'simple',
    description: 'Fast & cheap - clear buttons, basic navigation, obvious actions'
  },
  {
    name: 'claude-sonnet-4-20250514',
    rpm: 50,
    costPer1kTokens: 0.003,
    complexity: 'medium',
    description: 'Balanced - form filling, text extraction, moderate reasoning'
  },
  {
    name: 'claude-sonnet-4-20250514',
    rpm: 50,
    costPer1kTokens: 0.003,
    complexity: 'complex',
    description: 'Best reasoning - ambiguous situations, multi-step planning'
  },
];

// Task complexity patterns
const SIMPLE_PATTERNS = [
  /click.*(button|link|submit|next|continue|apply|search)/i,
  /navigate to/i,
  /scroll (up|down)/i,
  /press (enter|tab|escape)/i,
  /close (popup|modal|dialog)/i,
];

const COMPLEX_PATTERNS = [
  /fill.*(form|application)/i,
  /analyze|understand|figure out/i,
  /choose|decide|select.*(best|right|appropriate)/i,
  /multiple (options|choices)/i,
  /what should|how to/i,
  /error|problem|issue|stuck/i,
];

interface RateLimitTracker {
  requests: number[];
  warnings: number;
}

// System prompt optimized for element selection
const SYSTEM_PROMPT = `You are an AI agent that helps users apply to jobs automatically. You analyze screenshots and decide what action to take.

CRITICAL WORKFLOW RULES:
1. To fill an input field: FIRST click it, THEN type text (two separate actions)
2. After clicking an input field, your NEXT action should be "type" with the text to enter
3. NEVER click the same element twice in a row - if you just clicked an input, NOW TYPE into it
4. After typing, press Enter or click the next field/button

Available actions:
- click: Click an element (provide x,y AND selector)
- type: Type text into the ALREADY FOCUSED field (no need to click again!)
- scroll: Scroll up or down
- navigate: Go to a URL
- press: Press a key (Enter, Tab, Escape)
- wait: Wait for page to load
- done: Task complete
- error: Cannot proceed

ELEMENT IDENTIFICATION (for clicks):
- "input[placeholder='Search']" for search boxes
- "button:has-text('Apply')" for buttons with text
- "#email" for elements with ID
- ".submit-btn" for elements with class

IMPORTANT: When you see "LAST ACTION: click" on an input field, your next action should be "type"!

Respond in JSON:
{
  "understanding": "What you see on screen",
  "action": {
    "type": "click|type|scroll|navigate|press|wait|done|error",
    "x": 640,
    "y": 400,
    "selector": "button.apply-btn",
    "elementDescription": "Blue Apply button",
    "text": "text to type if applicable",
    "url": "url if navigating",
    "key": "key to press",
    "direction": "up|down",
    "amount": 300,
    "reason": "Why this action"
  },
  "confidence": 0.95
}`;

// Simpler prompt for Haiku (cheaper, faster)
const SIMPLE_PROMPT = `You analyze screenshots and decide one action. Be concise.

RULES:
- After clicking an input field, your NEXT action must be "type" with the text
- NEVER click the same element twice - if you clicked an input, NOW TYPE
- After typing, press Enter or click next element

Actions: click (x,y + selector), type, scroll, navigate, press, wait, done, error

JSON response only:
{
  "understanding": "Brief description",
  "action": {
    "type": "action_type",
    "x": 640, "y": 400,
    "selector": "button.btn",
    "text": "text to type",
    "reason": "Why"
  },
  "confidence": 0.9
}`;

export class VisionAgent {
  private client: Anthropic;
  private rateLimits: Map<string, RateLimitTracker> = new Map();
  private userProfile: UserProfile | null = null;
  private readonly RATE_LIMIT_THRESHOLD = 0.8;

  // Cost tracking
  private totalTokensUsed: number = 0;
  private estimatedCost: number = 0;
  private modelUsageCounts: Map<string, number> = new Map();

  // Smart routing settings
  private autoRouting: boolean = true;
  private preferredComplexity: 'simple' | 'medium' | 'complex' = 'simple';
  private escalationHistory: Map<string, number> = new Map(); // Track task escalations

  constructor(apiKey: string, options: { autoRouting?: boolean } = {}) {
    this.client = new Anthropic({ apiKey });
    this.autoRouting = options.autoRouting ?? true;

    // Initialize rate limit trackers
    for (const tier of MODEL_TIERS) {
      this.rateLimits.set(tier.name, { requests: [], warnings: 0 });
      this.modelUsageCounts.set(tier.name, 0);
    }

    console.log(`[ClaudeVision] Initialized with smart routing: ${this.autoRouting ? 'ON' : 'OFF'}`);
    console.log(`[ClaudeVision] Model tiers: ${MODEL_TIERS.map(m => m.name.split('-').slice(1, 3).join('-')).join(' → ')}`);
  }

  /**
   * Analyze task complexity to select appropriate model
   */
  private analyzeComplexity(
    task: string,
    previousActions: Action[] = [],
    retryCount: number = 0
  ): 'simple' | 'medium' | 'complex' {
    // If we've retried, escalate complexity
    if (retryCount > 0) {
      console.log(`[ClaudeVision] Retry ${retryCount} - escalating complexity`);
      if (retryCount === 1) return 'medium';
      return 'complex';
    }

    // Check for simple patterns
    for (const pattern of SIMPLE_PATTERNS) {
      if (pattern.test(task)) {
        console.log(`[ClaudeVision] Task matches simple pattern`);
        return 'simple';
      }
    }

    // Check for complex patterns
    for (const pattern of COMPLEX_PATTERNS) {
      if (pattern.test(task)) {
        console.log(`[ClaudeVision] Task matches complex pattern`);
        return 'complex';
      }
    }

    // If recent actions show repeated failures or stuck state, escalate
    if (previousActions.length >= 3) {
      const lastThree = previousActions.slice(-3);
      const sameAction = lastThree.every(a =>
        a.type === lastThree[0].type &&
        Math.abs((a.x || 0) - (lastThree[0].x || 0)) < 50 &&
        Math.abs((a.y || 0) - (lastThree[0].y || 0)) < 50
      );
      if (sameAction) {
        console.log(`[ClaudeVision] Detected stuck state - escalating to complex`);
        return 'complex';
      }
    }

    // Default to medium for balanced performance
    return 'medium';
  }

  /**
   * Select the best model for the task
   */
  private selectModel(complexity: 'simple' | 'medium' | 'complex'): ModelTier {
    // Find models that can handle this complexity
    const suitableModels = MODEL_TIERS.filter(m => {
      if (complexity === 'simple') return true; // All can handle simple
      if (complexity === 'medium') return m.complexity !== 'simple';
      return m.complexity === 'complex';
    });

    // Sort by cost and select cheapest available
    for (const model of suitableModels) {
      const tracker = this.rateLimits.get(model.name)!;
      const oneMinuteAgo = Date.now() - 60000;
      const recentRequests = tracker.requests.filter(t => t > oneMinuteAgo).length;
      const usage = recentRequests / model.rpm;

      if (usage < this.RATE_LIMIT_THRESHOLD) {
        return model;
      }
    }

    // All preferred models at capacity - use any available
    for (const model of MODEL_TIERS) {
      const tracker = this.rateLimits.get(model.name)!;
      const oneMinuteAgo = Date.now() - 60000;
      const recentRequests = tracker.requests.filter(t => t > oneMinuteAgo).length;
      if (recentRequests < model.rpm) {
        console.log(`[ClaudeVision] ⚠️ Preferred models busy, using ${model.name}`);
        return model;
      }
    }

    // All at capacity - return cheapest and we'll delay
    return MODEL_TIERS[0];
  }

  /**
   * Check rate limit and delay if needed
   */
  private async checkRateLimitAndManage(model: ModelTier): Promise<void> {
    const tracker = this.rateLimits.get(model.name)!;
    const oneMinuteAgo = Date.now() - 60000;
    tracker.requests = tracker.requests.filter(t => t > oneMinuteAgo);

    const usage = tracker.requests.length / model.rpm;

    if (usage >= this.RATE_LIMIT_THRESHOLD) {
      const delayMs = Math.ceil((60000 / model.rpm) * 1.5);
      console.log(`[ClaudeVision] ⚠️ Rate limit ${Math.round(usage * 100)}% on ${model.name} - waiting ${delayMs}ms`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  private recordRequest(modelName: string): void {
    const tracker = this.rateLimits.get(modelName)!;
    tracker.requests.push(Date.now());

    const count = this.modelUsageCounts.get(modelName) || 0;
    this.modelUsageCounts.set(modelName, count + 1);
  }

  /**
   * Get model status for monitoring
   */
  getModelStatus(): {
    currentModel: string;
    usage: number;
    totalTokens: number;
    estimatedCost: string;
    modelBreakdown: { model: string; calls: number; percentage: string }[];
    autoRouting: boolean;
  } {
    // Get most recently used model
    let currentModel = MODEL_TIERS[0].name;
    let maxCalls = 0;
    for (const [model, calls] of this.modelUsageCounts) {
      if (calls > maxCalls) {
        maxCalls = calls;
        currentModel = model;
      }
    }

    const tracker = this.rateLimits.get(currentModel)!;
    const model = MODEL_TIERS.find(m => m.name === currentModel)!;
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = tracker.requests.filter(t => t > oneMinuteAgo).length;

    // Calculate breakdown
    const totalCalls = Array.from(this.modelUsageCounts.values()).reduce((a, b) => a + b, 0);
    const breakdown = MODEL_TIERS.map(m => ({
      model: m.name.split('-').slice(1, 3).join('-'),
      calls: this.modelUsageCounts.get(m.name) || 0,
      percentage: totalCalls > 0
        ? (((this.modelUsageCounts.get(m.name) || 0) / totalCalls) * 100).toFixed(1) + '%'
        : '0%'
    }));

    return {
      currentModel: currentModel.split('-').slice(1, 3).join('-'),
      usage: Math.round((recentRequests / model.rpm) * 100),
      totalTokens: this.totalTokensUsed,
      estimatedCost: `$${this.estimatedCost.toFixed(4)}`,
      modelBreakdown: breakdown,
      autoRouting: this.autoRouting,
    };
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    console.log(`[ClaudeVision] User profile set for: ${profile.name}`);
  }

  /**
   * Enable/disable auto routing
   */
  setAutoRouting(enabled: boolean): void {
    this.autoRouting = enabled;
    console.log(`[ClaudeVision] Auto routing: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Force a specific complexity tier
   */
  setPreferredComplexity(complexity: 'simple' | 'medium' | 'complex'): void {
    this.preferredComplexity = complexity;
  }

  async analyze(
    screenshotBase64: string,
    task: string,
    currentUrl: string,
    options: {
      previousActions?: Action[];
      retryCount?: number;
      forceModel?: string;
    } = {}
  ): Promise<VisionResult> {
    const { previousActions = [], retryCount = 0, forceModel } = options;

    // Determine complexity and select model
    let complexity: 'simple' | 'medium' | 'complex';
    let selectedModel: ModelTier;

    if (forceModel) {
      selectedModel = MODEL_TIERS.find(m => m.name.includes(forceModel)) || MODEL_TIERS[1];
      complexity = selectedModel.complexity;
    } else if (this.autoRouting) {
      complexity = this.analyzeComplexity(task, previousActions, retryCount);
      selectedModel = this.selectModel(complexity);
    } else {
      complexity = this.preferredComplexity;
      selectedModel = this.selectModel(complexity);
    }

    // Check rate limit
    await this.checkRateLimitAndManage(selectedModel);

    const userProfileContext = this.userProfile
      ? `\nUSER PROFILE:\n- Name: ${this.userProfile.name}\n- Email: ${this.userProfile.email}\n- Phone: ${this.userProfile.phone}\n- Location: ${this.userProfile.location}\n- Skills: ${this.userProfile.skills.join(', ')}\n- Desired Jobs: ${this.userProfile.desiredJobTitles.join(', ')}\n- Work Type: ${this.userProfile.workType}\n`
      : '';

    // Build last action context to prevent repeated clicks
    let lastActionContext = '';
    if (previousActions.length > 0) {
      const lastAction = previousActions[previousActions.length - 1];
      lastActionContext = `\n\n⚠️ LAST ACTION: ${lastAction.type}`;
      if (lastAction.type === 'click' && lastAction.selector) {
        lastActionContext += ` on "${lastAction.selector}"`;
        lastActionContext += `\n👉 Since you just CLICKED an input field, your next action should be TYPE with the text to enter!`;
      } else if (lastAction.type === 'click' && lastAction.elementDescription) {
        lastActionContext += ` on "${lastAction.elementDescription}"`;
        if (lastAction.elementDescription.toLowerCase().includes('input') ||
            lastAction.elementDescription.toLowerCase().includes('field') ||
            lastAction.elementDescription.toLowerCase().includes('search')) {
          lastActionContext += `\n👉 Since you just CLICKED an input field, your next action should be TYPE with the text to enter!`;
        }
      } else if (lastAction.type === 'type') {
        lastActionContext += ` "${lastAction.text?.substring(0, 30)}..."`;
        lastActionContext += `\n👉 After typing, you should press Enter or click the next field/button.`;
      }
    }

    // Use simpler prompt for simple tasks
    const systemPrompt = complexity === 'simple' ? SIMPLE_PROMPT : SYSTEM_PROMPT;

    const userMessage = `TASK: ${task}\nURL: ${currentUrl}${userProfileContext}${lastActionContext}\n\nAnalyze the screenshot and decide the next action.`;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        this.recordRequest(selectedModel.name);

        const modelShort = selectedModel.name.split('-').slice(1, 3).join('-');
        console.log(`[ClaudeVision] Using ${modelShort} (${complexity}) - $${selectedModel.costPer1kTokens}/1K tokens`);

        const response = await this.client.messages.create({
          model: selectedModel.name,
          max_tokens: complexity === 'simple' ? 512 : 1024,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: screenshotBase64 } },
              { type: 'text', text: userMessage },
            ],
          }],
        });

        // Track tokens and cost
        const inputTokens = response.usage?.input_tokens || 0;
        const outputTokens = response.usage?.output_tokens || 0;
        this.totalTokensUsed += inputTokens + outputTokens;
        this.estimatedCost += ((inputTokens + outputTokens) / 1000) * selectedModel.costPer1kTokens;

        const textContent = response.content.find(block => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          throw new Error('No text response from Claude');
        }

        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse JSON from response');
        }

        const result = JSON.parse(jsonMatch[0]) as VisionResult;
        result.modelUsed = modelShort;
        result.complexity = complexity;

        console.log(`[ClaudeVision] Understanding: ${result.understanding.substring(0, 80)}...`);
        console.log(`[ClaudeVision] Action: ${result.action.type} - ${result.action.reason}`);
        if (result.action.selector) {
          console.log(`[ClaudeVision] Selector: ${result.action.selector}`);
        }

        return result;

      } catch (error: any) {
        lastError = error;

        // Handle rate limits and model overload
        if (error.status === 429 || error.status === 529) {
          console.log(`[ClaudeVision] Model unavailable, trying next tier...`);

          // Try next model tier
          const currentIndex = MODEL_TIERS.findIndex(m => m.name === selectedModel.name);
          if (currentIndex < MODEL_TIERS.length - 1) {
            selectedModel = MODEL_TIERS[currentIndex + 1];
            continue;
          }
        }

        console.error(`[ClaudeVision] Error on attempt ${attempt + 1}:`, error.message);

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    console.error('[ClaudeVision] All attempts failed:', lastError?.message);

    return {
      understanding: 'Error analyzing screenshot',
      action: { type: 'error', reason: lastError?.message || 'Unknown error' },
      confidence: 0,
      modelUsed: selectedModel.name.split('-').slice(1, 3).join('-'),
      complexity,
    };
  }

  async ask(screenshotBase64: string, question: string, currentUrl: string): Promise<string> {
    const model = this.selectModel('medium');
    await this.checkRateLimitAndManage(model);

    try {
      this.recordRequest(model.name);

      const response = await this.client.messages.create({
        model: model.name,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: screenshotBase64 } },
            { type: 'text', text: `URL: ${currentUrl}\n\nQuestion: ${question}` },
          ],
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      return textContent?.type === 'text' ? textContent.text : 'No response';
    } catch (error) {
      console.error('[ClaudeVision] Error asking question:', error);
      return 'Error processing question';
    }
  }

  resetToPreferredModel(): void {
    for (const tracker of this.rateLimits.values()) {
      tracker.requests = [];
      tracker.warnings = 0;
    }
    console.log(`[ClaudeVision] Rate limits reset`);
  }

  getCostSummary(): {
    tokens: number;
    cost: string;
    breakdown: { model: string; calls: number; percentage: string }[];
  } {
    const status = this.getModelStatus();
    return {
      tokens: this.totalTokensUsed,
      cost: `$${this.estimatedCost.toFixed(4)}`,
      breakdown: status.modelBreakdown,
    };
  }

  clearHistory(): void {
    this.totalTokensUsed = 0;
    this.estimatedCost = 0;
    for (const model of MODEL_TIERS) {
      this.modelUsageCounts.set(model.name, 0);
    }
  }
}

export default VisionAgent;
