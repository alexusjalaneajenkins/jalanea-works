import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Briefcase, ChevronRight, TrendingUp, MapPin, Zap, ArrowUpRight, CheckCircle2, Circle, ExternalLink, GraduationCap, Clock, MoreHorizontal, Sparkles, Loader2, Calendar, Target, Mail, MessageCircle } from 'lucide-react';
import { Job, TransportMode, MarketDemand, IndustryPulseItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { searchJobs } from '../services/jobService';
import { getMarketDemand } from '../services/marketDemandService';
import { generateIndustryPulse } from '../services/industryPulseService';
import { useNavigate } from 'react-router-dom';

// Skeleton Component for "Filling in the Blanks" visual
const SkeletonJobCard = () => (
    <Card variant="solid-white" className="border-l-[4px] border-l-jalanea-100 opacity-60">
        <div className="flex flex-col sm:flex-row justify-between gap-6 animate-pulse">
            <div className="flex-1 space-y-4">
                <div className="space-y-2">
                    <div className="h-6 bg-jalanea-200 rounded w-3/4"></div>
                    <div className="h-4 bg-jalanea-100 rounded w-1/2"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-6 w-20 bg-jalanea-100 rounded-full"></div>
                    <div className="h-6 w-24 bg-jalanea-100 rounded-full"></div>
                    <div className="h-6 w-16 bg-jalanea-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                    <div className="h-4 bg-jalanea-50 rounded w-full"></div>
                    <div className="h-4 bg-jalanea-50 rounded w-full"></div>
                </div>
            </div>
            <div className="hidden sm:flex flex-col items-center justify-center pl-6 border-l border-jalanea-100 min-w-[100px]">
                <div className="w-14 h-14 rounded-full border-4 border-jalanea-100"></div>
                <div className="h-3 w-12 bg-jalanea-100 rounded mt-2"></div>
            </div>
        </div>
    </Card>
);

// Active Application Tracker - Shows real applications or empty state
const ActiveTracker = ({ navigate }: { navigate: (path: string) => void }) => {
    const { userProfile } = useAuth();

    // Get applications from saved jobs (jobs with status other than 'saved')
    const apps = userProfile?.savedJobs?.filter(j => j.status !== 'saved') || [];

    // Empty state when no applications
    if (apps.length === 0) {
        return (
            <Card variant="solid-white" className="border-jalanea-200" noPadding>
                <div className="p-4 border-b border-jalanea-100 flex items-center gap-2">
                    <div className="p-1.5 bg-jalanea-900 text-white rounded-md">
                        <Target size={16} />
                    </div>
                    <h3 className="font-bold text-jalanea-900">Active Mission Control</h3>
                </div>
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-jalanea-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Briefcase size={24} className="text-jalanea-400" />
                    </div>
                    <h4 className="font-bold text-jalanea-900 mb-1">No Active Applications</h4>
                    <p className="text-sm text-jalanea-500 mb-4">
                        Start applying to jobs to track your progress here.
                    </p>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate('/jobs')}
                        icon={<ArrowUpRight size={14} />}
                    >
                        Find Jobs to Apply
                    </Button>
                </div>
            </Card>
        );
    }

    // Show real applications
    return (
        <Card variant="solid-white" className="border-jalanea-200" noPadding>
            <div className="p-4 border-b border-jalanea-100 flex items-center gap-2">
                <div className="p-1.5 bg-jalanea-900 text-white rounded-md">
                    <Target size={16} />
                </div>
                <h3 className="font-bold text-jalanea-900">Active Mission Control</h3>
                <span className="ml-auto text-xs font-bold text-jalanea-500">{apps.length} Active</span>
            </div>
            <div className="divide-y divide-jalanea-100">
                {apps.slice(0, 3).map(app => (
                    <div key={app.id} className="p-4 hover:bg-jalanea-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-jalanea-900">{app.job.company}</h4>
                                <p className="text-xs text-jalanea-500">{app.job.title} • {app.status}</p>
                            </div>
                            {app.nextActionDate && new Date(app.nextActionDate) <= new Date() && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </div>
                        {app.nextAction && (
                            <div className="bg-gold/10 border border-gold/20 rounded-lg p-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-jalanea-800 flex items-center gap-2">
                                    <Zap size={12} className="text-gold" /> {app.nextAction}
                                </span>
                                <button className="text-[10px] font-bold text-jalanea-500 hover:text-jalanea-900 uppercase">Do It</button>
                            </div>
                        )}
                    </div>
                ))}
                {apps.length > 3 && (
                    <div className="p-3 text-center">
                        <button className="text-xs font-bold text-jalanea-400 hover:text-gold transition-colors">
                            View All {apps.length} Applications
                        </button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export const Dashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New state for dynamic data
    const [marketDemand, setMarketDemand] = useState<MarketDemand | null>(null);
    const [industryPulse, setIndustryPulse] = useState<IndustryPulseItem[]>([]);
    const [isLoadingMarket, setIsLoadingMarket] = useState(true);
    const [isLoadingPulse, setIsLoadingPulse] = useState(true);

    // Fetch live jobs on mount
    useEffect(() => {
        const fetchDashboardJobs = async () => {
            setIsLoading(true);
            try {
                // Use user profile for search terms or fallback
                const searchTerms = userProfile?.preferences?.targetRoles?.join(' OR ') || 'entry level';
                const location = userProfile?.location || 'Orlando, FL';

                // Fetch just a few jobs for the dashboard
                const response = await searchJobs(searchTerms, {
                    location: location,
                    userLocation: location,
                    transportMode: (userProfile?.preferences?.transportMode?.[0] || 'Car') as TransportMode,
                });

                if (response.jobs && response.jobs.length > 0) {
                    setJobs(response.jobs.slice(0, 3)); // Only show top 3
                }
            } catch (err) {
                console.error("Dashboard job fetch failed", err);
                setError("Could not load recommendations.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardJobs();
    }, [userProfile]);

    // Fetch market demand data
    useEffect(() => {
        const fetchMarketDemand = async () => {
            if (!userProfile?.education?.[0]?.degree) {
                setIsLoadingMarket(false);
                return;
            }

            setIsLoadingMarket(true);
            try {
                const degree = userProfile.education[0].degree;
                const location = userProfile.location || 'Orlando, FL';
                const demand = await getMarketDemand(degree, location);
                setMarketDemand(demand);
            } catch (err) {
                console.error('Market demand fetch failed', err);
            } finally {
                setIsLoadingMarket(false);
            }
        };

        fetchMarketDemand();
    }, [userProfile?.education, userProfile?.location]);

    // Fetch AI-generated Industry Pulse
    useEffect(() => {
        const fetchIndustryPulse = async () => {
            if (!userProfile) {
                setIsLoadingPulse(false);
                return;
            }

            setIsLoadingPulse(true);
            try {
                const pulseItems = await generateIndustryPulse(userProfile);
                setIndustryPulse(pulseItems);
            } catch (err) {
                console.error('Industry pulse fetch failed', err);
            } finally {
                setIsLoadingPulse(false);
            }
        };

        fetchIndustryPulse();
    }, [userProfile]);

    // Derived State - use fullName (from Profile) or displayName (from Google Auth) as fallback
    const userName = userProfile?.fullName?.split(' ')[0] || userProfile?.displayName?.split(' ')[0] || 'Friend';
    const userDegree = userProfile?.education?.[0]?.degreeLevel && userProfile?.education?.[0]?.program
        ? `${userProfile.education[0].degreeLevel} ${userProfile.education[0].program}`
        : userProfile?.education?.[0]?.degree || 'Credentials';

    // Logic for Smart Schedule
    // Fallback to MOCK_PROFILE for schedule logic if userProfile is incomplete for now, 
    // or just assume standard flow.
    const isBusy = false;
    const scheduleType = isBusy ? 'Micro-Tasks' : 'Deep Work';

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-jalanea-900">Dashboard</h1>
                    <p className="text-jalanea-600 mt-2 text-lg">
                        Welcome back, {userName}. Your <span className="font-bold text-jalanea-900">{userDegree}</span> is in high demand today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-jalanea-200 text-jalanea-600 hover:border-jalanea-900 hover:text-jalanea-900" onClick={() => navigate('/profile')}>
                        Update Profile
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/jobs')}
                        icon={<Zap size={16} className="text-gold" />}
                    >
                        Find More Roles
                    </Button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: Market Demand (Dark Theme) */}
                <Card variant="solid-forest" className="relative overflow-hidden min-h-[200px] flex flex-col justify-between group">
                    {/* Abstract Graph Visual Background */}
                    <svg className="absolute bottom-0 right-0 w-48 h-32 text-white/5 pointer-events-none transform translate-y-4 translate-x-4" viewBox="0 0 100 50" preserveAspectRatio="none">
                        <path d="M0 50 L20 40 L40 45 L60 25 L80 30 L100 10 V50 Z" fill="currentColor" />
                        <path d="M0 50 L20 40 L40 45 L60 25 L80 30 L100 10" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/10 rounded-md">
                                <TrendingUp size={16} className="text-gold" />
                            </div>
                            <span className="text-xs font-bold text-jalanea-300 uppercase tracking-wider">Market Demand</span>
                        </div>
                    </div>

                    <div className="relative z-10 mt-4">
                        {isLoadingMarket ? (
                            <div className="animate-pulse">
                                <div className="h-12 bg-white/10 rounded w-24 mb-2"></div>
                                <div className="h-4 bg-white/5 rounded w-48"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-baseline gap-3">
                                    <h3 className="text-5xl font-display font-bold text-white">
                                        {marketDemand?.demandLevel || 'Moderate'}
                                    </h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${(marketDemand?.percentChange || 0) >= 0
                                        ? 'bg-gold/20 text-gold border-gold/20'
                                        : 'bg-red-500/20 text-red-400 border-red-500/20'
                                        }`}>
                                        {(marketDemand?.percentChange || 0) >= 0 ? '+' : ''}{marketDemand?.percentChange || 0}%
                                    </span>
                                </div>
                                <p className="text-sm text-jalanea-400 mt-2 font-medium">
                                    {(marketDemand?.totalOpenings || 0).toLocaleString()} US roles matching your degree.
                                </p>
                            </>
                        )}
                    </div>
                </Card>

                {/* Card 2: Applications (White Theme) */}
                <Card variant="solid-white" className="min-h-[200px] flex flex-col justify-between border-jalanea-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-jalanea-100 rounded-md">
                                <Briefcase size={16} className="text-jalanea-700" />
                            </div>
                            <span className="text-xs font-bold text-jalanea-500 uppercase tracking-wider">Applications</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
                            0 Active
                        </span>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-4xl font-display font-bold text-jalanea-900">0<span className="text-2xl text-jalanea-300">/15</span></h3>
                            <span className="text-xs font-bold text-jalanea-500 uppercase">Weekly Goal</span>
                        </div>
                        <div className="w-full bg-jalanea-100 rounded-full h-2">
                            <div className="bg-jalanea-900 h-2 rounded-full w-[0%]"></div>
                        </div>
                        <p className="text-xs text-jalanea-500 font-medium mt-3">Start applying to hit your target.</p>
                    </div>
                </Card>

                {/* Card 3: Smart Schedule (New) */}
                <Card variant="gold" className="min-h-[200px] flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-2 relative z-10">
                        <div className="p-1.5 bg-jalanea-950/10 rounded-md">
                            <Calendar size={16} className="text-jalanea-950" />
                        </div>
                        <span className="text-xs font-bold text-jalanea-950/70 uppercase tracking-wider">Daily Smart Schedule</span>
                    </div>

                    <div className="relative z-10 mt-2">
                        <h4 className="text-lg font-bold text-jalanea-950 leading-tight mb-2">
                            {scheduleType === 'Micro-Tasks' ? "15-Min Power Sprint" : "2-Hour Deep Dive"}
                        </h4>
                        <p className="text-xs text-jalanea-950/70 mb-4 font-medium">
                            {scheduleType === 'Micro-Tasks'
                                ? "We know you're busy. Use your break to apply to 1 job."
                                : "You have open blocks. Use this time for certification study."}
                        </p>
                        <Button size="sm" className="w-full bg-jalanea-950 text-white hover:bg-jalanea-800 border-none shadow-xl justify-between group" onClick={() => navigate('/schedule')}>
                            Start {scheduleType === 'Micro-Tasks' ? "Quick Apply" : "Study Session"}
                            <ArrowUpRight size={16} className="text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Job Feed */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-jalanea-900">Today's Top Matches</h2>
                        </div>
                        <button
                            onClick={() => navigate('/jobs')}
                            className="text-sm font-bold text-jalanea-500 hover:text-jalanea-900 transition-colors flex items-center gap-1"
                        >
                            View All <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Job Cards */}
                    <div className="space-y-4">
                        {isLoading && (
                            <>
                                <SkeletonJobCard />
                                <SkeletonJobCard />
                                <SkeletonJobCard />
                            </>
                        )}

                        {!isLoading && jobs.length === 0 && !error && (
                            <Card variant="glass-light" className="p-8 text-center text-jalanea-600">
                                <p>No recommendations yet. Update your profile or check the full job feed.</p>
                                <Button size="sm" variant="secondary" onClick={() => navigate('/jobs')} className="mt-4">Search Jobs</Button>
                            </Card>
                        )}

                        {!isLoading && jobs.map((job) => (
                            <Card
                                key={job.id}
                                variant="solid-white"
                                hoverEffect
                                className="group cursor-pointer border-l-[4px] border-l-transparent hover:border-l-jalanea-300 transition-all duration-300"
                                onClick={() => navigate('/jobs')} // For now, clicking takes you to jobs page where you can apply
                            >
                                <div className="flex flex-col sm:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <h3 className="text-lg font-bold text-jalanea-900 group-hover:text-jalanea-700 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {job.logo ? (
                                                        <img src={job.logo} className="w-8 h-8 rounded-lg object-cover shadow-sm border border-jalanea-100" alt="logo"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-8 h-8 rounded-lg bg-jalanea-100 flex items-center justify-center border border-jalanea-200 ${job.logo ? 'hidden' : ''}`}>
                                                        <Briefcase size={16} className="text-jalanea-400" />
                                                    </div>
                                                    <p className="text-sm font-bold text-jalanea-500 uppercase tracking-wide">{job.company}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags Row */}
                                        <div className="flex flex-wrap gap-2 mt-3 mb-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                 ${job.experienceLevel === 'Internship' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}
                              `}>
                                                {job.experienceLevel}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-jalanea-50 text-jalanea-600 border border-jalanea-100">
                                                <MapPin size={10} /> {job.location}
                                            </span>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-jalanea-600 max-w-md">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="text-jalanea-400" />
                                                <span className="font-medium">{job.salaryRange}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-jalanea-400" />
                                                <span className="font-medium">{job.postedAt}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Match Ring Visual (Desktop) */}
                                    <div className="hidden sm:flex flex-col items-center justify-center pl-6 border-l border-jalanea-100 min-w-[100px]">
                                        <div className="relative flex items-center justify-center w-14 h-14">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-jalanea-100"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                />
                                                <path
                                                    className="text-gold"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeDasharray="80, 100" // Static since match score needs deep calculation, or pass quick logic
                                                />
                                            </svg>
                                            <span className="absolute text-sm font-bold text-jalanea-900">80%</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-jalanea-400 mt-1 uppercase tracking-wider">Match</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button variant="ghost" className="text-jalanea-500 hover:text-jalanea-900" icon={<MoreHorizontal size={20} />} onClick={() => navigate('/jobs')}>
                            Load More Roles
                        </Button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Widgets */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Active Application Context Widget */}
                    <ActiveTracker navigate={navigate} />

                    {/* Industry Pulse Widget - AI Generated */}
                    <Card variant="solid-white" className="border-jalanea-200">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 rounded-md">
                                <Sparkles size={16} />
                            </div>
                            <h3 className="font-bold text-jalanea-900">Industry Pulse</h3>
                            <span className="ml-auto text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full uppercase">AI Curated</span>
                        </div>

                        <div className="space-y-3">
                            {isLoadingPulse ? (
                                <div className="animate-pulse space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-jalanea-50 rounded-xl p-3">
                                            <div className="h-4 bg-jalanea-100 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-jalanea-100 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : industryPulse.length > 0 ? (
                                industryPulse.map((item, i) => {
                                    // Get icon and color based on type
                                    const typeConfig = {
                                        news: { icon: '📰', bg: 'bg-blue-50', text: 'text-blue-600', label: 'News' },
                                        course: { icon: '📚', bg: 'bg-green-50', text: 'text-green-600', label: 'Course' },
                                        trend: { icon: '📊', bg: 'bg-orange-50', text: 'text-orange-600', label: 'Trend' },
                                    };
                                    const config = typeConfig[item.type as keyof typeof typeConfig] || typeConfig.news;

                                    return (
                                        <div
                                            key={item.id || i}
                                            className="group bg-jalanea-50/50 hover:bg-jalanea-50 rounded-xl p-3 cursor-pointer transition-all hover:shadow-sm border border-transparent hover:border-jalanea-100"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-lg">{config.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${config.bg} ${config.text}`}>
                                                            {config.label}
                                                        </span>
                                                        <span className="text-[10px] text-jalanea-400 font-medium truncate">{item.source}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-jalanea-900 group-hover:text-gold-dark transition-colors line-clamp-2">
                                                        {item.title}
                                                    </p>
                                                </div>
                                                <ExternalLink size={14} className="text-jalanea-300 group-hover:text-jalanea-600 shrink-0 mt-1 transition-colors" />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-6 text-center">
                                    <div className="w-10 h-10 bg-jalanea-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Sparkles size={18} className="text-jalanea-400" />
                                    </div>
                                    <p className="text-sm text-jalanea-500">Complete your profile for personalized recommendations.</p>
                                </div>
                            )}
                        </div>
                    </Card>

                </div>
            </div>

        </div>
    );
};
