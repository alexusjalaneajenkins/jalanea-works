/**
 * Adzuna API - Job Aggregator
 * 250 calls/day free tier
 * Docs: https://developer.adzuna.com/
 * Requires: ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables
 */

import type { Job } from '../../types';

interface AdzunaJob {
    id: string;
    title: string;
    description: string;
    redirect_url: string;
    created: string;
    category: {
        label: string;
        tag: string;
    };
    company: {
        display_name: string;
    };
    location: {
        display_name: string;
        area: string[];
    };
    salary_min?: number;
    salary_max?: number;
    salary_is_predicted?: string;
    contract_type?: string;
    contract_time?: string;
}

interface AdzunaResponse {
    count: number;
    results: AdzunaJob[];
}

export async function searchAdzunaJobs(
    query: string,
    location: string = 'us',
    appId?: string,
    appKey?: string
): Promise<Job[]> {
    const id = appId || process.env.ADZUNA_APP_ID;
    const key = appKey || process.env.ADZUNA_APP_KEY;
    
    if (!id || !key) {
        console.warn('Adzuna API credentials not configured, skipping');
        return [];
    }

    try {
        // Adzuna uses country codes in the URL
        const countryCode = location.toLowerCase().includes('united states') ? 'us' : 
                           location.toLowerCase().includes('uk') ? 'gb' : 'us';

        const params = new URLSearchParams({
            app_id: id,
            app_key: key,
            results_per_page: '20',
            what: `${query} entry level`,
            what_exclude: 'senior lead manager director principal',
            max_days_old: '30',
            sort_by: 'date'
        });

        const response = await fetch(
            `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?${params.toString()}`
        );
        
        if (!response.ok) {
            console.error('Adzuna API error:', response.status);
            return [];
        }

        const data: AdzunaResponse = await response.json();
        
        if (!data.results) return [];

        return data.results.map(job => {
            let salary = 'Not specified';
            if (job.salary_min && job.salary_max) {
                salary = `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`;
            } else if (job.salary_min) {
                salary = `From $${Math.round(job.salary_min).toLocaleString()}`;
            }

            return {
                id: `adzuna-${job.id}`,
                title: job.title,
                company: job.company?.display_name || 'Unknown',
                location: job.location?.display_name || 'Not specified',
                type: job.contract_time === 'full_time' ? 'Full-time' :
                      job.contract_time === 'part_time' ? 'Part-time' :
                      job.contract_type === 'contract' ? 'Contract' : 'Full-time',
                salaryRange: salary,
                postedAt: job.created,
                matchScore: 0,
                skills: [job.category?.label].filter(Boolean),
                description: job.description?.slice(0, 500) || '',
                experienceLevel: 'Entry Level',
                experienceYears: 'Not specified',
                applyUrl: job.redirect_url,
                source: 'Adzuna'
            };
        });

    } catch (error) {
        console.error('Error fetching Adzuna jobs:', error);
        return [];
    }
}
