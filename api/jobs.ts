import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Job Search via SerpApi
 * 
 * This function securely calls SerpApi to search Google Jobs
 * without exposing the API key to the client.
 * 
 * Endpoint: /api/jobs
 * Method: GET
 * Query Params:
 *   - q: search query (e.g., "Marketing Orlando")
 *   - location: optional location filter (e.g., "Orlando, FL")
 *   - gl: Country code (e.g., 'us', 'uk')
 *   - hl: Language code (e.g., 'en', 'es')
 *   - lrad: Search radius in kilometers
 *   - chips: Additional query conditions (deprecated but still works)
 *   - uds: Filter string from Google (remote, no degree, etc.)
 *   - next_page_token: Pagination token
 */

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        q,
        location,
        gl,           // Country code (e.g., 'us', 'uk')
        hl,           // Language code (e.g., 'en', 'es')
        lrad,         // Search radius in kilometers
        chips,        // Additional query conditions (deprecated but still works)
        uds,          // Filter string from Google (remote, no degree, etc.)
        next_page_token, // Pagination token
    } = req.query;

    // Validate required parameters
    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Get API key from environment variables
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
        console.error('SERPAPI_KEY not configured');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        // Build SerpApi URL with all parameters
        const params = new URLSearchParams({
            engine: 'google_jobs',
            q: q,
            api_key: apiKey,
        });

        // Add optional location parameter
        if (location && typeof location === 'string') {
            params.append('location', location);
        }

        // Add country code (e.g., 'us' for United States)
        if (gl && typeof gl === 'string') {
            params.append('gl', gl);
        }

        // Add language code (e.g., 'en' for English)
        if (hl && typeof hl === 'string') {
            params.append('hl', hl);
        }

        // Add search radius in kilometers
        if (lrad && typeof lrad === 'string') {
            params.append('lrad', lrad);
        }

        // Add chips (additional query conditions)
        if (chips && typeof chips === 'string') {
            params.append('chips', chips);
        }

        // Add uds filter (remote jobs, no degree, etc.)
        if (uds && typeof uds === 'string') {
            params.append('uds', uds);
        }

        // Add pagination token for next page
        if (next_page_token && typeof next_page_token === 'string') {
            params.append('next_page_token', next_page_token);
        }

        const serpApiUrl = `https://serpapi.com/search?${params.toString()}`;

        console.log('Fetching jobs from SerpApi:', {
            query: q,
            location: location || 'default',
            country: gl || 'default',
            language: hl || 'default',
            radius: lrad || 'default',
            filters: uds ? 'applied' : 'none',
            pagination: next_page_token ? 'page 2+' : 'page 1',
        });

        // Call SerpApi
        const response = await fetch(serpApiUrl);

        if (!response.ok) {
            throw new Error(`SerpApi returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for errors in response
        if (data.error) {
            console.error('SerpApi error:', data.error);
            return res.status(500).json({ error: data.error });
        }

        // Extract job results
        const jobs = data.jobs_results || [];

        // Extract pagination info
        const pagination = data.serpapi_pagination || {};
        const hasNextPage = !!pagination.next_page_token;

        // Extract available filters
        const filters = data.filters || [];

        console.log(`Found ${jobs.length} jobs for query: ${q}${hasNextPage ? ' (more pages available)' : ''}`);

        // Return formatted response with pagination and filters
        return res.status(200).json({
            jobs: jobs,
            totalResults: jobs.length,
            searchId: data.search_metadata?.id || 'unknown',
            searchParameters: {
                query: q,
                location: location || null,
                country: gl || null,
                language: hl || null,
                radius: lrad || null,
                filters: uds || null,
            },
            pagination: {
                hasNextPage,
                nextPageToken: pagination.next_page_token || null,
            },
            availableFilters: filters.map((filter: any) => ({
                name: filter.name,
                uds: filter.parameters?.uds || null,
                query: filter.parameters?.q || null,
            })),
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({
            error: 'Failed to fetch jobs',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
