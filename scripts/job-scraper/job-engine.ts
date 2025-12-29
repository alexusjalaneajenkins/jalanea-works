/**
 * AI Job Board Scraper
 * 
 * Architecture: "Hybrid Sandwich"
 * 1. Fetcher: SerpAPI (google_jobs engine) - gets raw structured data
 * 2. Processor: Gemini 3.0 Flash - cleans, standardizes, and scores
 * 
 * @author Senior Backend Engineer
 */

import { GoogleGenAI, Type } from "@google/genai";
import { config, getJson } from "serpapi";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ============================================
// CONFIGURATION
// ============================================

config.api_key = process.env.SERPAPI_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!config.api_key) {
    throw new Error("SERPAPI_KEY is required in .env file");
}
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required in .env file");
}

// Initialize Gemini client
const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ============================================
// TYPE DEFINITIONS
// ============================================

interface CleanedJob {
    title: string;
    company: string;
    location: string;
    salary_standardized: string | null;
    scam_likelihood: "LOW" | "MEDIUM" | "HIGH";
    match_score: number;
}

interface SerpAPIJob {
    title?: string;
    company_name?: string;
    location?: string;
    description?: string;
    detected_extensions?: {
        posted_at?: string;
        schedule_type?: string;
        salary?: string;
    };
    apply_options?: Array<{
        title?: string;
        link?: string;
    }>;
}

// ============================================
// 1. THE FETCHER (SerpAPI)
// ============================================

async function fetchRawJobs(query: string, location: string): Promise<SerpAPIJob[]> {
    console.log(`\n📡 [FETCHER] Fetching jobs from Google Jobs...`);
    console.log(`   Query: "${query}"`);
    console.log(`   Location: "${location}"`);

    try {
        const response = await getJson({
            engine: "google_jobs",
            q: query,
            location: location,
            hl: "en",
            gl: "us",
        });

        const jobs: SerpAPIJob[] = response["jobs_results"] || [];

        console.log(`   ✅ Found ${jobs.length} raw jobs from Google Jobs`);

        // Log sample job structure for debugging
        if (jobs.length > 0) {
            console.log(`\n📋 [DEBUG] Sample raw job structure:`);
            console.log(`   Title: ${jobs[0].title}`);
            console.log(`   Company: ${jobs[0].company_name}`);
            console.log(`   Location: ${jobs[0].location}`);
            console.log(`   Salary: ${jobs[0].detected_extensions?.salary || "Not specified"}`);
        }

        return jobs;
    } catch (error) {
        console.error(`   ❌ SerpAPI Error:`, error);
        return [];
    }
}

// ============================================
// 2. THE PROCESSOR (Gemini 3.0 Flash)
// ============================================

async function cleanAndScoreJobs(
    rawJobs: SerpAPIJob[],
    userPreferences?: string
): Promise<CleanedJob[]> {
    console.log(`\n🧠 [PROCESSOR] Sending ${rawJobs.length} jobs to Gemini 3.0 Flash...`);

    if (rawJobs.length === 0) {
        return [];
    }

    // Limit to 20 jobs per batch to stay within token limits
    const jobBatch = rawJobs.slice(0, 20);

    const systemPrompt = `You are an expert Job Recruiter AI.
Your task is to clean and score job listings. 

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no code blocks, no explanations
2. Standardize ALL salaries to "Annual USD" format (e.g., "$85k - $120k")
3. If salary is hourly, convert to annual (hourly * 2080)
4. If salary is missing, set salary_standardized to null
5. Detect scam indicators:
   - HIGH: Asks for money, MLM language, unrealistic pay ($5k/week easy work)
   - MEDIUM: Vague company info, too good to be true claims
   - LOW: Legitimate job posting
6. Score match 0-100 based on:
   - Job title clarity: +20
   - Company reputation: +20
   - Salary transparency: +20
   - Reasonable requirements: +20
   - Location match: +20

${userPreferences ? `USER PREFERENCES: ${userPreferences}` : ""}`;

    const userPrompt = `Clean and score these job listings:

${JSON.stringify(jobBatch.map(job => ({
        title: job.title,
        company: job.company_name,
        location: job.location,
        salary: job.detected_extensions?.salary,
        description: job.description?.substring(0, 500) // Truncate to save tokens
    })), null, 2)}`;

    try {
        const response = await genai.models.generateContent({
            model: "gemini-3.0-flash", // or "gemini-3.0-flash-preview"
            contents: [
                { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
            ],
            config: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "Cleaned job title"
                            },
                            company: {
                                type: Type.STRING,
                                description: "Company name only, no extra characters"
                            },
                            location: {
                                type: Type.STRING,
                                description: "City, State format"
                            },
                            salary_standardized: {
                                type: Type.STRING,
                                nullable: true,
                                description: "Annual USD format (e.g., '$85k - $120k') or null if not specified"
                            },
                            scam_likelihood: {
                                type: Type.STRING,
                                enum: ["LOW", "MEDIUM", "HIGH"],
                                description: "Scam risk assessment"
                            },
                            match_score: {
                                type: Type.NUMBER,
                                description: "Quality score 0-100"
                            }
                        },
                        required: ["title", "company", "location", "scam_likelihood", "match_score"]
                    }
                }
            }
        });

        if (!response.text) {
            console.error(`   ❌ Gemini returned no response`);
            return [];
        }

        console.log(`   ✅ Gemini response received (${response.text.length} chars)`);

        // Parse the JSON response
        const cleanedJobs: CleanedJob[] = JSON.parse(response.text);

        console.log(`   ✅ Parsed ${cleanedJobs.length} cleaned jobs`);

        // Filter out high-scam jobs
        const qualityJobs = cleanedJobs.filter(job => job.scam_likelihood !== "HIGH");
        console.log(`   ✅ ${qualityJobs.length} quality jobs after scam filter`);

        return qualityJobs;

    } catch (error) {
        console.error(`   ❌ Gemini Processing Error:`, error);

        // Fallback: return basic cleaned data from raw jobs
        console.log(`   ⚠️ Using fallback: returning raw job data`);
        return rawJobs.slice(0, 10).map(job => ({
            title: job.title || "Unknown",
            company: job.company_name || "Company Hiring",
            location: job.location || "Unknown",
            salary_standardized: job.detected_extensions?.salary || null,
            scam_likelihood: "LOW" as const,
            match_score: 50
        }));
    }
}

// ============================================
// 3. MAIN EXECUTION
// ============================================

async function main() {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║           AI JOB BOARD SCRAPER v1.0                      ║");
    console.log("║           SerpAPI + Gemini 3.0 Flash                     ║");
    console.log("╚══════════════════════════════════════════════════════════╝");

    const searchQuery = "Graphic Designer entry level";
    const searchLocation = "Orlando, Florida";
    const userPreferences = "Looking for remote-friendly positions with good work-life balance";

    try {
        // Step 1: Fetch raw jobs from Google Jobs (via SerpAPI)
        const rawJobs = await fetchRawJobs(searchQuery, searchLocation);

        if (rawJobs.length === 0) {
            console.log("\n❌ No jobs found. Check your SerpAPI key and try again.");
            return;
        }

        // Step 2: Clean and score with Gemini
        const cleanedJobs = await cleanAndScoreJobs(rawJobs, userPreferences);

        // Step 3: Display results
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║                    RESULTS                               ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        if (cleanedJobs.length === 0) {
            console.log("No quality jobs found after processing.");
            return;
        }

        // Sort by match score (highest first)
        const sortedJobs = cleanedJobs.sort((a, b) => b.match_score - a.match_score);

        sortedJobs.forEach((job, index) => {
            console.log(`┌─────────────────────────────────────────────────────────┐`);
            console.log(`│ #${index + 1} - ${job.title.substring(0, 45).padEnd(45)} │`);
            console.log(`├─────────────────────────────────────────────────────────┤`);
            console.log(`│ 🏢 Company:    ${job.company.substring(0, 40).padEnd(40)} │`);
            console.log(`│ 📍 Location:   ${job.location.substring(0, 40).padEnd(40)} │`);
            console.log(`│ 💰 Salary:     ${(job.salary_standardized || "Not specified").substring(0, 40).padEnd(40)} │`);
            console.log(`│ ⚠️  Scam Risk:  ${job.scam_likelihood.padEnd(40)} │`);
            console.log(`│ ⭐ Match Score: ${String(job.match_score).padEnd(39)} │`);
            console.log(`└─────────────────────────────────────────────────────────┘\n`);
        });

        console.log(`\n✅ Total: ${sortedJobs.length} quality jobs found and processed.`);

    } catch (error) {
        console.error("\n❌ Fatal Error:", error);
    }
}

// Run the script
main().catch(console.error);
