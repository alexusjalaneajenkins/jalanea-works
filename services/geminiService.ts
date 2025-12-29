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
 * Get career advice using the serverless API endpoint
 * This calls /api/chat which runs server-side with proper API key access
 */
export const getCareerAdvice = async (userQuery: string): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userQuery }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Chat API error:', data.error);
            return data.response || "I'm having trouble connecting right now. Please try again!";
        }

        return data.response || "I couldn't generate a response at this time.";
    } catch (error) {
        console.error("Career Advice API Error:", error);
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

export const generateResume = async (type: string, userProfile: UserProfile, jobDescription: string): Promise<string> => {
    try {
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

        const prompt = `
            Act as an expert Resume Writer for Valencia College Alumni.
            Generate a ${type} Resume.
            
            CANDIDATE PROFILE:
            Name: ${userProfile.name}
            Email: ${userProfile.email}
            Location: ${userProfile.location}
            
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
            
            CRITICAL INSTRUCTIONS:
            1. ${isGenericRole
                ? 'Create a strong, versatile resume optimized for this specific Career Path/Role.'
                : 'Tailor the resume content specifically to match keywords in the Target Job Description.'}
            2. Use the provided Bullet Points from experience but rephrase them to sound more impactful if necessary for the target.
            3. Highlight the Valencia College degrees.
            4. Format the output as clean Markdown.
            5. Keep it professional and ATS-friendly.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "Failed to generate resume.";
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

/**
 * NEW: Real-Time Job Search with Google Search Grounding
 * Uses Gemini's googleSearch tool to find ACTUAL live job postings from the web
 * This is the most accurate way to find current job listings
 */
export const searchJobsWithGrounding = async (
    query: string,
    location: string,
    workStyle?: 'On-site' | 'Remote' | 'Hybrid' | 'All',
    userProfile?: UserProfile
): Promise<Job[]> => {
    try {
        console.log(`🔍 Using Gemini Search Grounding for: "${query}" in "${location}" (workStyle: ${workStyle || 'All'})`);

        // Build context from user profile if available
        const degreesContext = userProfile?.education?.map(e => {
            const degreeType = (e as any).degreeType;
            return degreeType ? `${degreeType} in ${e.degree}` : e.degree;
        }).join(", ") || "";

        const skillsContext = userProfile?.skills?.technical?.join(", ") || "";

        // Build location requirements based on work style
        const isOnSite = workStyle === 'On-site' || workStyle === 'Hybrid';
        const locationRequirement = isOnSite
            ? `LOCATION REQUIREMENT: Jobs MUST be physically located in or within 30 miles of ${location}. Do NOT include jobs from other cities or states.`
            : `LOCATION: ${location} (remote positions from any location are acceptable)`;

        const remoteExclusion = isOnSite
            ? `
            CRITICAL EXCLUSIONS - Do NOT include:
            - Remote positions or "Work from Home" jobs
            - Jobs located in other cities or states
            - Jobs that don't specify ${location} or nearby areas as the work location`
            : '';

        const prompt = `
            TASK: Find 5 REAL job listings for "${query}" ${isOnSite ? `in ${location}` : ''}.
            
            ${locationRequirement}
            
            REQUIREMENTS:
            1. Search Indeed, LinkedIn, Glassdoor for REAL current job postings.
            2. Entry-level or junior roles only (0-3 years experience).
            3. Must have real application links.
            ${isOnSite ? `4. On-site or Hybrid only in ${location}. NO remote jobs.` : '4. Remote jobs are acceptable.'}
            
            Return JSON array with these fields (keep descriptions SHORT):
            - id: "grounded-[number]"
            - title: job title
            - company: COMPANY NAME (required!)
            - location: "City, State"
            - locationType: "On-site", "Remote", or "Hybrid"
            - type: "Full-time", "Part-time", "Contract", or "Internship"
            - salaryRange: salary or "Not specified"
            - postedAt: e.g., "2 days ago"
            - matchScore: 0-100
            - skills: [3 key skills]
            - description: ONE short sentence about the role
            - experienceLevel: "Entry Level" or "Internship"
            - experienceYears: e.g., "0-2 years"
            - applyUrl: direct link to apply
            - source: "Google Search"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], // This enables real-time web search!
                maxOutputTokens: 4096, // Limit response size to prevent JSON truncation
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
                            locationType: { type: Type.STRING },
                            type: { type: Type.STRING },
                            salaryRange: { type: Type.STRING },
                            postedAt: { type: Type.STRING },
                            matchScore: { type: Type.NUMBER },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            description: { type: Type.STRING },
                            experienceLevel: { type: Type.STRING },
                            experienceYears: { type: Type.STRING },
                            applyUrl: { type: Type.STRING },
                            source: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) {
            // Safer JSON parsing with error handling
            let rawJobs;
            try {
                rawJobs = JSON.parse(response.text);
            } catch (parseError) {
                console.error('❌ JSON Parse Error in Grounding Response:', parseError);
                console.log('📄 Response length:', response.text.length, 'characters');
                console.log('📄 Response preview:', response.text.substring(0, 500) + '...');
                return []; // Return empty - will fallback to aggregate API
            }

            console.log(`📍 Found ${rawJobs.length} live jobs via Google Search Grounding`);

            // Debug: log first job to see actual structure
            if (rawJobs.length > 0) {
                console.log('📋 Sample grounded job structure:', JSON.stringify(rawJobs[0], null, 2));
            }

            // Ensure all jobs have required fields (fallback for missing values)
            const jobs = rawJobs.map((job: any, index: number) => ({
                ...job,
                id: job.id || `grounded-${index}`,
                company: job.company || 'Company Hiring',  // Fallback if Gemini doesn't return company
                location: job.location || location, // Use searched location as fallback
                locationType: job.locationType || (isOnSite ? 'On-site' : 'Remote'),
                source: job.source || 'Google Search'
            }));

            return jobs;
        }
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

            // Filter out HIGH-risk scams AND irrelevant locations
            const goodJobs = cleanedJobs.filter((job: any) =>
                job.scam_likelihood !== 'HIGH' && !job.isIrrelevant
            );

            const scamCount = cleanedJobs.filter((job: any) => job.scam_likelihood === 'HIGH').length;
            const irrelevantCount = cleanedJobs.filter((job: any) => job.isIrrelevant).length;

            console.log(`📋 ${goodJobs.length} quality jobs after filtering:`);
            if (scamCount > 0) console.log(`   ❌ Blocked ${scamCount} HIGH-risk scams`);
            if (irrelevantCount > 0) console.log(`   📍 Blocked ${irrelevantCount} jobs > 50 miles away`);

            // Warn about MEDIUM risk jobs
            const mediumRiskCount = goodJobs.filter((job: any) => job.scam_likelihood === 'MEDIUM').length;
            if (mediumRiskCount > 0) {
                console.log(`   ⚠️ ${mediumRiskCount} jobs marked as MEDIUM risk - showing with warning`);
            }

            return goodJobs.map((job: any, index: number) => ({
                id: job.id || `cleaned-${index}`,
                title: job.title || 'Job Opening',
                company: job.company || 'Company Hiring',
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
