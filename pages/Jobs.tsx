import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { generateJobIntel } from '../services/geminiService';
import { searchJobs } from '../services/jobService';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Filter, MapPin, Sparkles, FileText,
    GraduationCap, Clock, Zap, Heart, X,
    Users, TrendingUp, Wand2, Briefcase, DollarSign, Calendar,
    ArrowRight, CheckCircle2, UserPlus, Target, Microscope, Share2, Linkedin,
    BookOpen, MessageSquare, ExternalLink, Mail, Copy, CalendarPlus,
    Library, Hammer, RefreshCw, Coffee, Car, Bus, Bike, Footprints, Info, Headphones, AlertCircle, Loader2
} from 'lucide-react';
import { NavRoute, Job, JobAnalysis, TransportMode } from '../types';
import { MOCK_PROFILE } from './Profile';

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

export const Jobs: React.FC<JobsProps> = ({ setRoute }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [pathSelectionOpen, setPathSelectionOpen] = useState(false); // Controls the "Path Choice" modal
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'content'>('overview');

    // Real job data state
    const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [jobsError, setJobsError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

    // Auth context for user profile
    const { userProfile } = useAuth();

    // Loading State Tracking
    const [loadingTime, setLoadingTime] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch jobs on mount and when search changes
    const fetchJobs = async (query?: string, location?: string) => {
        setIsLoadingJobs(true);
        setJobsError(null);

        try {
            // Build search query from user profile or custom search
            const searchTerms = query ||
                (userProfile?.preferences?.targetRoles?.join(' OR ') || 'entry level designer');
            const userLocation = location || userProfile?.location || 'Orlando, FL';
            const transportMode = (MOCK_PROFILE.preferences?.transportMode?.[0] || 'Car') as TransportMode;

            console.log('🔍 Searching jobs:', { searchTerms, userLocation });

            const response = await searchJobs(searchTerms, {
                location: userLocation,
                userLocation: userLocation,
                transportMode: transportMode,
            });

            if (response.jobs && response.jobs.length > 0) {
                // Add match scores based on user skills
                const userSkills = [
                    ...(MOCK_PROFILE.skills?.technical || []),
                    ...(MOCK_PROFILE.skills?.design || []),
                ];

                const jobsWithScores = response.jobs.map(job => ({
                    ...job,
                    matchScore: job.matchScore || calculateQuickMatchScore(job, userSkills),
                    matchReason: job.matchReason || generateMatchReason(job, userSkills),
                }));

                setJobs(jobsWithScores);
                console.log(`✅ Loaded ${jobsWithScores.length} real jobs`);
            } else {
                console.log('⚠️ No jobs found, using mock data');
                setJobs(MOCK_JOBS);
            }
        } catch (error) {
            console.error('❌ Job search error:', error);
            setJobsError('Unable to fetch live jobs. Showing cached results.');
            setJobs(MOCK_JOBS);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    // Quick match score calculation
    const calculateQuickMatchScore = (job: Job, userSkills: string[]): number => {
        const description = (job.description || '').toLowerCase();
        const matchingSkills = userSkills.filter(skill =>
            description.includes(skill.toLowerCase())
        );
        const baseScore = 70;
        const skillBonus = Math.min(matchingSkills.length * 8, 25);
        return Math.min(baseScore + skillBonus + Math.floor(Math.random() * 5), 99);
    };

    // Generate match reason
    const generateMatchReason = (job: Job, userSkills: string[]): string => {
        const description = (job.description || '').toLowerCase();
        const matchingSkills = userSkills.filter(skill =>
            description.includes(skill.toLowerCase())
        );
        if (matchingSkills.length > 0) {
            return `Matches your ${matchingSkills.slice(0, 2).join(' & ')} skills`;
        }
        return 'Good fit for your experience level';
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchJobs();
    }, [userProfile]);

    const handleSearch = () => {
        setIsSearching(true);
        fetchJobs(searchQuery || undefined, searchLocation || undefined).finally(() => {
            setIsSearching(false);
        });
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

    const aiFilters = [
        { label: "💰 Salary $50k+", id: "salary" },
        { label: "🏠 Remote / Hybrid", id: "remote" },
        { label: "⚡ Easy Apply", id: "easy" },
        { label: "📝 No Cover Letter", id: "nocover" }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 relative">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 px-1">
                <div>
                    <h1 className="text-3xl font-display font-bold text-jalanea-900">Explore Jobs</h1>
                    <p className="text-jalanea-600 font-medium mt-1 text-lg">
                        Your daily goal: <span className="font-bold text-jalanea-900">3 applications</span>. We've found the best matches.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-jalanea-500 bg-white px-4 py-2 rounded-xl border border-jalanea-200 shadow-sm">
                    <Clock size={18} className="text-gold" />
                    <span>Reset in: <span className="text-jalanea-900 tabular-nums">4h 12m</span></span>
                </div>
            </div>

            {/* Sticky Search & Filter Bar */}
            <div className="sticky top-0 z-20 -mx-4 px-4 md:-mx-8 md:px-8 py-4 bg-jalanea-50/95 backdrop-blur-md border-b border-white/10 transition-all shadow-sm">
                <div className="max-w-7xl mx-auto space-y-4">
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
                            <Button variant="secondary" icon={<Filter size={18} />} className="bg-jalanea-900 text-white border-jalanea-800 hover:bg-jalanea-800">
                                Filters
                            </Button>
                            <Button variant="primary" icon={<Sparkles size={16} />} onClick={handleSearch} isLoading={isSearching} className="whitespace-nowrap">
                                AI Search
                            </Button>
                        </div>
                    </div>
                    {/* AI Suggested Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <span className="text-xs font-bold text-jalanea-400 uppercase tracking-wider mr-2 shrink-0">AI Suggestions:</span>
                        {aiFilters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
                                className={`
                            whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                            ${activeFilter === filter.id
                                        ? 'bg-jalanea-900 text-white border-jalanea-900'
                                        : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-gold hover:text-jalanea-900'}
                        `}
                            >
                                {filter.label}
                            </button>
                        ))}
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
                        {/* Click Handler Wrapper */}
                        <div onClick={() => initiateJobClick(job)} className="flex flex-col lg:flex-row gap-6 lg:gap-8">

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

                                    {/* Location Type */}
                                    {job.locationType && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                            <MapPin size={12} className="text-blue-500" />
                                            {job.locationType}
                                        </span>
                                    )}

                                    {/* Experience Required */}
                                    {job.experienceYears && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                                            <Calendar size={12} className="text-orange-500" />
                                            {job.experienceYears}
                                        </span>
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
                            </div>

                            {/* RIGHT COLUMN: Stats & Actions */}
                            <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-jalanea-100 pt-6 lg:pt-0 lg:pl-8">
                                {/* Top: Score */}
                                <div className="flex justify-between items-start">
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
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); }} className="p-2 text-jalanea-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                            <Heart size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom: Buttons */}
                                <div className="space-y-3 mt-6">
                                    <Button fullWidth variant="primary" onClick={() => initiateJobClick(job)}>Choose Strategy</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* --- PATH SELECTION MODAL --- */}
            {selectedJob && pathSelectionOpen && (
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

                        <button onClick={closeJobModal} className="mt-8 text-jalanea-400 text-sm font-bold hover:text-white transition-colors w-full text-center">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* --- FULL SCREEN JOB DETAIL MODAL (THE MISSION BRIEFING) --- */}
            {selectedJob && !pathSelectionOpen && (
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
                                            <div className="bg-gradient-to-r from-jalanea-900 to-jalanea-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-lg">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-white/10 rounded-xl">
                                                        <Headphones size={24} className="text-gold" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg mb-1">Listen to your Research Brief</h4>
                                                        <p className="text-jalanea-300 text-sm max-w-md">
                                                            Don't just read. Generate an AI podcast about this company using Google NotebookLM to absorb the culture while you commute.
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => window.open(NOTEBOOK_LM_LINK, '_blank')}
                                                    icon={<ExternalLink size={16} />}
                                                    className="whitespace-nowrap shadow-xl shadow-gold/20"
                                                >
                                                    Generate Audio Brief
                                                </Button>
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
            )}
        </div>
    );
};
