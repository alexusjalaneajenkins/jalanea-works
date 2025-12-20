import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, IndustryPulseItem } from "../types";

// Initialize Gemini AI
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Cache for industry pulse items (1 hour TTL)
const pulseCache: Map<string, { data: IndustryPulseItem[]; timestamp: number }> = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate personalized industry resources based on user profile
 */
export async function generateIndustryPulse(userProfile: UserProfile): Promise<IndustryPulseItem[]> {
    // Create cache key from user's degrees and target roles
    const degrees = userProfile.education?.map(e => e.degree).join(',') || 'general';
    const roles = userProfile.preferences?.targetRoles?.join(',') || 'entry-level';
    const cacheKey = `${degrees}-${roles}`.toLowerCase();

    // Check cache
    const cached = pulseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const degreesText = userProfile.education?.map(e => e.degree).join(', ') || 'General Studies';
        const rolesText = userProfile.preferences?.targetRoles?.join(', ') || 'Entry Level positions';
        const skillsText = [
            ...(userProfile.skills?.technical || []),
            ...(userProfile.skills?.design || [])
        ].slice(0, 5).join(', ') || 'general skills';

        const prompt = `
      Act as a Career Development Expert. Generate exactly 3 personalized learning resources for this professional:
      
      PROFILE:
      - Degrees: ${degreesText}
      - Target Roles: ${rolesText}
      - Key Skills: ${skillsText}
      - Location: ${userProfile.location || 'Orlando, FL'}
      
      Generate resources that will help them:
      1. Stay current with industry news relevant to their target roles
      2. Learn a skill that will make them more competitive
      3. Understand market trends in their field
      
      REQUIREMENTS:
      - Use REAL course/resource names (Coursera, LinkedIn Learning, Udemy, industry blogs)
      - Make titles specific and actionable
      - Each "reason" should explain why this specific resource matches their profile
      
      Return JSON array with exactly 3 items.
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
                            source: { type: Type.STRING },
                            type: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const items: IndustryPulseItem[] = JSON.parse(response.text).map((item: any, index: number) => ({
                id: item.id || `pulse-${index}`,
                title: item.title,
                source: item.source,
                type: item.type as 'news' | 'course' | 'trend',
                reason: item.reason
            }));

            // Cache the result
            pulseCache.set(cacheKey, { data: items, timestamp: Date.now() });

            return items;
        }

        return getDefaultPulseItems();
    } catch (error) {
        console.error('Industry Pulse generation failed:', error);
        return getDefaultPulseItems();
    }
}

/**
 * Get default/fallback pulse items when AI fails
 */
function getDefaultPulseItems(): IndustryPulseItem[] {
    return [
        {
            id: 'default-1',
            title: 'Tech Industry Updates',
            source: 'TechCrunch',
            type: 'news',
            reason: 'Stay updated with the latest technology news'
        },
        {
            id: 'default-2',
            title: 'Professional Skills Development',
            source: 'LinkedIn Learning',
            type: 'course',
            reason: 'Enhance your professional skill set'
        },
        {
            id: 'default-3',
            title: 'Job Market Insights',
            source: 'Indeed Hiring Lab',
            type: 'trend',
            reason: 'Understand current hiring trends'
        }
    ];
}

/**
 * Clear expired cache entries
 */
export function clearExpiredPulseCache(): void {
    const now = Date.now();
    for (const [key, value] of pulseCache.entries()) {
        if (now - value.timestamp >= CACHE_TTL_MS) {
            pulseCache.delete(key);
        }
    }
}
