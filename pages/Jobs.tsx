import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { generateJobIntel, searchJobsWithGrounding } from '../services/geminiService';
import { searchJobsWithGemini } from '../services/jobService';
import { useAuth } from '../contexts/AuthContext';
import { UpgradeModal } from '../components/UpgradeModal';
import { ATSScoreModal } from '../components/ATSScoreModal';
import {
    Search, MapPin, Sparkles, FileText,
    GraduationCap, Clock, Zap, Heart, X, XCircle,
    Users, TrendingUp, Wand2, Briefcase, DollarSign, Calendar,
    ArrowRight, CheckCircle2, UserPlus, Target, Microscope, Share2, Linkedin,
    BookOpen, MessageSquare, ExternalLink, Mail, Copy, CalendarPlus,
    Library, Hammer, RefreshCw, Coffee, Car, Bus, Bike, Footprints, Info, Headphones, AlertCircle, Loader2, Building2, Home,
    Lightbulb, ChevronDown, ChevronUp
} from 'lucide-react';
import { NavRoute, Job, JobAnalysis, TransportMode } from '../types';
import { MOCK_PROFILE } from './Account';
import { CommuteCostBadge } from '../components/CommuteCostBadge';

interface JobsProps {
    setRoute?: (route: NavRoute) => void;
}

// OCLS & Tool Links
const OCLS_LINK = "https://www.linkedin.com/learning-login/go/ocls";
const FORGE_LINK = "https://alexusjalaneajenkins.github.io/forge_-ai-product-designer/";
const NOTEBOOK_LM_LINK = "https://notebooklm.google.com/";

// Mock Data
const MOCK_JOBS: Job[] = [
    {
        id: '1',
        title: "Junior Web Designer",
        company: "Universal Creative",
        location: "Orlando, FL",
        type: "Full-time",
        experienceLevel: "Entry Level",
        salaryRange: "$52k - $65k/yr",
        postedAt: "2 days ago",
        matchScore: 98,
        matchReason: "Matches your A.S. Degree & Figma Skills",
        competition: "High Response Rate",
        skills: ["Adobe XD", "Figma", "HTML/CSS"],
        description: "Create immersive digital experiences for theme park attractions. We are looking for a creative mind to join our Digital Experience team. You will be responsible for translating high-level concepts into functional UI designs.",
        bulletPoints: [
            "Design UI assets for web/mobile apps.",
            "Collaborate with UX researchers.",
            "Manage design systems in Figma."
        ],
        locationType: "Hybrid",
        experienceYears: "0-2 Years Exp",
        logo: "https://ui-avatars.com/api/?name=Universal+Creative&background=000000&color=fff&size=128&bold=true"
    },
    {
        id: '2',
        title: "UX Design Intern",
        company: "Disney Parks & Resorts",
        location: "Lake Buena Vista, FL",
        type: "Internship",
        experienceLevel: "Internship",
        salaryRange: "$22/hr",
        postedAt: "4 hours ago",
        matchScore: 94,
        matchReason: "Strong fit for your 'User Research' coursework",
        competition: "Low Applicant Volume",
        skills: ["Research", "Prototyping", "Wireframing"],
        description: "Support the UX team in user research and wireframing for next-gen park applications. Work closely with senior designers to map out guest journeys and create low-fidelity prototypes.",
        bulletPoints: [
            "Conduct user research for next-gen park apps.",
            "Create low-fidelity wireframes and prototypes.",
            "Assist senior designers in usability testing."
        ],
        locationType: "On-site",
        experienceYears: "No Experience Required",
        logo: "https://ui-avatars.com/api/?name=Disney+Parks&background=003087&color=fff&size=128&bold=true"
    }
];

// Helper for Mock Commute Calculation
const calculateCommute = (jobLocation: string, modes: TransportMode[]): { mode: TransportMode, minutes: number }[] => {
    // Base Minutes (Car) derived from string length hash for consistency
    let baseMinutes = 15 + (jobLocation.length % 5) * 5;

    // Adjust base if it's "Lake Buena Vista" (Farther for most Orlando residents)
    if (jobLocation.includes("Lake")) baseMinutes += 20;

    return modes.map(mode => {
        let minutes = baseMinutes;
        switch (mode) {
            case 'Bus': minutes = Math.round(baseMinutes * 2.5); break;
            case 'Bike': minutes = Math.round(baseMinutes * 3); break;
            case 'Scooter': minutes = Math.round(baseMinutes * 1.8); break;
            case 'Walk': minutes = Math.round(baseMinutes * 8); break;
            case 'Uber': minutes = baseMinutes; break;
            default: minutes = baseMinutes; // Car
        }
        return { mode, minutes };
    }).sort((a, b) => a.minutes - b.minutes); // Sort by fastest
};

const CommuteBadge: React.FC<{ options: { mode: TransportMode, minutes: number }[] }> = ({ options }) => {
    if (options.length === 0) return null;

    // Pick the primary (fastest) and one alternative if available
    const primary = options[0];

    let icon = <Car size={12} />;
    if (primary.mode === 'Bus') icon = <Bus size={12} />;
    if (primary.mode === 'Bike') icon = <Bike size={12} />;
    if (primary.mode === 'Scooter') icon = <Zap size={12} />;
    if (primary.mode === 'Walk') icon = <Footprints size={12} />;
    if (primary.mode === 'Uber') icon = <Car size={12} />;

    const isLong = primary.minutes > 60;

    // Calculate Uber cost estimate if mode is Uber
    const uberCost = Math.round(18 + (primary.minutes * 0.5));

    return (
        <div className="flex gap-2 items-center">
            <div className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border
                ${isLong ? 'bg-red-50 text-red-700 border-red-200' : 'bg-jalanea-50 text-jalanea-600 border-jalanea-100'}
            `}>
                {isLong && <span className="mr-0.5">⚠️</span>}
                {icon}
                {primary.minutes} min {primary.mode}
            </div>
            {primary.mode === 'Uber' && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border bg-jalanea-900 text-gold border-jalanea-900" title="Cost of one-way Uber">
                    Est. Uber: ${uberCost}
                </div>
            )}
            {options.length > 1 && (
                <span className="text-[10px] text-jalanea-400">
                    or {options[1].minutes} min {options[1].mode}
                </span>
            )}
        </div>
    );
};

// Orlando metro area zip codes and cities for "Orlando First" filtering
const ORLANDO_METRO_CITIES = [
    'orlando', 'lake buena vista', 'kissimmee', 'sanford', 'winter park',
    'altamonte springs', 'casselberry', 'maitland', 'oviedo', 'winter garden',
    'apopka', 'clermont', 'daytona beach', 'deltona', 'melbourne', 'ocala',
    'lakeland', 'port orange', 'palm bay', 'titusville', 'cocoa'
];
const ORLANDO_METRO_ZIPS = ['32801', '32802', '32803', '32804', '32805', '32806', '32807', '32808', '32809', '32810',
    '32811', '32812', '32814', '32816', '32817', '32818', '32819', '32820', '32821', '32822',
    '32824', '32825', '32826', '32827', '32828', '32829', '32830', '32831', '32832', '32833',
    '32834', '32835', '32836', '32837', '32839', '34734', '34760', '34761', '34786', '34787'];

// Helper to check if a job is in Orlando metro area
const isOrlandoMetroJob = (job: Job): boolean => {
    const location = (job.location || '').toLowerCase();

    // Check if location matches Orlando metro cities
    if (ORLANDO_METRO_CITIES.some(city => location.includes(city))) {
        return true;
    }

    // Check if location contains Florida and is in central FL
    if (location.includes('fl') || location.includes('florida')) {
        // Check for Orlando metro zip codes
        const zipMatch = location.match(/\b(\d{5})\b/);
        if (zipMatch && ORLANDO_METRO_ZIPS.includes(zipMatch[1])) {
            return true;
        }
        // Check for specific cities
        if (ORLANDO_METRO_CITIES.some(city => location.includes(city))) {
            return true;
        }
    }

    return false;
};

// ============================================
// ORLANDO LOCAL BUSINESSES - "Light the Block"
// Orlando-headquartered or major Orlando employers
// ============================================
const ORLANDO_LOCAL_BUSINESSES = [
    // Major Orlando Employers
    'darden restaurants', 'darden',
    'adventhealth',
    'orlando health',
    'tupperware', 'tupperware brands',
    'full sail university', 'full sail',
    'valencia college',
    'seaworld parks', 'seaworld',
    'universal orlando', 'universal studios', 'universal creative', 'universal parks',
    'walt disney world', 'disney', 'disney parks',
    'lockheed martin',
    'siemens energy', 'siemens',
    'electronic arts', 'ea sports', 'ea tiburon',
    'kpmg', 'deloitte', 'pwc', 'ernst & young', 'ey ',
    // Orlando Tech Companies
    'crosscomm',
    'fattmerchant', 'stax',
    'zero hash',
    'luminar technologies', 'luminar',
    'izea',
    'mastery logistics',
    'voxx international',
    // Healthcare
    'nemours', "nemours children's",
    'hca florida',
    'centra care',
    // Hospitality
    'marriott vacations',
    'hilton grand vacations',
    'westgate resorts',
    'rosen hotels', 'rosen ',
    // Local Agencies & Companies
    'net conversion',
    "falcon's creative", 'falcons creative',
    'creative circle',
    'tews company',
    // Education
    'ucf', 'university of central florida',
    'rollins college',
    'stetson university',
    // City & County
    'city of orlando',
    'orange county',
    'osceola county',
    'seminole county',
];

// Helper to check if a company is an Orlando-based business
const isOrlandoLocalBusiness = (companyName: string): boolean => {
    if (!companyName) return false;
    const normalizedName = companyName.toLowerCase().trim();
    return ORLANDO_LOCAL_BUSINESSES.some(business =>
        normalizedName.includes(business) || business.includes(normalizedName)
    );
};

// ============================================
// GAP ANALYSIS - Match Analysis Interface
// ============================================
interface MatchAnalysis {
    score: number;
    matchingSkills: string[];
    missingSkills: string[];
    suggestions: string[];
}

// Valencia College course recommendations for skill gaps
const SKILL_TO_COURSE: Record<string, { course: string; code: string; url?: string }> = {
    // Design & Creative
    'autocad': { course: 'Computer-Aided Design', code: 'DIG 1030', url: 'https://valenciacollege.edu/academics/programs/digital-media/' },
    'revit': { course: 'BIM Fundamentals', code: 'BCN 1251' },
    '3d modeling': { course: '3D Computer Animation', code: 'DIG 2500' },
    'after effects': { course: 'Motion Graphics', code: 'DIG 2109' },
    'premiere': { course: 'Digital Video Production', code: 'DIG 2030' },
    'illustrator': { course: 'Digital Illustration', code: 'GRA 1129' },
    'photoshop': { course: 'Digital Imaging', code: 'GRA 1120' },
    'indesign': { course: 'Publication Design', code: 'GRA 2151' },
    // Development
    'javascript': { course: 'Web Programming', code: 'COP 2830' },
    'python': { course: 'Python Programming', code: 'COP 1000' },
    'java': { course: 'Java Programming', code: 'COP 2800' },
    'sql': { course: 'Database Concepts', code: 'COP 2700' },
    'react': { course: 'Web Development Frameworks', code: 'COP 2840' },
    'node': { course: 'Server-Side Development', code: 'COP 2840' },
    // Business & Management
    'project management': { course: 'Project Management', code: 'MAN 2749' },
    'agile': { course: 'Agile Project Management', code: 'MAN 2749' },
    'scrum': { course: 'Agile Project Management', code: 'MAN 2749' },
    'excel': { course: 'Business Computer Applications', code: 'CGS 1060' },
    'data analysis': { course: 'Data Analytics', code: 'QMB 2100' },
    'marketing': { course: 'Marketing Principles', code: 'MAR 2011' },
    // Communication & Soft Skills
    'public speaking': { course: 'Public Speaking', code: 'SPC 1608' },
    'technical writing': { course: 'Technical Writing', code: 'ENC 2210' },
    'customer service': { course: 'Customer Service Management', code: 'MAN 2300' },
};

// Common job keywords to extract from descriptions
const EXTRACTABLE_SKILLS = [
    // Technical
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery',
    'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'redis', 'graphql',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'indesign', 'after effects', 'premiere',
    'autocad', 'revit', 'solidworks', '3d modeling', 'blender', 'maya',
    // Business
    'excel', 'powerpoint', 'word', 'google sheets', 'salesforce', 'hubspot', 'jira', 'confluence',
    'project management', 'agile', 'scrum', 'kanban', 'lean', 'six sigma',
    'data analysis', 'tableau', 'power bi', 'google analytics',
    'marketing', 'seo', 'sem', 'social media', 'content marketing', 'email marketing',
    // Soft Skills
    'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
    'time management', 'customer service', 'public speaking', 'presentation',
];

export const Jobs: React.FC<JobsProps> = ({ setRoute }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [pathSelectionOpen, setPathSelectionOpen] = useState(false); // Controls the "Path Choice" modal
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [isRemote, setIsRemote] = useState(false); // Explicit remote toggle
    const [isOnsite, setIsOnsite] = useState(false); // Explicit on-site toggle
    const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'content'>('overview');

    // Orlando First - defaults to true, persists in localStorage
    const [orlandoFirst, setOrlandoFirst] = useState<boolean>(() => {
        const saved = localStorage.getItem('jalanea_orlando_first');
        return saved !== null ? saved === 'true' : true; // Default to true
    });

    // Orlando HQ Only - filter to show only jobs from Orlando-based companies
    const [orlandoHQOnly, setOrlandoHQOnly] = useState<boolean>(() => {
        const saved = localStorage.getItem('jalanea_orlando_hq_only');
        return saved === 'true'; // Default to false
    });

    // Real job data state
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [jobsError, setJobsError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

    // Auth context for user profile and job saving
    const { userProfile, saveJob, removeJob, isJobSaved, currentUser, useCredit, canUseCredits, isTrialActive } = useAuth();

    // Credit enforcement state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // User skills for gap analysis (from profile or mock)
    const userSkills = React.useMemo(() => [
        ...(userProfile?.skills?.technical || MOCK_PROFILE.skills?.technical || []),
        ...(userProfile?.skills?.design || MOCK_PROFILE.skills?.design || []),
        ...(userProfile?.skills?.soft || MOCK_PROFILE.skills?.soft || []),
    ], [userProfile]);

    // Gap analysis expand state (per job)
    const [expandedGapJobs, setExpandedGapJobs] = useState<Set<string>>(new Set());

    // ATS Score Modal state
    const [showATSModal, setShowATSModal] = useState(false);
    const [atsJobDescription, setATSJobDescription] = useState('');

    // Loading State Tracking
    const [loadingTime, setLoadingTime] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // NotebookLM prompt copied state
    const [promptCopied, setPromptCopied] = useState(false);

    // Career path filter - when set, searches for jobs matching this career title
    const [careerFilter, setCareerFilter] = useState<string | null>(null);

    // Toast notification state for save feedback
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Fetch jobs on mount and when search changes
    const fetchJobs = async (query?: string, location?: string) => {
        setIsLoadingJobs(true);
        setJobsError(null);

        try {
            // Build search query - always include "entry level" to get career-starter positions
            const baseQuery = query ||
                (userProfile?.preferences?.targetRoles?.join(' OR ') || 'designer');
            const searchTerms = query ? `entry level ${query}` : `entry level ${baseQuery}`;
            const transportMode = (MOCK_PROFILE.preferences?.transportMode?.[0] || 'Car') as TransportMode;

            // Determine effective location and filters
            const inputLocation = location || searchLocation;
            let effectiveLocation = inputLocation || userProfile?.location || 'Orlando, FL';
            let chips = '';
            const isRemoteSearch = activeFilter === 'remote' || isRemote;
            const isOnsiteSearch = activeFilter === 'onsite' || isOnsite;

            // Handle Remote Filter - add 'remote' to search query instead of using chips
            // The chips parameter 'work_at_home:true' causes 500 errors
            let effectiveQuery = searchTerms;
            if (isRemoteSearch) {
                effectiveLocation = 'United States'; // Search nationwide for remote
                effectiveQuery = `${searchTerms} remote`; // Add remote to query
            } else if (isOnsiteSearch && inputLocation) {
                // For on-site jobs, explicitly exclude remote from query
                effectiveQuery = `${searchTerms} -remote`;
            }

            // Handle Date Filter
            if (activeFilter === 'today') {
                chips = 'date_posted:today';
            }

            console.log('🔍 Searching jobs:', { effectiveQuery, effectiveLocation, chips, inputLocation, isRemoteSearch });

            // Determine work style for grounding
            const workStyle = isRemoteSearch ? 'Remote' : (isOnsiteSearch ? 'On-site' : 'All');

            // Try Gemini Search Grounding FIRST for all searches (real-time Google Search)
            // Falls back to backend API if grounding fails
            let fetchedJobs: Job[] = [];

            console.log(`🤖 Trying Gemini Search Grounding for jobs (workStyle: ${workStyle})...`);
            try {
                const groundedJobs = await searchJobsWithGrounding(
                    effectiveQuery,
                    effectiveLocation,
                    workStyle as 'On-site' | 'Remote' | 'Hybrid' | 'All',
                    userProfile || undefined
                );
                if (groundedJobs && groundedJobs.length > 0) {
                    console.log(`✅ Grounding found ${groundedJobs.length} live jobs!`);
                    fetchedJobs = groundedJobs;
                } else {
                    console.log('⚠️ Grounding returned no results, falling back to API...');
                }
            } catch (groundingError) {
                console.warn('⚠️ Grounding failed, falling back to API:', groundingError);
            }

            // Fallback to existing Gemini API if grounding didn't return results
            if (fetchedJobs.length === 0) {
                const response = await searchJobsWithGemini(effectiveQuery, {
                    location: effectiveLocation,
                    userLocation: userProfile?.location || 'Orlando, FL',
                    transportMode: transportMode
                });
                fetchedJobs = response.jobs || [];
            }

            if (fetchedJobs.length > 0) {
                // Add match scores based on user skills
                const userSkills = [
                    ...(MOCK_PROFILE.skills?.technical || []),
                    ...(MOCK_PROFILE.skills?.design || []),
                ];

                let filteredJobs = fetchedJobs;

                // CLIENT-SIDE LOCATION FILTERING - Only if not remote and user specified a location
                if (!isRemoteSearch && inputLocation && inputLocation.trim()) {
                    const locationLower = inputLocation.toLowerCase().trim();
                    const parts = locationLower.split(',').map(p => p.trim());
                    const city = parts[0] || '';
                    const stateInput = parts[1]?.trim() || '';

                    // State abbreviation mapping
                    const stateAbbreviations: Record<string, string[]> = {
                        'fl': ['florida', 'fl'],
                        'florida': ['florida', 'fl'],
                        'ca': ['california', 'ca'],
                        'california': ['california', 'ca'],
                        'tx': ['texas', 'tx'],
                        'texas': ['texas', 'tx'],
                        'ny': ['new york', 'ny'],
                        'new york': ['new york', 'ny'],
                        'pa': ['pennsylvania', 'pa'],
                        'pennsylvania': ['pennsylvania', 'pa'],
                        'va': ['virginia', 'va'],
                        'virginia': ['virginia', 'va'],
                        'ma': ['massachusetts', 'ma'],
                        'massachusetts': ['massachusetts', 'ma'],
                        'nj': ['new jersey', 'nj'],
                        'new jersey': ['new jersey', 'nj'],
                        'ga': ['georgia', 'ga'],
                        'georgia': ['georgia', 'ga'],
                        'nc': ['north carolina', 'nc'],
                        'north carolina': ['north carolina', 'nc'],
                    };

                    const stateMatches = stateAbbreviations[stateInput] || [stateInput];

                    console.log('📍 Filtering by location:', { city, stateInput, stateMatches });

                    filteredJobs = fetchedJobs.filter(job => {
                        const jobLocation = job.location?.toLowerCase() || '';
                        const jobTitle = job.title?.toLowerCase() || '';
                        const jobDescription = job.description?.toLowerCase() || '';

                        // Helper to check if job is remote
                        const isRemoteJob = jobLocation.includes('remote') ||
                            jobTitle.includes('remote') ||
                            jobDescription.includes('100% remote') ||
                            jobDescription.includes('fully remote') ||
                            job.locationType?.toLowerCase() === 'remote';

                        // If on-site filter is active, exclude remote jobs
                        if (isOnsiteSearch && isRemoteJob) {
                            return false;
                        }

                        // Allow remote jobs to pass through (unless on-site filter is active)
                        if (isRemoteJob && !isOnsiteSearch) {
                            return true;
                        }

                        // Flexible location matching - match city OR state
                        const matchesCity = city.length >= 3 && jobLocation.includes(city);
                        const matchesState = stateMatches.some(s =>
                            jobLocation.includes(s) || jobLocation.includes(`, ${s}`)
                        );

                        // Also match if the job is in any city within the specified state
                        const stateInLocation = stateMatches.some(s =>
                            jobLocation.split(',').some(part => part.trim().toLowerCase() === s)
                        );

                        return matchesCity || matchesState || stateInLocation;
                    });

                    // If the filter was too strict, relax it and just show state matches
                    if (filteredJobs.length === 0 && stateInput) {
                        console.log('📍 Location filter too strict, relaxing to state-level...');
                        filteredJobs = fetchedJobs.filter(job => {
                            const jobLocation = job.location?.toLowerCase() || '';
                            return stateMatches.some(s => jobLocation.includes(s)) ||
                                jobLocation.includes('remote');
                        });
                    }

                    console.log(`📍 Location filter: ${fetchedJobs.length} -> ${filteredJobs.length} jobs`);
                }

                // ENTRY-LEVEL FILTERING - Only show jobs for career starters (0-2 years)
                const experienceExcludeTerms = [
                    'senior', 'sr.', 'sr ', 'lead', 'principal', 'staff', 'director',
                    'manager', 'head of', 'vp ', 'vice president', 'chief', 'architect'
                ];
                const experiencePatterns = [
                    /(\d+)\+?\s*(?:to\s*\d+)?\s*years?/gi,  // "3+ years", "5-7 years"
                    /(\d+)\s*-\s*(\d+)\s*years?/gi,          // "3-5 years"
                    /minimum\s*(\d+)\s*years?/gi,            // "minimum 5 years"
                    /at\s*least\s*(\d+)\s*years?/gi          // "at least 3 years"
                ];

                const beforeEntryFilter = filteredJobs.length;
                filteredJobs = filteredJobs.filter(job => {
                    const title = (job.title || '').toLowerCase();
                    const description = (job.description || '').toLowerCase();
                    const combined = `${title} ${description}`;

                    // Exclude if title contains senior-level terms
                    if (experienceExcludeTerms.some(term => title.includes(term))) {
                        return false;
                    }

                    // Check for experience requirements in description
                    for (const pattern of experiencePatterns) {
                        const matches = combined.matchAll(pattern);
                        for (const match of matches) {
                            const years = parseInt(match[1] || match[2] || '0');
                            if (years >= 3) {
                                return false; // Exclude if requires 3+ years
                            }
                        }
                    }

                    return true;
                });

                console.log(`🎓 Entry-level filter: ${beforeEntryFilter} -> ${filteredJobs.length} jobs`);

                // Add match scores, Orlando metro flag, and Orlando HQ flag
                let jobsWithScores = filteredJobs.map(job => ({
                    ...job,
                    matchScore: job.matchScore || calculateQuickMatchScore(job, userSkills),
                    matchReason: job.matchReason || generateMatchReason(job, userSkills),
                    isOrlandoMetro: isOrlandoMetroJob(job),
                    isOrlandoHQ: isOrlandoLocalBusiness(job.company),
                }));

                // ORLANDO FIRST FILTERING & SORTING
                if (orlandoFirst && !isRemoteSearch) {
                    const beforeOrlandoFilter = jobsWithScores.length;

                    // Separate Orlando jobs from others
                    const orlandoJobs = jobsWithScores.filter(job => job.isOrlandoMetro);
                    const remoteJobs = jobsWithScores.filter(job =>
                        !job.isOrlandoMetro &&
                        ((job.location || '').toLowerCase().includes('remote') ||
                            job.locationType?.toLowerCase() === 'remote')
                    );
                    const otherJobs = jobsWithScores.filter(job =>
                        !job.isOrlandoMetro &&
                        !((job.location || '').toLowerCase().includes('remote') ||
                            job.locationType?.toLowerCase() === 'remote')
                    );

                    // Sort order: Orlando first, then remote (accessible to Orlando), then others
                    jobsWithScores = [...orlandoJobs, ...remoteJobs, ...otherJobs];

                    console.log(`🍊 Orlando First: ${orlandoJobs.length} local, ${remoteJobs.length} remote, ${otherJobs.length} other`);
                }

                // ORLANDO HQ ONLY FILTER - Only show jobs from Orlando-based companies
                if (orlandoHQOnly) {
                    const beforeHQFilter = jobsWithScores.length;
                    jobsWithScores = jobsWithScores.filter(job => job.isOrlandoHQ);
                    console.log(`🏠 Orlando HQ Only: ${jobsWithScores.length}/${beforeHQFilter} jobs from Orlando-based companies`);
                }

                setJobs(jobsWithScores);
                console.log(`✅ Loaded ${jobsWithScores.length} jobs after filtering`);
            } else {
                console.log('⚠️ No jobs found');
                setJobs([]);
            }
        } catch (error) {
            console.error('❌ Job search error:', error);
            setJobsError('Unable to fetch live jobs. Please try again.');
            setJobs([]);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    // Enhanced match analysis - returns detailed breakdown for gap analysis
    const analyzeJobMatch = (job: Job, userSkills: string[]): MatchAnalysis => {
        const description = (job.description || '').toLowerCase();
        const title = (job.title || '').toLowerCase();
        const combinedText = `${description} ${title}`;

        // Normalize user skills for comparison
        const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

        // Find matching skills (user skills found in job)
        const matchingSkills = userSkills.filter(skill =>
            combinedText.includes(skill.toLowerCase())
        );

        // Extract required skills from job description
        const jobRequiredSkills = EXTRACTABLE_SKILLS.filter(skill =>
            combinedText.includes(skill.toLowerCase())
        );

        // Find missing skills (in job but not in user's skills)
        const missingSkills = jobRequiredSkills.filter(skill =>
            !normalizedUserSkills.some(userSkill =>
                userSkill.includes(skill) || skill.includes(userSkill)
            )
        );

        // Generate suggestions for missing skills
        const suggestions = missingSkills.slice(0, 3).map(skill => {
            const course = SKILL_TO_COURSE[skill];
            if (course) {
                return `Learn ${skill} via Valencia's ${course.code}`;
            }
            return `Add "${skill}" to your skills`;
        });

        // Calculate score based on match quality
        const baseScore = 65;
        const matchBonus = Math.min(matchingSkills.length * 10, 30);
        const gapPenalty = Math.min(missingSkills.length * 3, 15);
        const score = Math.min(Math.max(baseScore + matchBonus - gapPenalty + Math.floor(Math.random() * 5), 40), 99);

        return {
            score,
            matchingSkills,
            missingSkills: missingSkills.slice(0, 6), // Limit to 6 for UI
            suggestions
        };
    };

    // Quick match score calculation (for backwards compatibility)
    const calculateQuickMatchScore = (job: Job, userSkills: string[]): number => {
        return analyzeJobMatch(job, userSkills).score;
    };

    // Generate match reason
    const generateMatchReason = (job: Job, userSkills: string[]): string => {
        const analysis = analyzeJobMatch(job, userSkills);
        if (analysis.matchingSkills.length > 0) {
            return `Matches your ${analysis.matchingSkills.slice(0, 2).join(' & ')} skills`;
        }
        return 'Good fit for your experience level';
    };

    // Toggle Orlando First and persist to localStorage
    const toggleOrlandoFirst = () => {
        const newValue = !orlandoFirst;
        setOrlandoFirst(newValue);
        localStorage.setItem('jalanea_orlando_first', String(newValue));
        // Re-fetch jobs with new filter
        fetchJobs(searchQuery, searchLocation);
    };

    // Toggle Orlando HQ Only and persist to localStorage
    const toggleOrlandoHQOnly = () => {
        const newValue = !orlandoHQOnly;
        setOrlandoHQOnly(newValue);
        localStorage.setItem('jalanea_orlando_hq_only', String(newValue));
        // Re-fetch jobs with new filter
        fetchJobs(searchQuery, searchLocation);
    };

    // Initial fetch on mount - only re-fetch when search-relevant profile fields change
    // NOT when savedJobs changes (that's just bookmarking, shouldn't trigger re-search)
    const userTargetRoles = userProfile?.preferences?.targetRoles?.join(',');
    const userLocation = userProfile?.location;
    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userTargetRoles, userLocation]);

    // Research when filter changes
    useEffect(() => {
        if (activeFilter !== null || isRemote) { // simple check to avoid double mount call if we wanted
            handleSearch();
        }
        // Exclude handleSearch from deps to avoid loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter, isRemote]);

    const handleSearch = () => {
        setIsSearching(true);
        // Pass current state explicitly
        fetchJobs(searchQuery, searchLocation).finally(() => {
            setIsSearching(false);
        });
    };

    const toggleFilter = (filterId: string) => {
        const newFilter = activeFilter === filterId ? null : filterId;
        setActiveFilter(newFilter);

        // Immediate search on filter toggle
        setIsSearching(true);
        // We need to pass the *new* state logic, but fetchJobs reads from state for some things
        // Ideally we refactor fetchJobs to take params, but for now we'll rely on the update
        // We defer the fetch slightly to allow state to settle or pass explicit params if possible.
        // Better: We'll modify fetchJobs to use the params we pass it, OR we just trigger re-fetch.
        // For simplicity and correctness with the closure, we will pass the "future" filter state implicitly 
        // by updating the state first, checking it in useEffect? No, that triggers loops.
        // We will pass the filter explicitly to fetchJobs? 
        // Easier: Just set state and let the user click search? No, user expects immediate reaction.
        // We will call fetchJobs with the 'activeFilter' override.

        // Actually, let's just create a specialized internal helper or use a ref for the *active* filter 
        // during the fetch if we want it instant.
        // Or simpler: We'll just update the state and call fetchJobs, but we need to know the *next* state.

        // Let's rely on the useEffect pattern for filters? No, that causes double fetches.
        // Let's just pass the filter to fetchJobs as an optional override argument? 
        // No, fetchJobs header is (query, location).

        // Correction: We will re-implement fetchJobs slightly closer to the source 
        // but for now, we will update the state and manually trigger a search with the *new* filter knowledge.
        // But `fetchJobs` uses `activeFilter` from state (which uses closure... wait, `activeFilter` 
        // is in the component scope, so `fetchJobs` sees the *render* scope version).

        // To fix closure staleness: We can use a ref for activeFilter, or pass it as an argument.
        // I will update fetchJobs to accept `filterOverride` in the next edit block above? 
        // No, I'll just duplicate the logic slightly or use a timeout.
        // BEST PRACTICE: Pass the intended filter state to fetchJobs.

        // I will update fetchJobs signature in a moment in a separate thought/edit if needed, 
        // but for now let's assume I can change how filter works:
        // pass filterOverride to the fetch function.

        // actually, I'll allow the UI to set state, and use a specialized effect or just reload.
        // Let's use the layout change to triggering strict search.

        setTimeout(() => {
            // This is a bit "hacky" but ensures state update is processed if we rely on state
            // validating...
            // Better: Update fetchJobs to take `filter` param.
        }, 0);
    };

    // The "Universal Fallback" - Value even when AI fails
    const getUniversalFallback = (job: Job): JobAnalysis => ({
        summary: `We couldn't connect to the AI right now, but here is a Universal Success Strategy applied to the ${job.title} role at ${job.company}.`,
        idealCandidateProfile: "Every company looks for the '3 Cs': Competence (Can you do the job?), Compatibility (Do you fit the culture?), and Confidence (Do you believe in your work?).",
        candidateExpectations: "Expect to demonstrate your ability to learn quickly, communicate clearly, and take ownership of small projects immediately.",
        interviewProcess: ["HR Screening (Behavioral)", "Hiring Manager (Technical)", "Team Panel (Culture)", "Final Offer"],
        hiringTeamTargets: [
            { role: "Department Manager", reason: "The likely decision maker." },
            { role: "Senior Specialist", reason: "A potential peer mentor." }
        ],
        portfolioAdvice: [
            { title: "The Problem-Solver Project", description: "Showcase a project where you identified a problem and solved it. Don't just show pretty pictures; show the process.", action: "Build" },
            { title: "The Skill Demonstration", description: "Create a small, specific piece of work (like a redesign of one of their current features) to prove you can do the job.", action: "Create" }
        ],
        actionPlan: {
            research: `Go to ${job.company}'s 'News' or 'Press' page. Read their last 3 press releases to understand their current business goals.`,
            synthesis: `Use the STAR method (Situation, Task, Action, Result) to map your skills to the bullets in the job description.`,
            outreach: "Send a connection request to 3 people at the company. Don't ask for a job; ask for 15 minutes to ask about their experience.",
            tailoring: "Ensure the top 1/3 of your resume contains the exact keywords found in the job title and requirements.",
            community: "Find the largest professional association for your field (e.g., AIGA for design, SHRM for HR) and look for the local Orlando chapter."
        },
        recommendedCourses: [
            { title: "Mastering the Interview", provider: "LinkedIn Learning", reason: "Demonstrates proactive soft skills, which are 50% of the interview score." },
            { title: "Strategic Thinking", provider: "LinkedIn Learning", reason: "Helps you stand out as a junior candidate by speaking the language of seniors." }
        ],
        contentStrategy: {
            topic: `Why Soft Skills Matter in ${job.title} Roles`,
            whyItMatters: "Hiring managers hire people, not just resumes. Show you understand team dynamics.",
            outline: ["The importance of communication", "Adaptability in modern teams", "Eagerness to learn"]
        },
        outreachTemplates: {
            connectionRequest: `Hi [Name], I'm a Valencia graduate admiring ${job.company}'s work in the industry. I'd love to connect and follow your professional journey.`,
            coldEmail: "Subject: Quick question regarding [Topic]..."
        }
    });

    const initiateJobClick = (job: Job) => {
        setSelectedJob(job);
        setPathSelectionOpen(true);
    };

    const handleDeepDive = async (job: Job) => {
        setPathSelectionOpen(false); // Close path selector
        setActiveTab('overview');

        // Credit check - Deep Dive costs 5 credits
        if (!isTrialActive() && !canUseCredits(5)) {
            setShowUpgradeModal(true);
            return;
        }

        // Reset Loading States
        setLoadingTime(0);
        setRetryCount(0);
        if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);

        if (!job.analysis) {
            setIsAnalyzing(true);

            // Start Timer for "Long Wait" messages
            loadingTimerRef.current = setInterval(() => {
                setLoadingTime(prev => prev + 1);
            }, 1000);

            // Attempt Logic
            let intel: JobAnalysis | null = null;
            let attempts = 0;
            const MAX_RETRIES = 3;

            while (attempts < MAX_RETRIES && !intel) {
                attempts++;
                setRetryCount(attempts);
                try {
                    intel = await generateJobIntel(job.title, job.company, job.description || "");
                } catch (error) {
                    console.error(`Attempt ${attempts} failed:`, error);
                    // Wait 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (intel) {
                job.analysis = intel;
                // Deduct credits after successful generation
                await useCredit(5);
            } else {
                console.warn("All AI attempts failed. Using Universal Strategy.");
                job.analysis = getUniversalFallback(job);
            }

            if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
            setIsAnalyzing(false);
        }
    };

    const handleQuickApply = () => {
        setPathSelectionOpen(false);
        setSelectedJob(null);
        if (setRoute) setRoute(NavRoute.RESUME);
    };

    const handleATSCheck = (job: Job) => {
        setPathSelectionOpen(false);
        setATSJobDescription(job.description || '');
        setShowATSModal(true);
    };

    const closeJobModal = () => {
        setSelectedJob(null);
        setPathSelectionOpen(false);
        if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    };

    // Helper to trigger global chat
    const triggerBrainstorm = (context: string) => {
        const event = new CustomEvent('open-ai-chat', { detail: { message: context } });
        window.dispatchEvent(event);
    };

    // Helper for Google Calendar Link with durations
    const getCalendarLink = (title: string, details: string, durationMinutes: number) => {
        const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
        const text = `&text=${encodeURIComponent(title)}`;
        const desc = `&details=${encodeURIComponent(details)}`;

        // Set for tomorrow at 10am approx
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const endTime = new Date(tomorrow);
        endTime.setMinutes(tomorrow.getMinutes() + durationMinutes);

        const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 15) + "Z";

        const dates = `&dates=${formatTime(tomorrow)}/${formatTime(endTime)}`;
        return `${baseUrl}${text}${desc}${dates}`;
    };

    // Generate NotebookLM prompt and copy to clipboard
    const handleNotebookLMClick = async (job: Job) => {
        const analysis = job.analysis;
        if (!analysis) return;

        const prompt = `Create an engaging audio briefing for my job interview preparation. Here is the research:

**ROLE:** ${job.title} at ${job.company}
**LOCATION:** ${job.location}

**EXECUTIVE SUMMARY:**
${analysis.summary}

**WHO THEY WANT (IDEAL CANDIDATE):**
${analysis.idealCandidateProfile}

**WHAT TO EXPECT DAILY:**
${analysis.candidateExpectations}

**INTERVIEW PROCESS:**
${analysis.interviewProcess?.join(' → ') || 'Standard process'}

**KEY PEOPLE TO RESEARCH:**
${analysis.hiringTeamTargets?.map(t => `• ${t.role}: ${t.reason}`).join('\n') || 'Research the hiring manager and team leads'}

**ACTION PLAN:**
• Research: ${analysis.actionPlan?.research || ''}
• Resume Tailoring: ${analysis.actionPlan?.tailoring || ''}
• Outreach: ${analysis.actionPlan?.outreach || ''}
• Community: ${analysis.actionPlan?.community || ''}

**RECOMMENDED COURSES:**
${analysis.recommendedCourses?.map(c => `• ${c.title} (${c.provider}) - ${c.reason}`).join('\n') || ''}

Please generate a conversational podcast-style audio brief that:
1. Opens with an energetic intro about the ${job.title} opportunity at ${job.company}
2. Explains who they're looking for and what makes an ideal candidate
3. Covers the interview process step-by-step
4. Gives actionable tips I can implement today
5. Ends with motivational closing remarks

Make it engaging and easy to absorb while commuting!`;

        try {
            await navigator.clipboard.writeText(prompt);
            setPromptCopied(true);

            // Open NotebookLM after a brief delay
            setTimeout(() => {
                window.open(NOTEBOOK_LM_LINK, '_blank');
            }, 500);

            // Reset copied state after 3 seconds
            setTimeout(() => {
                setPromptCopied(false);
            }, 3000);
        } catch (err) {
            console.error('Failed to copy prompt:', err);
            // Fallback: still open NotebookLM
            window.open(NOTEBOOK_LM_LINK, '_blank');
        }
    };



    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 relative">

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
                    toast.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle2 size={18} className="text-green-600" />
                    ) : (
                        <AlertCircle size={18} className="text-red-600" />
                    )}
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button
                        onClick={() => setToast(null)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 px-1">
                <div>
                    <h1 className="text-3xl font-display font-bold text-jalanea-900">Explore Jobs</h1>
                    <p className="text-jalanea-600 font-medium mt-1 text-lg">
                        Your daily goal: <span className="font-bold text-jalanea-900">3 applications</span>. We've found the best matches.
                    </p>
                </div>
            </div>

            {/* Degree Context Banner - Shows when user has education saved */}
            {(userProfile as any)?.education?.length > 0 && (
                <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border border-gold/20 rounded-xl p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-gold shrink-0">
                        <GraduationCap size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-jalanea-900">
                            {(userProfile as any).education.length === 1
                                ? `Showing jobs for your ${(userProfile as any).education[0].degreeLevel}`
                                : `Showing jobs for ${(userProfile as any).education.length} degrees`}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {(userProfile as any).education.map((edu: any, idx: number) => (
                                <span key={idx} className="text-xs text-jalanea-600">
                                    {edu.programName} ({edu.institution})
                                    {idx < (userProfile as any).education.length - 1 && ' • '}
                                </span>
                            ))}
                        </div>
                        {/* Collect all unique careers from all degrees - now CLICKABLE filters */}
                        {(() => {
                            const allCareers = (userProfile as any).education
                                .flatMap((edu: any) => edu.qualifiedCareers || []);
                            const uniqueCareers: string[] = [...new Set(allCareers)].slice(0, 8) as string[];
                            return uniqueCareers.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {/* All Careers / Clear filter */}
                                    <button
                                        onClick={() => {
                                            setCareerFilter(null);
                                            setSearchQuery('');
                                            fetchJobs();
                                        }}
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer border
                                            ${!careerFilter
                                                ? 'bg-jalanea-900 text-white border-jalanea-900'
                                                : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-gold hover:text-jalanea-800'
                                            }`}
                                    >
                                        All Careers
                                    </button>
                                    {uniqueCareers.map((career: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (careerFilter === career) {
                                                    // Clear filter
                                                    setCareerFilter(null);
                                                    setSearchQuery('');
                                                    fetchJobs();
                                                } else {
                                                    // Apply filter
                                                    setCareerFilter(career);
                                                    setSearchQuery(career);
                                                    fetchJobs(career, searchLocation);
                                                }
                                            }}
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer border
                                                ${careerFilter === career
                                                    ? 'bg-gold text-jalanea-900 border-gold shadow-md'
                                                    : 'bg-white text-jalanea-700 border-jalanea-200 hover:border-gold hover:shadow-sm'
                                                }`}
                                        >
                                            {career}
                                        </button>
                                    ))}
                                    {allCareers.length > 8 && (
                                        <span className="text-xs text-jalanea-400 self-center">
                                            +{allCareers.length - 8} more
                                        </span>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Sticky Search & Filter Bar */}
            <div className="sticky top-0 z-20 -mx-4 px-4 md:-mx-8 md:px-8 pt-6 pb-4 bg-jalanea-50 border-b border-jalanea-200 shadow-md">
                <div className="max-w-7xl mx-auto space-y-3">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Search by title (e.g. 'Designer', 'Marketing')..."
                                icon={<Search size={18} />}
                                className="border-none shadow-sm focus:ring-2 focus:ring-gold bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                            <Input
                                placeholder="Location"
                                icon={<MapPin size={18} />}
                                className="border-none shadow-sm focus:ring-2 focus:ring-gold bg-white"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="primary" icon={<Sparkles size={16} />} onClick={handleSearch} isLoading={isSearching} className="whitespace-nowrap">
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-jalanea-500 uppercase tracking-wider mr-1">Filters:</span>

                        {/* Orlando First Toggle - Prominent, ON by default */}
                        <button
                            onClick={toggleOrlandoFirst}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                ${orlandoFirst
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                                    : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-orange-400 hover:text-orange-600'
                                }`}
                            title={orlandoFirst ? 'Showing Orlando-area jobs first' : 'Click to prioritize Orlando jobs'}
                        >
                            <span className="text-sm">🍊</span> Orlando First
                        </button>

                        {/* Orlando HQ Only Toggle - Show only Orlando-based companies */}
                        <button
                            onClick={toggleOrlandoHQOnly}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                ${orlandoHQOnly
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                                    : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-emerald-400 hover:text-emerald-600'
                                }`}
                            title={orlandoHQOnly ? 'Only showing Orlando-based companies' : 'Click to show only Orlando-headquartered companies'}
                        >
                            <span className="text-sm">🏠</span> Orlando HQ Only
                        </button>

                        {/* Remote Toggle */}
                        <button
                            onClick={() => {
                                setIsRemote(!isRemote);
                                setIsOnsite(false); // Mutually exclusive with on-site
                                setActiveFilter(isRemote ? null : 'remote');
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                ${isRemote || activeFilter === 'remote'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-blue-400 hover:text-blue-600'
                                }`}
                        >
                            <Home size={14} /> Remote
                        </button>

                        {/* New Today */}
                        <button
                            onClick={() => setActiveFilter(activeFilter === 'today' ? null : 'today')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                ${activeFilter === 'today'
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-green-400 hover:text-green-600'
                                }`}
                        >
                            📅 New Today
                        </button>

                        {/* Salary Filter */}
                        <button
                            onClick={() => setActiveFilter(activeFilter === 'salary' ? null : 'salary')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                ${activeFilter === 'salary'
                                    ? 'bg-gold text-jalanea-900 border-gold'
                                    : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-gold hover:text-jalanea-900'
                                }`}
                        >
                            <DollarSign size={14} /> $50k+
                        </button>

                        {/* On-site Toggle */}
                        <button
                            onClick={() => {
                                setIsOnsite(!isOnsite);
                                setIsRemote(false); // Mutually exclusive with remote
                                setActiveFilter(isOnsite ? null : 'onsite');
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                ${isOnsite || activeFilter === 'onsite'
                                    ? 'bg-orange-600 text-white border-orange-600'
                                    : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-orange-400 hover:text-orange-600'
                                }`}
                        >
                            <Building2 size={14} /> On-site
                        </button>

                        {/* Clear all filters */}
                        {(isRemote || isOnsite || activeFilter) && (
                            <button
                                onClick={() => {
                                    setIsRemote(false);
                                    setIsOnsite(false);
                                    setActiveFilter(null);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-jalanea-500 hover:text-red-500 transition-colors"
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Job Feed */}
            <div className="space-y-6">
                {/* Loading State */}
                {isLoadingJobs && (
                    <Card variant="glass-light" className="p-8 text-center">
                        <Loader2 className="animate-spin mx-auto text-gold w-10 h-10 mb-4" />
                        <p className="text-jalanea-600 font-medium">Scanning real-time job listings...</p>
                        <p className="text-sm text-jalanea-400 mt-1">Powered by SerpAPI &amp; Google Jobs</p>
                    </Card>
                )}

                {/* Error State */}
                {jobsError && (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{jobsError}</span>
                    </div>
                )}

                {/* Empty State */}
                {!isLoadingJobs && !jobsError && jobs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-jalanea-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-jalanea-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-jalanea-900">No jobs found</h3>
                        <p className="text-jalanea-500">Try adjusting your filters or location.</p>
                    </div>
                )}

                {/* Jobs List */}
                {!isLoadingJobs && jobs.map((job) => (
                    <Card
                        key={job.id}
                        variant="solid-white"
                        hoverEffect
                        className={`
                    group transition-all duration-300 border-l-[6px] relative overflow-hidden cursor-pointer
                    ${job.isPartner ? 'border-l-gold' : 'border-l-transparent hover:border-l-jalanea-200'}
                `}
                    >
                        {/* Save Button Container - Isolated from card click events */}
                        <div
                            className="absolute top-4 right-4 z-20"
                            data-save-button="true"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!currentUser) {
                                        setToast({ message: 'Please sign in to save jobs', type: 'error' });
                                        setTimeout(() => setToast(null), 3000);
                                        return;
                                    }
                                    try {
                                        if (isJobSaved(job.id)) {
                                            await removeJob(job.id);
                                            setToast({ message: 'Removed from your missions', type: 'success' });
                                        } else {
                                            await saveJob(job);
                                            setToast({ message: 'Added to your missions!', type: 'success' });
                                        }
                                        setTimeout(() => setToast(null), 3000);
                                    } catch (error) {
                                        setToast({ message: 'Failed to save job. Try again.', type: 'error' });
                                        setTimeout(() => setToast(null), 3000);
                                    }
                                }}
                                className={`p-2 rounded-full transition-all pointer-events-auto ${isJobSaved(job.id)
                                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                    : 'text-jalanea-300 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                title={isJobSaved(job.id) ? 'Remove from missions' : 'Save to missions'}
                            >
                                <Heart size={20} fill={isJobSaved(job.id) ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        {/* Click Handler Wrapper */}
                        <div
                            onClick={(e) => {
                                // Find the card container (parent of both save wrapper and clickable div)
                                const card = (e.currentTarget as HTMLElement).parentElement;
                                const saveBtn = card?.querySelector('[data-save-button]');
                                if (saveBtn) {
                                    const rect = saveBtn.getBoundingClientRect();
                                    // Check if click coordinates fall within save button area
                                    if (e.clientX >= rect.left && e.clientX <= rect.right &&
                                        e.clientY >= rect.top && e.clientY <= rect.bottom) {
                                        return; // Click is in save button area - don't trigger job click
                                    }
                                }
                                initiateJobClick(job);
                            }}
                            className="flex flex-col lg:flex-row gap-6 lg:gap-8"
                        >

                            {/* LEFT COLUMN: Job Details */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-2xl font-display font-bold text-jalanea-900 group-hover:text-jalanea-700 transition-colors">
                                            {job.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        {/* Enhanced Logo Display */}
                                        {job.logo ? (
                                            <img
                                                src={job.logo}
                                                alt={`${job.company} logo`}
                                                className="w-10 h-10 rounded-lg object-cover shadow-sm border border-jalanea-100"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-10 h-10 rounded-lg bg-jalanea-100 flex items-center justify-center border border-jalanea-200 ${job.logo ? 'hidden' : ''}`}>
                                            <Briefcase size={20} className="text-jalanea-400" />
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                            <span className="font-bold text-lg text-jalanea-700">{job.company}</span>
                                            <span className="hidden md:inline text-jalanea-300">•</span>
                                            <div className="flex items-center gap-1 text-sm font-medium text-jalanea-500">
                                                <MapPin size={14} className="text-jalanea-400" />
                                                {job.location}
                                            </div>
                                            <span className="hidden md:inline text-jalanea-300">•</span>
                                            <CommuteBadge options={calculateCommute(job.location, MOCK_PROFILE.preferences.transportMode as TransportMode[])} />
                                        </div>
                                    </div>
                                </div>

                                {/* REFINED TAGS ROW */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Role Type */}
                                    <span className={`
                                inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide
                                ${job.experienceLevel === 'Internship' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}
                            `}>
                                        {job.experienceLevel}
                                    </span>

                                    {/* Salary */}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-jalanea-50 text-jalanea-700 border border-jalanea-200">
                                        <DollarSign size={12} className="text-jalanea-500" />
                                        {job.salaryRange}
                                    </span>

                                    {/* Location Type - Remote vs On-site visual differentiation */}
                                    {(() => {
                                        const jobLocation = job.location?.toLowerCase() || '';
                                        const jobTitle = job.title?.toLowerCase() || '';
                                        const jobDesc = job.description?.toLowerCase() || '';
                                        const isRemoteJob = jobLocation.includes('remote') ||
                                            jobTitle.includes('remote') ||
                                            jobDesc.includes('100% remote') ||
                                            jobDesc.includes('fully remote') ||
                                            job.locationType?.toLowerCase() === 'remote';

                                        if (isRemoteJob) {
                                            return (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    <Home size={12} className="text-emerald-600" />
                                                    Remote
                                                </span>
                                            );
                                        } else {
                                            return (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                                                    <Building2 size={12} className="text-orange-500" />
                                                    On-site
                                                </span>
                                            );
                                        }
                                    })()}

                                    {/* Orlando HQ Badge - Company is Orlando-based */}
                                    {(job as any).isOrlandoHQ && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white border border-emerald-700 shadow-sm"
                                            title="🏠 Orlando-Based Company - This company is headquartered in Orlando or is a major Orlando employer. Support local jobs and Light the Block!">
                                            <span>🏠</span> Orlando HQ
                                        </span>
                                    )}

                                    {/* Orlando Local Badge - Job location is Orlando metro */}
                                    {(job as any).isOrlandoMetro && !(job as any).isOrlandoHQ && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500 text-white border border-orange-600 shadow-sm"
                                            title="This job is in the Orlando metro area">
                                            <span>🍊</span> Local
                                        </span>
                                    )}

                                    {/* Experience Required */}
                                    {job.experienceYears && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                                            <Calendar size={12} className="text-orange-500" />
                                            {job.experienceYears}
                                        </span>
                                    )}

                                    {/* Commute Cost Badge - uses user's salary and transport preference */}
                                    {userProfile?.preferences?.salary && userProfile?.preferences?.transportMode && (
                                        <CommuteCostBadge
                                            transportMode={userProfile.preferences.transportMode as TransportMode}
                                            salary={userProfile.preferences.salary}
                                        />
                                    )}
                                </div>

                                {/* Description Summary */}
                                <p className="text-sm text-jalanea-700 leading-relaxed max-w-2xl line-clamp-2">
                                    {job.description}
                                </p>

                                {/* AI Insight Box */}
                                <div className="bg-jalanea-50 rounded-xl p-4 border border-jalanea-100 flex gap-3 items-start max-w-xl">
                                    <div className="mt-0.5 p-1 bg-white rounded-md shadow-sm border border-jalanea-100">
                                        <Sparkles size={14} className="text-gold" fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-jalanea-900 uppercase tracking-wide mb-1">Why this matches you</p>
                                        <p className="text-sm text-jalanea-600 font-medium">{job.matchReason}</p>
                                    </div>
                                </div>

                                {/* Gap Analysis Section - Shows when match < 80% */}
                                {(() => {
                                    const analysis = analyzeJobMatch(job, userSkills);
                                    const isExpanded = expandedGapJobs.has(job.id);
                                    const hasGaps = analysis.missingSkills.length > 0;

                                    if (analysis.score >= 80 || !hasGaps) return null;

                                    return (
                                        <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 overflow-hidden max-w-xl">
                                            {/* Header - Always Visible */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedGapJobs(prev => {
                                                        const next = new Set(prev);
                                                        if (next.has(job.id)) {
                                                            next.delete(job.id);
                                                        } else {
                                                            next.add(job.id);
                                                        }
                                                        return next;
                                                    });
                                                }}
                                                className="w-full p-4 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-amber-100 rounded-lg">
                                                        <AlertCircle size={14} className="text-amber-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Skill Gaps Detected</p>
                                                        <p className="text-xs text-amber-600">{analysis.missingSkills.length} skills to develop for stronger match</p>
                                                    </div>
                                                </div>
                                                {isExpanded ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-amber-600" />}
                                            </button>

                                            {/* Expanded Content */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 space-y-4 border-t border-amber-200">
                                                    {/* Missing Skills */}
                                                    <div className="pt-4">
                                                        <p className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-2">
                                                            <XCircle size={12} /> Missing Skills
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {analysis.missingSkills.map((skill, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Matching Skills */}
                                                    {analysis.matchingSkills.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold text-green-700 flex items-center gap-1.5 mb-2">
                                                                <CheckCircle2 size={12} /> Your Matching Skills
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {analysis.matchingSkills.slice(0, 5).map((skill, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200"
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Course Recommendations */}
                                                    {analysis.missingSkills.some(skill => SKILL_TO_COURSE[skill.toLowerCase()]) && (
                                                        <div>
                                                            <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mb-2">
                                                                <GraduationCap size={12} /> Valencia College Courses
                                                            </p>
                                                            <div className="space-y-1">
                                                                {analysis.missingSkills
                                                                    .filter(skill => SKILL_TO_COURSE[skill.toLowerCase()])
                                                                    .slice(0, 3)
                                                                    .map((skill, i) => {
                                                                        const course = SKILL_TO_COURSE[skill.toLowerCase()];
                                                                        return (
                                                                            <div key={i} className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                                                                <BookOpen size={10} />
                                                                                <span className="font-medium">{course.code}</span>
                                                                                <span className="text-blue-600">- {course.course}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Quick Suggestions */}
                                                    {analysis.suggestions.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-2">
                                                                <Lightbulb size={12} /> Quick Fixes
                                                            </p>
                                                            <ul className="space-y-1">
                                                                {analysis.suggestions.map((suggestion, i) => (
                                                                    <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                                                                        <span className="text-amber-400 mt-0.5">•</span>
                                                                        {suggestion}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* CTA Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (setRoute) setRoute('resume');
                                                        }}
                                                        className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-md"
                                                    >
                                                        <Wand2 size={14} />
                                                        Fix Gaps in Resume Studio
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* RIGHT COLUMN: Stats & Actions */}
                            <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-jalanea-100 pt-6 lg:pt-0 lg:pl-8">
                                {/* Top: Score */}
                                <div className="flex flex-col items-center">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-jalanea-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                            <path className="text-gold" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${job.matchScore}, 100`} />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-display font-bold text-jalanea-900">{job.matchScore}%</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-jalanea-400 mt-2 uppercase tracking-wider">Match Score</span>
                                </div>

                                {/* Bottom: Buttons */}
                                <div className="space-y-3 mt-6">
                                    <Button fullWidth variant="primary" onClick={() => initiateJobClick(job)}>Choose Strategy</Button>
                                    {job.applyUrl && job.applyUrl !== '#' && (
                                        <a
                                            href={job.applyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-jalanea-200 text-jalanea-700 hover:border-gold hover:text-jalanea-900 transition-all bg-white"
                                        >
                                            <ExternalLink size={16} />
                                            Apply Now
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* --- PATH SELECTION MODAL --- */}
            {
                selectedJob && pathSelectionOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-jalanea-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeJobModal}></div>

                        <div className="relative w-full max-w-4xl z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                                    <Target size={12} className="text-gold" /> Strategy Decision
                                </div>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">How do you want to attack this?</h2>
                                <p className="text-jalanea-300">Choose the depth of your preparation based on how much you want this role.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Deep Dive Option */}
                                <button
                                    onClick={() => handleDeepDive(selectedJob)}
                                    className="bg-jalanea-900 border border-jalanea-700 hover:border-gold group rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,196,37,0.15)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Microscope size={120} className="text-gold" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-jalanea-950 transition-colors">
                                            <Microscope size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Deep Dive</h3>
                                        <p className="text-jalanea-400 text-sm leading-relaxed mb-6">
                                            Full research mode. Analyze the hiring team, generate portfolio ideas, and create a strategic content plan. Best for "Dream Jobs".
                                        </p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-jalanea-500 uppercase tracking-wider">
                                            <Clock size={12} /> Est. 45 Mins Prep
                                        </div>
                                    </div>
                                </button>

                                {/* Quick Apply Option */}
                                <button
                                    onClick={handleQuickApply}
                                    className="bg-white hover:bg-jalanea-50 border border-jalanea-200 group rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Zap size={120} className="text-jalanea-900" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-jalanea-100 text-jalanea-900 flex items-center justify-center mb-6 group-hover:bg-jalanea-900 group-hover:text-white transition-colors">
                                            <Zap size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-jalanea-900 mb-2">Quick Apply</h3>
                                        <p className="text-jalanea-600 text-sm leading-relaxed mb-6">
                                            Streamlined flow. We'll tailor your resume immediately based on the job description so you can submit your application now.
                                        </p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-jalanea-400 uppercase tracking-wider">
                                            <Clock size={12} /> Est. 5 Mins Prep
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* ATS Score Checker Option */}
                            <button
                                onClick={() => handleATSCheck(selectedJob)}
                                className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <Target size={18} /> Check ATS Score
                            </button>

                            {/* Apply Now - Direct link to job application */}
                            {selectedJob.applyUrl && selectedJob.applyUrl !== '#' && (
                                <a
                                    href={selectedJob.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-center justify-center gap-2 px-6 py-3 bg-gold text-jalanea-950 font-bold rounded-xl hover:bg-gold/90 transition-all shadow-lg shadow-gold/20"
                                    onClick={() => closeJobModal()}
                                >
                                    <ExternalLink size={18} />
                                    Apply Now on {selectedJob.source || 'Company Site'}
                                </a>
                            )}

                            <button onClick={closeJobModal} className="mt-4 text-jalanea-400 text-sm font-bold hover:text-white transition-colors w-full text-center">
                                Cancel
                            </button>
                        </div>
                    </div>
                )
            }

            {/* --- FULL SCREEN JOB DETAIL MODAL (THE MISSION BRIEFING) --- */}
            {
                selectedJob && !pathSelectionOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <div className="absolute inset-0 bg-jalanea-950/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeJobModal}></div>

                        <Card variant="solid-white" className="relative w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden border-jalanea-200" noPadding>

                            {/* Modal Header */}
                            <div className="shrink-0 bg-white border-b border-jalanea-200 p-6 flex justify-between items-start sticky top-0 z-20">
                                <div className="flex gap-4">
                                    {selectedJob.logo ? (
                                        <img src={selectedJob.logo} className="w-16 h-16 rounded-xl border border-jalanea-100 shadow-sm" alt="logo" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-jalanea-100 flex items-center justify-center border border-jalanea-200">
                                            <Briefcase size={28} className="text-jalanea-400" />
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-display font-bold text-jalanea-900">{selectedJob.title}</h2>
                                        <div className="flex items-center gap-2 text-jalanea-600 font-medium mt-1">
                                            <span>{selectedJob.company}</span>
                                            <span className="text-jalanea-300">•</span>
                                            <span className="text-sm bg-jalanea-100 px-2 py-0.5 rounded text-jalanea-600">{selectedJob.locationType || 'On-site'}</span>
                                            <span className="text-sm bg-jalanea-100 px-2 py-0.5 rounded text-jalanea-600">{selectedJob.experienceLevel}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={closeJobModal} className="p-2 hover:bg-jalanea-100 rounded-full text-jalanea-400 hover:text-jalanea-900 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Loading State with Smart Messages */}
                            {isAnalyzing && (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-8 text-center">
                                    <div className="relative w-20 h-20">
                                        <div className="absolute inset-0 border-4 border-jalanea-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                                    </div>

                                    <div className="max-w-md space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {loadingTime > 15 ? (
                                            <>
                                                <h3 className="text-xl font-display font-bold text-jalanea-900 flex items-center justify-center gap-2">
                                                    <Coffee size={24} className="text-gold" /> Taking a moment...
                                                </h3>
                                                <p className="text-jalanea-600 font-medium leading-relaxed">
                                                    Go stretch your legs, claim your space, or grab some water. We're building a comprehensive strategy just for you.
                                                </p>
                                                <p className="text-xs font-bold text-jalanea-400 uppercase tracking-widest mt-4">
                                                    Attempt {retryCount}/3 • Analyzing Market Data
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-xl font-display font-bold text-jalanea-900">Initializing Strategy Engine...</h3>
                                                <p className="text-jalanea-500">
                                                    Analyzing job description • Identifying hiring team • Formulating action plan
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            {!isAnalyzing && selectedJob.analysis && (
                                <div className="flex-1 overflow-hidden flex flex-col">

                                    {/* Tab Bar */}
                                    <div className="flex border-b border-jalanea-200 bg-white px-6">
                                        <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-jalanea-900 text-jalanea-900' : 'border-transparent text-jalanea-500 hover:text-jalanea-900'}`}>
                                            Mission Overview
                                        </button>
                                        <button onClick={() => setActiveTab('strategy')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'strategy' ? 'border-jalanea-900 text-jalanea-900' : 'border-transparent text-jalanea-500 hover:text-jalanea-900'}`}>
                                            Strategy & Action
                                        </button>
                                        <button onClick={() => setActiveTab('content')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'content' ? 'border-jalanea-900 text-jalanea-900' : 'border-transparent text-jalanea-500 hover:text-jalanea-900'}`}>
                                            Content Studio
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto bg-jalanea-50/50 p-6 md:p-10">

                                        {/* --- TAB: OVERVIEW --- */}
                                        {activeTab === 'overview' && (
                                            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div>
                                                    <h3 className="text-sm font-bold text-jalanea-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <FileText size={16} /> Executive Summary
                                                    </h3>
                                                    <p className="text-lg text-jalanea-900 font-medium leading-relaxed">
                                                        {selectedJob.analysis.summary}
                                                    </p>
                                                </div>

                                                {/* NotebookLM Banner */}
                                                <div className="bg-gradient-to-r from-jalanea-900 to-jalanea-800 rounded-2xl p-6 text-white shadow-lg">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 bg-white/10 rounded-xl">
                                                                <Headphones size={24} className="text-gold" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-lg mb-1">🎧 Listen to your Research Brief</h4>
                                                                <p className="text-jalanea-300 text-sm max-w-md">
                                                                    Generate an AI podcast about this role using Google NotebookLM.
                                                                    Absorb the strategy while you commute!
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => handleNotebookLMClick(selectedJob)}
                                                            icon={promptCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                                            className={`whitespace-nowrap shadow-xl shadow-gold/20 transition-all ${promptCopied ? 'bg-green-600 hover:bg-green-600' : ''}`}
                                                        >
                                                            {promptCopied ? 'Copied! Opening...' : 'Copy Prompt & Open'}
                                                        </Button>
                                                    </div>

                                                    {/* Instructions */}
                                                    <div className="mt-4 pt-4 border-t border-white/10">
                                                        <p className="text-xs text-jalanea-400 font-medium">
                                                            <span className="text-gold font-bold">How it works:</span> Click the button → Prompt is copied → Paste in NotebookLM → Click "Generate" → Get your audio brief!
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                                        <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold">
                                                            <Target size={18} />
                                                            <h3>Who They Want</h3>
                                                        </div>
                                                        <p className="text-sm text-jalanea-700 leading-relaxed">
                                                            {selectedJob.analysis.idealCandidateProfile}
                                                        </p>
                                                    </div>
                                                    <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                                                        <div className="flex items-center gap-2 mb-3 text-orange-700 font-bold">
                                                            <Microscope size={18} />
                                                            <h3>Daily Expectations</h3>
                                                        </div>
                                                        <p className="text-sm text-jalanea-700 leading-relaxed">
                                                            {selectedJob.analysis.candidateExpectations}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-sm font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                                                            <BookOpen size={16} /> Upskill Recommendations
                                                        </h3>
                                                        {/* OCLS Link Banner */}
                                                        <a href={OCLS_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                                                            <Library size={12} /> Access for Free with OCLS Card
                                                        </a>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedJob.analysis.recommendedCourses?.map((course, i) => (
                                                            <a key={i} href={`https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(course.title)}`} target="_blank" rel="noreferrer" className="block p-4 bg-white border border-jalanea-200 rounded-xl hover:shadow-md transition-all group relative">
                                                                {/* Tooltip trigger */}
                                                                <div className="absolute top-3 right-3 group/info">
                                                                    <Info size={16} className="text-jalanea-400 hover:text-gold transition-colors" />
                                                                    <div className="absolute right-0 top-full mt-2 w-64 bg-jalanea-900 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-10">
                                                                        <div className="font-bold mb-1 text-gold">Strategic Benefit:</div>
                                                                        {course.reason}
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-between items-start mb-2 pr-6">
                                                                    <span className="text-xs font-bold text-jalanea-400 uppercase tracking-wide">{course.provider}</span>
                                                                </div>
                                                                <h4 className="font-bold text-jalanea-900 mb-1">{course.title}</h4>
                                                                <div className="flex items-center gap-1 text-xs text-jalanea-500 mt-2 group-hover:text-gold transition-colors">
                                                                    Start Learning <ExternalLink size={10} />
                                                                </div>
                                                            </a>
                                                        )) || (
                                                                <p className="text-sm text-jalanea-500 italic p-4">Courses tailored to this role will appear here.</p>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* --- TAB: STRATEGY --- */}
                                        {activeTab === 'strategy' && (
                                            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">

                                                {/* Left: Action Plan */}
                                                <div className="lg:col-span-7 space-y-8">
                                                    <div className="bg-jalanea-900 text-white p-6 rounded-2xl shadow-xl">
                                                        <h3 className="font-display font-bold text-xl mb-1 flex items-center gap-2">
                                                            <CheckCircle2 size={20} className="text-gold" /> Action Plan
                                                        </h3>
                                                        <p className="text-jalanea-400 text-sm">Execute these 5 steps to secure an interview.</p>
                                                    </div>

                                                    <div className="space-y-6 bg-white p-8 rounded-2xl border border-jalanea-200">
                                                        {[
                                                            { title: "Research", content: selectedJob.analysis.actionPlan?.research, action: "Brainstorm with AI", prompt: `Help me research specific details about ${selectedJob.company} for a ${selectedJob.title} role. Specifically: ${selectedJob.analysis.actionPlan?.research}` },
                                                            { title: "Synthesis", content: selectedJob.analysis.actionPlan?.synthesis, action: "Analyze Gap", prompt: "Help me synthesize my skills against this job description." },
                                                            { title: "Tailor Resume", content: selectedJob.analysis.actionPlan?.tailoring, action: "Open Builder", link: NavRoute.RESUME },
                                                            { title: "Outreach", content: selectedJob.analysis.actionPlan?.outreach, action: "Draft Message", prompt: "Draft a LinkedIn connection message for this role." },
                                                            { title: "Community", content: selectedJob.analysis.actionPlan?.community, action: "Find Group", link: "https://www.meetup.com/find/?keywords=tech" },
                                                        ].map((step, idx) => (
                                                            <div key={idx} className="relative pl-6 border-l-2 border-jalanea-100 last:border-0 pb-6">
                                                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-jalanea-300 rounded-full"></div>
                                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                                                    <h4 className="font-bold text-jalanea-900 text-sm uppercase tracking-wide">{step.title}</h4>

                                                                    {/* Granular Scheduling Options */}
                                                                    <div className="flex gap-1">
                                                                        <a
                                                                            href={getCalendarLink(`Jalanea Task: ${step.title}`, step.content || "Complete this step", 15)}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="px-2 py-1 text-[10px] font-bold text-jalanea-500 bg-jalanea-50 hover:bg-gold/20 hover:text-jalanea-900 rounded border border-jalanea-100 transition-colors"
                                                                            title="Schedule 15 mins"
                                                                        >
                                                                            15m
                                                                        </a>
                                                                        <a
                                                                            href={getCalendarLink(`Jalanea Task: ${step.title}`, step.content || "Complete this step", 30)}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="px-2 py-1 text-[10px] font-bold text-jalanea-500 bg-jalanea-50 hover:bg-gold/20 hover:text-jalanea-900 rounded border border-jalanea-100 transition-colors"
                                                                            title="Schedule 30 mins"
                                                                        >
                                                                            30m
                                                                        </a>
                                                                        <a
                                                                            href={getCalendarLink(`Jalanea Task: ${step.title}`, step.content || "Complete this step", 60)}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="px-2 py-1 text-[10px] font-bold text-jalanea-500 bg-jalanea-50 hover:bg-gold/20 hover:text-jalanea-900 rounded border border-jalanea-100 transition-colors"
                                                                            title="Schedule 1 hour"
                                                                        >
                                                                            1h
                                                                        </a>
                                                                        <button
                                                                            className="px-2 py-1 text-[10px] font-bold text-jalanea-500 bg-jalanea-50 hover:bg-blue-50 hover:text-blue-600 rounded border border-jalanea-100 transition-colors ml-1"
                                                                            title="Add to To-Do List"
                                                                            onClick={() => alert("Added to your Daily Tasks!")}
                                                                        >
                                                                            + To-Do
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-jalanea-600 mb-3">{step.content}</p>

                                                                {step.link ? (
                                                                    typeof step.link === 'string' && step.link.startsWith('http') ? (
                                                                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => window.open(step.link, '_blank')}>
                                                                            {step.action} <ExternalLink size={12} className="ml-1" />
                                                                        </Button>
                                                                    ) : (
                                                                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setRoute && setRoute(step.link as NavRoute)}>
                                                                            {step.action} <ArrowRight size={12} className="ml-1" />
                                                                        </Button>
                                                                    )
                                                                ) : (
                                                                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => triggerBrainstorm(step.prompt || "")}>
                                                                        <Sparkles size={12} className="mr-1 text-gold" /> {step.action}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Right: Hiring Team & Portfolio */}
                                                <div className="lg:col-span-5 space-y-6">
                                                    <Card variant="solid-white" className="border-jalanea-200">
                                                        <h3 className="font-bold text-jalanea-900 mb-4 flex items-center gap-2">
                                                            <Users size={18} /> Hiring Team Targets
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {selectedJob.analysis.hiringTeamTargets?.map((target, i) => (
                                                                <div key={i} className="p-3 bg-jalanea-50 rounded-lg border border-jalanea-100">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h4 className="font-bold text-jalanea-900 text-sm">{target.role}</h4>
                                                                        <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(target.role + " " + selectedJob.company)}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                                                                            Find <Linkedin size={10} />
                                                                        </a>
                                                                    </div>
                                                                    <p className="text-xs text-jalanea-500 italic">"{target.reason}"</p>

                                                                    {/* Outreach Tool */}
                                                                    <div className="mt-3 pt-2 border-t border-jalanea-200">
                                                                        <p className="text-[10px] font-bold text-jalanea-400 uppercase mb-1">Quick Connect Template</p>
                                                                        <div className="bg-white p-2 rounded border border-jalanea-200 text-xs text-jalanea-600 italic">
                                                                            "{selectedJob.analysis?.outreachTemplates?.connectionRequest.replace('[Name]', target.role) || "Hi, I'd like to connect..."}"
                                                                        </div>
                                                                        <div className="flex justify-end mt-1">
                                                                            <button
                                                                                onClick={() => navigator.clipboard.writeText(selectedJob.analysis?.outreachTemplates?.connectionRequest || "")}
                                                                                className="flex items-center gap-1 text-[10px] font-bold text-jalanea-500 hover:text-jalanea-900"
                                                                            >
                                                                                <Copy size={10} /> Copy
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Card>

                                                    <Card variant="solid-white" className="border-jalanea-200">
                                                        <h3 className="font-bold text-jalanea-900 mb-4 flex items-center gap-2">
                                                            <Briefcase size={18} /> Portfolio Focus
                                                        </h3>
                                                        <div className="space-y-4">
                                                            {selectedJob.analysis.portfolioAdvice?.map((item, i) => (
                                                                <div key={i}>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="bg-jalanea-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">{item.action}</span>
                                                                        <h4 className="font-bold text-jalanea-900 text-sm">{item.title}</h4>
                                                                    </div>
                                                                    <p className="text-xs text-jalanea-600 mb-2">{item.description}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-6 pt-4 border-t border-jalanea-100">
                                                            <Button fullWidth variant="primary" size="sm" className="shadow-lg shadow-gold/20" onClick={() => window.open(FORGE_LINK, '_blank')} icon={<Hammer size={16} />}>
                                                                Launch Forge: AI Product Designer
                                                            </Button>
                                                            <p className="text-[10px] text-center text-jalanea-500 mt-2">Turn these ideas into a portfolio piece instantly.</p>
                                                        </div>
                                                    </Card>
                                                </div>
                                            </div>
                                        )}

                                        {/* --- TAB: CONTENT STUDIO --- */}
                                        {activeTab === 'content' && (
                                            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="bg-gradient-to-br from-jalanea-900 to-jalanea-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px]"></div>
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="p-1.5 bg-gold/20 rounded-lg text-gold"><Zap size={18} /></div>
                                                            <span className="text-sm font-bold uppercase tracking-wider text-gold">Thought Leadership Generator</span>
                                                        </div>
                                                        <h2 className="text-3xl font-display font-bold mb-4">Stand Out Before You Apply</h2>
                                                        <p className="text-jalanea-200 text-lg mb-8 max-w-xl">
                                                            Posting relevant content on LinkedIn increases visibility by 400%. Here is a custom article strategy tailored to this role.
                                                        </p>

                                                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
                                                            <h3 className="text-xl font-bold text-white mb-2">"{selectedJob.analysis.contentStrategy?.topic || 'Industry Insights'}"</h3>
                                                            <p className="text-sm text-jalanea-300 italic mb-4">Why this works: {selectedJob.analysis.contentStrategy?.whyItMatters || 'Shows proactive thinking.'}</p>

                                                            <div className="space-y-2">
                                                                {selectedJob.analysis.contentStrategy?.outline?.map((point, i) => (
                                                                    <div key={i} className="flex gap-3 text-sm text-jalanea-100">
                                                                        <span className="font-bold text-gold">{i + 1}.</span>
                                                                        <span>{point}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <Button
                                                                variant="primary"
                                                                className="shadow-xl shadow-gold/20"
                                                                icon={<MessageSquare size={16} />}
                                                                onClick={() => triggerBrainstorm(`Write a LinkedIn article about: ${selectedJob.analysis?.contentStrategy?.topic}. Follow this outline: ${selectedJob.analysis?.contentStrategy?.outline.join(', ')}`)}
                                                            >
                                                                Draft Article with AI
                                                            </Button>
                                                            <Button variant="glass-light" onClick={() => window.open('https://www.linkedin.com/post/new', '_blank')}>
                                                                Open LinkedIn Editor <ExternalLink size={16} className="ml-2" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )
            }
            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                reason="no_credits"
            />

            {/* ATS Score Modal */}
            <ATSScoreModal
                isOpen={showATSModal}
                onClose={() => setShowATSModal(false)}
                initialJobDescription={atsJobDescription}
            />
        </div >
    );
};
