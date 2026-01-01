import React, { useState, useMemo } from 'react';
import {
    X, MapPin, TrendingUp, Building2, DollarSign, Users,
    Briefcase, GraduationCap, ChevronRight, ExternalLink,
    Sparkles, Award, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

// ============================================
// TYPES
// ============================================

interface OrlandoMarketInsightsProps {
    isOpen: boolean;
    onClose: () => void;
    userIndustry?: string;
    userTargetRoles?: string[];
}

interface EmployerData {
    name: string;
    industry: string;
    hiringNow: number;
    avgSalary: string;
    entryLevelFriendly: boolean;
    logoColor: string;
}

interface IndustryTrend {
    industry: string;
    growth: number;
    avgSalary: string;
    openings: number;
    hotRoles: string[];
}

interface SalaryBenchmark {
    role: string;
    entryLevel: string;
    midLevel: string;
    senior: string;
    growth: number;
}

// ============================================
// MOCK DATA (Would come from API in production)
// ============================================

const TOP_EMPLOYERS: EmployerData[] = [
    { name: 'Walt Disney World', industry: 'Entertainment', hiringNow: 245, avgSalary: '$52k', entryLevelFriendly: true, logoColor: 'bg-blue-500' },
    { name: 'AdventHealth', industry: 'Healthcare', hiringNow: 189, avgSalary: '$58k', entryLevelFriendly: true, logoColor: 'bg-teal-500' },
    { name: 'Universal Orlando', industry: 'Entertainment', hiringNow: 156, avgSalary: '$48k', entryLevelFriendly: true, logoColor: 'bg-purple-500' },
    { name: 'Lockheed Martin', industry: 'Aerospace', hiringNow: 87, avgSalary: '$75k', entryLevelFriendly: false, logoColor: 'bg-slate-700' },
    { name: 'Orlando Health', industry: 'Healthcare', hiringNow: 134, avgSalary: '$55k', entryLevelFriendly: true, logoColor: 'bg-orange-500' },
    { name: 'Marriott Vacations', industry: 'Hospitality', hiringNow: 98, avgSalary: '$45k', entryLevelFriendly: true, logoColor: 'bg-red-500' },
    { name: 'EA Sports', industry: 'Tech/Gaming', hiringNow: 42, avgSalary: '$85k', entryLevelFriendly: false, logoColor: 'bg-emerald-600' },
    { name: 'Darden Restaurants', industry: 'Hospitality', hiringNow: 112, avgSalary: '$42k', entryLevelFriendly: true, logoColor: 'bg-amber-600' },
];

const INDUSTRY_TRENDS: IndustryTrend[] = [
    { industry: 'Healthcare', growth: 12, avgSalary: '$56k', openings: 1245, hotRoles: ['Medical Assistant', 'Health IT', 'Nursing Support'] },
    { industry: 'Technology', growth: 18, avgSalary: '$72k', openings: 892, hotRoles: ['Software Developer', 'Data Analyst', 'Cybersecurity'] },
    { industry: 'Hospitality & Tourism', growth: 8, avgSalary: '$44k', openings: 2340, hotRoles: ['Guest Services', 'Event Coordinator', 'Hotel Ops'] },
    { industry: 'Aerospace & Defense', growth: 15, avgSalary: '$78k', openings: 456, hotRoles: ['Engineering Tech', 'Quality Assurance', 'Project Coord'] },
    { industry: 'Finance & Insurance', growth: 6, avgSalary: '$58k', openings: 678, hotRoles: ['Financial Analyst', 'Claims Specialist', 'Underwriter'] },
    { industry: 'Creative & Design', growth: 10, avgSalary: '$52k', openings: 324, hotRoles: ['Graphic Designer', 'UX Designer', 'Content Creator'] },
];

const SALARY_BENCHMARKS: SalaryBenchmark[] = [
    { role: 'Software Developer', entryLevel: '$55k-$70k', midLevel: '$80k-$100k', senior: '$110k-$140k', growth: 8 },
    { role: 'Graphic Designer', entryLevel: '$40k-$52k', midLevel: '$55k-$70k', senior: '$75k-$95k', growth: 5 },
    { role: 'Medical Assistant', entryLevel: '$32k-$40k', midLevel: '$42k-$52k', senior: '$55k-$65k', growth: 12 },
    { role: 'Business Analyst', entryLevel: '$50k-$62k', midLevel: '$68k-$85k', senior: '$90k-$115k', growth: 7 },
    { role: 'Marketing Coordinator', entryLevel: '$38k-$48k', midLevel: '$52k-$65k', senior: '$70k-$90k', growth: 6 },
    { role: 'Cybersecurity Analyst', entryLevel: '$55k-$68k', midLevel: '$75k-$95k', senior: '$100k-$130k', growth: 15 },
    { role: 'Hotel Operations', entryLevel: '$35k-$42k', midLevel: '$45k-$58k', senior: '$62k-$80k', growth: 4 },
    { role: 'Data Analyst', entryLevel: '$48k-$60k', midLevel: '$65k-$82k', senior: '$88k-$115k', growth: 14 },
];

const RECENT_HIRES = [
    { name: 'Maria C.', college: 'Valencia College', role: 'UX Designer', company: 'Disney', timeAgo: '2 weeks ago' },
    { name: 'James T.', college: 'Miami Dade College', role: 'Software Dev', company: 'EA Sports', timeAgo: '1 month ago' },
    { name: 'Aisha M.', college: 'Broward College', role: 'Medical Admin', company: 'AdventHealth', timeAgo: '3 weeks ago' },
    { name: 'Carlos R.', college: 'Valencia College', role: 'Network Tech', company: 'Lockheed Martin', timeAgo: '1 month ago' },
    { name: 'Taylor S.', college: 'Santa Fe College', role: 'Marketing Coord', company: 'Marriott', timeAgo: '2 weeks ago' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const OrlandoMarketInsights: React.FC<OrlandoMarketInsightsProps> = ({
    isOpen,
    onClose,
    userIndustry,
    userTargetRoles = []
}) => {
    const [activeTab, setActiveTab] = useState<'trends' | 'employers' | 'salaries'>('trends');

    // Filter and sort data based on user preferences
    const relevantTrends = useMemo(() => {
        if (!userIndustry) return INDUSTRY_TRENDS;
        return INDUSTRY_TRENDS.sort((a, b) => {
            const aMatch = a.industry.toLowerCase().includes(userIndustry.toLowerCase());
            const bMatch = b.industry.toLowerCase().includes(userIndustry.toLowerCase());
            if (aMatch && !bMatch) return -1;
            if (bMatch && !aMatch) return 1;
            return b.growth - a.growth;
        });
    }, [userIndustry]);

    const relevantBenchmarks = useMemo(() => {
        if (userTargetRoles.length === 0) return SALARY_BENCHMARKS;
        return SALARY_BENCHMARKS.sort((a, b) => {
            const aMatch = userTargetRoles.some(r => a.role.toLowerCase().includes(r.toLowerCase()));
            const bMatch = userTargetRoles.some(r => b.role.toLowerCase().includes(r.toLowerCase()));
            if (aMatch && !bMatch) return -1;
            if (bMatch && !aMatch) return 1;
            return b.growth - a.growth;
        });
    }, [userTargetRoles]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Orlando Market Insights</h2>
                                <p className="text-sm text-white/80">Local hiring trends, salaries, and top employers</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold">5,800+</div>
                            <div className="text-xs text-white/70">Open Positions</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold">$54k</div>
                            <div className="text-xs text-white/70">Avg Entry Salary</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold">+11%</div>
                            <div className="text-xs text-white/70">YoY Job Growth</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 shrink-0 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                            activeTab === 'trends'
                                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <TrendingUp size={16} />
                        Industry Trends
                    </button>
                    <button
                        onClick={() => setActiveTab('employers')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                            activeTab === 'employers'
                                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Building2 size={16} />
                        Top Employers
                    </button>
                    <button
                        onClick={() => setActiveTab('salaries')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                            activeTab === 'salaries'
                                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <DollarSign size={16} />
                        Salary Benchmarks
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Industry Trends Tab */}
                    {activeTab === 'trends' && (
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                {relevantTrends.map((trend, i) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-xl border ${
                                            i === 0 && userIndustry
                                                ? 'bg-emerald-50 border-emerald-200'
                                                : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-900">{trend.industry}</h3>
                                                    {i === 0 && userIndustry && (
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                            Your Industry
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {trend.openings.toLocaleString()} open positions
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`flex items-center gap-1 font-bold ${
                                                    trend.growth >= 10 ? 'text-emerald-600' : 'text-amber-600'
                                                }`}>
                                                    {trend.growth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                    {trend.growth}% growth
                                                </div>
                                                <div className="text-sm text-gray-500">Avg: {trend.avgSalary}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {trend.hotRoles.map((role, j) => (
                                                <span
                                                    key={j}
                                                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Employers Tab */}
                    {activeTab === 'employers' && (
                        <div className="space-y-6">
                            {/* Recent Hires from CC */}
                            <div className="bg-gradient-to-r from-gold/10 to-amber-50 border border-gold/20 rounded-xl p-4">
                                <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                                    <GraduationCap size={18} className="text-gold" />
                                    Community College Grads Getting Hired
                                </h3>
                                <div className="space-y-2">
                                    {RECENT_HIRES.map((hire, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold text-xs">
                                                    {hire.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900">{hire.name}</span>
                                                    <span className="text-gray-400 mx-1">•</span>
                                                    <span className="text-gray-500">{hire.college}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-medium text-gray-900">{hire.role}</span>
                                                <span className="text-gray-400 mx-1">@</span>
                                                <span className="text-emerald-600">{hire.company}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Employer List */}
                            <div className="grid gap-3">
                                {TOP_EMPLOYERS.map((employer, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 ${employer.logoColor} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                                                {employer.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{employer.name}</h4>
                                                    {employer.entryLevelFriendly && (
                                                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                                                            ENTRY-LEVEL FRIENDLY
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{employer.industry}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-emerald-600 font-bold">
                                                <Briefcase size={14} />
                                                {employer.hiringNow} open
                                            </div>
                                            <div className="text-sm text-gray-500">Avg: {employer.avgSalary}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Salary Benchmarks Tab */}
                    {activeTab === 'salaries' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-4">
                                Salary ranges based on Orlando metro area data. Your actual salary may vary based on experience, company, and negotiation.
                            </p>

                            {relevantBenchmarks.map((benchmark, i) => (
                                <div
                                    key={i}
                                    className={`p-4 rounded-xl border ${
                                        i === 0 && userTargetRoles.length > 0
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">{benchmark.role}</h3>
                                            {i === 0 && userTargetRoles.length > 0 && (
                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                    Your Target
                                                </span>
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-1 text-sm font-medium ${
                                            benchmark.growth >= 10 ? 'text-emerald-600' : 'text-amber-600'
                                        }`}>
                                            <TrendingUp size={14} />
                                            +{benchmark.growth}% demand
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                                            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Entry Level</div>
                                            <div className="text-lg font-bold text-emerald-600">{benchmark.entryLevel}</div>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                                            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Mid Level</div>
                                            <div className="text-lg font-bold text-blue-600">{benchmark.midLevel}</div>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                                            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Senior</div>
                                            <div className="text-lg font-bold text-purple-600">{benchmark.senior}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                            Data updated weekly from local job boards and employer reports
                        </p>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrlandoMarketInsights;
