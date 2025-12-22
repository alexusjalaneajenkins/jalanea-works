/**
 * Vercel Serverless Function: AI Chat
 * 
 * Handles career advice chat requests using Gemini AI.
 * This runs server-side so it can access GOOGLE_GENERATIVE_AI_API_KEY.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// System prompt for career coaching
const SYSTEM_PROMPT = `You are an expert career coach for Jalanea Works. Your goal is to help entry-level and transitioning professionals. Be empowering, concise, and strategic. Focus on actionable advice.

Key principles:
- Be encouraging but realistic
- Provide specific, actionable steps
- Focus on entry-level and early-career professionals
- Reference modern job search strategies (LinkedIn, networking, portfolio building)
- Keep responses focused and under 200 words unless asked for more detail`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check for API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        response: "I'm currently being configured. Please check back soon!" 
      });
    }

    console.log('[AI Chat] Processing message:', message.substring(0, 50) + '...');

    // Use Gemini Pro for complex conversational advice
    const model = google('gemini-1.5-pro');

    const result = await generateText({
      model,
      prompt: message,
      system: SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: 500,
    });

    console.log('[AI Chat] Response generated successfully');

    return res.status(200).json({
      response: result.text,
      success: true
    });

  } catch (error: any) {
    console.error('[AI Chat] Error:', error);
    
    // Check for specific error types
    if (error.message?.includes('API key')) {
      return res.status(500).json({
        error: 'API key issue',
        response: "There's a configuration issue with my AI brain. The team has been notified!"
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limited',
        response: "I'm getting a lot of requests right now. Please try again in a moment!"
      });
    }

    return res.status(500).json({
      error: 'AI generation failed',
      response: "I encountered an issue processing your request. Please try again!"
    });
  }
}
