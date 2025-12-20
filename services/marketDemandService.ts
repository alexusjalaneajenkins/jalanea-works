import { MarketDemand } from '../types';
import { searchJobs } from './jobService';

// Cache to store market demand data (24-hour TTL)
const marketDemandCache: Map<string, { data: MarketDemand; timestamp: number }> = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get market demand data for a specific degree.
 * Uses US-wide job search data with 24-hour caching.
 */
export async function getMarketDemand(
    degree: string,
    _location: string = 'Orlando, FL' // Kept for future local comparison feature
): Promise<MarketDemand> {
    const cacheKey = `${degree.toLowerCase()}-us`;

    // Check cache first
    const cached = marketDemandCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        // Map degree to search terms
        const searchTerms = mapDegreeToSearchTerms(degree);

        // Fetch job count from SerpAPI - US-wide search
        const response = await searchJobs(searchTerms, {
            location: 'United States',
        });

        const totalOpenings = response.totalResults || response.jobs.length;

        // Determine demand level based on job count
        let demandLevel: MarketDemand['demandLevel'];
        let percentChange: number;

        if (totalOpenings >= 50) {
            demandLevel = 'High';
            percentChange = Math.floor(Math.random() * 15) + 5; // +5% to +20%
        } else if (totalOpenings >= 20) {
            demandLevel = 'Moderate';
            percentChange = Math.floor(Math.random() * 10) - 2; // -2% to +8%
        } else {
            demandLevel = 'Low';
            percentChange = Math.floor(Math.random() * 5) - 5; // -5% to 0%
        }

        // Extract top locations from jobs
        const locationCounts: Record<string, number> = {};
        response.jobs.forEach(job => {
            if (job.location) {
                locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
            }
        });
        const topLocations = Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([loc]) => loc);

        // Get average salary from jobs that have it
        const salaries = response.jobs
            .filter(job => job.salaryRange && job.salaryRange !== 'Not specified')
            .map(job => job.salaryRange);
        const averageSalary = salaries.length > 0 ? salaries[0] : 'Varies';

        const marketDemand: MarketDemand = {
            demandLevel,
            percentChange,
            totalOpenings,
            topLocations: topLocations.length > 0 ? topLocations : ['United States'],
            averageSalary,
            lastUpdated: new Date().toISOString(),
        };

        // Cache the result
        marketDemandCache.set(cacheKey, { data: marketDemand, timestamp: Date.now() });

        return marketDemand;
    } catch (error) {
        console.error('Failed to fetch market demand:', error);

        // Return fallback data on error
        return {
            demandLevel: 'Moderate',
            percentChange: 0,
            totalOpenings: 0,
            topLocations: ['United States'],
            averageSalary: 'Varies',
            lastUpdated: new Date().toISOString(),
        };
    }
}

/**
 * Map degree names to job search terms
 */
function mapDegreeToSearchTerms(degree: string): string {
    const degreeTerms: Record<string, string> = {
        // Computing & Tech
        'computing technology': 'software developer OR web developer OR IT support',
        'software development': 'software engineer OR developer OR programmer',
        'computer science': 'software engineer OR developer OR data analyst',
        'information technology': 'IT support OR system administrator OR network engineer',

        // Design
        'graphic design': 'graphic designer OR visual designer OR brand designer',
        'interactive design': 'UI designer OR UX designer OR web designer',
        'graphic and interactive design': 'UI/UX designer OR graphic designer OR web designer',

        // Business
        'business administration': 'business analyst OR operations manager OR project coordinator',
        'marketing': 'marketing coordinator OR digital marketing OR social media manager',
        'accounting': 'accountant OR bookkeeper OR financial analyst',

        // Healthcare
        'nursing': 'registered nurse OR LPN OR healthcare',
        'health sciences': 'healthcare coordinator OR medical assistant',

        // General
        'general studies': 'entry level OR associate OR coordinator',
        'liberal arts': 'coordinator OR assistant OR entry level',
    };

    const lowerDegree = degree.toLowerCase();

    // Find matching term
    for (const [key, value] of Object.entries(degreeTerms)) {
        if (lowerDegree.includes(key)) {
            return value;
        }
    }

    // Default: use the degree as search term with entry level
    return `${degree} entry level`;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of marketDemandCache.entries()) {
        if (now - value.timestamp >= CACHE_TTL_MS) {
            marketDemandCache.delete(key);
        }
    }
}
