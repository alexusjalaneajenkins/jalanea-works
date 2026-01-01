import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    Rocket, Target, TrendingUp, CheckCircle, AlertCircle,
    ExternalLink, Briefcase, DollarSign, Home, Search,
    Linkedin, Building2, Zap, Sparkles, Lightbulb, ArrowRight, Clock
} from 'lucide-react';

// Animation variants
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } }
};

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
// COMPONENT: Power Hour Ring
// ===========================================
const PowerHourTracker: React.FC<{ current: number; goal: number }> = ({ current, goal }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <motion.div
            variants={fadeUp}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 backdrop-blur-xl"
        >
            <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={current >= goal ? '#FFC425' : '#FFD768'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(255, 196, 37, 0.5))' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{current}/{goal}</span>
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gold" />
                    <p className="text-sm font-bold text-white">Power Hour</p>
                </div>
                <p className="text-xs text-slate-400">Daily Applications</p>
                {current >= goal && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-gold">
                        <Sparkles size={12} /> Goal Hit!
                    </span>
                )}
            </div>
        </motion.div>
    );
};

// ===========================================
// COMPONENT: Launchpad Button
// ===========================================
const LaunchpadButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <motion.button
        variants={fadeUp}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 hover:border-gold/40 hover:bg-slate-800/80 transition-all group"
    >
        <span className="text-slate-400 group-hover:text-gold transition-colors">{icon}</span>
        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
        <ExternalLink size={14} className="ml-auto text-slate-500 group-hover:text-gold/60 transition-colors" />
    </motion.button>
);

// ===========================================
// COMPONENT: Mission Card
// ===========================================
const MissionCard: React.FC<{
    role: string;
    company: string;
    status: string;
    grade?: string;
}> = ({ role, company, status, grade }) => {
    const statusColors: Record<string, string> = {
        'saved': 'bg-slate-700/50 text-slate-300 border-slate-600',
        'applied': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'interviewing': 'bg-gold/20 text-gold border-gold/30',
        'offer': 'bg-green-500/20 text-green-400 border-green-500/30',
        'rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const gradeColors: Record<string, string> = {
        'A': 'bg-gold/20 text-gold border-gold/30',
        'B': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'C': 'bg-slate-700/50 text-slate-400 border-slate-600',
    };

    return (
        <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01, x: 4 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-gold/30 transition-all group cursor-pointer"
        >
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate group-hover:text-gold transition-colors">{role}</h4>
                <p className="text-sm text-slate-400 truncate">{company}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border ${statusColors[status] || statusColors['saved']}`}>
                    {status}
                </span>
                {grade && (
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${gradeColors[grade] || gradeColors['C']}`}>
                        {grade}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

// ===========================================
// COMPONENT: Glass Card
// ===========================================
const GlassCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
}> = ({ children, className = '', glow }) => (
    <motion.div
        variants={fadeUp}
        className={`p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 backdrop-blur-xl ${glow ? 'shadow-[0_0_30px_rgba(255,196,37,0.1)]' : ''} ${className}`}
    >
        {children}
    </motion.div>
);

// ===========================================
// MAIN COMPONENT: Dashboard
// ===========================================
export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const [jobUrl, setJobUrl] = useState('');
    const [dailyApps, setDailyApps] = useState(0);

    const userName = userProfile?.fullName?.split(' ')[0] || userProfile?.displayName?.split(' ')[0] || 'there';
    const applications = userProfile?.savedJobs || [];
    const salaryMin = userProfile?.targetSalaryRange?.min || 45000;
    const salaryMax = userProfile?.targetSalaryRange?.max || 65000;
    const maxRent = userProfile?.monthlyBudgetEstimate?.maxRent || 0;
    const housingTier = getHousingTier(maxRent);

    const hasEducation = (userProfile?.education?.length || 0) > 0;
    const hasSkills = (userProfile?.skills?.technical?.length || 0) > 0;
    const hasExperience = (userProfile?.experience?.length || 0) > 0;
    const profileScore = [hasEducation, hasSkills, hasExperience, maxRent > 0].filter(Boolean).length;
    const profileGrade = profileScore >= 4 ? 'A' : profileScore >= 3 ? 'B+' : profileScore >= 2 ? 'B' : 'C';

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
        <div className="min-h-screen bg-[#020617] pb-16">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900 pointer-events-none" />
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-gold/3 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
            >
                {/* Header */}
                <motion.div variants={stagger} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <motion.div variants={fadeUp}>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            {getGreeting()}, <span className="text-gold">{userName}</span>.
                        </h1>
                        <p className="text-lg text-slate-400 mt-1">Ready to execute?</p>
                    </motion.div>
                    <PowerHourTracker current={dailyApps} goal={3} />
                </motion.div>

                {/* Input Nexus */}
                <motion.div
                    variants={fadeUp}
                    className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-gold/20 border border-gold/30">
                            <Target size={24} className="text-gold" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">The Input Nexus</h2>
                            <p className="text-sm text-slate-400">Paste a job link to get your Jalanea Grade</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="url"
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                                placeholder="Paste job link (LinkedIn, Indeed, etc)..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800/50 border border-white/10 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder:text-slate-500 transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeJob()}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAnalyzeJob}
                            className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-black font-bold px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(255,196,37,0.3)] hover:shadow-[0_0_40px_rgba(255,196,37,0.5)] transition-all"
                        >
                            <Zap size={18} />
                            Analyze Match
                        </motion.button>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Smart Launchpads</p>
                        <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Grid */}
                <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Missions */}
                    <div className="lg:col-span-2 space-y-4">
                        <motion.div variants={fadeUp} className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Briefcase size={20} className="text-gold" />
                                Active Missions
                            </h3>
                            <button
                                onClick={() => navigate('/jobs')}
                                className="text-sm font-medium text-slate-400 hover:text-gold transition-colors"
                            >
                                View All →
                            </button>
                        </motion.div>

                        {applications.length === 0 ? (
                            <motion.div
                                variants={fadeUp}
                                className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30"
                            >
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold/10 border border-gold/30">
                                    <Target size={32} className="text-gold" />
                                </div>
                                <h4 className="font-bold text-white mb-2">No Active Missions</h4>
                                <p className="text-sm text-slate-400 mb-4">Launch a search to begin tracking your applications.</p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/jobs')}
                                    className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-black font-bold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(255,196,37,0.3)] transition-all"
                                >
                                    <Rocket size={16} />
                                    Start Searching
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div variants={stagger} className="space-y-3">
                                {applications.slice(0, 5).map((app) => (
                                    <MissionCard
                                        key={app.id}
                                        role={app.job.title}
                                        company={app.job.company}
                                        status={app.status}
                                        grade={undefined}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column */}
                    <motion.div variants={stagger} className="space-y-6">
                        {/* Market Readiness */}
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={18} className="text-gold" />
                                <h4 className="font-bold text-white">Market Readiness</h4>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-slate-400">Profile Strength</span>
                                <span className={`px-2.5 py-1 rounded-lg text-sm font-medium border ${
                                    profileGrade === 'A' ? 'bg-gold/20 text-gold border-gold/30' :
                                    profileGrade.startsWith('B') ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                    'bg-slate-700/50 text-slate-400 border-slate-600'
                                }`}>
                                    {profileGrade} Candidate
                                </span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(profileScore / 4) * 100}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                                    style={{ boxShadow: '0 0 10px rgba(255, 196, 37, 0.5)' }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {4 - profileScore > 0 ? `Complete ${4 - profileScore} more section${4 - profileScore > 1 ? 's' : ''} to improve.` : 'Your profile is complete!'}
                            </p>
                        </GlassCard>

                        {/* Financial Pulse */}
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign size={18} className="text-gold" />
                                <h4 className="font-bold text-white">Financial Pulse</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">Target Salary</span>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        ${(salaryMin / 1000).toFixed(0)}k – ${(salaryMax / 1000).toFixed(0)}k
                                    </p>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                    <span className="text-sm text-slate-400">Lifestyle Tier</span>
                                    <div className="flex items-center gap-2">
                                        <Home size={14} className="text-slate-500" />
                                        <span className="text-sm font-medium text-gold">{housingTier}</span>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-white/10">
                                    {maxRent > 0 ? (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle size={16} />
                                            <span className="text-sm font-medium">Budget Aligned</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gold">
                                            <AlertCircle size={16} />
                                            <span className="text-sm font-medium">Complete onboarding</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>

                        {/* Start a Business */}
                        <GlassCard glow className="bg-gradient-to-br from-gold/10 to-slate-900/60 border-gold/20">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-gold/20 rounded-lg border border-gold/30">
                                    <Lightbulb size={16} className="text-gold" />
                                </div>
                                <h4 className="font-bold text-white">Start a Business</h4>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">
                                Not finding the right job? Create your own opportunity.
                            </p>
                            <div className="space-y-2 mb-4">
                                {['150+ local small business resources', 'Free SBDC consultations available', 'Orlando ranked #3 for startups'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                        <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/start-business')}
                                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-black font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
                            >
                                Explore Resources
                                <ArrowRight size={14} />
                            </motion.button>
                        </GlassCard>

                        {/* Quick Actions */}
                        <motion.div variants={stagger} className="space-y-2">
                            {[
                                { emoji: '✏️', label: 'My Account', path: '/account' },
                                { emoji: '📄', label: 'Build Resume', path: '/resume' },
                            ].map((action, i) => (
                                <motion.button
                                    key={i}
                                    variants={fadeUp}
                                    whileHover={{ scale: 1.01, x: 4 }}
                                    onClick={() => navigate(action.path)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 hover:border-gold/30 text-slate-300 hover:text-white font-medium transition-all text-left"
                                >
                                    {action.emoji} {action.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
