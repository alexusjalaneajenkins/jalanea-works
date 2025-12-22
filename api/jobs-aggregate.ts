import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Aggregate Job Search
 * 
 * Searches multiple job APIs in parallel and returns combined, deduplicated results.
 * 
 * Endpoint: /api/jobs-aggregate
 * Method: GET
 * Query Params:
 *   - q: search query (required)
 *   - location: location filter (optional, default: "United States")
 *   - remote: "true" to filter for remote jobs only (optional)
 *   - sources: comma-separated list of sources to query (optional, default: all)
 *     Available: serpapi, remotive, remoteok, arbeitnow, muse, jsearch, adzuna
 */

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salaryRange: string;
    postedAt: string;
    matchScore: number;
    skills: string[];
    description: string;
    experienceLevel: string;
    experienceYears: string;
    applyUrl: string;
    source: string;
    companyLogo?: string;
}

// Remotive API (no key needed)
async function fetchRemotiveJobs(query: string): Promise<Job[]> {
    try {
        const response = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=15`);
        if (!response.ok) return [];
        const data = await response.json();
        return (data.jobs || []).slice(0, 15).map((job: any) => ({
            id: `remotive-${job.id}`,
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location || 'Remote',
            type: job.job_type === 'full_time' ? 'Full-time' : 'Full-time',
            salaryRange: job.salary || 'Not specified',
            postedAt: job.publication_date,
            matchScore: 0,
            skills: job.tags || [],
            description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 500),
            experienceLevel: 'Entry Level',
            experienceYears: 'Not specified',
            applyUrl: job.url,
            source: 'Remotive',
            companyLogo: job.company_logo
        }));
    } catch (e) {
        console.error('Remotive error:', e);
        return [];
    }
}

// RemoteOK API (no key needed)
async function fetchRemoteOKJobs(query: string): Promise<Job[]> {
    try {
        const response = await fetch('https://remoteok.com/api', {
            headers: { 'User-Agent': 'JalaneaWorks/1.0' }
        });
        if (!response.ok) return [];
        const data = await response.json();
        const jobs = data.slice(1); // First item is metadata
        const queryLower = query.toLowerCase();
        return jobs
            .filter((job: any) => 
                job.title?.toLowerCase().includes(queryLower) ||
                job.position?.toLowerCase().includes(queryLower) ||
                job.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))
            )
            .slice(0, 15)
            .map((job: any) => ({
                id: `remoteok-${job.id || job.slug}`,
                title: job.title || job.position,
                company: job.company,
                location: job.location || 'Remote Worldwide',
                type: 'Full-time',
                salaryRange: job.salary_min && job.salary_max 
                    ? `$${(job.salary_min/1000).toFixed(0)}k - $${(job.salary_max/1000).toFixed(0)}k`
                    : 'Not specified',
                postedAt: job.date,
                matchScore: 0,
                skills: job.tags || [],
                description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 500),
                experienceLevel: 'Entry Level',
                experienceYears: 'Not specified',
                applyUrl: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
                source: 'RemoteOK',
                companyLogo: job.company_logo
            }));
    } catch (e) {
        console.error('RemoteOK error:', e);
        return [];
    }
}

// Arbeitnow API (no key needed)
async function fetchArbeitnowJobs(query: string): Promise<Job[]> {
    try {
        const response = await fetch(`https://www.arbeitnow.com/api/job-board-api`);
        if (!response.ok) return [];
        const data = await response.json();
        const queryLower = query.toLowerCase();
        return (data.data || [])
            .filter((job: any) => 
                job.title?.toLowerCase().includes(queryLower) ||
                job.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))
            )
            .slice(0, 15)
            .map((job: any) => ({
                id: `arbeitnow-${job.slug}`,
                title: job.title,
                company: job.company_name,
                location: job.remote ? 'Remote' : (job.location || 'Not specified'),
                type: 'Full-time',
                salaryRange: 'Not specified',
                postedAt: new Date(job.created_at * 1000).toISOString(),
                matchScore: 0,
                skills: job.tags || [],
                description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 500),
                experienceLevel: 'Entry Level',
                experienceYears: 'Not specified',
                applyUrl: job.url,
                source: 'Arbeitnow'
            }));
    } catch (e) {
        console.error('Arbeitnow error:', e);
        return [];
    }
}

// The Muse API (no key needed for public API)
async function fetchMuseJobs(query: string): Promise<Job[]> {
    try {
        const categoryMap: Record<string, string> = {
            'developer': 'Engineering', 'engineer': 'Engineering', 'software': 'Engineering',
            'design': 'Design', 'designer': 'Design', 'ux': 'Design', 'graphic': 'Design',
            'marketing': 'Marketing', 'data': 'Data Science', 'analyst': 'Data Science'
        };
        
        let category = '';
        const queryLower = query.toLowerCase();
        for (const [keyword, cat] of Object.entries(categoryMap)) {
            if (queryLower.includes(keyword)) {
                category = cat;
                break;
            }
        }

        const params = new URLSearchParams({ page: '1', level: 'Entry Level' });
        if (category) params.append('category', category);

        const response = await fetch(`https://www.themuse.com/api/public/jobs?${params.toString()}`);
        if (!response.ok) return [];
        const data = await response.json();
        
        return (data.results || []).slice(0, 15).map((job: any) => ({
            id: `muse-${job.id}`,
            title: job.name,
            company: job.company?.name || 'Unknown',
            location: job.locations?.map((l: any) => l.name).join(', ') || 'Not specified',
            type: 'Full-time',
            salaryRange: 'Not specified',
            postedAt: job.publication_date,
            matchScore: 0,
            skills: job.categories?.map((c: any) => c.name) || [],
            description: (job.contents || '').replace(/<[^>]*>/g, '').slice(0, 500),
            experienceLevel: job.levels?.[0]?.name || 'Entry Level',
            experienceYears: 'Not specified',
            applyUrl: job.refs?.landing_page || `https://www.themuse.com/jobs/${job.company?.short_name}/${job.short_name}`,
            source: 'The Muse'
        }));
    } catch (e) {
        console.error('Muse error:', e);
        return [];
    }
}

// JSearch (RapidAPI) - requires RAPIDAPI_KEY
async function fetchJSearchJobs(query: string): Promise<Job[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) return [];

    try {
        const params = new URLSearchParams({
            query: `${query} entry level`,
            page: '1',
            num_pages: '1',
            country: 'us'
        });

        const response = await fetch(
            `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
            {
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            }
        );
        if (!response.ok) return [];
        const data = await response.json();
        
        return (data.data || []).slice(0, 15).map((job: any) => ({
            id: `jsearch-${job.job_id}`,
            title: job.job_title,
            company: job.employer_name,
            location: job.job_is_remote ? 'Remote' : 
                [job.job_city, job.job_state].filter(Boolean).join(', ') || 'Not specified',
            type: job.job_employment_type === 'FULLTIME' ? 'Full-time' : 'Full-time',
            salaryRange: job.job_min_salary && job.job_max_salary 
                ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
                : 'Not specified',
            postedAt: job.job_posted_at_datetime_utc,
            matchScore: 0,
            skills: job.job_required_skills || [],
            description: (job.job_description || '').slice(0, 500),
            experienceLevel: 'Entry Level',
            experienceYears: 'Not specified',
            applyUrl: job.job_apply_link,
            source: 'JSearch',
            companyLogo: job.employer_logo
        }));
    } catch (e) {
        console.error('JSearch error:', e);
        return [];
    }
}

// Adzuna - requires ADZUNA_APP_ID and ADZUNA_APP_KEY
async function fetchAdzunaJobs(query: string): Promise<Job[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) return [];

    try {
        const params = new URLSearchParams({
            app_id: appId,
            app_key: appKey,
            results_per_page: '15',
            what: `${query} entry level`,
            what_exclude: 'senior lead manager director',
            max_days_old: '30'
        });

        const response = await fetch(
            `https://api.adzuna.com/v1/api/jobs/us/search/1?${params.toString()}`
        );
        if (!response.ok) return [];
        const data = await response.json();
        
        return (data.results || []).map((job: any) => ({
            id: `adzuna-${job.id}`,
            title: job.title,
            company: job.company?.display_name || 'Unknown',
            location: job.location?.display_name || 'Not specified',
            type: job.contract_time === 'full_time' ? 'Full-time' : 'Full-time',
            salaryRange: job.salary_min && job.salary_max 
                ? `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`
                : 'Not specified',
            postedAt: job.created,
            matchScore: 0,
            skills: [job.category?.label].filter(Boolean),
            description: (job.description || '').slice(0, 500),
            experienceLevel: 'Entry Level',
            experienceYears: 'Not specified',
            applyUrl: job.redirect_url,
            source: 'Adzuna'
        }));
    } catch (e) {
        console.error('Adzuna error:', e);
        return [];
    }
}

// Existing SerpAPI (keep as primary)
async function fetchSerpApiJobs(query: string, location: string): Promise<Job[]> {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) return [];

    try {
        const params = new URLSearchParams({
            engine: 'google_jobs',
            q: `${query} entry level`,
            location: location,
            api_key: apiKey
        });

        const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
        if (!response.ok) return [];
        const data = await response.json();
        
        return (data.jobs_results || []).slice(0, 15).map((job: any, i: number) => ({
            id: `serp-${data.search_metadata?.id || 'unknown'}-${i}`,
            title: job.title,
            company: job.company_name,
            location: job.location,
            type: 'Full-time',
            salaryRange: job.detected_extensions?.salary || 'Not specified',
            postedAt: job.detected_extensions?.posted_at || 'Recently',
            matchScore: 0,
            skills: [],
            description: (job.description || '').slice(0, 500),
            experienceLevel: 'Entry Level',
            experienceYears: 'Not specified',
            applyUrl: job.apply_options?.[0]?.link || job.related_links?.[0]?.link || '#',
            source: 'Google Jobs'
        }));
    } catch (e) {
        console.error('SerpAPI error:', e);
        return [];
    }
}

// Deduplicate jobs by title + company
function deduplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
        const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q, location = 'United States', remote, sources } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Determine which sources to query
    const allSources = ['serpapi', 'remotive', 'remoteok', 'arbeitnow', 'muse', 'jsearch', 'adzuna'];
    const requestedSources = sources 
        ? (typeof sources === 'string' ? sources.split(',') : sources)
        : allSources;

    console.log(`Aggregating jobs for "${q}" from sources:`, requestedSources);

    // Build promise array based on requested sources
    const promises: Promise<Job[]>[] = [];
    const sourceNames: string[] = [];

    if (requestedSources.includes('serpapi')) {
        promises.push(fetchSerpApiJobs(q, location as string));
        sourceNames.push('SerpAPI');
    }
    if (requestedSources.includes('remotive')) {
        promises.push(fetchRemotiveJobs(q));
        sourceNames.push('Remotive');
    }
    if (requestedSources.includes('remoteok')) {
        promises.push(fetchRemoteOKJobs(q));
        sourceNames.push('RemoteOK');
    }
    if (requestedSources.includes('arbeitnow')) {
        promises.push(fetchArbeitnowJobs(q));
        sourceNames.push('Arbeitnow');
    }
    if (requestedSources.includes('muse')) {
        promises.push(fetchMuseJobs(q));
        sourceNames.push('Muse');
    }
    if (requestedSources.includes('jsearch')) {
        promises.push(fetchJSearchJobs(q));
        sourceNames.push('JSearch');
    }
    if (requestedSources.includes('adzuna')) {
        promises.push(fetchAdzunaJobs(q));
        sourceNames.push('Adzuna');
    }

    // Fetch all in parallel
    const results = await Promise.all(promises);
    
    // Log results per source
    results.forEach((jobs, i) => {
        console.log(`${sourceNames[i]}: ${jobs.length} jobs`);
    });

    // Combine and deduplicate
    const allJobs = results.flat();
    const deduped = deduplicateJobs(allJobs);

    // Filter for remote if requested
    let finalJobs = deduped;
    if (remote === 'true') {
        finalJobs = deduped.filter(job => 
            job.location.toLowerCase().includes('remote') ||
            job.location.toLowerCase().includes('anywhere') ||
            job.location.toLowerCase().includes('worldwide')
        );
    }

    // Sort by posted date (most recent first)
    finalJobs.sort((a, b) => {
        const dateA = new Date(a.postedAt).getTime() || 0;
        const dateB = new Date(b.postedAt).getTime() || 0;
        return dateB - dateA;
    });

    console.log(`Total: ${allJobs.length} raw, ${deduped.length} after dedup, ${finalJobs.length} final`);

    return res.status(200).json({
        jobs: finalJobs,
        totalResults: finalJobs.length,
        sources: sourceNames,
        query: q,
        location: location
    });
}
