import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, JobAnalysis, Job } from "../types";

// Initialize Gemini AI with Vite environment variable (kept for structured output functions)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// ============================================
// JOB CACHE: Save API costs with 4-hour TTL
// ============================================

interface CachedJobResult {
    jobs: Job[];
    timestamp: number;
}

class JobCache {
    private cache: Map<string, CachedJobResult> = new Map();
    private readonly TTL_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    /**
     * Generate a unique cache key from search parameters
     */
    private generateKey(query: string, location?: string, preferences?: string): string {
        const raw = `${query}|${location || ''}|${preferences || ''}`.toLowerCase().trim();
        // Simple hash function for consistent keys
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            const char = raw.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `jobs_${Math.abs(hash)}`;
    }

    /**
     * Get cached jobs if they exist and are not expired
     */
    get(query: string, location?: string, preferences?: string): Job[] | null {
        const key = this.generateKey(query, location, preferences);
        const cached = this.cache.get(key);

        if (!cached) {
            console.log(`🔍 [CACHE MISS] No cached results for: ${query}`);
            return null;
        }

        const age = Date.now() - cached.timestamp;
        if (age > this.TTL_MS) {
            console.log(`⏰ [CACHE EXPIRED] Results older than 4 hours for: ${query}`);
            this.cache.delete(key);
            return null;
        }

        const ageMinutes = Math.round(age / 60000);
        console.log(`✅ [CACHE HIT] Returning ${cached.jobs.length} cached jobs (${ageMinutes}m old)`);
        return cached.jobs;
    }

    /**
     * Store jobs in cache with current timestamp
     */
    set(query: string, location: string | undefined, preferences: string | undefined, jobs: Job[]): void {
        const key = this.generateKey(query, location, preferences);
        this.cache.set(key, {
            jobs,
            timestamp: Date.now()
        });
        console.log(`💾 [CACHE SAVE] Stored ${jobs.length} jobs for: ${query}`);
    }

    /**
     * Clear the entire cache (useful for debugging)
     */
    clear(): void {
        this.cache.clear();
        console.log('🧹 [CACHE CLEARED]');
    }
}

// Singleton cache instance
const jobCache = new JobCache();

/**
 * User context for personalized AI responses
 */
export interface AIUserContext {
    name?: string | null;
    school?: string | null;
    program?: string | null;
    skills?: {
        technical?: string[];
        soft?: string[];
        design?: string[];
    } | null;
    targetSalary?: string;
    availability?: string | null;
    challenges?: string[];
    location?: string | null;
    commuteMethod?: string[];
    commuteWillingness?: string | null;
}

/**
 * Build a personalized system prompt for the AI based on user context
 */
const buildSystemPrompt = (userContext?: AIUserContext | null): string => {
    const base = `You are an expert career coach and research assistant for Jalanea Works, a platform helping Orlando-area community college graduates launch their careers.

Your capabilities:
- Provide personalized career advice
- Research current job market trends
- Find relevant industry news and insights
- Recommend specific companies and opportunities in Orlando
- Answer questions about salaries, skills, and career paths

Your personality:
- Encouraging but realistic
- Provide specific, actionable steps
- Focus on entry-level and early-career professionals
- Reference modern job search strategies (LinkedIn, networking, portfolio building)
- Keep responses focused and under 200 words unless detailed analysis is requested

Always be supportive and empowering!`;

    if (userContext && Object.keys(userContext).some(key => (userContext as any)[key])) {
        let contextSection = '\n\n--- USER CONTEXT (personalize your advice) ---';

        if (userContext.name) contextSection += `\nName: ${userContext.name}`;
        if (userContext.school) contextSection += `\nSchool: ${userContext.school}`;
        if (userContext.program) contextSection += `\nProgram: ${userContext.program}`;
        if (userContext.skills?.technical?.length) contextSection += `\nTechnical Skills: ${userContext.skills.technical.join(', ')}`;
        if (userContext.skills?.soft?.length) contextSection += `\nSoft Skills: ${userContext.skills.soft.join(', ')}`;
        if (userContext.targetSalary) contextSection += `\nTarget Salary: ${userContext.targetSalary}`;
        if (userContext.location) contextSection += `\nLocation: ${userContext.location}`;
        if (userContext.availability) contextSection += `\nAvailability: ${userContext.availability}`;
        if (userContext.challenges?.length) contextSection += `\nCurrent Challenges: ${userContext.challenges.join(', ')}`;

        contextSection += '\n\nUse this context to personalize your advice. Don\'t ask for information you already have.';
        contextSection += '\n--- END USER CONTEXT ---';

        return base + contextSection;
    }

    return base;
};

/**
 * Get career advice - tries serverless API first, falls back to direct Gemini call
 * @param userQuery - The user's message
 * @param userContext - Optional user profile context for personalization
 */
export const getCareerAdvice = async (userQuery: string, userContext?: AIUserContext): Promise<string> => {
    // First try the Vercel serverless API (works in production)
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userQuery,
                userContext: userContext || null
            }),
        });

        // If endpoint exists and returns valid response
        if (response.ok) {
            const data = await response.json();
            return data.response || "I couldn't generate a response at this time.";
        }

        // If 404, fall through to client-side fallback
        if (response.status !== 404) {
            const data = await response.json().catch(() => ({}));
            console.error('Chat API error:', response.status, data);
            return data.response || "I'm having trouble connecting right now. Please try again!";
        }

        console.log('[AI Chat] API returned 404, using client-side fallback');
    } catch (error) {
        console.log('[AI Chat] API call failed, using client-side fallback:', error);
    }

    // Client-side fallback: Call Gemini directly (for local development)
    if (!apiKey) {
        console.error('[AI Chat] No API key available for fallback');
        return "I'm not configured properly. Please check your API key settings.";
    }

    try {
        console.log('[AI Chat] Using direct Gemini API call');

        const systemPrompt = buildSystemPrompt(userContext);
        const fullPrompt = `${systemPrompt}\n\nUser question: ${userQuery}\n\nProvide a helpful, encouraging response:`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: fullPrompt,
        });

        const responseText = response.text;
        if (!responseText) {
            return "I couldn't generate a response at this time.";
        }

        return responseText;
    } catch (error) {
        console.error('[AI Chat] Direct Gemini call failed:', error);
        return "I'm having trouble connecting to the career intelligence network right now. Please try again later.";
    }
};

export const analyzeJobMatch = async (resumeText: string, jobDescription: string): Promise<string> => {
    try {
        const prompt = `Analyze the fit between this resume and job description. Provide a match score (0-100) and 3 key missing skills.\n\nResume: ${resumeText}\n\nJob: ${jobDescription}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "Analysis failed.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Could not analyze job match.";
    }
};

export const getFollowUpStrategy = async (company: string, daysSinceApplied: number): Promise<string> => {
    if (daysSinceApplied < 3) return "Too early. Research recent company news instead.";
    if (daysSinceApplied === 3) return "Perfect time. Send a LinkedIn connection request to the hiring manager.";
    if (daysSinceApplied > 7) return "Critical. Send a short, value-focused email restating your interest.";
    return "Monitor status.";
};

/**
 * Clean AI response to remove any thinking/reasoning text
 * This ensures only the actual resume content is returned
 * IMPORTANT: Preserves the H1 header (candidate name) and contact info
 */
const cleanResumeResponse = (response: string): string => {
    if (!response) return response;

    console.log('[Resume Cleaner] Raw response length:', response.length);
    console.log('[Resume Cleaner] First 200 chars:', response.substring(0, 200));

    let cleaned = response;

    // STEP 1: Find the H1 header (candidate name) - this is the TRUE start of the resume
    // The H1 should be: # Name Here or # Name
    const h1Match = cleaned.match(/^#\s+.+$/m);

    if (h1Match && h1Match.index !== undefined) {
        // Found an H1 header - strip everything BEFORE it (that's the thinking text)
        const beforeH1 = cleaned.substring(0, h1Match.index).trim();

        // Only strip if there's actual content before H1 (thinking text)
        if (beforeH1.length > 0) {
            console.log('[Resume Cleaner] Stripping', beforeH1.length, 'chars before H1 header');
            cleaned = cleaned.substring(h1Match.index);
        }

        console.log('[Resume Cleaner] Found H1 header:', h1Match[0]);
    } else {
        console.log('[Resume Cleaner] WARNING: No H1 header found in response');

        // Fallback: Look for ## Professional Summary as backup
        const summaryMatch = cleaned.match(/^##\s*(Professional Summary|Summary|Profile)/im);
        if (summaryMatch && summaryMatch.index !== undefined && summaryMatch.index > 0) {
            const beforeSummary = cleaned.substring(0, summaryMatch.index).trim();
            // Only strip if content before looks like thinking text (short, no markdown structure)
            if (beforeSummary.length > 0 && beforeSummary.length < 500 && !beforeSummary.includes('#')) {
                console.log('[Resume Cleaner] Fallback: Stripping content before ## Summary');
                cleaned = cleaned.substring(summaryMatch.index);
            }
        }
    }

    // STEP 2: Remove AI thinking patterns from the beginning only (not from body)
    // Be conservative - only remove obvious thinking text before any content
    const thinkingStarters = [
        /^(Self-Correction:.*?\n)+/i,
        /^(Wait,.*?\n)+/i,
        /^(Looking closer.*?\n)+/i,
        /^(Decision:.*?\n)+/i,
        /^(Key constraint:.*?\n)+/i,
        /^(Scenario [A-Z]:.*?\n)+/i,
        /^(Note:.*?\n)+/i,
        /^(I will.*?\n)+/i,
        /^(Here is.*?\n)+/i,
        /^(Based on.*?\n)+/i,
        /^(Let me.*?\n)+/i,
    ];

    thinkingStarters.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });

    // STEP 3: Remove trailing explanations or notes
    const trailingPatterns = [
        /\n---+\n[\s\S]*$/,                          // Everything after a separator line
        /\n\*\*Note:\*\*[\s\S]*$/,                   // Trailing notes
        /\n\[Note:[\s\S]*$/,                         // Bracketed notes
        /\nI hope this[\s\S]*$/i,                    // Common AI sign-off
        /\nLet me know[\s\S]*$/i,                    // Common AI sign-off
        /\nThis resume[\s\S]*optimized[\s\S]*$/i,   // Explanation about the resume
        /\nFeel free[\s\S]*$/i,                      // Common AI sign-off
    ];

    trailingPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });

    const result = cleaned.trim();
    console.log('[Resume Cleaner] Final output length:', result.length);
    console.log('[Resume Cleaner] Starts with:', result.substring(0, 100));

    return result;
};

export type WritingTone = 'formal' | 'innovative' | 'narrative';

export const generateResume = async (type: string, userProfile: UserProfile, jobDescription: string, tone: WritingTone = 'formal'): Promise<string> => {
    try {
        // Get the candidate's name (prefer fullName, fallback to name)
        const candidateName = userProfile.fullName || userProfile.name || 'Candidate Name';
        const candidateEmail = userProfile.email || '';

        // Build full location string: "Orlando, FL 32801"
        // Check for individual city/state/zip fields, or parse from location field
        const profile = userProfile as any;
        const city = profile.city || 'Orlando';
        const state = profile.state || 'FL';
        const zipCode = profile.zipCode || profile.zip || '';

        // If location field exists and looks like a full address, use it
        // Otherwise build from city/state/zip
        let candidateLocation = 'Orlando, FL';
        if (userProfile.location) {
            // Check if location already has city/state format (contains comma or letters)
            if (/[a-zA-Z].*,/.test(userProfile.location) || /[a-zA-Z]{2,}/.test(userProfile.location)) {
                // Location already has city/state info
                candidateLocation = userProfile.location;
            } else if (/^\d{5}(-\d{4})?$/.test(userProfile.location)) {
                // Location is just a zip code - build full address
                candidateLocation = `${city}, ${state} ${userProfile.location}`;
            } else {
                candidateLocation = userProfile.location;
            }
        } else if (zipCode) {
            // No location field, but have zip code
            candidateLocation = `${city}, ${state} ${zipCode}`;
        } else {
            // Default for Orlando-area users
            candidateLocation = `${city}, ${state}`;
        }

        const candidatePhone = profile.phone || '';
        const candidateLinkedIn = userProfile.linkedinUrl || profile.linkedin || '';
        const candidatePortfolio = userProfile.portfolioUrl || profile.portfolio || '';

        // Build contact info array (only include non-empty values)
        const contactParts: string[] = [];
        if (candidateLocation) contactParts.push(candidateLocation);
        if (candidateEmail) contactParts.push(candidateEmail);
        if (candidatePhone) contactParts.push(candidatePhone);
        if (candidateLinkedIn) contactParts.push(`LinkedIn: ${candidateLinkedIn}`);
        if (candidatePortfolio) contactParts.push(`Portfolio: ${candidatePortfolio}`);
        const contactInfoString = contactParts.join(' | ');

        const educationString = userProfile.education
            .map(e => {
                const degreeLabel = e.degreeType ? `${e.degreeType} in ${e.degree}` : e.degree;
                return `${degreeLabel} from ${e.school} (${e.year || e.gradYear || 'N/A'}) - GPA: ${e.gpa || 'N/A'}`;
            })
            .join('\n');

        const experienceString = userProfile.experience
            .map(e => `Role: ${e.role} at ${e.company} (${e.duration})\nDetails:\n${e.description.map(d => `- ${d}`).join('\n')}`)
            .join('\n\n');

        const skillsString = `
          Technical: ${userProfile.skills.technical.join(', ')}
          Design: ${userProfile.skills.design.join(', ')}
          Soft Skills: ${userProfile.skills.soft.join(', ')}
        `;

        const certsString = userProfile.certifications
            .map(c => `${c.name} (${c.issuer})`)
            .join(', ');

        const isGenericRole = jobDescription.length < 150;

        // Tone-specific writing guidance
        const toneGuidance = {
            formal: `
WRITING TONE: FORMAL (Traditional Corporate)
- Use third-person, objective language
- Employ professional, traditional business vocabulary
- Focus on qualifications, credentials, and accomplishments
- Maintain a serious, authoritative tone
- Use industry-standard phrases and conventional resume language
- Example: "Demonstrated expertise in project management methodologies"`,
            innovative: `
WRITING TONE: INNOVATIVE (Startups & Creative)
- Use dynamic, action-oriented language
- Employ modern, energetic vocabulary
- Focus on impact, disruption, and forward-thinking contributions
- Maintain a confident, ambitious tone
- Use verbs like "launched", "pioneered", "transformed", "accelerated"
- Example: "Launched data-driven initiative that transformed customer engagement"`,
            narrative: `
WRITING TONE: NARRATIVE (Story-Driven & Human)
- Use first-person perspective where appropriate
- Employ warm, authentic, conversational language
- Focus on personal growth, learning journeys, and meaningful impact
- Maintain a genuine, relatable tone
- Tell mini-stories about challenges overcome and lessons learned
- Example: "Through hands-on problem-solving, I discovered my passion for helping users navigate complex systems"`
        };

        const prompt = `Generate a ${type} Resume in Markdown format.

CANDIDATE INFORMATION:
- Name: ${candidateName}
- Email: ${candidateEmail}
- Location: ${candidateLocation}
${candidatePhone ? `- Phone: ${candidatePhone}` : ''}
${candidateLinkedIn ? `- LinkedIn: ${candidateLinkedIn}` : ''}
${candidatePortfolio ? `- Portfolio: ${candidatePortfolio}` : ''}

EDUCATION:
${educationString}

EXPERIENCE:
${experienceString}

SKILLS:
${skillsString}

CERTIFICATIONS:
${certsString}

TARGET ${isGenericRole ? 'ROLE / PATH' : 'JOB DESCRIPTION'}:
${jobDescription}

RESUME FORMAT REQUIREMENTS:
1. ${isGenericRole
            ? 'Create a strong, versatile resume optimized for this Career Path/Role.'
            : 'Tailor content to match keywords in the Job Description.'}
2. Rephrase experience bullets to be impactful and results-focused.
3. Highlight Valencia College degrees prominently.
4. Use clean Markdown: # for name, ## for sections, - for bullets.
5. Keep it professional and ATS-friendly.
${toneGuidance[tone]}

OUTPUT RULES (YOU MUST FOLLOW THESE EXACTLY):
- Output ONLY the resume content in Markdown format
- Do NOT include any explanations, thinking, reasoning, or commentary
- Do NOT include phrases like "Here is", "Based on", "Let me", etc.
- Do NOT include notes or meta-text
- End with the last resume section - no closing remarks

YOUR FIRST LINE MUST BE EXACTLY:
# ${candidateName}

YOUR SECOND LINE MUST BE EXACTLY:
${contactInfoString}

Then continue with ## Professional Summary, ## Experience, ## Education, ## Skills, etc.

START YOUR RESPONSE WITH THE # HEADING NOW:`;

        console.log('[Resume Generator] Sending prompt to Gemini...');
        console.log('[Resume Generator] Expected header: # ' + candidateName);

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        // Clean the response to remove any accidental thinking text
        const rawResponse = response.text || "Failed to generate resume.";

        console.log('[Resume Generator] Raw response received, length:', rawResponse.length);
        console.log('[Resume Generator] Raw first 300 chars:', rawResponse.substring(0, 300));

        return cleanResumeResponse(rawResponse);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error generating resume. Please check your API connection.";
    }
};

export const recommendResumeStrategy = async (userProfile: UserProfile, jobDescription: string): Promise<{ recommendedType: string; reasoning: string; successProbability: string } | null> => {
    try {
        const prompt = `
            Analyze this candidate profile and the target job description to recommend the SINGLE BEST resume format (Chronological, Functional, Combination, Targeted, etc.).

            CANDIDATE EXPERIENCE:
            ${JSON.stringify(userProfile.experience.map(e => e.role))}
            SKILLS:
            ${JSON.stringify(userProfile.skills)}
            
            TARGET JOB DESCRIPTION:
            ${jobDescription.substring(0, 1000)}...

            Return JSON ONLY:
            {
                "recommendedType": "string (One of: Chronological, Functional, Combination, Targeted)",
                "reasoning": "string (Why is this best? Max 2 sentences)",
                "successProbability": "string (High/Medium/Low based on fit)"
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendedType: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        successProbability: { type: Type.STRING }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return null;
    } catch (error) {
        console.error("Resume Recommendation Error:", error);
        return null;
    }
};

export const suggestRolesForDegree = async (degree: string): Promise<string[]> => {
    try {
        const prompt = `List 4 specific entry-level job titles suitable for someone with a "${degree}" degree in the current Orlando, FL job market. Return ONLY a JSON array of strings.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (error) {
        console.error("Gemini Role Suggestion Error:", error);
        return ["Entry Level Associate", "Junior Specialist", "Trainee"];
    }
};

// ============================================
// COMPANY NAME EXTRACTION FROM URLs
// ============================================

/**
 * Extract company name from job application URL
 * Fallback when Gemini doesn't return company name
 */
const extractCompanyFromUrl = (url: string): string | null => {
    if (!url || url === '#' || !url.startsWith('http')) return null;

    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        const pathname = urlObj.pathname.toLowerCase();

        // Skip generic job boards - company name is usually in path
        const genericJobBoards = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'ziprecruiter.com', 'monster.com'];
        const isGenericBoard = genericJobBoards.some(board => hostname.includes(board));

        if (isGenericBoard) {
            // Try to extract from path for job boards
            // LinkedIn: /jobs/view/company-name-job-title
            // Indeed: /viewjob?...&company=CompanyName or /cmp/company-name
            if (hostname.includes('linkedin.com')) {
                const pathParts = pathname.split('/').filter(p => p);
                if (pathParts.length >= 3 && pathParts[0] === 'jobs') {
                    // Often the company is NOT in LinkedIn URLs, skip
                    return null;
                }
            }
            if (hostname.includes('indeed.com') && pathname.includes('/cmp/')) {
                const match = pathname.match(/\/cmp\/([^\/]+)/);
                if (match) return formatCompanyName(match[1]);
            }
            return null; // Can't reliably extract from generic boards
        }

        // Pattern 1: Workday URLs - {company}.wd5.myworkdayjobs.com or {company}.workday.com
        if (hostname.includes('workday') || hostname.includes('myworkdayjobs')) {
            const subdomain = hostname.split('.')[0];
            if (subdomain && subdomain !== 'www') {
                return formatCompanyName(subdomain);
            }
        }

        // Pattern 2: careers.{company}.com or jobs.{company}.com
        if (hostname.startsWith('careers.') || hostname.startsWith('jobs.')) {
            const parts = hostname.split('.');
            if (parts.length >= 2) {
                return formatCompanyName(parts[1]);
            }
        }

        // Pattern 3: {company}.greenhouse.io, {company}.lever.co, {company}.breezy.hr
        const atsProviders = ['greenhouse.io', 'lever.co', 'breezy.hr', 'ashbyhq.com', 'recruitee.com', 'bamboohr.com'];
        for (const ats of atsProviders) {
            if (hostname.endsWith(ats)) {
                const subdomain = hostname.replace('.' + ats, '').split('.').pop();
                if (subdomain && subdomain !== 'www') {
                    return formatCompanyName(subdomain);
                }
            }
        }

        // Pattern 4: teamworkonline.com/category/subcategory/organization-name/...
        if (hostname.includes('teamworkonline.com')) {
            const parts = pathname.split('/').filter(p => p);
            if (parts.length >= 3) {
                return formatCompanyName(parts[2]); // Organization is usually 3rd segment
            }
        }

        // Pattern 5: Direct company domain - {company}.com/careers or {company}.io/jobs
        if (pathname.includes('/careers') || pathname.includes('/jobs') || pathname.includes('/career')) {
            // Extract company from main domain
            const domainParts = hostname.replace('www.', '').split('.');
            if (domainParts.length >= 2) {
                const companyPart = domainParts[0];
                // Skip if it's a generic term
                if (!['apply', 'hire', 'recruiting', 'talent'].includes(companyPart)) {
                    return formatCompanyName(companyPart);
                }
            }
        }

        // Pattern 6: icims, taleo, successfactors URLs often have company in subdomain
        if (hostname.includes('icims.com') || hostname.includes('taleo.net') || hostname.includes('successfactors.com')) {
            const subdomain = hostname.split('.')[0];
            if (subdomain && subdomain !== 'www' && subdomain !== 'jobs') {
                return formatCompanyName(subdomain);
            }
        }

        // Fallback: Try main domain name if it looks like a company
        const mainDomain = hostname.replace('www.', '').split('.')[0];
        if (mainDomain && mainDomain.length > 2 && mainDomain.length < 30) {
            // Avoid generic domains
            const genericDomains = ['apply', 'jobs', 'careers', 'hire', 'work', 'talent', 'recruiting', 'employment'];
            if (!genericDomains.includes(mainDomain)) {
                return formatCompanyName(mainDomain);
            }
        }

        return null;
    } catch (e) {
        console.log(`[URL Parser] Failed to parse URL: ${url}`);
        return null;
    }
};

/**
 * Format extracted company name for display
 * Converts "orlando-city-sc" → "Orlando City SC"
 */
const formatCompanyName = (raw: string): string => {
    if (!raw) return '';

    return raw
        // Replace hyphens and underscores with spaces
        .replace(/[-_]/g, ' ')
        // Capitalize each word
        .split(' ')
        .map(word => {
            // Handle common acronyms
            const acronyms = ['sc', 'fc', 'llc', 'inc', 'io', 'ai', 'hr', 'it', 'us', 'usa'];
            if (acronyms.includes(word.toLowerCase())) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ')
        .trim();
};

// ============================================
// ROBUST JSON PARSING FOR JOB SEARCH
// ============================================

/**
 * Clean up verbose/malformed field values from Gemini output
 * Fixes issues like: "type": "Full-time (from listing)" → "type": "Full-time"
 * Also handles escaped quotes and alternative lists in values
 */
const cleanVerboseFieldValues = (jsonStr: string): string => {
    let cleaned = jsonStr;

    // Fix double-escaped quotes that break parsing: \\" → "
    cleaned = cleaned.replace(/\\\\"/g, '"');

    // Remove parenthetical notes from values: "Full-time (from listing)" → "Full-time"
    // Match: "key": "value (anything in parens)"
    cleaned = cleaned.replace(/"([^"]+)\s*\([^)]*\)"/g, '"$1"');

    // Fix verbose type fields with alternatives: "Full-time", "Part-time", or ... → "Full-time"
    // This handles cases where Gemini lists multiple options instead of picking one
    const verboseFieldPattern = /"(type|locationType|experienceLevel)":\s*"([^",]+)(?:["\\,\s]+(?:or\s+)?["\\]*[^"]*)*"/g;
    cleaned = cleaned.replace(verboseFieldPattern, (match, field, firstValue) => {
        // Extract just the first valid value
        const cleanValue = firstValue.trim().replace(/\\+$/, '');
        return `"${field}": "${cleanValue}"`;
    });

    // Clean up any remaining backslash issues in string values
    // But be careful not to break valid escapes
    cleaned = cleaned.replace(/\\+"/g, (match) => {
        // If odd number of backslashes, it's escaping the quote - keep one backslash
        // If even number, they're escaping each other - remove extras
        const backslashCount = (match.match(/\\/g) || []).length;
        if (backslashCount % 2 === 1) {
            return '\\"';
        }
        return '"';
    });

    return cleaned;
};

/**
 * Extract individual job objects from malformed JSON
 * Last resort when JSON.parse completely fails
 */
const extractJobObjects = (text: string): any[] => {
    const jobs: any[] = [];

    // Try to find objects that look like job listings
    // Match objects containing id, title, and company fields
    const objectMatches = text.matchAll(/\{[^{}]*?"id"\s*:\s*"[^"]*"[^{}]*?"title"\s*:\s*"[^"]*"[^{}]*?\}/gs);

    for (const match of objectMatches) {
        try {
            // Clean up the matched object
            let objStr = match[0];
            // Fix any trailing commas
            objStr = objStr.replace(/,\s*\}/g, '}');
            const job = JSON.parse(objStr);
            if (job.id && job.title) {
                jobs.push(job);
            }
        } catch (e) {
            // Skip malformed objects
        }
    }

    console.log(`[JSON Recovery] Extracted ${jobs.length} job objects individually`);
    return jobs;
};

/**
 * Clean and parse JSON with multiple fallback strategies
 * Handles truncated responses, trailing commas, unterminated strings, and verbose field values
 */
const cleanAndParseJobsJSON = (rawResponse: string): any[] => {
    if (!rawResponse || rawResponse.trim().length === 0) {
        console.log('[JSON Parser] Empty response');
        return [];
    }

    console.log(`[JSON Parser] Attempting to parse ${rawResponse.length} characters`);

    // Pre-process: Clean up verbose/malformed field values FIRST
    // This fixes issues like "type": "Full-time (from listing)" before any parsing
    const cleanedResponse = cleanVerboseFieldValues(rawResponse);
    if (cleanedResponse !== rawResponse) {
        console.log('[JSON Parser] Cleaned verbose field values');
    }

    // Strategy 1: Direct parse (best case)
    try {
        const result = JSON.parse(cleanedResponse);
        if (Array.isArray(result)) {
            console.log(`[JSON Parser] Direct parse successful: ${result.length} items`);
            return result;
        }
        // If it's an object with a jobs array, extract it
        if (result && Array.isArray(result.jobs)) {
            console.log(`[JSON Parser] Found jobs in object: ${result.jobs.length} items`);
            return result.jobs;
        }
        return [];
    } catch (directError) {
        console.log('[JSON Parser] Direct parse failed, attempting cleanup...');
    }

    // Strategy 2: Find and extract JSON array from response
    let jsonStr = cleanedResponse;

    // Try to find JSON array in the response
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        jsonStr = arrayMatch[0];
    }

    // Strategy 3: Fix common JSON issues
    try {
        // Remove trailing commas before ] or }
        jsonStr = jsonStr.replace(/,\s*(\]|\})/g, '$1');

        // Fix unterminated strings - find last complete object
        const lastCloseBrace = jsonStr.lastIndexOf('}');
        const lastCloseBracket = jsonStr.lastIndexOf(']');

        if (lastCloseBrace > 0 && lastCloseBrace > lastCloseBracket) {
            // The array might be truncated - try to close it properly
            const openBracket = jsonStr.indexOf('[');
            if (openBracket >= 0) {
                // Count how many complete objects we have
                let depth = 0;
                let lastCompleteObj = -1;
                let inString = false;
                let escaped = false;

                for (let i = openBracket; i <= lastCloseBrace; i++) {
                    const char = jsonStr[i];

                    if (escaped) {
                        escaped = false;
                        continue;
                    }

                    if (char === '\\') {
                        escaped = true;
                        continue;
                    }

                    if (char === '"' && !escaped) {
                        inString = !inString;
                        continue;
                    }

                    if (!inString) {
                        if (char === '{') depth++;
                        if (char === '}') {
                            depth--;
                            if (depth === 0) {
                                lastCompleteObj = i;
                            }
                        }
                    }
                }

                if (lastCompleteObj > openBracket) {
                    jsonStr = jsonStr.substring(openBracket, lastCompleteObj + 1) + ']';
                    console.log(`[JSON Parser] Truncated to last complete object at position ${lastCompleteObj}`);
                }
            }
        }

        // Try parsing the cleaned string
        const result = JSON.parse(jsonStr);
        if (Array.isArray(result)) {
            console.log(`[JSON Parser] Cleanup parse successful: ${result.length} items`);
            return result;
        }
        return [];
    } catch (cleanupError) {
        console.log('[JSON Parser] Cleanup parse failed, trying object extraction...');
    }

    // Strategy 4: Last resort - extract individual objects from cleaned response
    return extractJobObjects(cleanedResponse);
};

/**
 * Real-Time Job Search with Gemini 3 Structured Output + Search Grounding
 * Uses Gemini 3's combined feature for structured JSON output with live web search
 * This is the recommended approach per Google's documentation
 */
export const searchJobsWithGrounding = async (
    query: string,
    location: string,
    workStyle?: 'On-site' | 'Remote' | 'Hybrid' | 'All',
    userProfile?: UserProfile
): Promise<Job[]> => {
    try {
        console.log(`🔍 Using Gemini 3 Structured Output + Search Grounding for: "${query}" in "${location}" (workStyle: ${workStyle || 'All'})`);

        // Build location requirements based on work style
        const isOnSite = workStyle === 'On-site' || workStyle === 'Hybrid';
        const locationContext = isOnSite
            ? `in ${location} (on-site or hybrid positions only, no remote)`
            : `(remote positions welcome, or in ${location})`;

        // Simplified prompt - schema enforces structure, so we just need to describe the task
        const prompt = `Search for 5 real entry-level job listings for "${query}" ${locationContext}.

Requirements:
- Only entry-level or junior roles (0-3 years experience)
- Must have identifiable company names
- Must have real application URLs
- Include salary if available
${isOnSite ? `- Must be located in or near ${location} - no remote positions` : '- Remote positions are acceptable'}

For each job found, extract the title, company name, location, work arrangement, salary range, brief description, experience level, and application URL.`;

        // Define the structured output schema with required fields and enums
        const jobSchema = {
            type: Type.OBJECT,
            properties: {
                title: {
                    type: Type.STRING,
                    description: "Job title exactly as listed"
                },
                company: {
                    type: Type.STRING,
                    description: "Company name - required, skip job if unknown"
                },
                location: {
                    type: Type.STRING,
                    description: "City, State format"
                },
                locationType: {
                    type: Type.STRING,
                    enum: ["On-site", "Remote", "Hybrid"],
                    description: "Work arrangement type"
                },
                type: {
                    type: Type.STRING,
                    enum: ["Full-time", "Part-time", "Contract", "Internship"],
                    description: "Employment type"
                },
                salaryRange: {
                    type: Type.STRING,
                    description: "Salary range or 'Not specified'"
                },
                postedAt: {
                    type: Type.STRING,
                    description: "When posted, e.g. '2 days ago'"
                },
                skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Key skills required (up to 5)"
                },
                description: {
                    type: Type.STRING,
                    description: "One sentence job summary"
                },
                experienceLevel: {
                    type: Type.STRING,
                    enum: ["Entry Level", "Mid Level", "Senior", "Internship"],
                    description: "Required experience level"
                },
                experienceYears: {
                    type: Type.STRING,
                    description: "Years required, e.g. '0-2 years'"
                },
                applyUrl: {
                    type: Type.STRING,
                    description: "Direct URL to apply for this job"
                }
            },
            required: ["title", "company", "location", "applyUrl"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                // Gemini 3 supports combining structured output with built-in tools
                tools: [
                    { googleSearch: {} },  // Real-time web search
                    { urlContext: {} }     // Better extraction from job page URLs
                ],
                maxOutputTokens: 4096,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: jobSchema
                }
            }
        });

        if (response.text) {
            console.log(`📄 Structured response length: ${response.text.length} characters`);

            // With proper structured output, JSON.parse should work directly
            // But we keep fallback parsing for robustness
            let rawJobs: any[] = [];
            try {
                rawJobs = JSON.parse(response.text);
                console.log(`✅ Direct JSON parse successful: ${rawJobs.length} jobs`);
            } catch (parseError) {
                console.log('⚠️ Direct parse failed, using fallback parser...');
                rawJobs = cleanAndParseJobsJSON(response.text);
            }

            if (rawJobs.length === 0) {
                console.log('⚠️ No jobs extracted from grounding response');
                console.log('📄 Response preview:', response.text.substring(0, 300) + '...');
                return [];
            }

            console.log(`📍 Found ${rawJobs.length} live jobs via Google Search Grounding`);

            // STEP 1: Enrich jobs missing company names by extracting from URL
            let urlExtractedCount = 0;
            const enrichedJobs = rawJobs.map((job: any) => {
                if (job && job.title && (!job.company || !job.company.trim()) && job.applyUrl) {
                    const extractedCompany = extractCompanyFromUrl(job.applyUrl);
                    if (extractedCompany) {
                        urlExtractedCount++;
                        console.log(`🔗 Extracted company from URL: "${extractedCompany}" for "${job.title}"`);
                        return { ...job, company: extractedCompany, companySource: 'url' };
                    }
                }
                return job;
            });

            if (urlExtractedCount > 0) {
                console.log(`🔗 Recovered ${urlExtractedCount} company names from URLs`);
            }

            // STEP 2: Validate jobs - REQUIRE both title AND company
            const validJobs = enrichedJobs.filter((job: any) =>
                job &&
                typeof job === 'object' &&
                job.title && job.title.trim() && // Must have real title
                job.company && job.company.trim() // Must have real company name
            );

            // Log filtered jobs for monitoring
            const stillMissingCompanyCount = enrichedJobs.filter((job: any) =>
                job && job.title && (!job.company || !job.company.trim())
            ).length;
            const missingTitleCount = enrichedJobs.filter((job: any) =>
                job && job.company && (!job.title || !job.title.trim())
            ).length;
            const invalidCount = enrichedJobs.length - validJobs.length;

            if (invalidCount > 0) {
                console.log(`🔍 Filtered out ${invalidCount} incomplete jobs:`);
                if (stillMissingCompanyCount > 0) console.log(`   ⚠️ ${stillMissingCompanyCount} jobs still missing company (URL extraction failed)`);
                if (missingTitleCount > 0) console.log(`   ⚠️ ${missingTitleCount} jobs missing title`);
            }

            // Debug: log first job to see actual structure
            if (validJobs.length > 0) {
                console.log('📋 Sample grounded job:', validJobs[0].title, 'at', validJobs[0].company);
            }

            // Map validated jobs with defaults for optional fields only
            // Note: title and company are guaranteed by validation above
            const jobs = validJobs.map((job: any, index: number) => ({
                ...job,
                id: job.id || `grounded-${index}`,
                title: job.title, // Required - already validated
                company: job.company, // Required - already validated (may be from URL extraction)
                location: job.location || location,
                locationType: job.locationType || (isOnSite ? 'On-site' : 'Remote'),
                type: job.type || 'Full-time',
                salaryRange: job.salaryRange || 'Not specified',
                postedAt: job.postedAt || 'Recently',
                matchScore: job.matchScore || 75,
                skills: Array.isArray(job.skills) ? job.skills : [],
                description: job.description || '',
                experienceLevel: job.experienceLevel || 'Entry Level',
                experienceYears: job.experienceYears || '0-2 years',
                applyUrl: job.applyUrl || '#',
                source: job.source || 'Google Search'
            }));

            console.log(`✅ Returning ${jobs.length} validated jobs from grounding`);
            return jobs;
        }

        console.log('⚠️ Empty response from grounding');
        return [];
    } catch (error) {
        console.error("Search Grounding Error:", error);
        // Return empty array - caller should fall back to aggregate API
        return [];
    }
};

/**
 * HYBRID SANDWICH: Clean and Score Jobs with Gemini
 * Takes raw SerpAPI jobs and uses Gemini to:
 * 1. Standardize data (salary format, company names)
 * 2. Detect scams/low-quality listings  
 * 3. Score relevance based on user profile
 * 4. Add tags for filtering (Remote, Entry Level, etc.)
 */
export const cleanAndScoreJobs = async (
    rawJobs: any[],
    userProfile?: UserProfile,
    userPreferences?: string,
    targetLocation?: string  // NEW: User's target city for radius filtering
): Promise<Job[]> => {
    try {
        if (!rawJobs || rawJobs.length === 0) {
            return [];
        }

        console.log(`🧹 Cleaning ${rawJobs.length} jobs with Gemini...`);

        // Debug: log first job structure
        if (rawJobs.length > 0) {
            console.log('📋 Sample raw job from SerpAPI:', {
                title: rawJobs[0].title,
                company: rawJobs[0].company,
                location: rawJobs[0].location
            });
        }

        // Build user context for scoring
        const degreesContext = userProfile?.education?.map(e => {
            const degreeType = (e as any).degreeType;
            return degreeType ? `${degreeType} in ${e.degree}` : e.degree;
        }).join(", ") || "";
        const skillsContext = userProfile?.skills?.technical?.join(", ") || "";

        // System prompt with strict rules (proven pattern from job-engine.ts)
        const systemPrompt = `You are an expert Job Recruiter AI.
Clean and score these raw job listings for a recent graduate.

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no code blocks, no explanations
2. Standardize ALL salaries to "Annual USD" format (e.g., "$50k - $70k")
3. If salary is missing, set salaryRange to "Not specified"
4. Detect scam indicators and set scam_likelihood:
   - HIGH: Asks for money, MLM language, unrealistic pay ($5k/week easy work)
   - MEDIUM: Vague company info, poor grammar, too good to be true
   - LOW: Legitimate job posting
5. Score match 0-100 based on user profile fit

7. STRICT ENTRY-LEVEL FILTER (CRITICAL):
   - EXCLUDE any job title containing: 'Senior', 'Sr.', 'Sr ', 'Snr', 'Lead', 'Principal', 'Manager', 'Director', 'Head of', 'VP', 'II', 'III', 'Level 2', 'Level 3'
   - EXCLUDE any job requiring more than 3 years of experience
   - PRIORITIZE jobs with: 'Junior', 'Jr.', 'Jr ', 'Associate', 'Entry Level', 'Entry-Level', 'Intern', 'Apprentice', 'Trainee', 'Graduate', 'New Grad'
   - If a job fails entry-level criteria, mark isIrrelevant: true

${degreesContext ? `USER DEGREES: ${degreesContext}` : ''}
${skillsContext ? `USER SKILLS: ${skillsContext}` : ''}
${userPreferences ? `USER PREFERENCES: ${userPreferences}` : ''}
${targetLocation ? `
6. STRICT LOCATION CHECK:
   - User's target location: "${targetLocation}"
   - Mark jobs farther than 50 miles from ${targetLocation} as isIrrelevant: true
   - Jobs in distant cities (e.g., Miami for Orlando user) should be marked isIrrelevant
   - Remote jobs are NEVER irrelevant regardless of location` : ''}`;

        // REDUCED: Limit to 5 jobs to prevent JSON truncation (was 8)
        const jobBatch = rawJobs.slice(0, 5);

        const userPrompt = `Clean and score these job listings:

${JSON.stringify(jobBatch.map(job => ({
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salaryRange || job.detected_extensions?.salary,
            applyUrl: job.applyUrl || job.apply_options?.[0]?.link
        })), null, 2)}`;

        const prompt = systemPrompt + "\n\n" + userPrompt;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Updated to 3.0 Flash
            contents: [
                { role: "user", parts: [{ text: prompt }] }
            ],
            config: {
                maxOutputTokens: 8192,
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
                            salaryRange: { type: Type.STRING },
                            postedAt: { type: Type.STRING },
                            matchScore: { type: Type.NUMBER },
                            applyUrl: { type: Type.STRING },
                            description: { type: Type.STRING },
                            type: { type: Type.STRING },
                            experienceLevel: { type: Type.STRING },
                            scam_likelihood: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            isIrrelevant: { type: Type.BOOLEAN }  // NEW: true if job is > 50 miles from target
                        }
                    }
                }
            }
        });

        if (response.text) {
            let cleanedJobs;
            try {
                cleanedJobs = JSON.parse(response.text);
            } catch (parseError) {
                console.error('❌ JSON Parse Error in Job Cleaning:', parseError);
                // ONLY fallback on actual parse errors - return empty to trigger Onboarding fallback
                console.log('⚠️ Returning empty array due to parse error (will trigger Onboarding fallback)');
                return [];
            }

            console.log(`✅ Cleaned ${cleanedJobs.length} jobs, filtering...`);

            // STEP 1: Enrich jobs missing company names by extracting from URL
            let urlExtractedCount = 0;
            const enrichedJobs = cleanedJobs.map((job: any) => {
                if (job && job.title && (!job.company || !job.company.trim()) && job.applyUrl) {
                    const extractedCompany = extractCompanyFromUrl(job.applyUrl);
                    if (extractedCompany) {
                        urlExtractedCount++;
                        console.log(`🔗 Extracted company from URL: "${extractedCompany}" for "${job.title}"`);
                        return { ...job, company: extractedCompany, companySource: 'url' };
                    }
                }
                return job;
            });

            if (urlExtractedCount > 0) {
                console.log(`🔗 Recovered ${urlExtractedCount} company names from URLs`);
            }

            // STEP 2: Filter out HIGH-risk scams, irrelevant locations, AND jobs still missing company names
            const goodJobs = enrichedJobs.filter((job: any) =>
                job.scam_likelihood !== 'HIGH' &&
                !job.isIrrelevant &&
                job.title && job.title.trim() && // Must have real title
                job.company && job.company.trim() // Must have real company name
            );

            const scamCount = enrichedJobs.filter((job: any) => job.scam_likelihood === 'HIGH').length;
            const irrelevantCount = enrichedJobs.filter((job: any) => job.isIrrelevant).length;
            const stillMissingCompanyCount = enrichedJobs.filter((job: any) =>
                job.title && (!job.company || !job.company.trim())
            ).length;

            console.log(`📋 ${goodJobs.length} quality jobs after filtering:`);
            if (scamCount > 0) console.log(`   ❌ Blocked ${scamCount} HIGH-risk scams`);
            if (irrelevantCount > 0) console.log(`   📍 Blocked ${irrelevantCount} jobs > 50 miles away`);
            if (stillMissingCompanyCount > 0) console.log(`   ⚠️ Blocked ${stillMissingCompanyCount} jobs still missing company (URL extraction failed)`);

            // Warn about MEDIUM risk jobs
            const mediumRiskCount = goodJobs.filter((job: any) => job.scam_likelihood === 'MEDIUM').length;
            if (mediumRiskCount > 0) {
                console.log(`   ⚠️ ${mediumRiskCount} jobs marked as MEDIUM risk - showing with warning`);
            }

            // Map validated jobs - title and company are guaranteed by filter above
            return goodJobs.map((job: any, index: number) => ({
                id: job.id || `cleaned-${index}`,
                title: job.title, // Required - already validated
                company: job.company, // Required - already validated
                location: job.location || 'Unknown',
                salaryRange: job.salaryRange || 'Not specified',
                postedAt: job.postedAt || 'Recently',
                matchScore: job.matchScore || 50,
                applyUrl: job.applyUrl || '#',
                description: job.description || '',
                type: (job.type || 'Full-time') as Job['type'],
                experienceLevel: job.experienceLevel || 'Entry Level',
                skills: job.skills || [],
                // Pass both for backwards compatibility and new UI features
                scamLikelihood: job.scam_likelihood || 'LOW',
                isScam: job.scam_likelihood === 'HIGH'
            }));
        }

        return [];
    } catch (error) {
        console.error("Job Cleaning Error:", error);
        // FIXED: Return empty array on network/API errors
        // DO NOT fallback to rawJobs - that bypasses all filtering!
        console.log('⚠️ Returning empty array due to API error (Onboarding will handle fallback)');
        return [];
    }
};

/**
 * CACHED WRAPPER: Fetch and clean jobs with caching
 * Checks cache first (4-hour TTL), only calls API if miss
 */
export const searchJobsCached = async (
    rawJobs: any[],
    userProfile?: UserProfile,
    userPreferences?: string,
    targetLocation?: string,
    cacheQuery?: string  // For cache key generation
): Promise<Job[]> => {
    // Generate a cache key from the search parameters
    const query = cacheQuery || 'jobs';

    // Check cache first
    const cachedJobs = jobCache.get(query, targetLocation, userPreferences);
    if (cachedJobs) {
        return cachedJobs;
    }

    // Cache miss - run the full cleaning pipeline
    const freshJobs = await cleanAndScoreJobs(rawJobs, userProfile, userPreferences, targetLocation);

    // Store in cache for next time
    if (freshJobs.length > 0) {
        jobCache.set(query, targetLocation, userPreferences, freshJobs);
    }

    return freshJobs;
};

// Export cache clear function for debugging
export const clearJobCache = () => jobCache.clear();

// LEGACY: Real-Time Job Search Simulation (generates fake jobs, kept for reference)
export const findRealTimeJobs = async (userProfile: UserProfile): Promise<Job[]> => {
    try {
        const degrees = userProfile.education.map(e => {
            return e.degreeType ? `${e.degreeType} in ${e.degree} ` : e.degree;
        }).join(", ");
        const skills = userProfile.skills.technical.join(", ");

        const prompt = `
        Act as a Real - Time Job Scraper for Orlando, FL.
            Find 3 currently active(or highly realistic based on current market data) job listings for a candidate with these credentials:

                Degrees: ${degrees}
        Skills: ${skills}
        Location: ${userProfile.location}
            
            Generate a JSON array of 3 Job objects.

            CRITICAL:
        1. Use REAL company names in Orlando(e.g., Disney, Universal, Lockheed Martin, AdventHealth, Orlando Health, EA, Tech start - ups).
            2. Ensure "postedAt" implies recent activity(e.g., "2h ago", "Just now").
            3. "matchScore" should be between 85 and 99.
        4. "matchReason" should explain WHY it fits the candidate's specific skills/degree.
        5. "logo" should be a URL string: "https://ui-avatars.com/api/?name=[CompanyName]&background=random&color=fff&size=128&bold=true"(Replace[CompanyName] with the actual name).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
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
                            matchScore: { type: Type.NUMBER },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            experienceLevel: { type: Type.STRING },
                            description: { type: Type.STRING },
                            matchReason: { type: Type.STRING },
                            logo: { type: Type.STRING },
                            locationType: { type: Type.STRING },
                            experienceYears: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (error) {
        console.error("Job Search Error:", error);
        return [];
    }
};

// NEW: Strategic Job Analysis Function
export const generateJobIntel = async (jobTitle: string, company: string, description: string): Promise<JobAnalysis | null> => {
    try {
        // Sanitize description to prevent prompt injection or excessive length
        // Reduced to 3000 to keep context tight and prevent overwhelming the model
        const cleanDescription = description.replace(/`/g, "'").substring(0, 3000);

        const prompt = `
            Act as a Strategic Career Coach for a new graduate.
            Analyze this job opportunity at ${company} for the role of ${jobTitle}.
            
            Job Description Overview: ${cleanDescription}
            
            Provide a strategic "Mission Briefing" in JSON format.
            
            STRICT GENERATION RULES:
            1. JSON ONLY. No markdown formatting.
            2. Do NOT repeat the job description.
            3. "summary", "idealCandidateProfile", and "candidateExpectations" MUST be under 50 words each.
            4. Arrays should have max 3 items.
            5. Ensure the JSON is complete and properly terminated.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                maxOutputTokens: 8192, // High limit to ensure JSON closes, but content is restricted by prompt
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        idealCandidateProfile: { type: Type.STRING },
                        candidateExpectations: { type: Type.STRING },
                        interviewProcess: { type: Type.ARRAY, items: { type: Type.STRING } },
                        hiringTeamTargets: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    role: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                }
                            }
                        },
                        portfolioAdvice: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    action: { type: Type.STRING }
                                }
                            }
                        },
                        actionPlan: {
                            type: Type.OBJECT,
                            properties: {
                                research: { type: Type.STRING },
                                synthesis: { type: Type.STRING },
                                outreach: { type: Type.STRING },
                                tailoring: { type: Type.STRING },
                                community: { type: Type.STRING },
                            }
                        },
                        recommendedCourses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    provider: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                }
                            }
                        },
                        contentStrategy: {
                            type: Type.OBJECT,
                            properties: {
                                topic: { type: Type.STRING },
                                whyItMatters: { type: Type.STRING },
                                outline: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        },
                        outreachTemplates: {
                            type: Type.OBJECT,
                            properties: {
                                connectionRequest: { type: Type.STRING },
                                coldEmail: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as JobAnalysis;
        }
        return null;
    } catch (error) {
        console.error("Job Intel Error:", error);
        return null;
    }
};

// NEW: Wellness & Recovery Analysis
export interface WellnessInsight {
    currentLoadScore: number; // 0-100
    breakStrategy: {
        type: string; // "Active", "Mental", "Sensory"
        duration: string;
        activity: string;
        reason: string;
    };
    sleepTarget: {
        hours: number;
        reason: string;
        windDownStart: string;
    };
    successImpact: string; // Explanation of why rest helps specific goals
}

export const generateWellnessInsights = async (schedule: any[], userProfile: UserProfile): Promise<WellnessInsight | null> => {
    try {
        const scheduleSummary = schedule.map(s => `${s.title} (${s.type}): ${s.startTime} to ${s.endTime}`).join(", ");

        const prompt = `
            Act as a Performance Recovery Coach. Analyze this user's daily schedule and profile.
            
            USER CONTEXT:
            Schedule Today: ${scheduleSummary}
            Is Parent: ${userProfile.logistics?.isParent || false}
            Employment: ${userProfile.logistics?.employmentStatus || 'Unknown'}
            
            Generate a precise Wellness & Recovery plan.
            RULES:
            1. If they have long work blocks (>4h), prescribe a specific break type opposing the work type (e.g. Physical work -> Mental rest, Desk work -> Active movement).
            2. If total work hours > 8, increase recommended sleep.
            3. "successImpact" must explain specifically how this rest will improve their cognitive performance on their next task.
            
            Return JSON ONLY matching the schema.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        currentLoadScore: { type: Type.NUMBER, description: "0-100, where 100 is extremely drained" },
                        breakStrategy: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                duration: { type: Type.STRING },
                                activity: { type: Type.STRING },
                                reason: { type: Type.STRING }
                            }
                        },
                        sleepTarget: {
                            type: Type.OBJECT,
                            properties: {
                                hours: { type: Type.NUMBER },
                                reason: { type: Type.STRING },
                                windDownStart: { type: Type.STRING }
                            }
                        },
                        successImpact: { type: Type.STRING }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return null;
    } catch (error) {
        console.error("Wellness API Error:", error);
        return null;
    }
};

// NEW: Smart Schedule Suggester
export interface ScheduleSuggestion {
    id: string;
    title: string;
    type: string;
    suggestedDurationMinutes: number;
    reasoning: string; // Scientific data backing the suggestion
    category: 'Wellness' | 'Learning' | 'Career';
}

export const generateScheduleSuggestions = async (schedule: any[]): Promise<ScheduleSuggestion[]> => {
    try {
        const scheduleSummary = schedule.map(s => `${s.title} (${s.type})`).join(", ");
        const prompt = `
            Act as "JW" (Jalanea Works), a hyper-intelligent career & wellness assistant.
            The user has the following items on their schedule: ${scheduleSummary}.
            
            Suggest exactly 3 NEW blocks they should add to optimize their day.
            
            REQUIREMENTS:
            1. One block MUST be for Wellness (e.g., "15m Power Walk", "Healthy Snack Prep", "Meditation").
            2. One block MUST be for Learning/Industry Knowledge (e.g., "Read TechCrunch", "Figma Practice").
            3. One block MUST be for Career Prep (e.g., "Interview Mockup", "Network Outreach").
            4. Provide a "reasoning" that uses data/science (e.g., "Taking a 15m walk increases cognitive retention by 20%").
            
            Return JSON Array.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            type: { type: Type.STRING },
                            suggestedDurationMinutes: { type: Type.NUMBER },
                            reasoning: { type: Type.STRING },
                            category: { type: Type.STRING, enum: ['Wellness', 'Learning', 'Career'] }
                        }
                    }
                }
            }
        });

        if (response.text) return JSON.parse(response.text);
        return [];
    } catch (e) {
        console.error("Suggestion Error", e);
        return [];
    }
}

// ============================================
// ATS (Applicant Tracking System) ANALYSIS
// ============================================

/**
 * ATS Analysis Result Interface
 */
export interface ATSAnalysisResult {
    overallScore: number;           // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    matchedKeywords: string[];      // Keywords found in both resume and job
    missingKeywords: string[];      // Important keywords missing from resume
    suggestions: string[];          // Actionable improvement tips
    sectionBreakdown: {
        skills: { score: number; feedback: string };
        experience: { score: number; feedback: string };
        education: { score: number; feedback: string };
        formatting: { score: number; feedback: string };
    };
    summary: string;                // Brief analysis summary
}

/**
 * Analyze Resume for ATS Compatibility
 * Compares resume against job description to identify match quality
 *
 * @param resumeText - The full text content of the resume
 * @param jobDescription - The job posting description
 * @returns ATSAnalysisResult with score, grade, and recommendations
 */
export const analyzeResumeATS = async (
    resumeText: string,
    jobDescription: string
): Promise<ATSAnalysisResult | null> => {
    try {
        console.log('[ATS Analysis] Starting analysis...');

        // Truncate inputs to prevent token overflow
        const cleanResume = resumeText.substring(0, 5000);
        const cleanJob = jobDescription.substring(0, 3000);

        const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer for job seekers.

TASK: Analyze this resume against the job description and provide a detailed ATS compatibility score.

RESUME:
${cleanResume}

JOB DESCRIPTION:
${cleanJob}

ANALYSIS REQUIREMENTS:
1. Score the resume from 0-100 based on keyword match, formatting, and relevance
2. Assign a letter grade (A: 90+, B: 80-89, C: 70-79, D: 60-69, F: <60)
3. Identify keywords that MATCH between resume and job description
4. Identify MISSING keywords that should be added to the resume
5. Provide 3-5 specific, actionable suggestions to improve ATS score
6. Score each section: skills, experience, education, formatting (0-100 each)
7. Write a brief 2-sentence summary of the analysis

Be specific and actionable. Focus on what the candidate can actually improve.
Return JSON ONLY matching the schema.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                maxOutputTokens: 4096,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallScore: { type: Type.NUMBER },
                        grade: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'F'] },
                        matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        sectionBreakdown: {
                            type: Type.OBJECT,
                            properties: {
                                skills: {
                                    type: Type.OBJECT,
                                    properties: {
                                        score: { type: Type.NUMBER },
                                        feedback: { type: Type.STRING }
                                    }
                                },
                                experience: {
                                    type: Type.OBJECT,
                                    properties: {
                                        score: { type: Type.NUMBER },
                                        feedback: { type: Type.STRING }
                                    }
                                },
                                education: {
                                    type: Type.OBJECT,
                                    properties: {
                                        score: { type: Type.NUMBER },
                                        feedback: { type: Type.STRING }
                                    }
                                },
                                formatting: {
                                    type: Type.OBJECT,
                                    properties: {
                                        score: { type: Type.NUMBER },
                                        feedback: { type: Type.STRING }
                                    }
                                }
                            }
                        },
                        summary: { type: Type.STRING }
                    }
                }
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text) as ATSAnalysisResult;
            console.log(`[ATS Analysis] Complete - Score: ${result.overallScore}, Grade: ${result.grade}`);
            return result;
        }

        console.error('[ATS Analysis] Empty response from Gemini');
        return null;
    } catch (error) {
        console.error('[ATS Analysis] Error:', error);
        return null;
    }
}

// ============================================
// HUMAN READABILITY ANALYSIS
// ============================================

/**
 * Readability Analysis Result Interface
 */
export interface ReadabilityAnalysisResult {
    score: number;                  // 0-100
    tone: 'Authentic' | 'Professional' | 'Generic' | 'Robotic';
    roboticPhrases: {
        phrase: string;
        suggestion: string;
    }[];
    strengths: string[];            // What sounds authentic
    tips: string[];                 // How to sound more human
}

/**
 * Analyze Resume for Human Readability
 * Identifies robotic, generic, or overly corporate language
 *
 * @param resumeText - The full text content of the resume
 * @returns ReadabilityAnalysisResult with score, tone, and recommendations
 */
export const analyzeReadability = async (
    resumeText: string
): Promise<ReadabilityAnalysisResult | null> => {
    try {
        console.log('[Readability Analysis] Starting analysis...');

        // Truncate input to prevent token overflow
        const cleanResume = resumeText.substring(0, 5000);

        const prompt = `
You are an expert at detecting authentic vs. robotic writing in resumes. Jalanea Works believes resumes should sound like REAL PEOPLE, not corporate buzzword generators.

TASK: Analyze this resume for human readability. Identify robotic, generic, or overly corporate language that makes the person sound like a template rather than an individual.

RESUME:
${cleanResume}

COMMON ROBOTIC PHRASES TO FLAG:
- "Results-driven professional"
- "Synergized cross-functional teams"
- "Leveraged best practices"
- "Dynamic self-starter"
- "Spearheaded initiatives"
- "Utilized core competencies"
- "Proactive team player"
- "Think outside the box"
- "Hit the ground running"
- "Proven track record"
- Excessive buzzwords and corporate jargon
- Overly formal language that no human actually speaks

WHAT SOUNDS AUTHENTIC:
- Specific achievements with numbers
- First-person perspective and natural phrasing
- Genuine descriptions of what they actually did
- Personality showing through word choices
- Concrete examples instead of vague claims

ANALYSIS REQUIREMENTS:
1. Score the resume 0-100 for human authenticity (100 = sounds like a real person)
2. Assign a tone: Authentic, Professional, Generic, or Robotic
3. Identify specific robotic phrases and suggest human alternatives
4. List what already sounds authentic (strengths)
5. Provide 3-5 tips to make it sound more human

Be encouraging but honest. The goal is to help them sound like themselves, not a template.
Return JSON ONLY matching the schema.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                maxOutputTokens: 4096,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        tone: { type: Type.STRING, enum: ['Authentic', 'Professional', 'Generic', 'Robotic'] },
                        roboticPhrases: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    phrase: { type: Type.STRING },
                                    suggestion: { type: Type.STRING }
                                }
                            }
                        },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text) as ReadabilityAnalysisResult;
            console.log(`[Readability Analysis] Complete - Score: ${result.score}, Tone: ${result.tone}`);
            return result;
        }

        console.error('[Readability Analysis] Empty response from Gemini');
        return null;
    } catch (error) {
        console.error('[Readability Analysis] Error:', error);
        return null;
    }
}

// ============================================
// STAR METHOD BULLET IMPROVEMENT
// ============================================

/**
 * Improve a resume bullet point using the STAR method
 * Returns an improved version with metrics and impact
 */
export const improveBulletPoint = async (
    bulletText: string,
    context?: {
        role?: string;
        company?: string;
        industry?: string;
    }
): Promise<string | null> => {
    console.log(`[Bullet Improvement] Improving: "${bulletText.substring(0, 50)}..."`);

    try {
        const contextInfo = context
            ? `Role: ${context.role || 'Not specified'}, Company: ${context.company || 'Not specified'}, Industry: ${context.industry || 'General'}`
            : 'No specific context provided';

        const prompt = `You are an expert resume writer specializing in the STAR method (Situation, Task, Action, Result).

CONTEXT: ${contextInfo}

ORIGINAL BULLET POINT:
"${bulletText}"

TASK: Rewrite this bullet point to be more accomplishment-focused using the STAR method.

RULES:
1. Start with a strong action verb (Led, Created, Increased, Developed, Implemented, etc.)
2. Include specific metrics or outcomes - use placeholders like [X%] or [Y customers] if you need to estimate
3. Focus on RESULTS and IMPACT, not just tasks
4. Keep it concise - ideally one powerful sentence
5. Make it specific and believable for this type of role
6. If the original is already strong, only make minor improvements

EXAMPLES OF GOOD TRANSFORMATIONS:
- "Responsible for customer service" → "Resolved 50+ customer inquiries daily, maintaining 95% satisfaction rating"
- "Helped with social media" → "Grew Instagram following by 40% (2K to 2.8K) through strategic content planning"
- "Worked on team projects" → "Collaborated with 5-person team to deliver 3 client projects on time, resulting in 2 contract renewals"

Return ONLY the improved bullet point text, nothing else. No quotes, no explanation.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                maxOutputTokens: 256,
                temperature: 0.7
            }
        });

        if (response.text) {
            // Clean up the response - remove quotes, newlines, etc.
            let improved = response.text.trim();
            improved = improved.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
            improved = improved.replace(/\n/g, ' ').trim(); // Remove newlines

            console.log(`[Bullet Improvement] Result: "${improved.substring(0, 50)}..."`);
            return improved;
        }

        console.error('[Bullet Improvement] Empty response from Gemini');
        return null;
    } catch (error) {
        console.error('[Bullet Improvement] Error:', error);
        return null;
    }
};

/**
 * Batch improve multiple bullet points
 * More efficient than calling improveBulletPoint multiple times
 */
export const improveBulletPointsBatch = async (
    bullets: { text: string; lineIndex: number }[],
    context?: {
        role?: string;
        company?: string;
        industry?: string;
    }
): Promise<Map<number, string>> => {
    console.log(`[Bullet Improvement Batch] Improving ${bullets.length} bullets`);

    const results = new Map<number, string>();

    try {
        const contextInfo = context
            ? `Role: ${context.role || 'Not specified'}, Company: ${context.company || 'Not specified'}, Industry: ${context.industry || 'General'}`
            : 'No specific context provided';

        const bulletsList = bullets.map((b, i) => `${i + 1}. "${b.text}"`).join('\n');

        const prompt = `You are an expert resume writer specializing in the STAR method.

CONTEXT: ${contextInfo}

ORIGINAL BULLET POINTS:
${bulletsList}

TASK: Rewrite each bullet point to be more accomplishment-focused using the STAR method.

RULES:
1. Start each with a strong action verb
2. Include specific metrics or outcomes - use placeholders like [X%] if needed
3. Focus on RESULTS and IMPACT
4. Keep each concise - one powerful sentence each
5. Return in the same numbered format

Return ONLY the improved bullets in this format:
1. [improved bullet 1]
2. [improved bullet 2]
etc.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                maxOutputTokens: 1024,
                temperature: 0.7
            }
        });

        if (response.text) {
            // Parse the numbered response
            const lines = response.text.trim().split('\n');
            lines.forEach((line) => {
                const match = line.match(/^(\d+)\.\s*(.+)$/);
                if (match) {
                    const index = parseInt(match[1]) - 1;
                    let improved = match[2].trim();
                    improved = improved.replace(/^["']|["']$/g, ''); // Remove quotes

                    if (index >= 0 && index < bullets.length) {
                        results.set(bullets[index].lineIndex, improved);
                    }
                }
            });

            console.log(`[Bullet Improvement Batch] Improved ${results.size}/${bullets.length} bullets`);
        }
    } catch (error) {
        console.error('[Bullet Improvement Batch] Error:', error);
    }

    return results;
};

// ============================================
// VALENCIA COURSE MATCHING
// ============================================

export interface CourseMatchResult {
    code: string;
    name: string;
    relevanceScore: number; // 0-100
    matchedSkills: string[];
    matchReason: string;
    isCapstone: boolean;
    isProjectBased: boolean;
}

export interface CourseMatchAnalysis {
    programName: string;
    matchedCourses: CourseMatchResult[];
    totalRelevanceScore: number;
    keySkillsFromCourses: string[];
    suggestedHighlights: string[];
}

/**
 * Minimal response format for course matching to avoid truncation
 */
interface MinimalCourseScores {
    scores: Record<string, number>;  // Course code -> relevance score
    skills: string[];                // Top matching skills
}

/**
 * Analyze job description and match to Valencia courses
 * Uses minimal JSON response to avoid truncation, then reconstructs full data
 */
export const analyzeCourseworkMatch = async (
    jobDescription: string,
    courses: { code: string; name: string; skills: string[]; isCapstone?: boolean; projectBased?: boolean }[],
    programName: string,
    retryCount = 0
): Promise<CourseMatchAnalysis | null> => {
    const MAX_RETRIES = 2;
    console.log(`[Course Match] Analyzing ${courses.length} courses (attempt ${retryCount + 1})`);

    try {
        // Limit to 5 courses and normalize codes (remove spaces for shorter keys)
        const topCourses = courses.slice(0, 5);
        const courseList = topCourses.map(c => `${c.code.replace(/\s+/g, '')}: ${c.name}`).join(', ');

        // Ultra-minimal prompt requesting just scores
        const prompt = `Rate course relevance (0-100) for this job.

Job: ${jobDescription.substring(0, 250)}

Courses: ${courseList}

Return ONLY: {"scores":{"CODE":score},"skills":["skill1","skill2"]}
Example: {"scores":{"COP2830":85,"CTS2440":70},"skills":["JavaScript","Python"]}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                maxOutputTokens: 256,
                temperature: 0.1
            }
        });

        if (!response.text) {
            console.error('[Course Match] Empty response');
            if (retryCount < MAX_RETRIES) {
                return analyzeCourseworkMatch(jobDescription, courses, programName, retryCount + 1);
            }
            return createFallbackResult(programName, courses);
        }

        // Parse minimal response
        let parsed: MinimalCourseScores | null = null;
        try {
            // Clean and parse
            let text = response.text.trim();
            text = text.replace(/```json\n?|\n?```/g, '');
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end > start) {
                text = text.substring(start, end + 1);
            }
            parsed = JSON.parse(text);
        } catch (e) {
            console.error('[Course Match] Parse error:', e, 'Raw:', response.text.substring(0, 100));
        }

        if (!parsed?.scores) {
            if (retryCount < MAX_RETRIES) {
                return analyzeCourseworkMatch(jobDescription, courses, programName, retryCount + 1);
            }
            return createFallbackResult(programName, courses);
        }

        // Reconstruct full result from scores + course database
        const matchedCourses: CourseMatchResult[] = [];
        let totalScore = 0;
        let scoreCount = 0;

        for (const course of courses) {
            // Try to find score with or without spaces in code
            const codeNoSpace = course.code.replace(/\s+/g, '');
            const score = parsed.scores[codeNoSpace] || parsed.scores[course.code] || 0;

            if (score >= 40) {
                matchedCourses.push({
                    code: course.code,
                    name: course.name,
                    relevanceScore: score,
                    matchedSkills: course.skills.slice(0, 3),
                    matchReason: course.isCapstone
                        ? 'Capstone demonstrates hands-on experience'
                        : course.projectBased
                            ? 'Project-based learning applies to this role'
                            : 'Skills align with job requirements',
                    isCapstone: course.isCapstone || false,
                    isProjectBased: course.projectBased || false
                });
                totalScore += score;
                scoreCount++;
            }
        }

        // Sort by score descending
        matchedCourses.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Generate highlights based on top courses
        const suggestedHighlights: string[] = [];
        const capstoneCourse = matchedCourses.find(c => c.isCapstone);
        if (capstoneCourse) {
            suggestedHighlights.push(`Capstone project in ${capstoneCourse.name} demonstrates real-world application`);
        }
        if (matchedCourses.length > 0) {
            suggestedHighlights.push(`Coursework in ${matchedCourses.slice(0, 2).map(c => c.name).join(' and ')} directly applies to this role`);
        }

        console.log(`[Course Match] Found ${matchedCourses.length} matching courses`);

        return {
            programName,
            matchedCourses: matchedCourses.slice(0, 4),
            totalRelevanceScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
            keySkillsFromCourses: parsed.skills || [],
            suggestedHighlights
        };

    } catch (error) {
        console.error('[Course Match] Error:', error);
        if (retryCount < MAX_RETRIES) {
            return analyzeCourseworkMatch(jobDescription, courses, programName, retryCount + 1);
        }
        return createFallbackResult(programName, courses);
    }
};

/**
 * Create fallback result when analysis fails
 */
function createFallbackResult(programName: string, courses: { code: string; name: string; skills: string[]; isCapstone?: boolean; projectBased?: boolean }[]): CourseMatchAnalysis {
    // Return capstone and project courses as likely relevant
    const fallbackCourses = courses
        .filter(c => c.isCapstone || c.projectBased)
        .slice(0, 3)
        .map(c => ({
            code: c.code,
            name: c.name,
            relevanceScore: c.isCapstone ? 70 : 60,
            matchedSkills: c.skills.slice(0, 2),
            matchReason: 'Likely relevant based on hands-on coursework',
            isCapstone: c.isCapstone || false,
            isProjectBased: c.projectBased || false
        }));

    return {
        programName,
        matchedCourses: fallbackCourses,
        totalRelevanceScore: fallbackCourses.length > 0 ? 65 : 0,
        keySkillsFromCourses: courses.flatMap(c => c.skills).slice(0, 4),
        suggestedHighlights: ['Analysis incomplete - showing project-based courses that likely apply']
    };
}

// ============================================
// OUTREACH SCRIPT GENERATOR
// ============================================

export type OutreachScriptType = 'connection_request' | 'follow_up' | 'informational_interview' | 'thank_you';

export interface OutreachScriptParams {
    type: OutreachScriptType;
    targetName?: string;
    targetCompany?: string;
    targetRole?: string;
    howFound?: string;
    specificTopic?: string;
    userBackground?: {
        name?: string;
        targetRoles?: string[];
        education?: string;
        experience?: string;
    };
}

/**
 * Generate personalized outreach scripts for networking
 */
export const generateOutreachScript = async (params: OutreachScriptParams): Promise<string> => {
    const {
        type,
        targetName,
        targetCompany,
        targetRole,
        howFound,
        specificTopic,
        userBackground
    } = params;

    const typeDescriptions = {
        connection_request: 'a LinkedIn connection request message (max 300 characters)',
        follow_up: 'a follow-up message after connecting or meeting',
        informational_interview: 'a request for an informational interview or brief chat',
        thank_you: 'a thank you message after receiving help or having a conversation'
    };

    const prompt = `Generate ${typeDescriptions[type]} for networking purposes.

CONTEXT:
- Sender: ${userBackground?.name || 'A job seeker'}${userBackground?.education ? `, educated in ${userBackground.education}` : ''}${userBackground?.experience ? `, with experience in ${userBackground.experience}` : ''}
- Target roles: ${userBackground?.targetRoles?.join(', ') || 'Not specified'}
${targetName ? `- Recipient name: ${targetName}` : '- Recipient name: [Name]'}
${targetCompany ? `- Their company: ${targetCompany}` : ''}
${targetRole ? `- Their role: ${targetRole}` : ''}
${howFound ? `- How they found them: ${howFound}` : ''}
${specificTopic ? `- Topic to discuss: ${specificTopic}` : ''}

REQUIREMENTS:
1. Be professional yet warm and personable
2. Keep it concise - people are busy
3. Show genuine interest, not just asking for a job
4. Include a clear but soft call-to-action
5. Use [brackets] for any details that should be personalized
6. For connection requests, stay under 300 characters
7. Don't be overly formal or stiff - be human

EXAMPLES OF GOOD TONE:
- "I came across your profile while researching..."
- "I'd love to learn more about your journey..."
- "Would you be open to a quick 15-minute chat?"
- "Your insights on [topic] really resonated with me..."

Generate ONLY the message text, no explanations or alternatives.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                maxOutputTokens: 512,
                temperature: 0.7
            }
        });

        const text = response.text?.trim() || '';

        // Clean up any markdown or quotes
        return text
            .replace(/^["']|["']$/g, '')
            .replace(/^\*\*.*?\*\*\n?/g, '')
            .trim();
    } catch (error) {
        console.error('[Outreach Script] Error generating script:', error);

        // Return a fallback template based on type
        const fallbacks = {
            connection_request: `Hi ${targetName || '[Name]'}, I came across your profile while researching ${targetCompany || '[Company]'}. As someone exploring careers in ${userBackground?.targetRoles?.[0] || 'your field'}, I'd love to connect and learn from your experience.`,
            follow_up: `Hi ${targetName || '[Name]'}, Thanks for connecting! I really appreciated your profile and would love to hear more about your work at ${targetCompany || '[Company]'}. Would you have a few minutes for a brief chat sometime?`,
            informational_interview: `Hi ${targetName || '[Name]'}, I hope this message finds you well. I'm exploring careers in ${userBackground?.targetRoles?.[0] || 'your field'} and your path from ${targetRole || 'your background'} is inspiring. Would you have 15 minutes for a virtual coffee chat? I'd love to hear your insights.`,
            thank_you: `Hi ${targetName || '[Name]'}, Thank you so much for taking the time to speak with me. Your insights about ${specificTopic || 'the industry'} were incredibly valuable. I really appreciate your generosity in sharing your experience!`
        };

        return fallbacks[type];
    }
};

// ============================================
// INTERVIEW PREP FUNCTIONS
// ============================================

export type InterviewQuestionType = 'behavioral' | 'technical' | 'situational' | 'company_specific';

export interface InterviewQuestion {
    id: string;
    question: string;
    type: InterviewQuestionType;
    context?: string;
    tips?: string;
}

export interface InterviewFeedback {
    score: number; // 1-100
    strengths: string[];
    improvements: string[];
    suggestedAnswer: string;
    starAnalysis?: {
        situation: string;
        task: string;
        action: string;
        result: string;
    };
}

export interface InterviewJobContext {
    id: string;
    title: string;
    company: string;
    description?: string;
    skills?: string[];
}

export interface InterviewUserContext {
    name?: string;
    education?: string;
    experience?: string;
    skills?: string[];
    targetRoles?: string[];
}

/**
 * Generate interview questions based on job and user profile
 */
export const generateInterviewQuestions = async (
    job: InterviewJobContext,
    userContext?: InterviewUserContext
): Promise<InterviewQuestion[]> => {
    const prompt = `Generate 6 interview questions for a ${job.title} position at ${job.company}.

JOB CONTEXT:
- Role: ${job.title}
- Company: ${job.company}
${job.description ? `- Job Description: ${job.description.slice(0, 500)}...` : ''}
${job.skills?.length ? `- Required Skills: ${job.skills.join(', ')}` : ''}

CANDIDATE CONTEXT:
${userContext?.name ? `- Name: ${userContext.name}` : ''}
${userContext?.education ? `- Education: ${userContext.education}` : ''}
${userContext?.experience ? `- Experience: ${userContext.experience}` : ''}
${userContext?.skills?.length ? `- Skills: ${userContext.skills.join(', ')}` : ''}

REQUIREMENTS:
1. Generate exactly 6 questions with a good mix of types
2. Include at least 2 behavioral questions (STAR-friendly)
3. Include at least 1 technical question relevant to the role
4. Include 1-2 situational questions
5. Include 1 company-specific question

Return a JSON array with this structure:
[
  {
    "question": "Tell me about a time when...",
    "type": "behavioral",
    "context": "Brief context about why this matters for the role",
    "tips": "What the interviewer is looking for"
  }
]

Types must be one of: behavioral, technical, situational, company_specific

ONLY return the JSON array, no other text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                maxOutputTokens: 2048,
                temperature: 0.7
            }
        });

        const text = response.text?.trim() || '';

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in response');
        }

        const questions = JSON.parse(jsonMatch[0]) as Array<{
            question: string;
            type: InterviewQuestionType;
            context?: string;
            tips?: string;
        }>;

        // Add IDs and return
        return questions.map((q, i) => ({
            id: `q-${Date.now()}-${i}`,
            question: q.question,
            type: q.type,
            context: q.context,
            tips: q.tips
        }));
    } catch (error) {
        console.error('[Interview Questions] Error generating questions:', error);

        // Return fallback questions
        return [
            {
                id: `q-${Date.now()}-0`,
                question: `Tell me about yourself and why you're interested in the ${job.title} role at ${job.company}.`,
                type: 'behavioral',
                context: 'Opening question to understand your background',
                tips: 'Keep it relevant to the role, 2-3 minutes'
            },
            {
                id: `q-${Date.now()}-1`,
                question: 'Describe a challenging project you worked on. What was your role and what was the outcome?',
                type: 'behavioral',
                context: 'Understanding your problem-solving abilities',
                tips: 'Use the STAR method: Situation, Task, Action, Result'
            },
            {
                id: `q-${Date.now()}-2`,
                question: `What skills or experiences make you a strong candidate for this ${job.title} position?`,
                type: 'technical',
                context: 'Assessing your qualifications',
                tips: 'Be specific and give examples'
            },
            {
                id: `q-${Date.now()}-3`,
                question: 'How do you handle tight deadlines or conflicting priorities?',
                type: 'situational',
                context: 'Understanding your time management',
                tips: 'Give a specific example if possible'
            },
            {
                id: `q-${Date.now()}-4`,
                question: 'Tell me about a time you received constructive criticism. How did you respond?',
                type: 'behavioral',
                context: 'Assessing your ability to grow and learn',
                tips: 'Show how you turned feedback into improvement'
            },
            {
                id: `q-${Date.now()}-5`,
                question: `What do you know about ${job.company} and why do you want to work here?`,
                type: 'company_specific',
                context: 'Testing your research and genuine interest',
                tips: 'Show you\'ve researched the company'
            }
        ];
    }
};

/**
 * Generate general interview questions (not job-specific)
 */
export const generateGeneralInterviewQuestions = async (
    userContext?: InterviewUserContext
): Promise<InterviewQuestion[]> => {
    const prompt = `Generate 6 general interview questions for a job seeker.

CANDIDATE CONTEXT:
${userContext?.name ? `- Name: ${userContext.name}` : ''}
${userContext?.education ? `- Education: ${userContext.education}` : ''}
${userContext?.experience ? `- Experience: ${userContext.experience}` : ''}
${userContext?.targetRoles?.length ? `- Target Roles: ${userContext.targetRoles.join(', ')}` : ''}

REQUIREMENTS:
1. Generate 6 common interview questions that apply to most roles
2. Include 3 behavioral questions (STAR-friendly)
3. Include 2 situational questions
4. Include 1 general/opening question
5. Focus on transferable skills and experiences

Return a JSON array with this structure:
[
  {
    "question": "Tell me about a time when...",
    "type": "behavioral",
    "context": "Brief context about why this matters",
    "tips": "What the interviewer is looking for"
  }
]

Types must be one of: behavioral, technical, situational, company_specific

ONLY return the JSON array, no other text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                maxOutputTokens: 2048,
                temperature: 0.7
            }
        });

        const text = response.text?.trim() || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in response');
        }

        const questions = JSON.parse(jsonMatch[0]);
        return questions.map((q: any, i: number) => ({
            id: `q-${Date.now()}-${i}`,
            question: q.question,
            type: q.type,
            context: q.context,
            tips: q.tips
        }));
    } catch (error) {
        console.error('[General Interview Questions] Error:', error);
        return generateInterviewQuestions({ id: 'general', title: 'Professional Role', company: 'a company' }, userContext);
    }
};

/**
 * Evaluate an interview response and provide feedback
 */
export const evaluateInterviewResponse = async (
    question: InterviewQuestion,
    response: string,
    job?: InterviewJobContext,
    userContext?: InterviewUserContext
): Promise<InterviewFeedback> => {
    const prompt = `Evaluate this interview response and provide constructive feedback.

QUESTION:
"${question.question}"
Question Type: ${question.type}
${question.context ? `Context: ${question.context}` : ''}

CANDIDATE'S RESPONSE:
"${response}"

${job ? `JOB CONTEXT:
- Role: ${job.title}
- Company: ${job.company}` : ''}

${userContext?.experience ? `CANDIDATE BACKGROUND:
- Experience: ${userContext.experience}` : ''}

EVALUATION CRITERIA:
1. Relevance to the question
2. Structure and clarity (especially STAR method for behavioral)
3. Specific examples and details
4. Enthusiasm and authenticity
5. Length and completeness

Provide feedback in this JSON format:
{
  "score": 75,
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Area to improve 1", "Area to improve 2"],
  "suggestedAnswer": "A brief example of how to improve or extend the answer",
  "starAnalysis": {
    "situation": "What situation was described or missing",
    "task": "What task/goal was mentioned or missing",
    "action": "What actions were described or missing",
    "result": "What results were mentioned or missing"
  }
}

Note: Only include starAnalysis for behavioral questions.
Score should be 1-100 based on overall quality.

ONLY return the JSON object, no other text.`;

    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                maxOutputTokens: 1024,
                temperature: 0.5
            }
        });

        const text = aiResponse.text?.trim() || '';

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON object found in response');
        }

        const feedback = JSON.parse(jsonMatch[0]) as InterviewFeedback;

        // Validate and normalize score
        feedback.score = Math.min(100, Math.max(1, feedback.score || 50));

        // Ensure arrays exist
        feedback.strengths = feedback.strengths || [];
        feedback.improvements = feedback.improvements || [];
        feedback.suggestedAnswer = feedback.suggestedAnswer || 'Consider adding more specific examples and details to strengthen your response.';

        // Only include STAR analysis for behavioral questions
        if (question.type !== 'behavioral') {
            delete feedback.starAnalysis;
        }

        return feedback;
    } catch (error) {
        console.error('[Interview Evaluation] Error evaluating response:', error);

        // Return fallback feedback
        const hasExamples = response.length > 100 && (
            response.toLowerCase().includes('for example') ||
            response.toLowerCase().includes('instance') ||
            response.toLowerCase().includes('when i')
        );

        const hasStructure = response.length > 150;
        const baseScore = 50 + (hasExamples ? 15 : 0) + (hasStructure ? 10 : 0);

        return {
            score: Math.min(75, baseScore),
            strengths: hasExamples
                ? ['You provided specific examples', 'Your response addressed the question']
                : ['You attempted to answer the question'],
            improvements: hasExamples
                ? ['Consider adding more quantifiable results', 'You could elaborate on the impact']
                : ['Try to include specific examples', 'Use the STAR method for behavioral questions', 'Add more detail about your actions and results'],
            suggestedAnswer: 'Consider restructuring your answer using the STAR method: describe the Situation, explain the Task, detail the Actions you took, and share the Results achieved.'
        };
    }
};
