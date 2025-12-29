import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
    Rocket, Target, TrendingUp, CheckCircle, AlertCircle,
    ExternalLink, Briefcase, DollarSign, Home, Search,
    Linkedin, Building2, Zap, Sparkles
} from 'lucide-react';

// Helper: Get time-based greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

// Helper: Get housing tier from max rent
const getHousingTier = (maxRent: number): string => {
    if (maxRent < 900) return 'Shared Housing';
    if (maxRent < 1100) return 'Studio Apartment';
    if (maxRent < 1300) return 'Basic 1-Bed';
    if (maxRent < 1550) return 'Nice 1-Bed';
    if (maxRent < 1900) return 'Standard 2-Bed';
    if (maxRent < 2400) return 'Nice 2-Bed';
    return '3+ Bedrooms';
};

// ===========================================
// COMPONENT: Power Hour Tracker (Gold Ring - Light)
// ===========================================
const PowerHourTracker: React.FC<{ current: number; goal: number }> = ({ current, goal }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                    />
                    {/* Progress circle - Gold */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={current >= goal ? '#eab308' : '#facc15'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-900">{current}/{goal}</span>
                </div>
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900">Power Hour</p>
                <p className="text-xs text-slate-500">Daily Applications</p>
                {current >= goal && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-yellow-600">
                        <Sparkles size={12} /> Goal Hit!
                    </span>
                )}
            </div>
        </div>
    );
};

// ===========================================
// COMPONENT: Smart Launchpad Button (Light)
// ===========================================
const LaunchpadButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-500/10 transition-all group"
    >
        <span className="text-slate-600 group-hover:text-yellow-600 transition-colors">{icon}</span>
        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
        <ExternalLink size={14} className="ml-auto text-slate-400 group-hover:text-yellow-600 transition-colors" />
    </button>
);

// ===========================================
// COMPONENT: Active Mission Card (Light)
// ===========================================
const MissionCard: React.FC<{
    role: string;
    company: string;
    status: string;
    grade?: string;
}> = ({ role, company, status, grade }) => {
    const statusColors: Record<string, string> = {
        'saved': 'bg-slate-100 text-slate-600 border-slate-200',
        'applied': 'bg-blue-50 text-blue-700 border-blue-200',
        'interviewing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'offer': 'bg-green-50 text-green-700 border-green-200',
        'rejected': 'bg-red-50 text-red-600 border-red-200',
    };

    const gradeColors: Record<string, string> = {
        'A': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        'B': 'bg-blue-50 text-blue-700 border border-blue-200',
        'C': 'bg-slate-50 text-slate-600 border border-slate-200',
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-500/5 transition-all group">
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate group-hover:text-yellow-700 transition-colors">{role}</h4>
                <p className="text-sm text-slate-500 truncate">{company}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize border ${statusColors[status] || statusColors['saved']}`}>
                    {status}
                </span>
                {grade && (
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${gradeColors[grade] || gradeColors['C']}`}>
                        {grade}
                    </span>
                )}
            </div>
        </div>
    );
};

// ===========================================
// MAIN COMPONENT: Dashboard (Light Theme)
// ===========================================
export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    // Local state
    const [jobUrl, setJobUrl] = useState('');
    const [dailyApps, setDailyApps] = useState(0); // TODO: Persist this

    // Derived data
    const userName = userProfile?.fullName?.split(' ')[0] || userProfile?.displayName?.split(' ')[0] || 'there';
    const applications = userProfile?.savedJobs?.filter(j => j.status !== 'saved') || [];
    const salaryMin = userProfile?.targetSalaryRange?.min || 45000;
    const salaryMax = userProfile?.targetSalaryRange?.max || 65000;
    const maxRent = userProfile?.monthlyBudgetEstimate?.maxRent || 0;
    const housingTier = getHousingTier(maxRent);

    // Profile strength calculation
    const hasEducation = (userProfile?.education?.length || 0) > 0;
    const hasSkills = (userProfile?.skills?.technical?.length || 0) > 0;
    const hasExperience = (userProfile?.experience?.length || 0) > 0;
    const profileScore = [hasEducation, hasSkills, hasExperience, maxRent > 0].filter(Boolean).length;
    const profileGrade = profileScore >= 4 ? 'A' : profileScore >= 3 ? 'B+' : profileScore >= 2 ? 'B' : 'C';

    // Handlers
    const handleAnalyzeJob = () => {
        if (jobUrl.trim()) {
            console.log('Analyzing:', jobUrl);
            alert('Jalanea Grade AI analysis coming soon!');
            setJobUrl('');
        }
    };

    const handleLaunchpad = (platform: string) => {
        const urls: Record<string, string> = {
            'google': 'https://www.google.com/search?q=entry+level+jobs+near+me&ibp=htl;jobs',
            'linkedin': 'https://www.linkedin.com/jobs/',
            'indeed': 'https://www.indeed.com/',
            'ziprecruiter': 'https://www.ziprecruiter.com/',
        };
        window.open(urls[platform], '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* ========================================= */}
                {/* HEADER ROW: Daily Briefing */}
                {/* ========================================= */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            {getGreeting()}, {userName}.
                        </h1>
                        <p className="text-lg text-slate-500 mt-1">Ready to execute?</p>
                    </div>
                    <PowerHourTracker current={dailyApps} goal={3} />
                </div>

                {/* ========================================= */}
                {/* HERO MODULE: The Input Nexus (Light) */}
                {/* ========================================= */}
                <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-yellow-50 rounded-xl border border-yellow-200">
                            <Target size={24} className="text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">The Input Nexus</h2>
                            <p className="text-sm text-slate-500">Paste a job link to get your Jalanea Grade</p>
                        </div>
                    </div>

                    {/* Job URL Input (Light) */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="url"
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                                placeholder="Paste job link (LinkedIn, Indeed, etc)..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-slate-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-500/10 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeJob()}
                            />
                        </div>
                        <button
                            onClick={handleAnalyzeJob}
                            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
                        >
                            <Zap size={18} className="text-yellow-400" />
                            Analyze Match
                        </button>
                    </div>

                    {/* Smart Launchpads */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Smart Launchpads</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <LaunchpadButton
                                icon={<img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />}
                                label="Google Jobs"
                                onClick={() => handleLaunchpad('google')}
                            />
                            <LaunchpadButton
                                icon={<Linkedin size={20} />}
                                label="LinkedIn"
                                onClick={() => handleLaunchpad('linkedin')}
                            />
                            <LaunchpadButton
                                icon={<Building2 size={20} />}
                                label="Indeed"
                                onClick={() => handleLaunchpad('indeed')}
                            />
                            <LaunchpadButton
                                icon={<Rocket size={20} />}
                                label="ZipRecruiter"
                                onClick={() => handleLaunchpad('ziprecruiter')}
                            />
                        </div>
                    </div>
                </div>

                {/* ========================================= */}
                {/* MAIN CONTENT: 2-Column Grid */}
                {/* ========================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Active Missions (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase size={20} className="text-yellow-600" />
                                Active Missions
                            </h3>
                            <button
                                onClick={() => navigate('/jobs')}
                                className="text-sm font-bold text-slate-500 hover:text-yellow-600 transition-colors"
                            >
                                View All →
                            </button>
                        </div>

                        {applications.length === 0 ? (
                            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-200">
                                    <Target size={32} className="text-yellow-600" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">No Active Missions</h4>
                                <p className="text-sm text-slate-500 mb-4">Launch a search to begin tracking your applications.</p>
                                <button
                                    onClick={() => navigate('/jobs')}
                                    className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-xl shadow-md shadow-yellow-500/20 transition-all"
                                >
                                    <Rocket size={16} />
                                    Start Searching
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {applications.slice(0, 5).map((app) => (
                                    <MissionCard
                                        key={app.id}
                                        role={app.job.title}
                                        company={app.job.company}
                                        status={app.status}
                                        grade={undefined}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Strategy & Pulse (1/3 width) */}
                    <div className="space-y-6">

                        {/* Card 1: Market Readiness (Light) */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={18} className="text-yellow-600" />
                                <h4 className="font-bold text-slate-900">Market Readiness</h4>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-slate-500">Profile Strength</span>
                                <span className={`px-2 py-1 rounded-lg text-sm font-bold border ${profileGrade === 'A' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        profileGrade.startsWith('B') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                    {profileGrade} Candidate
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
                                    style={{ width: `${(profileScore / 4) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {4 - profileScore > 0 ? `Complete ${4 - profileScore} more section${4 - profileScore > 1 ? 's' : ''} to improve.` : 'Your profile is complete!'}
                            </p>
                        </div>

                        {/* Card 2: Financial Pulse (Light) */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign size={18} className="text-yellow-600" />
                                <h4 className="font-bold text-slate-900">Financial Pulse</h4>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wide">Target Salary</span>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        ${(salaryMin / 1000).toFixed(0)}k – ${(salaryMax / 1000).toFixed(0)}k
                                    </p>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                    <span className="text-sm text-slate-500">Lifestyle Tier</span>
                                    <div className="flex items-center gap-2">
                                        <Home size={14} className="text-slate-400" />
                                        <span className="text-sm font-bold text-yellow-600">{housingTier}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100">
                                    {maxRent > 0 ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle size={16} />
                                            <span className="text-sm font-bold">Budget Aligned</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-yellow-600">
                                            <AlertCircle size={16} />
                                            <span className="text-sm font-bold">Complete onboarding</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions (Light) */}
                        <div className="space-y-2">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-500/5 text-slate-700 font-medium transition-all text-left"
                            >
                                ✏️ Edit Profile
                            </button>
                            <button
                                onClick={() => navigate('/resume')}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-500/5 text-slate-700 font-medium transition-all text-left"
                            >
                                📄 Build Resume
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
