import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, JobAnalysis, Job } from "../types";

// Initialize Gemini AI with Vite environment variable (kept for structured output functions)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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
            model: 'gemini-2.5-flash',
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
            .map(e => `${e.degree} from ${e.school} (${e.year}) - GPA: ${e.gpa || 'N/A'}`)
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
            model: 'gemini-2.5-flash',
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
            model: 'gemini-2.5-flash',
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
            model: 'gemini-2.5-flash',
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

// NEW: Real-Time Job Search Simulation
export const findRealTimeJobs = async (userProfile: UserProfile): Promise<Job[]> => {
    try {
        const degrees = userProfile.education.map(e => e.degree).join(", ");
        const skills = userProfile.skills.technical.join(", ");

        const prompt = `
            Act as a Real-Time Job Scraper for Orlando, FL.
            Find 3 currently active (or highly realistic based on current market data) job listings for a candidate with these credentials:
            
            Degrees: ${degrees}
            Skills: ${skills}
            Location: ${userProfile.location}
            
            Generate a JSON array of 3 Job objects.
            
            CRITICAL:
            1. Use REAL company names in Orlando (e.g., Disney, Universal, Lockheed Martin, AdventHealth, Orlando Health, EA, Tech start-ups).
            2. Ensure "postedAt" implies recent activity (e.g., "2h ago", "Just now").
            3. "matchScore" should be between 85 and 99.
            4. "matchReason" should explain WHY it fits the candidate's specific skills/degree.
            5. "logo" should be a URL string: "https://ui-avatars.com/api/?name=[CompanyName]&background=random&color=fff&size=128&bold=true" (Replace [CompanyName] with the actual name).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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
            model: 'gemini-2.5-flash',
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
            model: 'gemini-2.5-flash',
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
            model: 'gemini-2.5-flash',
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
