/**
 * Vercel Serverless Function: AI Chat
 * 
 * Handles career advice chat requests using Google Gemini AI.
 * Uses @google/genai directly for simplicity and reliability.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// System prompt for career coaching
const SYSTEM_PROMPT = `You are an expert career coach for Jalanea Works, a platform helping entry-level and transitioning professionals. 

Your personality:
- Encouraging but realistic
- Provide specific, actionable steps
- Focus on entry-level and early-career professionals
- Reference modern job search strategies (LinkedIn, networking, portfolio building)
- Keep responses focused and under 150 words

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

    // Generate response using Gemini 1.5 Flash (has separate quota from 2.0)
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: fullPrompt,
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
