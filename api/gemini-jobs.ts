/**
 * Vercel Serverless Function: AI-Powered Job Search
 * 
 * Uses Google Gemini 2.5 Flash with Google Search grounding to find
 * real-time job listings - the same capability as Google AI Studio.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

interface JobResult {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salaryRange: string;
    postedAt: string;
    description: string;
    applyUrl: string;
    source: string;
    skills: string[];
}

// System prompt for job searching
const JOB_SEARCH_PROMPT = `You are a job search assistant with access to Google Search. Your task is to find REAL, CURRENT job listings.

CRITICAL RULES:
1. Search for actual job postings on job boards (Indeed, LinkedIn, Glassdoor, company career pages)
2. Return ONLY jobs you find through search - do not make up jobs
3. Include the ACTUAL apply URL from the job posting
4. If you can't find jobs matching the query, return an empty array
5. Focus on entry-level positions unless otherwise specified
6. Extract salary information if available in the posting

For each job found, extract:
- Job title (exact title from posting)
- Company name
- Location 
- Job type (Full-time, Part-time, Contract)
- Salary range (if mentioned)
- Posted date or "Recently" if not clear
- Brief description (first 200 chars of job description)
- Apply URL (the actual link to apply)
- Source (which site you found it on)
- Required skills (if listed)`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q, location = 'United States' } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Get API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('[Gemini Jobs] No API key found');
        return res.status(500).json({ error: 'AI service not configured' });
    }

    console.log(`[Gemini Jobs] Searching for: "${q}" in "${location}"`);

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Build the search prompt
        const searchPrompt = `${JOB_SEARCH_PROMPT}

Search for current job listings matching:
- Query: "${q}"
- Location: "${location}"

Search Google for job postings matching this query. Return up to 10 real job listings you find.

Return a JSON array of job objects with these fields:
id, title, company, location, type, salaryRange, postedAt, description, applyUrl, source, skills (array)`;

        // Use Gemini with Google Search grounding enabled
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: searchPrompt,
            config: {
                tools: [{
                    googleSearch: {} // Enable real-time web search
                }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            company: { type: Type.STRING },
                            location: { type: Type.STRING },
                            type: { type: Type.STRING },
                            salaryRange: { type: Type.STRING },
                            postedAt: { type: Type.STRING },
                            description: { type: Type.STRING },
                            applyUrl: { type: Type.STRING },
                            source: { type: Type.STRING },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            }
        });

        const responseText = response.text;

        if (!responseText) {
            console.error('[Gemini Jobs] Empty response');
            return res.status(200).json({
                jobs: [],
                totalResults: 0,
                source: 'gemini',
                message: 'No jobs found'
            });
        }

        // Parse the response
        let jobs: JobResult[] = [];
        try {
            jobs = JSON.parse(responseText);

            // Ensure each job has an ID
            jobs = jobs.map((job, index) => ({
                ...job,
                id: job.id || `gemini-${Date.now()}-${index}`,
                matchScore: 0, // Will be calculated by frontend
                experienceLevel: 'Entry Level',
                experienceYears: 'Not specified'
            }));
        } catch (parseError) {
            console.error('[Gemini Jobs] Failed to parse response:', parseError);
            return res.status(200).json({
                jobs: [],
                totalResults: 0,
                source: 'gemini',
                message: 'Failed to parse job results'
            });
        }

        console.log(`[Gemini Jobs] Found ${jobs.length} jobs`);

        return res.status(200).json({
            jobs,
            totalResults: jobs.length,
            source: 'gemini',
            query: q,
            location: location
        });

    } catch (error: any) {
        console.error('[Gemini Jobs] Error:', error.message || error);

        if (error.message?.includes('quota') || error.message?.includes('429')) {
            return res.status(429).json({
                error: 'Rate limited',
                jobs: [],
                totalResults: 0
            });
        }

        return res.status(500).json({
            error: 'Job search failed',
            details: error.message || 'Unknown error',
            jobs: [],
            totalResults: 0
        });
    }
}
