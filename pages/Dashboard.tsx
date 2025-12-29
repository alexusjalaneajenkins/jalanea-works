import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
    Rocket, Target, TrendingUp, CheckCircle, AlertCircle,
    ExternalLink, Briefcase, DollarSign, Home, Search,
    Linkedin, Building2, Zap
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
// COMPONENT: Power Hour Tracker (Circular Progress)
// ===========================================
const PowerHourTracker: React.FC<{ current: number; goal: number }> = ({ current, goal }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={current >= goal ? '#10b981' : '#6366f1'}
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
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
                        <CheckCircle size={12} /> Goal Hit!
                    </span>
                )}
            </div>
        </div>
    );
};

// ===========================================
// COMPONENT: Smart Launchpad Button
// ===========================================
const LaunchpadButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: () => void;
}> = ({ icon, label, color, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all group`}
    >
        <span className={color}>{icon}</span>
        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{label}</span>
        <ExternalLink size={14} className="ml-auto text-slate-400 group-hover:text-slate-600" />
    </button>
);

// ===========================================
// COMPONENT: Active Mission Card
// ===========================================
const MissionCard: React.FC<{
    role: string;
    company: string;
    status: string;
    grade?: string;
}> = ({ role, company, status, grade }) => {
    const statusColors: Record<string, string> = {
        'saved': 'bg-slate-100 text-slate-600',
        'applied': 'bg-blue-100 text-blue-700',
        'interviewing': 'bg-amber-100 text-amber-700',
        'offer': 'bg-emerald-100 text-emerald-700',
        'rejected': 'bg-red-100 text-red-600',
    };

    const gradeColors: Record<string, string> = {
        'A': 'bg-emerald-500 text-white',
        'B': 'bg-blue-500 text-white',
        'C': 'bg-amber-500 text-white',
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{role}</h4>
                <p className="text-sm text-slate-500 truncate">{company}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${statusColors[status] || statusColors['saved']}`}>
                    {status}
                </span>
                {grade && (
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${gradeColors[grade] || 'bg-slate-200 text-slate-600'}`}>
                        {grade}
                    </span>
                )}
            </div>
        </div>
    );
};

// ===========================================
// MAIN COMPONENT: Dashboard
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

    // Profile strength calculation (simplified)
    const hasEducation = (userProfile?.education?.length || 0) > 0;
    const hasSkills = (userProfile?.skills?.technical?.length || 0) > 0;
    const hasExperience = (userProfile?.experience?.length || 0) > 0;
    const profileScore = [hasEducation, hasSkills, hasExperience, maxRent > 0].filter(Boolean).length;
    const profileGrade = profileScore >= 4 ? 'A' : profileScore >= 3 ? 'B+' : profileScore >= 2 ? 'B' : 'C';

    // Handlers
    const handleAnalyzeJob = () => {
        if (jobUrl.trim()) {
            // TODO: Implement Jalanea Grade AI analysis
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white pb-16">
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
                {/* HERO MODULE: The Input Nexus */}
                {/* ========================================= */}
                <Card variant="solid-white" className="p-6 md:p-8 border-2 border-slate-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-indigo-100 rounded-xl">
                            <Target size={24} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">The Input Nexus</h2>
                            <p className="text-sm text-slate-500">Paste a job link to get your Jalanea Grade</p>
                        </div>
                    </div>

                    {/* Job URL Input */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="url"
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                                placeholder="Paste job link (LinkedIn, Indeed, etc)..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeJob()}
                            />
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleAnalyzeJob}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all"
                            icon={<Zap size={18} />}
                        >
                            Analyze Match
                        </Button>
                    </div>

                    {/* Smart Launchpads */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Smart Launchpads</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <LaunchpadButton
                                icon={<img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />}
                                label="Google Jobs"
                                color=""
                                onClick={() => handleLaunchpad('google')}
                            />
                            <LaunchpadButton
                                icon={<Linkedin size={20} />}
                                label="LinkedIn"
                                color="text-blue-600"
                                onClick={() => handleLaunchpad('linkedin')}
                            />
                            <LaunchpadButton
                                icon={<Building2 size={20} />}
                                label="Indeed"
                                color="text-indigo-600"
                                onClick={() => handleLaunchpad('indeed')}
                            />
                            <LaunchpadButton
                                icon={<Rocket size={20} />}
                                label="ZipRecruiter"
                                color="text-emerald-600"
                                onClick={() => handleLaunchpad('ziprecruiter')}
                            />
                        </div>
                    </div>
                </Card>

                {/* ========================================= */}
                {/* MAIN CONTENT: 2-Column Grid */}
                {/* ========================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Active Missions (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase size={20} className="text-slate-600" />
                                Active Missions
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/jobs')}
                                className="text-slate-500 hover:text-slate-900"
                            >
                                View All
                            </Button>
                        </div>

                        {applications.length === 0 ? (
                            <Card variant="solid-white" className="p-8 text-center border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target size={32} className="text-slate-400" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">No Active Missions</h4>
                                <p className="text-sm text-slate-500 mb-4">Launch a search to begin tracking your applications.</p>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/jobs')}
                                    icon={<Rocket size={16} />}
                                >
                                    Start Searching
                                </Button>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {applications.slice(0, 5).map((app) => (
                                    <MissionCard
                                        key={app.id}
                                        role={app.job.title}
                                        company={app.job.company}
                                        status={app.status}
                                        grade={undefined} // TODO: Add Jalanea Grade
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Strategy & Pulse (1/3 width) */}
                    <div className="space-y-6">

                        {/* Card 1: Market Readiness */}
                        <Card variant="solid-white" className="p-5 border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={18} className="text-indigo-600" />
                                <h4 className="font-bold text-slate-900">Market Readiness</h4>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-slate-500">Profile Strength</span>
                                <span className={`px-2 py-1 rounded-lg text-sm font-bold ${profileGrade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                        profileGrade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {profileGrade} Candidate
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${profileGrade === 'A' ? 'bg-emerald-500' :
                                            profileGrade.startsWith('B') ? 'bg-blue-500' :
                                                'bg-amber-500'
                                        }`}
                                    style={{ width: `${(profileScore / 4) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {4 - profileScore > 0 ? `Complete ${4 - profileScore} more section${4 - profileScore > 1 ? 's' : ''} to improve.` : 'Your profile is complete!'}
                            </p>
                        </Card>

                        {/* Card 2: Financial Pulse */}
                        <Card variant="solid-white" className="p-5 border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign size={18} className="text-emerald-600" />
                                <h4 className="font-bold text-slate-900">Financial Pulse</h4>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Target Salary</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        ${(salaryMin / 1000).toFixed(0)}k – ${(salaryMax / 1000).toFixed(0)}k
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Lifestyle Tier</span>
                                    <div className="flex items-center gap-2">
                                        <Home size={14} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-900">{housingTier}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100">
                                    {maxRent > 0 ? (
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <CheckCircle size={16} />
                                            <span className="text-sm font-bold">Budget Aligned</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <AlertCircle size={16} />
                                            <span className="text-sm font-bold">Complete onboarding for budget analysis</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start text-slate-700 border-slate-200 hover:border-slate-300"
                                onClick={() => navigate('/profile')}
                            >
                                ✏️ Edit Profile
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-slate-700 border-slate-200 hover:border-slate-300"
                                onClick={() => navigate('/resume')}
                            >
                                📄 Build Resume
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
