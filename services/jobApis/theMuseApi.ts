/**
 * The Muse API - Curated Startup/Tech Jobs
 * Free public API, no key required for basic access
 * Docs: https://www.themuse.com/developers/api/v2
 */

import type { Job } from '../../types';

interface MuseJob {
    id: number;
    name: string;
    type: string;
    publication_date: string;
    short_name: string;
    model_type: string;
    locations: Array<{ name: string }>;
    categories: Array<{ name: string }>;
    levels: Array<{ name: string; short_name: string }>;
    tags: string[];
    refs: {
        landing_page: string;
    };
    company: {
        id: number;
        short_name: string;
        name: string;
    };
    contents: string;
}

interface MuseResponse {
    page: number;
    page_count: number;
    items_per_page: number;
    took: number;
    timed_out: boolean;
    total: number;
    results: MuseJob[];
}

// Map common search terms to Muse categories
const categoryMap: Record<string, string> = {
    'developer': 'Engineering',
    'engineer': 'Engineering',
    'software': 'Engineering',
    'web': 'Engineering',
    'design': 'Design',
    'designer': 'Design',
    'ux': 'Design',
    'ui': 'Design',
    'graphic': 'Design',
    'marketing': 'Marketing',
    'sales': 'Sales',
    'data': 'Data Science',
    'analyst': 'Data Science',
    'product': 'Product',
    'project': 'Project Management',
    'hr': 'HR',
    'finance': 'Finance',
    'accounting': 'Accounting'
};

export async function searchMuseJobs(query: string): Promise<Job[]> {
    try {
        const params = new URLSearchParams({
            page: '1',
            descending: 'true'
        });

        // Try to map query to a category
        const queryLower = query.toLowerCase();
        for (const [keyword, category] of Object.entries(categoryMap)) {
            if (queryLower.includes(keyword)) {
                params.append('category', category);
                break;
            }
        }

        // Add entry level filter
        params.append('level', 'Entry Level');

        const response = await fetch(`https://www.themuse.com/api/public/jobs?${params.toString()}`);
        
        if (!response.ok) {
            console.error('The Muse API error:', response.status);
            return [];
        }

        const data: MuseResponse = await response.json();
        
        return data.results.slice(0, 20).map(job => ({
            id: `muse-${job.id}`,
            title: job.name,
            company: job.company?.name || 'Unknown',
            location: job.locations?.map(l => l.name).join(', ') || 'Not specified',
            type: job.type === 'external' ? 'Full-time' : 'Full-time',
            salaryRange: 'Not specified',
            postedAt: job.publication_date,
            matchScore: 0,
            skills: job.categories?.map(c => c.name) || [],
            description: job.contents?.replace(/<[^>]*>/g, '').slice(0, 500) || '',
            experienceLevel: job.levels?.[0]?.name || 'Entry Level',
            experienceYears: 'Not specified',
            applyUrl: job.refs?.landing_page || `https://www.themuse.com/jobs/${job.company?.short_name}/${job.short_name}`,
            source: 'The Muse'
        }));

    } catch (error) {
        console.error('Error fetching The Muse jobs:', error);
        return [];
    }
}
