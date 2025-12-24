
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UpgradeModal } from '../components/UpgradeModal';
import { ResumeType } from '../types';
import { FileText, Download, Copy, Sparkles, ChevronDown, ChevronUp, Bot, ArrowRight, Settings, AlertCircle, Save, History, Trash2, Edit3, X, Database } from 'lucide-react';
import { generateResume, recommendResumeStrategy } from '../services/geminiService';
import { saveResume, getUserResumes, deleteResume, SavedResume } from '../services/resumeService';

export const ResumeBuilder: React.FC = () => {
    const { currentUser, userProfile, useCredit, canUseCredits, isTrialActive, saveUserProfile } = useAuth();
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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-display font-bold text-jalanea-900">AI Resume Studio</h1>
                    <p className="text-jalanea-600 font-medium mt-1">Generate tailored resumes based on your Valencia degree.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Debug Restore Button */}
                    <Button
                        variant="outline"
                        onClick={handleRestoreData}
                        disabled={isRestoring}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 bg-white"
                        icon={isRestoring ? <div className="animate-spin h-3 w-3 border-2 border-orange-600 border-t-transparent rounded-full" /> : <Database size={16} />}
                        title="Restore Missing Profile Data"
                    >
                        Fix Data
                    </Button>
                    <div className="relative flex-1 md:flex-none">
                        <input
                            type="text"
                            placeholder="Resume Title..."
                            value={resumeTitle}
                            onChange={(e) => setResumeTitle(e.target.value)}
                            className="w-full md:w-64 px-4 py-2 rounded-lg border border-jalanea-200 focus:ring-2 focus:ring-gold focus:border-transparent text-sm font-bold text-jalanea-900"
                        />
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleSave}
                        disabled={!generatedContent || isSaving}
                        icon={isSaving ? <div className="animate-spin h-3 w-3 border-2 border-jalanea-900 border-t-transparent rounded-full" /> : <Save size={16} />}
                    >
                        {isSaving ? 'Saving' : 'Save'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setShowHistory(!showHistory)}
                        icon={<History size={16} />}
                        className={showHistory ? 'bg-jalanea-100 border-jalanea-300' : ''}
                    >
                        History
                    </Button>
                </div>
            </div>

            {/* Resume History Sidepanel */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-jalanea-900 flex items-center gap-2">
                                <History size={20} /> Saved Resumes
                            </h2>
                            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-jalanea-100 rounded-full text-jalanea-500 hover:text-jalanea-900">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {savedResumes.length === 0 ? (
                                <div className="text-center py-12 text-jalanea-400">
                                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No saved resumes yet.</p>
                                </div>
                            ) : (
                                savedResumes.map(resume => (
                                    <div
                                        key={resume.id}
                                        onClick={() => handleLoad(resume)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative
                                            ${currentResumeId === resume.id ? 'bg-jalanea-50 border-jalanea-900' : 'bg-white border-jalanea-200 hover:border-jalanea-300'}
                                        `}
                                    >
                                        <div className="pr-8">
                                            <h3 className="font-bold text-jalanea-900 truncate">{resume.title}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-jalanea-500">
                                                <span className="uppercase font-bold bg-jalanea-100 px-1.5 py-0.5 rounded">{resume.type}</span>
                                                <span>• {new Date(resume.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                            {resume.targetRole && (
                                                <p className="mt-2 text-xs text-jalanea-600 line-clamp-1 italic">Target: {resume.targetRole}</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => handleDelete(e, resume.id || '')}
                                            className="absolute top-4 right-4 p-1.5 text-jalanea-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
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
                    <Card className="sticky top-6" variant="solid-white">
                        <h3 className="font-bold text-jalanea-900 mb-4 flex items-center gap-2">
                            <FileText size={18} /> Resume Configuration
                        </h3>

                        <div className="space-y-4">

                            {/* Quick Start Buttons */}
                            {(userProfile?.preferences?.targetRoles?.length || 0) > 0 && (
                                <div className="bg-jalanea-50 p-3 rounded-xl border border-jalanea-100">
                                    <label className="text-xs font-bold text-jalanea-500 uppercase block mb-2">One-Click Quick Start</label>
                                    <div className="flex flex-wrap gap-2">
                                        {userProfile?.preferences.targetRoles.map((role: string) => (
                                            <button
                                                key={role}
                                                onClick={() => {
                                                    setJobDescription(role);
                                                    handleGenerate(role);
                                                }}
                                                disabled={isGenerating}
                                                className="px-3 py-1.5 bg-white border border-jalanea-200 hover:border-gold hover:text-jalanea-900 text-jalanea-600 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                            >
                                                <Sparkles size={10} className="text-gold" /> {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-jalanea-900 mb-2">Target Job Description</label>
                                <textarea
                                    className="w-full h-32 p-3 rounded-xl border border-jalanea-200 text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-none bg-jalanea-50"
                                    placeholder="Paste the job description here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            {/* Formatting Controls */}
                            <div>
                                <label className="block text-sm font-bold text-jalanea-900 mb-2">Formatting</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-jalanea-500 uppercase block mb-1">Font</label>
                                        <select
                                            className="w-full p-2 rounded-lg border border-jalanea-200 text-sm bg-white focus:ring-1 focus:ring-gold"
                                            value={fontFamily}
                                            onChange={(e) => setFontFamily(e.target.value)}
                                        >
                                            <option value="font-serif">Serif (Times)</option>
                                            <option value="font-sans">Sans (Arial)</option>
                                            <option value="font-mono">Mono (Code)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-jalanea-500 uppercase block mb-1">Size</label>
                                        <select
                                            className="w-full p-2 rounded-lg border border-jalanea-200 text-sm bg-white focus:ring-1 focus:ring-gold"
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
                                    <label className="block text-sm font-bold text-jalanea-900">Resume Type</label>
                                    <button
                                        onClick={handleAiRecommendation}
                                        disabled={!jobDescription || isRecommending}
                                        className={`text-xs font-bold flex items-center gap-1 transition-colors ${!jobDescription ? 'text-jalanea-300 cursor-not-allowed' : 'text-gold hover:text-jalanea-900'}`}
                                    >
                                        {isRecommending ? <div className="animate-spin h-3 w-3 border-2 border-gold border-t-transparent rounded-full" /> : <Bot size={14} />}
                                        Help me choose
                                    </button>
                                </div>

                                {recommendation && (
                                    <div className="mb-4 bg-jalanea-900 text-white p-4 rounded-xl border border-gold/30 shadow-lg animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 bg-gold/20 rounded-lg text-gold shrink-0 mt-1">
                                                <Sparkles size={16} fill="currentColor" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-sm text-gold">Recommended: {recommendation.recommendedType}</h4>
                                                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-jalanea-200">{recommendation.successProbability} Success Rate</span>
                                                </div>
                                                <p className="text-xs text-jalanea-200 mt-1 mb-3 leading-relaxed">
                                                    {recommendation.reasoning}
                                                </p>
                                                <Button size="sm" fullWidth className="h-8 text-xs bg-gold text-jalanea-950 hover:bg-white" onClick={applyRecommendation}>
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
                                            className={`w-full text-left p-3 rounded-lg border transition-all text-sm group
                                            ${selectedType === rt.type
                                                    ? 'bg-jalanea-50 border-jalanea-900 shadow-sm relative overflow-hidden'
                                                    : 'bg-white text-jalanea-600 border-jalanea-200 hover:bg-jalanea-50 hover:border-jalanea-300'}
                                        `}
                                        >
                                            {selectedType === rt.type && <div className="absolute left-0 top-0 bottom-0 w-1 bg-jalanea-900"></div>}
                                            <div className={`font-bold ${selectedType === rt.type ? 'text-jalanea-900' : ''}`}>{rt.type}</div>
                                            <div className={`text-xs mt-1 ${selectedType === rt.type ? 'text-jalanea-600' : 'text-jalanea-400'}`}>{rt.desc}</div>
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setShowAllTypes(!showAllTypes)}
                                        className="w-full py-2 text-xs font-bold text-jalanea-500 hover:text-jalanea-900 flex items-center justify-center gap-1 transition-colors border border-dashed border-jalanea-200 rounded-lg hover:border-jalanea-400"
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
                    </Card>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-8 print:w-full print:col-span-12">
                    <div className="bg-white rounded-2xl border border-jalanea-200 shadow-lg min-h-[600px] flex flex-col print:border-none print:shadow-none print:min-h-0">
                        <div className="p-4 border-b border-jalanea-200 flex justify-between items-center bg-jalanea-50/50 rounded-t-2xl print:hidden">
                            <div className="flex gap-2 bg-white p-1 rounded-lg border border-jalanea-200">
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-jalanea-900 text-white' : 'text-jalanea-600 hover:bg-jalanea-100'}`}
                                >
                                    Preview
                                </button>
                                <button
                                    onClick={() => setViewMode('edit')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'edit' ? 'bg-jalanea-900 text-white' : 'text-jalanea-600 hover:bg-jalanea-100'}`}
                                >
                                    Edit (Markdown)
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" icon={<Copy size={14} />}>Copy</Button>
                                <Button size="sm" variant="primary" icon={<Download size={14} />} onClick={handlePrint}>Print/PDF</Button>
                            </div>
                        </div>

                        <div className="flex-1 p-8 bg-white overflow-auto print:p-0">
                            {!generatedContent ? (
                                <div className="h-full flex flex-col items-center justify-center text-jalanea-400 opacity-50">
                                    <FileText size={64} strokeWidth={1} />
                                    <p className="mt-4 font-medium">Configure and generate to see your resume here.</p>
                                </div>
                            ) : (
                                viewMode === 'preview' ? (
                                    <div
                                        className={`prose max-w-none text-jalanea-800 leading-relaxed print:text-black ${fontFamily} ${fontSize} 
                                            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-jalanea-900 [&_h1]:border-b [&_h1]:pb-2 [&_h1]:mb-4
                                            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-jalanea-900 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:border-l-4 [&_h2]:border-gold [&_h2]:pl-3
                                            [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-jalanea-800 [&_h3]:mt-4 [&_h3]:mb-1
                                            [&_strong]:font-bold [&_strong]:text-jalanea-900
                                            [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mt-2 [&_ul]:space-y-1
                                            [&_li]:text-jalanea-700
                                            [&_p]:mt-2 [&_p]:mb-2
                                        `}
                                        dangerouslySetInnerHTML={{
                                            __html: generatedContent
                                                // Headers
                                                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                                                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                                                .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                                                // Bold
                                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                                // Bullet points - convert markdown lists to HTML
                                                .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
                                                .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                                                // Numbered lists
                                                .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
                                                // Line breaks for remaining newlines
                                                .replace(/\n\n/g, '</p><p>')
                                                .replace(/\n/g, '<br/>')
                                        }}
                                    />
                                ) : (
                                    <textarea
                                        value={generatedContent}
                                        onChange={(e) => setGeneratedContent(e.target.value)}
                                        className="w-full h-full font-mono text-sm bg-jalanea-50 text-jalanea-800 p-6 rounded-xl border border-transparent focus:border-jalanea-300 focus:ring-0 resize-none outline-none leading-relaxed"
                                        spellCheck={false}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </div>
    );
};
