/**
 * JSearch API (RapidAPI) - Google Jobs Scraper
 * 500 calls/month free tier
 * Docs: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 * Requires: RAPIDAPI_KEY environment variable
 */

import type { Job } from '../../types';

interface JSearchJob {
    job_id: string;
    employer_name: string;
    employer_logo: string;
    job_title: string;
    job_apply_link: string;
    job_description: string;
    job_is_remote: boolean;
    job_city: string;
    job_state: string;
    job_country: string;
    job_employment_type: string;
    job_min_salary?: number;
    job_max_salary?: number;
    job_salary_period?: string;
    job_posted_at_datetime_utc: string;
    job_required_skills?: string[];
    job_required_experience?: {
        no_experience_required: boolean;
        required_experience_in_months?: number;
    };
}

interface JSearchResponse {
    status: string;
    request_id: string;
    data: JSearchJob[];
}

export async function searchJSearchJobs(
    query: string, 
    location: string = 'United States',
    apiKey?: string
): Promise<Job[]> {
    const key = apiKey || process.env.RAPIDAPI_KEY;
    
    if (!key) {
        console.warn('JSearch API key not configured, skipping');
        return [];
    }

    try {
        const params = new URLSearchParams({
            query: `${query} entry level`,
            page: '1',
            num_pages: '1',
            country: 'us',
            date_posted: 'month'
        });

        const response = await fetch(
            `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
            {
                headers: {
                    'X-RapidAPI-Key': key,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            }
        );
        
        if (!response.ok) {
            console.error('JSearch API error:', response.status);
            return [];
        }

        const data: JSearchResponse = await response.json();
        
        if (!data.data) return [];

        return data.data.slice(0, 20).map(job => {
            let salary = 'Not specified';
            if (job.job_min_salary && job.job_max_salary) {
                const period = job.job_salary_period === 'HOUR' ? '/hr' : '/yr';
                salary = `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}${period}`;
            }

            const location = job.job_is_remote ? 'Remote' : 
                [job.job_city, job.job_state].filter(Boolean).join(', ') || 'Not specified';

            return {
                id: `jsearch-${job.job_id}`,
                title: job.job_title,
                company: job.employer_name,
                location,
                type: job.job_employment_type === 'FULLTIME' ? 'Full-time' :
                      job.job_employment_type === 'CONTRACTOR' ? 'Contract' :
                      job.job_employment_type === 'PARTTIME' ? 'Part-time' : 'Full-time',
                salaryRange: salary,
                postedAt: job.job_posted_at_datetime_utc,
                matchScore: 0,
                skills: job.job_required_skills || [],
                description: job.job_description?.slice(0, 500) || '',
                experienceLevel: job.job_required_experience?.no_experience_required ? 'Entry Level' : 'Entry Level',
                experienceYears: job.job_required_experience?.required_experience_in_months 
                    ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)} years`
                    : 'Not specified',
                applyUrl: job.job_apply_link,
                source: 'JSearch',
                companyLogo: job.employer_logo
            };
        });

    } catch (error) {
        console.error('Error fetching JSearch jobs:', error);
        return [];
    }
}
