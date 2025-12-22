/**
 * Arbeitnow API - Remote & Tech Jobs
 * Free API, no key required
 * Docs: https://arbeitnow.com/api
 */

import type { Job } from '../../types';

interface ArbeitnowJob {
    slug: string;
    company_name: string;
    title: string;
    description: string;
    remote: boolean;
    url: string;
    tags: string[];
    job_types: string[];
    location: string;
    created_at: number;
}

interface ArbeitnowResponse {
    data: ArbeitnowJob[];
    links: {
        next?: string;
    };
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

export async function searchArbeitnowJobs(query: string): Promise<Job[]> {
    try {
        const params = new URLSearchParams();
        if (query) {
            params.append('search', query);
        }

        const response = await fetch(`https://www.arbeitnow.com/api/job-board-api?${params.toString()}`);
        
        if (!response.ok) {
            console.error('Arbeitnow API error:', response.status);
            return [];
        }

        const data: ArbeitnowResponse = await response.json();
        
        // Filter by query and limit to 20
        const queryLower = query.toLowerCase();
        const filteredJobs = data.data
            .filter(job => 
                job.title?.toLowerCase().includes(queryLower) ||
                job.description?.toLowerCase().includes(queryLower) ||
                job.tags?.some(tag => tag.toLowerCase().includes(queryLower))
            )
            .slice(0, 20);

        return filteredJobs.map(job => ({
            id: `arbeitnow-${job.slug}`,
            title: job.title,
            company: job.company_name,
            location: job.remote ? 'Remote' : (job.location || 'Not specified'),
            type: job.job_types?.includes('Full Time') ? 'Full-time' : 
                  job.job_types?.includes('Contract') ? 'Contract' : 'Full-time',
            salaryRange: 'Not specified',
            postedAt: new Date(job.created_at * 1000).toISOString(),
            matchScore: 0,
            skills: job.tags || [],
            description: job.description?.replace(/<[^>]*>/g, '').slice(0, 500) || '',
            experienceLevel: 'Entry Level',
            experienceYears: 'Not specified',
            applyUrl: job.url,
            source: 'Arbeitnow'
        }));

    } catch (error) {
        console.error('Error fetching Arbeitnow jobs:', error);
        return [];
    }
}
