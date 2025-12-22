/**
 * AI Model Router
 * 
 * Routes AI requests to optimal models based on task complexity.
 * Uses Gemini Flash for simple tasks (fast, cheap) and Pro for complex reasoning.
 */

import { google } from '@ai-sdk/google';
import { generateText, streamText, GenerateTextResult, StreamTextResult } from 'ai';

// Model definitions
const MODELS = {
  // Fast, cheap model for simple tasks
  flash: google('gemini-2.0-flash'),
  // Smarter model for complex reasoning
  pro: google('gemini-1.5-pro'),
} as const;

// Task complexity levels
export type TaskComplexity = 'simple' | 'complex';

// Task type definitions with their complexity mappings
export const TASK_COMPLEXITY_MAP: Record<string, TaskComplexity> = {
  // Simple tasks (use Flash)
  'suggestRoles': 'simple',
  'scheduleSuggestions': 'simple',
  'resumeStrategy': 'simple',
  'industryPulse': 'simple',
  
  // Complex tasks (use Pro)
  'careerAdvice': 'complex',
  'generateResume': 'complex',
  'jobIntel': 'complex',
  'wellnessInsights': 'complex',
  'jobMatch': 'complex',
};

/**
 * Get the appropriate model based on task type
 */
export function getModelForTask(taskType: keyof typeof TASK_COMPLEXITY_MAP) {
  const complexity = TASK_COMPLEXITY_MAP[taskType] || 'simple';
  const model = complexity === 'complex' ? MODELS.pro : MODELS.flash;
  
  // Log for debugging (can be removed in production)
  console.log(`[AI Router] Task: ${taskType} → Model: ${complexity === 'complex' ? 'Pro' : 'Flash'}`);
  
  return model;
}

/**
 * Generate text with automatic model routing
 */
export async function generateWithRouting(
  taskType: keyof typeof TASK_COMPLEXITY_MAP,
  prompt: string,
  options?: {
    system?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const model = getModelForTask(taskType);
  
  try {
    const result = await generateText({
      model,
      prompt,
      system: options?.system,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });
    
    return result.text;
  } catch (error) {
    console.error(`[AI Router] Error with ${taskType}:`, error);
    throw error;
  }
}

/**
 * Generate structured output with automatic model routing
 */
export async function generateObjectWithRouting<T>(
  taskType: keyof typeof TASK_COMPLEXITY_MAP,
  prompt: string,
  options?: {
    system?: string;
    temperature?: number;
  }
): Promise<T | null> {
  const model = getModelForTask(taskType);
  
  try {
    const result = await generateText({
      model,
      prompt,
      system: options?.system,
      temperature: options?.temperature,
    });
    
    // Parse JSON from response
    const text = result.text;
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || 
                      text.match(/\[[\s\S]*\]/) || 
                      text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr) as T;
    }
    
    // Try parsing the entire response as JSON
    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`[AI Router] JSON parse error for ${taskType}:`, error);
    return null;
  }
}

/**
 * Stream text with automatic model routing (for chat UI)
 */
export function streamWithRouting(
  taskType: keyof typeof TASK_COMPLEXITY_MAP,
  prompt: string,
  options?: {
    system?: string;
    temperature?: number;
  }
) {
  const model = getModelForTask(taskType);
  
  return streamText({
    model,
    prompt,
    system: options?.system,
    temperature: options?.temperature,
  });
}

// Re-export for direct model access if needed
export { MODELS };
