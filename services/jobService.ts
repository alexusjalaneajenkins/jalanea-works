import type { Job, SerpApiJobResult, JobSearchResponse, TransformedJobSearchResponse, TransportMode } from '../types';

/**
 * Service for searching jobs via SerpApi
 * Calls our Vercel serverless function to keep API keys secure
 */

const API_BASE_URL = import.meta.env.PROD
    ? ''  // Use relative paths in production (works on any domain)
    : 'http://localhost:5173';

/**
 * Search for jobs using SerpApi (Google Jobs)
 * @param query - Search query (e.g., "Marketing Orlando")
 * @param options - Search options including location, filters, pagination
 * @returns JobSearchResponse with jobs, pagination, and available filters
 */
export async function searchJobs(
    query: string,
    options?: {
        location?: string;
        userLocation?: string;
        transportMode?: TransportMode;
        country?: string;      // 'us', 'uk', etc.
        language?: string;     // 'en', 'es', etc.
        radius?: number;       // Search radius in km
        chips?: string;        // Google Jobs chips (e.g. date_posted:today)
        filters?: string;      // uds filter string
        nextPageToken?: string; // For pagination
    }
): Promise<TransformedJobSearchResponse> {
    try {
        // Build query parameters - append 'entry level' to focus on career starters
        const entryLevelQuery = `${query} entry level`.trim();
        const params = new URLSearchParams({ q: entryLevelQuery });

        if (options?.location) params.append('location', options.location);
        if (options?.country) params.append('gl', options.country);
        if (options?.language) params.append('hl', options.language);
        if (options?.radius) params.append('lrad', options.radius.toString());
        if (options?.chips) params.append('chips', options.chips);
        if (options?.filters) params.append('uds', options.filters);
        if (options?.nextPageToken) params.append('next_page_token', options.nextPageToken);

        // Call our Vercel serverless function
        const response = await fetch(`${API_BASE_URL}/api/jobs?${params.toString()}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch jobs');
        }

        const data: JobSearchResponse = await response.json();

        // Transform SerpApi results to our Job interface
        const jobs: Job[] = await Promise.all(
            data.jobs.map(async (serpJob: SerpApiJobResult, index: number) => {
                // Extract salary from extensions or detected_extensions
                const salaryExtension = serpJob.extensions?.find(ext =>
                    ext.toLowerCase().includes('$') || ext.toLowerCase().includes('hour') || ext.toLowerCase().includes('year')
                );
                const salary = salaryExtension || serpJob.detected_extensions?.salary || 'Not specified';

                // Extract job type
                const typeExtension = serpJob.extensions?.find(ext =>
                    ['full-time', 'part-time', 'contract', 'internship'].some(type =>
                        ext.toLowerCase().includes(type)
                    )
                );
                const jobType = typeExtension?.includes('Contract') ? 'Contract' :
                    typeExtension?.includes('Internship') ? 'Internship' :
                        typeExtension?.includes('Part') ? 'Contract' :
                            'Full-time';

                // Extract experience level from description
                const experienceLevel = serpJob.description.toLowerCase().includes('intern') ? 'Internship' :
                    serpJob.description.toLowerCase().includes('entry') ? 'Entry Level' :
                        serpJob.description.toLowerCase().includes('senior') ? 'Mid-Senior' :
                            'Associate';

                // Extract years of experience (simple regex)
                const yearsMatch = serpJob.description.match(/(\d+|one|two|three)\+?\s*(?:-|to)?\s*(\d+)?\s*years?/i);
                let experienceYears = "Not specified";
                if (serpJob.description.toLowerCase().includes('no experience')) {
                    experienceYears = "0 Years";
                } else if (yearsMatch) {
                    experienceYears = yearsMatch[0]; // e.g. "2+ years" or "1-3 years"
                }

                // Get apply URL
                const applyUrl = serpJob.apply_options?.[0]?.link || serpJob.related_links?.[0]?.link || '#';

                // Calculate commute if user location is provided
                let commute;
                if (options?.userLocation && serpJob.location) {
                    try {
                        const commuteMode = options.transportMode === 'Car' ? 'driving' :
                            options.transportMode === 'Bike' ? 'bicycling' :
                                options.transportMode === 'Walk' ? 'walking' :
                                    options.transportMode === 'Bus' || options.transportMode === 'Uber' ? 'transit' :
                                        'driving';

                        const commuteResponse = await fetch(
                            `${API_BASE_URL}/api/commute?origin=${encodeURIComponent(options.userLocation)}&destination=${encodeURIComponent(serpJob.location)}&mode=${commuteMode}`
                        );

                        if (commuteResponse.ok) {
                            const commuteData = await commuteResponse.json();
                            commute = commuteData.commute;
                        }
                    } catch (error) {
                        console.warn('Failed to calculate commute for job:', serpJob.title, error);
                    }
                }

                // Build Job object
                const job: Job = {
                    id: `serp-${data.searchId}-${index}`,
                    title: serpJob.title,
                    company: serpJob.company_name,
                    location: serpJob.location,
                    type: jobType as Job['type'],
                    salaryRange: salary,
                    postedAt: serpJob.detected_extensions?.posted_at || 'Recently',
                    matchScore: 0, // Will be calculated by AI later
                    skills: [], // Will be extracted by AI later
                    description: serpJob.description,
                    experienceLevel,
                    experienceYears, // extracted above
                    applyUrl,
                    commute,
                    bulletPoints: serpJob.job_highlights?.flatMap(h => h.items) || [],
                };

                return job;
            })
        );

        console.log(`✅ Found ${jobs.length} entry-level jobs for "${entryLevelQuery}"${data.pagination.hasNextPage ? ' (more pages available)' : ''}`);

        // Return response with transformed jobs
        return {
            jobs,
            totalResults: jobs.length,
            searchId: data.searchId,
            searchParameters: data.searchParameters,
            pagination: data.pagination,
            availableFilters: data.availableFilters,
        };

    } catch (error) {
        console.error('Error searching jobs:', error);
        throw error;
    }
}

/**
 * Search for jobs using multiple sources (aggregate endpoint)
 * Queries: SerpAPI, Remotive, RemoteOK, Arbeitnow, The Muse, JSearch, Adzuna
 * @param query - Search query (e.g., "Developer")
 * @param options - Search options
 * @returns Combined, deduplicated job results from all sources
 */
export async function searchJobsAggregate(
    query: string,
    options?: {
        location?: string;
        remote?: boolean;
        sources?: string[]; // Filter to specific sources
    }
): Promise<{ jobs: Job[]; totalResults: number; sources: string[] }> {
    try {
        const params = new URLSearchParams({ q: query });

        if (options?.location) params.append('location', options.location);
        if (options?.remote) params.append('remote', 'true');
        if (options?.sources?.length) params.append('sources', options.sources.join(','));

        const response = await fetch(`${API_BASE_URL}/api/jobs-aggregate?${params.toString()}`);

        if (!response.ok) {
            console.error('Aggregate API error, falling back to SerpAPI only');
            // Fallback to original SerpAPI search
            const fallback = await searchJobs(query, { location: options?.location });
            return {
                jobs: fallback.jobs,
                totalResults: fallback.totalResults,
                sources: ['Google Jobs']
            };
        }

        const data = await response.json();

        console.log(`✅ Aggregate search returned ${data.totalResults} jobs from sources:`, data.sources);

        return {
            jobs: data.jobs || [],
            totalResults: data.totalResults || 0,
            sources: data.sources || []
        };

    } catch (error) {
        console.error('Error in aggregate job search:', error);
        // Fallback to original search
        try {
            const fallback = await searchJobs(query, { location: options?.location });
            return {
                jobs: fallback.jobs,
                totalResults: fallback.totalResults,
                sources: ['Google Jobs']
            };
        } catch (e) {
            return { jobs: [], totalResults: 0, sources: [] };
        }
    }
}

/**
 * Get job details and generate AI analysis
 * This will be used for the "Deep Dive" feature
 * @param job - The job to analyze
 * @returns Job with AI-generated analysis
 */
export async function getJobAnalysis(job: Job): Promise<Job> {
    // TODO: Integrate with Gemini API to generate:
    // - Executive Summary
    // - Ideal Candidate Profile
    // - Attack Plan
    // - Hiring Team Targets
    // - Portfolio Advice
    // - Outreach Templates

    console.log('TODO: Generate AI analysis for job:', job.title);
    return job;
}

/**
 * Calculate match score between user profile and job
 * @param job - The job to match
 * @param userSkills - User's skills
 * @param userExperience - User's experience level
 * @returns Match score (0-100)
 */
export function calculateMatchScore(
    job: Job,
    userSkills: string[],
    userExperience: string
): number {
    // Simple matching algorithm (can be enhanced with AI later)
    let score = 0;

    // Check skills overlap
    const jobSkills = job.skills || [];
    const matchingSkills = userSkills.filter(skill =>
        jobSkills.some(jobSkill =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
    );
    score += (matchingSkills.length / Math.max(jobSkills.length, 1)) * 50;

    // Check experience level match
    if (job.experienceLevel === userExperience) {
        score += 30;
    } else if (
        (job.experienceLevel === 'Entry Level' && userExperience === 'Internship') ||
        (job.experienceLevel === 'Associate' && userExperience === 'Entry Level')
    ) {
        score += 20;
    }

    // Add base score
    score += 20;

    return Math.min(Math.round(score), 100);
}
