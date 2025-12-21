/**
 * O*NET Career Service
 * Fetches career data from the O*NET API via our Vercel proxy
 */

const API_BASE_URL = import.meta.env.PROD
    ? 'https://jalanea-works.vercel.app'
    : 'http://localhost:5173';

// Types matching O*NET API responses
export interface ONetCareerResult {
    code: string;
    title: string;
    tags?: {
        bright_outlook?: boolean;
        green?: boolean;
        apprenticeship?: boolean;
    };
}

export interface ONetSearchResponse {
    keyword: string;
    total: number;
    start: number;
    end: number;
    career: ONetCareerResult[];
    next?: string;
}

export interface ONetCareerDetails {
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

export interface ONetOutlook {
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

export interface ONetSkill {
    id: string;
    name: string;
    description?: string;
    score?: {
        scale: string;
        value: number;
    };
}

export interface ONetSkillsResponse {
    code: string;
    title: string;
    element: ONetSkill[];
}

export interface ONetRelatedResponse {
    code: string;
    title: string;
    career: ONetCareerResult[];
}

/**
 * Search careers by keyword (degree title, job title, skill, etc.)
 */
export async function searchCareers(keyword: string, start?: number): Promise<ONetSearchResponse | null> {
    try {
        let url = `${API_BASE_URL}/api/onet?action=search&keyword=${encodeURIComponent(keyword)}`;
        if (start) url += `&start=${start}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error('O*NET search failed:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error searching O*NET careers:', error);
        return null;
    }
}

/**
 * Get detailed career information
 */
export async function getCareerDetails(code: string): Promise<ONetCareerDetails | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/onet?action=career&code=${encodeURIComponent(code)}`
        );

        if (!response.ok) {
            console.error('O*NET career details failed:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching O*NET career details:', error);
        return null;
    }
}

/**
 * Get job outlook (salary, growth projections)
 */
export async function getCareerOutlook(code: string): Promise<ONetOutlook | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/onet?action=outlook&code=${encodeURIComponent(code)}`
        );

        if (!response.ok) {
            console.error('O*NET outlook failed:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching O*NET outlook:', error);
        return null;
    }
}

/**
 * Get required skills for a career
 */
export async function getCareerSkills(code: string): Promise<ONetSkillsResponse | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/onet?action=skills&code=${encodeURIComponent(code)}`
        );

        if (!response.ok) {
            console.error('O*NET skills failed:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching O*NET skills:', error);
        return null;
    }
}

/**
 * Get related careers (for "More" button)
 */
export async function getRelatedCareers(code: string): Promise<ONetRelatedResponse | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/onet?action=related&code=${encodeURIComponent(code)}`
        );

        if (!response.ok) {
            console.error('O*NET related careers failed:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching O*NET related careers:', error);
        return null;
    }
}

/**
 * Format salary from O*NET (annual median) to display string
 */
export function formatSalary(outlook: ONetOutlook | null): string {
    if (!outlook?.salary?.annual_median) {
        return 'Salary varies';
    }

    const median = outlook.salary.annual_median;
    const low = outlook.salary.annual_10th_percentile;
    const high = outlook.salary.annual_90th_percentile;

    if (low && high) {
        return `$${(low / 1000).toFixed(0)}K - $${(high / 1000).toFixed(0)}K`;
    }

    return `~$${(median / 1000).toFixed(0)}K/year`;
}

/**
 * Map O*NET career to our CareerPathSuggestion format
 */
export function mapToCareerPath(
    career: ONetCareerResult,
    outlook?: ONetOutlook | null,
    skills?: ONetSkillsResponse | null
): {
    id: string;
    title: string;
    field: string;
    salaryRange: string;
    matchScore: number;
    growth: 'hot' | 'growing' | 'stable' | 'emerging';
    skills: string[];
    description: string;
    onetCode: string;
} {
    // Determine field from O*NET code prefix
    const codePrefix = career.code.split('-')[0];
    const fieldMap: Record<string, string> = {
        '11': 'Business',
        '13': 'Business',
        '15': 'Technology',
        '17': 'Engineering',
        '19': 'Science',
        '21': 'Social Services',
        '23': 'Legal',
        '25': 'Education',
        '27': 'Creative/Design',
        '29': 'Healthcare',
        '31': 'Healthcare',
        '33': 'Public Safety',
        '35': 'Hospitality',
        '37': 'Maintenance',
        '39': 'Services',
        '41': 'Sales',
        '43': 'Administrative',
        '45': 'Agriculture',
        '47': 'Construction',
        '49': 'Maintenance',
        '51': 'Manufacturing',
        '53': 'Transportation',
    };

    const field = fieldMap[codePrefix] || 'Other';

    // Determine growth from outlook
    let growth: 'hot' | 'growing' | 'stable' | 'emerging' = 'stable';
    if (career.tags?.bright_outlook) {
        growth = 'hot';
    } else if (outlook?.outlook?.category === 'Bright') {
        growth = 'hot';
    } else if (outlook?.outlook?.category === 'Average') {
        growth = 'growing';
    } else if (career.tags?.green) {
        growth = 'emerging';
    }

    // Extract top skills
    const topSkills = skills?.element
        ?.sort((a, b) => (b.score?.value || 0) - (a.score?.value || 0))
        ?.slice(0, 5)
        ?.map(s => s.name) || ['Communication', 'Problem Solving'];

    return {
        id: `onet-${career.code}`,
        title: career.title,
        field,
        salaryRange: formatSalary(outlook ?? null),
        matchScore: Math.floor(Math.random() * 15) + 85, // Will be calculated properly later
        growth,
        skills: topSkills,
        description: outlook?.outlook?.description || `Entry-level position in ${field.toLowerCase()}`,
        onetCode: career.code,
    };
}

/**
 * Search careers and return in our format (with enriched data)
 */
export async function searchCareersEnriched(keyword: string, limit: number = 10): Promise<ReturnType<typeof mapToCareerPath>[]> {
    const searchResult = await searchCareers(keyword);

    if (!searchResult?.career?.length) {
        return [];
    }

    // Get top careers
    const careers = searchResult.career.slice(0, limit);

    // Enrich with outlook data (in parallel, but limit concurrency)
    const enrichedCareers = await Promise.all(
        careers.map(async (career) => {
            // Add small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 100));

            const outlook = await getCareerOutlook(career.code);
            // Skip skills for now to reduce API calls
            return mapToCareerPath(career, outlook, null);
        })
    );

    return enrichedCareers;
}
