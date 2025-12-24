/**
 * Vercel Serverless Function: AI Chat
 * 
 * Handles career advice chat requests using Google Gemini AI.
 * Uses @google/genai directly for simplicity and reliability.
 * Now includes Google Search grounding for real-time research.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// System prompt for career coaching with research capabilities
const SYSTEM_PROMPT = `You are an expert career coach and research assistant for Jalanea Works, a platform helping entry-level and transitioning professionals.

Your capabilities:
- Provide personalized career advice
- Research current job market trends using Google Search
- Find relevant industry news and insights
- Recommend specific companies and opportunities
- Answer questions about salaries, skills, and career paths

Your personality:
- Encouraging but realistic
- Provide specific, actionable steps
- Focus on entry-level and early-career professionals
- Reference modern job search strategies (LinkedIn, networking, portfolio building)
- When researching, cite your sources when possible
- Keep responses focused and under 200 words unless detailed research is requested

When the user asks for research or current information, use your search capabilities to find real, up-to-date data.

Always be supportive and empowering!`;

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

    // Check for API key - try both possible env var names
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('[AI Chat] No API key found. Checked: GOOGLE_GENERATIVE_AI_API_KEY, GEMINI_API_KEY, VITE_GEMINI_API_KEY');
      return res.status(500).json({
        error: 'AI service not configured',
        response: "I'm currently being configured. Please check back soon!"
      });
    }

    console.log('[AI Chat] Processing message:', message.substring(0, 50) + '...');

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey });

    // Create the prompt with system context
    const fullPrompt = `${SYSTEM_PROMPT}

User question: ${message}

Provide a helpful, encouraging response:`;

    // Determine if user is asking for research (triggers Google Search grounding)
    const isResearchQuery = /research|current|latest|trend|news|2024|2025|market|statistics|data|find|search|look up/i.test(message);

    // Generate response using Gemini 2.5 Flash with optional Google Search grounding
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: isResearchQuery ? {
        tools: [{
          googleSearch: {} // Enable Google Search grounding for research queries
        }]
      } : undefined
    });

    const responseText = response.text;

    if (!responseText) {
      console.error('[AI Chat] Empty response from Gemini');
      return res.status(500).json({
        error: 'Empty response',
        response: "I couldn't generate a response. Please try again!"
      });
    }

    console.log('[AI Chat] Response generated successfully');

    return res.status(200).json({
      response: responseText,
      success: true
    });

  } catch (error: any) {
    console.error('[AI Chat] Error:', error.message || error);

    // Check for specific error types
    if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      return res.status(500).json({
        error: 'API key issue',
        response: "There's a configuration issue. Please try again later!"
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit') || error.message?.includes('429')) {
      return res.status(429).json({
        error: 'Rate limited',
        response: "I'm getting a lot of requests right now. Please try again in a moment!"
      });
    }

    return res.status(500).json({
      error: 'AI generation failed',
      response: "I encountered an issue processing your request. Please try again!",
      details: error.message || 'Unknown error'
    });
  }
}
