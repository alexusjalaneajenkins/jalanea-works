/**
 * Remotive API - Remote Jobs
 * Free API, no key required
 * Docs: https://remotive.com/api/remote-jobs
 */

import type { Job } from '../../types';

interface RemotiveJob {
    id: number;
    url: string;
    title: string;
    company_name: string;
    company_logo: string;
    category: string;
    tags: string[];
    job_type: string;
    publication_date: string;
    candidate_required_location: string;
    salary: string;
    description: string;
}

interface RemotiveResponse {
    'job-count': number;
    jobs: RemotiveJob[];
}

export async function searchRemotiveJobs(query: string, limit: number = 20): Promise<Job[]> {
    try {
        const params = new URLSearchParams({
            search: query,
            limit: limit.toString()
        });

        const response = await fetch(`https://remotive.com/api/remote-jobs?${params.toString()}`);
        
        if (!response.ok) {
            console.error('Remotive API error:', response.status);
            return [];
        }

        const data: RemotiveResponse = await response.json();
        
        return data.jobs.map((job, index) => ({
            id: `remotive-${job.id}`,
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location || 'Remote',
            type: job.job_type === 'full_time' ? 'Full-time' : 
                  job.job_type === 'contract' ? 'Contract' : 
                  job.job_type === 'part_time' ? 'Part-time' : 'Full-time',
            salaryRange: job.salary || 'Not specified',
            postedAt: job.publication_date,
            matchScore: 0,
            skills: job.tags || [],
            description: job.description?.replace(/<[^>]*>/g, '').slice(0, 500) || '',
            experienceLevel: 'Entry Level',
            experienceYears: 'Not specified',
            applyUrl: job.url,
            source: 'Remotive',
            companyLogo: job.company_logo
        }));

    } catch (error) {
        console.error('Error fetching Remotive jobs:', error);
        return [];
    }
}
