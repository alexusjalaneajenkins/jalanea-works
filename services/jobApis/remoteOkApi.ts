/**
 * RemoteOK API - Remote Tech Jobs
 * Free API, no key required
 * Docs: https://remoteok.com/api
 */

import type { Job } from '../../types';

interface RemoteOKJob {
    id: string;
    slug: string;
    url: string;
    title: string;
    company: string;
    company_logo: string;
    position: string;
    tags: string[];
    description: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    date: string;
}

export async function searchRemoteOKJobs(query: string): Promise<Job[]> {
    try {
        // RemoteOK API returns all jobs, we filter client-side
        const response = await fetch('https://remoteok.com/api', {
            headers: {
                'User-Agent': 'JalaneaWorks/1.0'
            }
        });
        
        if (!response.ok) {
            console.error('RemoteOK API error:', response.status);
            return [];
        }

        const data: RemoteOKJob[] = await response.json();
        
        // First item is metadata, skip it
        const jobs = data.slice(1);
        
        // Filter by query
        const queryLower = query.toLowerCase();
        const filteredJobs = jobs.filter(job => 
            job.title?.toLowerCase().includes(queryLower) ||
            job.position?.toLowerCase().includes(queryLower) ||
            job.tags?.some(tag => tag.toLowerCase().includes(queryLower)) ||
            job.company?.toLowerCase().includes(queryLower)
        ).slice(0, 20);

        return filteredJobs.map(job => {
            const salary = job.salary_min && job.salary_max 
                ? `$${(job.salary_min/1000).toFixed(0)}k - $${(job.salary_max/1000).toFixed(0)}k`
                : 'Not specified';

            return {
                id: `remoteok-${job.id || job.slug}`,
                title: job.title || job.position,
                company: job.company,
                location: job.location || 'Remote Worldwide',
                type: 'Full-time' as const,
                salaryRange: salary,
                postedAt: job.date,
                matchScore: 0,
                skills: job.tags || [],
                description: job.description?.replace(/<[^>]*>/g, '').slice(0, 500) || '',
                experienceLevel: 'Entry Level',
                experienceYears: 'Not specified',
                applyUrl: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
                source: 'RemoteOK',
                companyLogo: job.company_logo
            };
        });

    } catch (error) {
        console.error('Error fetching RemoteOK jobs:', error);
        return [];
    }
}
