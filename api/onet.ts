import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * O*NET API Proxy
 * Securely proxies requests to O*NET Web Services
 * 
 * Endpoints:
 * - /api/onet?action=search&keyword=software
 * - /api/onet?action=career&code=15-1252.00
 * - /api/onet?action=related&code=15-1252.00
 * - /api/onet?action=outlook&code=15-1252.00
 */

const ONET_API_BASE = 'https://services.onetcenter.org/ws';

interface ONetSearchResult {
    code: string;
    title: string;
    tags?: {
        bright_outlook?: boolean;
        green?: boolean;
        apprenticeship?: boolean;
    };
}

interface ONetCareer {
    code: string;
    title: string;
    description?: string;
    also_called?: { title: string }[];
    what_they_do?: string;
    on_the_job?: { task: string }[];
    education?: {
        category?: string;
        group?: { level: string; percent: number }[];
    };
}

interface ONetOutlook {
    code: string;
    title: string;
    outlook?: {
        category?: string;
        description?: string;
    };
    salary?: {
        annual_median?: number;
        annual_10th_percentile?: number;
        annual_90th_percentile?: number;
    };
    bright_outlook?: {
        category?: string;
        description?: string;
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.ONET_API_KEY;
    if (!apiKey) {
        console.error('ONET_API_KEY not configured');
        return res.status(500).json({ error: 'O*NET API not configured' });
    }

    const { action, keyword, code, start } = req.query;

    try {
        let endpoint = '';

        switch (action) {
            case 'search':
                if (!keyword) {
                    return res.status(400).json({ error: 'keyword parameter required' });
                }
                endpoint = `/mnm/search?keyword=${encodeURIComponent(String(keyword))}`;
                if (start) endpoint += `&start=${start}`;
                break;

            case 'career':
                if (!code) {
                    return res.status(400).json({ error: 'code parameter required' });
                }
                endpoint = `/mnm/careers/${encodeURIComponent(String(code))}`;
                break;

            case 'related':
                if (!code) {
                    return res.status(400).json({ error: 'code parameter required' });
                }
                endpoint = `/mnm/careers/${encodeURIComponent(String(code))}/related_careers`;
                break;

            case 'outlook':
                if (!code) {
                    return res.status(400).json({ error: 'code parameter required' });
                }
                endpoint = `/mnm/careers/${encodeURIComponent(String(code))}/job_outlook`;
                break;

            case 'skills':
                if (!code) {
                    return res.status(400).json({ error: 'code parameter required' });
                }
                endpoint = `/mnm/careers/${encodeURIComponent(String(code))}/skills`;
                break;

            default:
                return res.status(400).json({ error: 'Invalid action. Use: search, career, related, outlook, skills' });
        }

        const response = await fetch(`${ONET_API_BASE}${endpoint}`, {
            headers: {
                'X-API-Key': apiKey,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`O*NET API error: ${response.status}`, errorText);

            if (response.status === 429) {
                return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
            }

            return res.status(response.status).json({
                error: `O*NET API error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();

        // Cache for 1 hour (O*NET data is updated quarterly)
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        return res.status(200).json(data);

    } catch (error) {
        console.error('O*NET API proxy error:', error);
        return res.status(500).json({
            error: 'Failed to fetch from O*NET API',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
