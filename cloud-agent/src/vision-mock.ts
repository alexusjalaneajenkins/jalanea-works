/**
 * Mock Vision Module
 *
 * For testing the agent flow without making API calls.
 * Returns pre-programmed responses based on URL patterns.
 */

import { Action, VisionResult, UserProfile } from './vision.js';

export class MockVisionAgent {
  private userProfile: UserProfile | null = null;
  private actionCount: number = 0;

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    console.log(`[MockVision] User profile set for: ${profile.name}`);
  }

  /**
   * Mock analyze - returns pre-programmed responses based on URL
   */
  async analyze(
    screenshotBase64: string,
    task: string,
    currentUrl: string
  ): Promise<VisionResult> {
    this.actionCount++;

    console.log(`[MockVision] Analyzing (action #${this.actionCount})`);
    console.log(`[MockVision] URL: ${currentUrl}`);
    console.log(`[MockVision] Task: ${task.substring(0, 50)}...`);

    // Simulate thinking delay
    await this.sleep(500);

    // Return mock responses based on URL patterns
    return this.getMockResponse(currentUrl, task);
  }

  private getMockResponse(url: string, task: string): VisionResult {
    // Initial state - no URL yet
    if (!url || url === 'about:blank') {
      return {
        understanding: 'Browser is open with blank page. Need to navigate to a job site.',
        action: {
          type: 'navigate',
          url: 'https://www.indeed.com',
          reason: 'Starting by navigating to Indeed job search',
        },
        confidence: 0.95,
      };
    }

    // Indeed homepage
    if (url.includes('indeed.com') && !url.includes('jobs')) {
      return {
        understanding: 'I see the Indeed homepage with a search bar for job titles and location.',
        action: {
          type: 'click',
          x: 400,
          y: 200,
          reason: 'Clicking on the job search input field',
        },
        confidence: 0.9,
      };
    }

    // Indeed with search
    if (url.includes('indeed.com') && this.actionCount < 5) {
      return {
        understanding: 'Search field is focused. Ready to type job search query.',
        action: {
          type: 'type',
          text: 'web developer',
          reason: 'Typing job search query',
        },
        confidence: 0.9,
      };
    }

    // After a few actions, simulate finding results
    if (url.includes('indeed.com') && this.actionCount < 10) {
      return {
        understanding: 'I see job search results. There are several web developer positions listed.',
        action: {
          type: 'scroll',
          direction: 'down',
          amount: 300,
          reason: 'Scrolling to see more job listings',
        },
        confidence: 0.85,
      };
    }

    // LinkedIn
    if (url.includes('linkedin.com')) {
      return {
        understanding: 'I see LinkedIn. May need to log in to access job applications.',
        action: {
          type: 'error',
          reason: 'LinkedIn requires login. Cannot proceed without user authentication.',
        },
        confidence: 0.95,
      };
    }

    // Generic - complete after some actions
    if (this.actionCount >= 10) {
      return {
        understanding: 'Completed browsing job listings. Found several relevant positions.',
        action: {
          type: 'done',
          reason: 'Mock test completed successfully. Browsed job listings and demonstrated flow.',
        },
        confidence: 0.95,
      };
    }

    // Default fallback
    return {
      understanding: `Viewing page at ${url}. Analyzing content...`,
      action: {
        type: 'scroll',
        direction: 'down',
        amount: 200,
        reason: 'Scrolling to explore page content',
      },
      confidence: 0.7,
    };
  }

  async ask(
    screenshotBase64: string,
    question: string,
    currentUrl: string
  ): Promise<string> {
    await this.sleep(300);
    return `[Mock Response] This is a mock response to: "${question}". In production, Claude would analyze the screenshot and provide a real answer.`;
  }

  clearHistory(): void {
    this.actionCount = 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default MockVisionAgent;
