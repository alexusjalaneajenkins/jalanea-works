import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UpgradeModal } from '../components/UpgradeModal';
import { ResumeType } from '../types';
import { FileText, Download, Copy, Sparkles, ChevronDown, ChevronUp, Bot, ArrowRight, Settings, AlertCircle, Save, History, Trash2, Edit3, X, Database, Heart, Loader2, CheckCircle, AlertTriangle, XCircle, Smile } from 'lucide-react';
import { generateResume, recommendResumeStrategy, analyzeReadability, ReadabilityAnalysisResult } from '../services/geminiService';
import { saveResume, getUserResumes, deleteResume, SavedResume } from '../services/resumeService';

export const ResumeBuilder: React.FC = () => {
    const { currentUser, userProfile, useCredit, canUseCredits, isTrialActive, saveUserProfile } = useAuth();
    const { isLight } = useTheme();
    const [selectedType, setSelectedType] = useState<ResumeType>(ResumeType.CHRONOLOGICAL);
    const [jobDescription, setJobDescription] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

    // Persistence State
    const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
    const [resumeTitle, setResumeTitle] = useState('');
    const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleRestoreData = async () => {
        if (!currentUser || !saveUserProfile) return;
        if (!window.confirm("This will overwrite your current profile education and experience with the seed data. Continue?")) return;

        setIsRestoring(true);
        try {
            await saveUserProfile({
                education: [
                    { id: 'edu1', degree: 'Bachelor of Applied Science', details: 'Computing Technology & Software Development', school: 'Valencia College', year: '2025', gpa: '3.93' },
                    { id: 'edu2', degree: 'Associate of Science', details: 'Graphic and Interactive Design', school: 'Valencia College', year: '2023', gpa: '3.88' },
                    { id: 'edu3', degree: 'Associate of Arts', details: 'General Studies', school: 'Valencia College', year: '2021' }
                ],
                experience: [
                    {
                        id: 'exp1', role: 'Junior UI/UX Design Intern', company: 'PETE Learning', duration: 'Jun 2024 - Aug 2024',
                        description: [
                            'Served as Junior UI/UX Designer to enhance PETE Learning\'s platforms with a fresh perspective.',
                            'Identified navigation challenges and proposed a new tooltip system to reduce user confusion.',
                            'Designed three tooltip variations (text, image, video) and documented their pros, cons, benefits, and use cases.',
                            'Created animated UI mockups and delivered a full proposal directly to the President of the company.',
                            'Contributed UI updates and quality of life improvements to PETE Learning\'s course builder.'
                        ]
                    },
                    {
                        id: 'exp2', role: 'Kid Coordinator (Imagination Station)', company: 'Mosaic Church', duration: 'Jun 2024 - Aug 2024',
                        description: [
                            'Coordinated 9 rotating activity stations for over 120 children during Mosaic Church\'s summer program.',
                            'Developed hands-on learning activities using various materials to engage kids creatively.',
                            'Adapted lessons in real-time to ensure all children received individual attention and support.',
                            'Collaborated with a team of volunteers to maintain a safe and fun environment.'
                        ]
                    },
                    {
                        id: 'exp3', role: 'Educational Content Intern', company: 'CoLabL', duration: 'Feb 2024 - May 2024',
                        description: [
                            'Participated with ColaBB, focusing on mental health and wellness for teens.',
                            'Collaborated with team members to create a comprehensive guide addressing mental health issues.',
                            'Developed promotional strategies to effectively disseminate mental health resources to young adults.'
                        ]
                    },
                    {
                        id: 'exp4', role: 'Customer Associate', company: 'Wawa, Inc.', duration: 'Nov 2021 - May 2024',
                        description: [
                            'Worked at a 24/7 Wawa location for 2 years, specializing in service excellence.',
                            'Handled everything from high-volume orders to customer escalation with patience and care.',
                            'Known for staying calm during conflicts, solving customer issues, and helping people feel heard.',
                            'Represented Wawa\'s values by creating a welcoming, safe space.'
                        ]
                    },
                    {
                        id: 'exp5', role: 'Crew Member', company: 'The Wendy\'s Company', duration: 'Mar 2020 - Oct 2021',
                        description: [
                            'Worked every major station: grill, fries, cashier, drive-thru, and overnight stocking.',
                            'Averaged 30 hour shifts, 4 days a week with consistent on-time attendance.',
                            'Transformed by managers and coworkers as reliable, adaptable, and fast-learning.'
                        ]
                    },
                    {
                        id: 'exp6', role: 'Concept Artist & Graphic Designer', company: 'River Rose Productions LLC', duration: 'Jun 2019 - Mar 2020',
                        description: [
                            'Developed unique visual identities and illustrations for various projects, enhancing brand recognition.',
                            'Collaborated closely with authors and developers to create engaging content.',
                            'Contributed illustrations to a children\'s book that achieved over 2,500 retail sales.',
                            'Designed educational infographics for a gaming startup, boosting user retention by 20%.'
                        ]
                    }
                ],
                skills: {
                    technical: ['Java', 'SQL', 'Docker', 'HTML/CSS/JS', 'SDLC', 'Database Management', 'VS Code', 'GitHub'],
                    design: ['Figma', 'Adobe Creative Suite (Ps, Ai, Id, Ae)', 'User Journey Mapping', 'Wireframing'],
                    soft: ['Conflict Resolution', 'Adaptability', 'Empathy', 'Team Leadership', 'High-Volume Cash Handling']
                },
                certifications: [
                    { name: 'Graphics Interactive Design Production', issuer: 'Valencia College', date: '2023' },
                    { name: 'Interactive Design Support', issuer: 'Valencia College', date: '2023' },
                    { name: 'Microsoft Office Specialist', issuer: 'Microsoft', date: '2022' },
                    { name: 'Entrepreneurship & Small Business', issuer: 'Microsoft', date: '2022' },
                    { name: 'Strategic Career Alignment', issuer: 'University Park, FL', date: '2025' }
                ]
            });
            alert('Profile restored! You can now generate resumes.');
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Failed to restore profile.');
        } finally {
            setIsRestoring(false);
        }
    };

    // Formatting State
    const [fontFamily, setFontFamily] = useState('font-serif');
    const [fontSize, setFontSize] = useState('text-sm');

    // New State for UX Improvements
    const [showAllTypes, setShowAllTypes] = useState(false);
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendation, setRecommendation] = useState<{ recommendedType: string; reasoning: string; successProbability: string } | null>(null);

    // Credit enforcement state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Human Readability Score state
    const [readabilityResult, setReadabilityResult] = useState<ReadabilityAnalysisResult | null>(null);
    const [isAnalyzingReadability, setIsAnalyzingReadability] = useState(false);
    const [showReadabilityPanel, setShowReadabilityPanel] = useState(false);

    // Build user data from Firebase profile
    const userData = {
        name: userProfile?.fullName || currentUser?.displayName || 'User',
        email: currentUser?.email || '',
        location: userProfile?.location || 'Orlando, FL',
        education: (userProfile?.education || []).map((e: any) => ({
            degree: `${e.degreeLevel || ''} ${e.program || ''}`.trim(),
            school: 'Valencia College',
            year: e.gradYear || '',
            gpa: ''
        })),
        experience: (userProfile?.experience || []).map((e: any) => ({
            role: e.role || '',
            company: e.company || '',
            duration: e.duration || '',
            description: [e.description || 'Contributed to team projects']
        })),
        skills: {
            technical: [],
            design: [],
            soft: []
        },
        certifications: [],
        learningStyle: [],
        transportMode: [],
        isParent: false,
        employmentStatus: 'Looking'
    };

    const handleGenerate = async (descriptionOverride?: string) => {
        const descriptionToUse = descriptionOverride || jobDescription;
        if (!descriptionToUse) return;

        // Credit check - Resume generation costs 3 credits
        if (!isTrialActive() && !canUseCredits(3)) {
            setShowUpgradeModal(true);
            return;
        }

        setIsGenerating(true);
        const content = await generateResume(selectedType, userData as any, descriptionToUse);
        setGeneratedContent(content);

        // Deduct credits after successful generation
        await useCredit(3);

        setIsGenerating(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAiRecommendation = async () => {
        if (!jobDescription) return;

        // Credit check - AI Recommendation costs 2 credits
        if (!isTrialActive() && !canUseCredits(2)) {
            setShowUpgradeModal(true);
            return;
        }

        setIsRecommending(true);
        const result = await recommendResumeStrategy(userData as any, jobDescription);
        if (result) {
            setRecommendation(result);
            setShowAllTypes(true);
            // Deduct credits after successful recommendation
            await useCredit(2);
        }
        setIsRecommending(false);
    };

    const applyRecommendation = () => {
        if (recommendation) {
            const matchedType = Object.values(ResumeType).find(t => t.toLowerCase() === recommendation.recommendedType.toLowerCase());
            if (matchedType) {
                setSelectedType(matchedType);
            } else {
                setSelectedType(ResumeType.TARGETED);
            }
            setRecommendation(null);
        }
    };

    // Human Readability Analysis
    const handleReadabilityCheck = async () => {
        if (!generatedContent) return;

        // Credit check - Readability analysis costs 2 credits
        if (!isTrialActive() && !canUseCredits('readabilityAnalysis')) {
            setShowUpgradeModal(true);
            return;
        }

        setIsAnalyzingReadability(true);
        setShowReadabilityPanel(true);

        try {
            const result = await analyzeReadability(generatedContent);
            if (result) {
                setReadabilityResult(result);
                // Deduct credits after successful analysis
                await useCredit('readabilityAnalysis');
            }
        } catch (error) {
            console.error('Readability analysis failed:', error);
        } finally {
            setIsAnalyzingReadability(false);
        }
    };

    // Helper functions for readability display
    const getReadabilityEmoji = (score: number) => {
        if (score >= 90) return '🌟';
        if (score >= 70) return '✨';
        if (score >= 50) return '😐';
        return '🤖';
    };

    const getReadabilityLabel = (score: number) => {
        if (score >= 90) return 'Sounds like YOU';
        if (score >= 70) return 'Mostly authentic';
        if (score >= 50) return 'Getting generic';
        return 'Robot detected';
    };

    const getReadabilityColor = (score: number) => {
        if (score >= 90) return 'text-green-500';
        if (score >= 70) return 'text-blue-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getReadabilityBg = (score: number) => {
        if (score >= 90) return 'bg-green-50 border-green-200';
        if (score >= 70) return 'bg-blue-50 border-blue-200';
        if (score >= 50) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const getToneBadgeColor = (tone: string) => {
        switch (tone) {
            case 'Authentic': return 'bg-green-100 text-green-700 border-green-200';
            case 'Professional': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Generic': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Robotic': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // Persistence Handlers
    const fetchResumes = async () => {
        if (!currentUser) return;
        try {
            const resumes = await getUserResumes(currentUser.uid);
            setSavedResumes(resumes);
        } catch (error) {
            console.error("Failed to fetch resumes", error);
        }
    };

    const handleSave = async () => {
        if (!currentUser || !generatedContent) return;

        setIsSaving(true);
        try {
            // Default title if none provided
            const titleToSave = resumeTitle || `${selectedType} Resume - ${new Date().toLocaleDateString()}`;

            const id = await saveResume(currentUser.uid, {
                title: titleToSave,
                type: selectedType,
                content: generatedContent,
                jobDescription: jobDescription,
                targetRole: jobDescription.split('\n')[0].substring(0, 50) // Guess role from JD
            }, currentResumeId || undefined);

            setCurrentResumeId(id);
            setResumeTitle(titleToSave);
            await fetchResumes(); // Refresh list

            // Show success feedback (optional, could use toast)
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoad = (resume: SavedResume) => {
        if (!resume.content) return;

        setGeneratedContent(resume.content);
        setSelectedType(resume.type);
        setJobDescription(resume.jobDescription || '');
        setResumeTitle(resume.title);
        setCurrentResumeId(resume.id || null);
        setViewMode('preview');
        setShowHistory(false);
    };

    const handleDelete = async (e: React.MouseEvent, resumeId: string) => {
        e.stopPropagation(); // Prevent loading when clicking delete
        if (!currentUser) return;

        if (window.confirm("Are you sure you want to delete this resume?")) {
            try {
                await deleteResume(currentUser.uid, resumeId);
                await fetchResumes();
                if (currentResumeId === resumeId) {
                    setCurrentResumeId(null);
                    setGeneratedContent('');
                    setResumeTitle('');
                }
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    // Load resumes on mount or when history opens
    useEffect(() => {
        if (showHistory) {
            fetchResumes();
        }
    }, [showHistory, currentUser]);

    const resumeTypes = [
        { type: ResumeType.CHRONOLOGICAL, desc: "Best for showing steady career progression." },
        { type: ResumeType.FUNCTIONAL, desc: "Focuses on skills over work history. Good for career changers." },
        { type: ResumeType.COMBINATION, desc: "Mix of skills and history." },
        { type: ResumeType.TARGETED, desc: "Highly customized to a specific job description." },
        { type: ResumeType.INFOGRAPHIC, desc: "Visual-heavy. Great for designers." },
        { type: ResumeType.MINI, desc: "Brief summary for networking." },
        { type: ResumeType.FEDERAL, desc: "Detailed format for government jobs." },
    ];

    const displayedTypes = showAllTypes ? resumeTypes : resumeTypes.slice(0, 3);

    return (
        <div className={`min-h-screen pb-16 relative ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
            {/* Background */}
            <div className={`fixed inset-0 pointer-events-none ${isLight ? 'bg-gradient-to-br from-slate-100 via-slate-50 to-white' : 'bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900'}`} />
            <div className={`fixed top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isLight ? 'bg-gold/10' : 'bg-gold/5'}`} />
            <div className={`fixed bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isLight ? 'bg-purple-500/10' : 'bg-purple-500/5'}`} />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className={`text-3xl md:text-4xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>AI Resume Studio</h1>
                    <p className={`font-medium mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Generate tailored resumes based on your Valencia degree.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Debug Restore Button */}
                    <button
                        onClick={handleRestoreData}
                        disabled={isRestoring}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium disabled:opacity-50 ${
                            isLight
                                ? 'bg-white border-orange-200 text-orange-500 hover:bg-orange-50'
                                : 'bg-slate-800/50 border-orange-500/30 text-orange-400 hover:bg-orange-500/10'
                        }`}
                        title="Restore Missing Profile Data"
                    >
                        {isRestoring ? <div className="animate-spin h-3 w-3 border-2 border-orange-400 border-t-transparent rounded-full" /> : <Database size={16} />}
                        Fix Data
                    </button>
                    <div className="relative flex-1 md:flex-none">
                        <input
                            type="text"
                            placeholder="Resume Title..."
                            value={resumeTitle}
                            onChange={(e) => setResumeTitle(e.target.value)}
                            className={`w-full md:w-64 px-4 py-2.5 rounded-xl border focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none text-sm font-bold ${
                                isLight
                                    ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                    : 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500'
                            }`}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!generatedContent || isSaving}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 ${
                            isLight
                                ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                : 'bg-slate-800/50 border-white/10 text-slate-300 hover:bg-slate-700/50 hover:border-white/20'
                        }`}
                    >
                        {isSaving ? <div className={`animate-spin h-3 w-3 border-2 border-t-transparent rounded-full ${isLight ? 'border-slate-600' : 'border-white'}`} /> : <Save size={16} />}
                        {isSaving ? 'Saving' : 'Save'}
                    </button>

                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            showHistory
                                ? 'bg-gold/20 border-gold/30 text-gold'
                                : isLight
                                    ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    : 'bg-slate-800/50 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                    >
                        <History size={16} />
                        History
                    </button>
                </div>
            </div>

            {/* Resume History Sidepanel */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
                    <div className={`relative w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 ${
                        isLight ? 'bg-white' : 'bg-slate-900'
                    }`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                <History size={20} /> Saved Resumes
                            </h2>
                            <button onClick={() => setShowHistory(false)} className={`p-2 rounded-full transition-colors ${
                                isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {savedResumes.length === 0 ? (
                                <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No saved resumes yet.</p>
                                </div>
                            ) : (
                                savedResumes.map(resume => (
                                    <div
                                        key={resume.id}
                                        onClick={() => handleLoad(resume)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative ${
                                            currentResumeId === resume.id
                                                ? isLight ? 'bg-slate-50 border-slate-900' : 'bg-slate-800 border-gold'
                                                : isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="pr-8">
                                            <h3 className={`font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{resume.title}</h3>
                                            <div className={`flex items-center gap-2 mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                                <span className={`uppercase font-bold px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>{resume.type}</span>
                                                <span>• {new Date(resume.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                            {resume.targetRole && (
                                                <p className={`mt-2 text-xs line-clamp-1 italic ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Target: {resume.targetRole}</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => handleDelete(e, resume.id || '')}
                                            className={`absolute top-4 right-4 p-2 rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                                isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                            }`}
                                            title="Delete Resume"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-6 print:hidden">
                    <div className={`sticky top-6 rounded-2xl p-6 border ${
                        isLight
                            ? 'bg-white border-slate-200 shadow-lg'
                            : 'bg-slate-800/60 border-white/10 backdrop-blur-xl'
                    }`}>
                        <h3 className={`font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            <FileText size={18} /> Resume Configuration
                        </h3>

                        <div className="space-y-4">

                            {/* Quick Start Buttons */}
                            {(userProfile?.preferences?.targetRoles?.length || 0) > 0 && (
                                <div className={`p-3 rounded-xl border ${
                                    isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-700/50 border-slate-600'
                                }`}>
                                    <label className={`text-xs font-bold uppercase block mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>One-Click Quick Start</label>
                                    <div className="flex flex-wrap gap-2">
                                        {userProfile?.preferences.targetRoles.map((role: string) => (
                                            <button
                                                key={role}
                                                onClick={() => {
                                                    setJobDescription(role);
                                                    handleGenerate(role);
                                                }}
                                                disabled={isGenerating}
                                                className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
                                                    isLight
                                                        ? 'bg-white border-slate-200 hover:border-gold text-slate-600 hover:text-slate-900'
                                                        : 'bg-slate-800 border-slate-600 hover:border-gold text-slate-300 hover:text-white'
                                                }`}
                                            >
                                                <Sparkles size={10} className="text-gold" /> {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className={`block text-sm font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Target Job Description</label>
                                <textarea
                                    className={`w-full h-32 p-3 rounded-xl border text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-none ${
                                        isLight
                                            ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                            : 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400'
                                    }`}
                                    placeholder="Paste the job description here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            {/* Formatting Controls */}
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Formatting</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={`text-xs font-bold uppercase block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Font</label>
                                        <select
                                            className={`w-full p-2 rounded-lg border text-sm focus:ring-1 focus:ring-gold ${
                                                isLight
                                                    ? 'bg-white border-slate-200 text-slate-900'
                                                    : 'bg-slate-700 border-slate-600 text-white'
                                            }`}
                                            value={fontFamily}
                                            onChange={(e) => setFontFamily(e.target.value)}
                                        >
                                            <option value="font-serif">Serif (Times)</option>
                                            <option value="font-sans">Sans (Arial)</option>
                                            <option value="font-mono">Mono (Code)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`text-xs font-bold uppercase block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Size</label>
                                        <select
                                            className={`w-full p-2 rounded-lg border text-sm focus:ring-1 focus:ring-gold ${
                                                isLight
                                                    ? 'bg-white border-slate-200 text-slate-900'
                                                    : 'bg-slate-700 border-slate-600 text-white'
                                            }`}
                                            value={fontSize}
                                            onChange={(e) => setFontSize(e.target.value)}
                                        >
                                            <option value="text-xs">Small</option>
                                            <option value="text-sm">Medium</option>
                                            <option value="text-base">Large</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className={`block text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Resume Type</label>
                                    <button
                                        onClick={handleAiRecommendation}
                                        disabled={!jobDescription || isRecommending}
                                        className={`text-xs font-bold flex items-center gap-1 transition-colors ${
                                            !jobDescription
                                                ? isLight ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 cursor-not-allowed'
                                                : 'text-gold hover:text-gold-light'
                                        }`}
                                    >
                                        {isRecommending ? <div className="animate-spin h-3 w-3 border-2 border-gold border-t-transparent rounded-full" /> : <Bot size={14} />}
                                        Help me choose
                                    </button>
                                </div>

                                {recommendation && (
                                    <div className="mb-4 bg-slate-900 text-white p-4 rounded-xl border border-gold/30 shadow-lg animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 bg-gold/20 rounded-lg text-gold shrink-0 mt-1">
                                                <Sparkles size={16} fill="currentColor" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-sm text-gold">Recommended: {recommendation.recommendedType}</h4>
                                                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-slate-200">{recommendation.successProbability} Success Rate</span>
                                                </div>
                                                <p className="text-xs text-slate-200 mt-1 mb-3 leading-relaxed">
                                                    {recommendation.reasoning}
                                                </p>
                                                <Button size="sm" fullWidth className="h-8 text-xs bg-gold text-slate-950 hover:bg-white" onClick={applyRecommendation}>
                                                    Use {recommendation.recommendedType} Format
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {displayedTypes.map((rt) => (
                                        <button
                                            key={rt.type}
                                            onClick={() => setSelectedType(rt.type)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all text-sm group relative overflow-hidden
                                            ${selectedType === rt.type
                                                    ? isLight
                                                        ? 'bg-slate-50 border-slate-900 shadow-sm'
                                                        : 'bg-slate-700 border-gold shadow-sm'
                                                    : isLight
                                                        ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                        : 'bg-slate-800/50 text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500'
                                            }`}
                                        >
                                            {selectedType === rt.type && <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLight ? 'bg-slate-900' : 'bg-gold'}`}></div>}
                                            <div className={`font-bold ${
                                                selectedType === rt.type
                                                    ? isLight ? 'text-slate-900' : 'text-white'
                                                    : isLight ? 'text-slate-700' : 'text-slate-200'
                                            }`}>{rt.type}</div>
                                            <div className={`text-xs mt-1 ${
                                                selectedType === rt.type
                                                    ? isLight ? 'text-slate-600' : 'text-slate-300'
                                                    : isLight ? 'text-slate-400' : 'text-slate-400'
                                            }`}>{rt.desc}</div>
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setShowAllTypes(!showAllTypes)}
                                        className={`w-full py-2 text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-dashed rounded-lg ${
                                            isLight
                                                ? 'text-slate-500 hover:text-slate-900 border-slate-200 hover:border-slate-400'
                                                : 'text-slate-400 hover:text-white border-slate-600 hover:border-slate-400'
                                        }`}
                                    >
                                        {showAllTypes ? (
                                            <>Show Less <ChevronUp size={14} /></>
                                        ) : (
                                            <>View {resumeTypes.length - 3} More Types <ChevronDown size={14} /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                fullWidth
                                onClick={handleGenerate}
                                disabled={!jobDescription || isGenerating}
                                icon={isGenerating ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" /> : <Sparkles size={16} />}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Resume'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-8 print:w-full print:col-span-12">
                    <div className={`rounded-2xl border shadow-lg min-h-[600px] flex flex-col print:border-none print:shadow-none print:min-h-0 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-white/10'
                    }`}>
                        <div className={`p-4 border-b flex justify-between items-center rounded-t-2xl print:hidden ${
                            isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-700/50 border-white/10'
                        }`}>
                            <div className={`flex gap-2 p-1 rounded-lg border ${
                                isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'
                            }`}>
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                                        viewMode === 'preview'
                                            ? isLight ? 'bg-slate-900 text-white' : 'bg-gold text-black'
                                            : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    Preview
                                </button>
                                <button
                                    onClick={() => setViewMode('edit')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                                        viewMode === 'edit'
                                            ? isLight ? 'bg-slate-900 text-white' : 'bg-gold text-black'
                                            : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    Edit (Markdown)
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleReadabilityCheck}
                                    disabled={!generatedContent || isAnalyzingReadability}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors disabled:opacity-50 ${
                                        isLight
                                            ? 'text-pink-600 border-pink-200 hover:bg-pink-50'
                                            : 'text-pink-400 border-pink-500/30 hover:bg-pink-500/10'
                                    }`}
                                >
                                    {isAnalyzingReadability ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} />}
                                    Human Score
                                </button>
                                <button className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                                    isLight
                                        ? 'text-slate-600 border-slate-200 hover:bg-slate-50'
                                        : 'text-slate-300 border-slate-600 hover:bg-slate-700'
                                }`}>
                                    <Copy size={14} /> Copy
                                </button>
                                <Button size="sm" variant="primary" icon={<Download size={14} />} onClick={handlePrint}>Print/PDF</Button>
                            </div>
                        </div>

                        <div className={`flex-1 p-8 overflow-auto print:p-0 ${isLight ? 'bg-white' : 'bg-slate-800/30'}`}>
                            {!generatedContent ? (
                                <div className={`h-full flex flex-col items-center justify-center opacity-50 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <FileText size={64} strokeWidth={1} />
                                    <p className="mt-4 font-medium">Configure and generate to see your resume here.</p>
                                </div>
                            ) : (
                                viewMode === 'preview' ? (
                                    <div
                                        className={`prose max-w-none leading-relaxed print:text-black ${fontFamily} ${fontSize}
                                            ${isLight ? 'text-slate-800' : 'text-slate-200'}
                                            ${isLight ? '[&_h1]:text-slate-900' : '[&_h1]:text-white'} [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:border-b [&_h1]:pb-2 [&_h1]:mb-4
                                            ${isLight ? '[&_h2]:text-slate-900' : '[&_h2]:text-white'} [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:border-l-4 [&_h2]:border-gold [&_h2]:pl-3
                                            ${isLight ? '[&_h3]:text-slate-800' : '[&_h3]:text-slate-100'} [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-1
                                            ${isLight ? '[&_strong]:text-slate-900' : '[&_strong]:text-white'} [&_strong]:font-bold
                                            [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mt-2 [&_ul]:space-y-1
                                            ${isLight ? '[&_li]:text-slate-700' : '[&_li]:text-slate-300'}
                                            [&_p]:mt-2 [&_p]:mb-2
                                        `}
                                        dangerouslySetInnerHTML={{
                                            __html: generatedContent
                                                // Headers - match the whole line
                                                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                                                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                                                .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                                                // Bold - match double asterisks (non-greedy)
                                                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                                                // Italic - single asterisks (after bold, only inline text)
                                                .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
                                                // Bullet points with asterisk at start of line
                                                .replace(/^\*\s+(.+)$/gm, '<li>$1</li>')
                                                // Bullet points with dash at start of line
                                                .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
                                                // Wrap consecutive list items in ul
                                                .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                                                // Numbered lists
                                                .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
                                                // Paragraphs from double newlines
                                                .replace(/\n\n/g, '</p><p>')
                                                // Single newlines to br
                                                .replace(/\n/g, '<br/>')
                                                // Clean up any remaining stray asterisks from malformed markdown
                                                .replace(/\s\*\s/g, ' ')
                                        }}
                                    />
                                ) : (
                                    <textarea
                                        value={generatedContent}
                                        onChange={(e) => setGeneratedContent(e.target.value)}
                                        className={`w-full h-full font-mono text-sm p-6 rounded-xl border border-transparent focus:ring-0 resize-none outline-none leading-relaxed ${
                                            isLight
                                                ? 'bg-slate-50 text-slate-800 focus:border-slate-300'
                                                : 'bg-slate-700/50 text-slate-200 focus:border-slate-500'
                                        }`}
                                        spellCheck={false}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Human Readability Score Panel */}
            {showReadabilityPanel && (
                <div className="fixed inset-0 z-50 flex justify-end print:hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowReadabilityPanel(false)}></div>
                    <div className={`relative w-full max-w-lg h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 ${
                        isLight ? 'bg-white' : 'bg-slate-900'
                    }`}>
                        {/* Header */}
                        <div className={`sticky top-0 border-b p-4 flex justify-between items-center z-10 ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg text-white">
                                    <Heart size={20} />
                                </div>
                                <div>
                                    <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Human Readability Score</h2>
                                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Does your resume sound like YOU?</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReadabilityPanel(false)} className={`p-2 rounded-full transition-colors ${
                                isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Loading State */}
                            {isAnalyzingReadability && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="relative">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isLight ? 'bg-pink-100' : 'bg-pink-500/20'}`}>
                                            <Loader2 className="text-pink-500 animate-spin" size={40} />
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-4 border-pink-300 animate-ping opacity-20" />
                                    </div>
                                    <h3 className={`text-lg font-bold mt-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>Analyzing authenticity...</h3>
                                    <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Checking for robotic language patterns</p>
                                </div>
                            )}

                            {/* Results */}
                            {!isAnalyzingReadability && readabilityResult && (
                                <>
                                    {/* Score Header */}
                                    <div className={`rounded-2xl p-6 border ${getReadabilityBg(readabilityResult.score)}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="text-5xl">{getReadabilityEmoji(readabilityResult.score)}</span>
                                                <div>
                                                    <div className={`text-4xl font-bold ${getReadabilityColor(readabilityResult.score)}`}>
                                                        {readabilityResult.score}
                                                    </div>
                                                    <div className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-800'}`}>
                                                        {getReadabilityLabel(readabilityResult.score)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getToneBadgeColor(readabilityResult.tone)}`}>
                                                {readabilityResult.tone}
                                            </div>
                                        </div>
                                    </div>

                                    {/* What's Working (Strengths) */}
                                    {readabilityResult.strengths.length > 0 && (
                                        <div>
                                            <h3 className={`text-sm font-bold flex items-center gap-2 mb-3 ${isLight ? 'text-green-600' : 'text-green-400'}`}>
                                                <CheckCircle size={16} /> What Sounds Authentic
                                            </h3>
                                            <div className="space-y-2">
                                                {readabilityResult.strengths.map((strength, i) => (
                                                    <div key={i} className={`flex items-start gap-2 text-sm p-3 rounded-lg border ${
                                                        isLight
                                                            ? 'text-slate-700 bg-green-50 border-green-100'
                                                            : 'text-slate-200 bg-green-500/10 border-green-500/20'
                                                    }`}>
                                                        <span className="text-green-500 mt-0.5">✓</span>
                                                        {strength}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Robotic Phrases */}
                                    {readabilityResult.roboticPhrases.length > 0 && (
                                        <div>
                                            <h3 className={`text-sm font-bold flex items-center gap-2 mb-3 ${isLight ? 'text-red-600' : 'text-red-400'}`}>
                                                <XCircle size={16} /> Robot Language Detected
                                            </h3>
                                            <div className="space-y-3">
                                                {readabilityResult.roboticPhrases.map((item, i) => (
                                                    <div key={i} className={`rounded-xl p-4 border ${
                                                        isLight ? 'bg-red-50 border-red-100' : 'bg-red-500/10 border-red-500/20'
                                                    }`}>
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-red-400 mt-0.5">🤖</span>
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-medium line-through ${isLight ? 'text-red-700' : 'text-red-300'}`}>
                                                                    "{item.phrase}"
                                                                </p>
                                                                <div className="mt-2 flex items-start gap-2">
                                                                    <span className="text-green-500 shrink-0">→</span>
                                                                    <p className={`text-sm font-medium ${isLight ? 'text-green-700' : 'text-green-400'}`}>
                                                                        "{item.suggestion}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    {readabilityResult.tips.length > 0 && (
                                        <div>
                                            <h3 className={`text-sm font-bold flex items-center gap-2 mb-3 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                                                <Smile size={16} className="text-gold" /> Tips to Sound More Human
                                            </h3>
                                            <ul className="space-y-2">
                                                {readabilityResult.tips.map((tip, i) => (
                                                    <li key={i} className={`flex items-start gap-2 text-sm p-3 rounded-lg border ${
                                                        isLight
                                                            ? 'text-slate-600 bg-slate-50 border-slate-100'
                                                            : 'text-slate-300 bg-slate-800/50 border-slate-700'
                                                    }`}>
                                                        <span className="text-gold font-bold">{i + 1}.</span>
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className={`pt-4 border-t flex gap-3 ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                                        <Button
                                            variant="outline"
                                            fullWidth
                                            onClick={handleReadabilityCheck}
                                            disabled={isAnalyzingReadability}
                                            icon={<Loader2 size={14} className={isAnalyzingReadability ? 'animate-spin' : 'hidden'} />}
                                        >
                                            Re-analyze
                                        </Button>
                                        <Button
                                            variant="primary"
                                            fullWidth
                                            onClick={() => {
                                                setViewMode('edit');
                                                setShowReadabilityPanel(false);
                                            }}
                                        >
                                            Edit Resume
                                        </Button>
                                    </div>
                                </>
                            )}

                            {/* No Results Yet */}
                            {!isAnalyzingReadability && !readabilityResult && (
                                <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Heart size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>Click "Human Score" to analyze your resume</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                reason="no_credits"
            />
            </div>
        </div>
    );
};
