import React, { useState } from 'react';
import { X, FileText, Briefcase, Sparkles, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Loader2, Target, BookOpen, Wand2, Layout } from 'lucide-react';
import { Button } from './Button';
import { analyzeResumeATS, ATSAnalysisResult } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

interface ATSScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialJobDescription?: string;
}

type Step = 'job' | 'resume' | 'analyzing' | 'results';

// Grade color helper
const getGradeColor = (grade: string): string => {
    switch (grade) {
        case 'A': return 'text-green-400';
        case 'B': return 'text-blue-400';
        case 'C': return 'text-yellow-400';
        case 'D': return 'text-orange-400';
        case 'F': return 'text-red-400';
        default: return 'text-white';
    }
};

const getGradeBg = (grade: string): string => {
    switch (grade) {
        case 'A': return 'bg-green-500/20 border-green-500/40';
        case 'B': return 'bg-blue-500/20 border-blue-500/40';
        case 'C': return 'bg-yellow-500/20 border-yellow-500/40';
        case 'D': return 'bg-orange-500/20 border-orange-500/40';
        case 'F': return 'bg-red-500/20 border-red-500/40';
        default: return 'bg-jalanea-700/50';
    }
};

const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
};

export const ATSScoreModal: React.FC<ATSScoreModalProps> = ({
    isOpen,
    onClose,
    initialJobDescription = ''
}) => {
    const { useCredit, canUseCredits, isTrialActive } = useAuth();
    const [step, setStep] = useState<Step>('job');
    const [jobDescription, setJobDescription] = useState(initialJobDescription);
    const [resumeText, setResumeText] = useState('');
    const [results, setResults] = useState<ATSAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleClose = () => {
        // Reset state on close
        setStep('job');
        setJobDescription(initialJobDescription);
        setResumeText('');
        setResults(null);
        setError(null);
        onClose();
    };

    const handleAnalyze = async () => {
        // Check trial status
        if (!isTrialActive()) {
            setError('Your trial has expired. Please upgrade to continue.');
            return;
        }

        // Check credits
        if (!canUseCredits('atsAnalysis')) {
            setError("You don't have enough credits for ATS analysis.");
            return;
        }

        setStep('analyzing');
        setError(null);

        try {
            // Deduct credit
            const creditResult = await useCredit('atsAnalysis');
            if (!creditResult.success) {
                setError('Could not deduct credits. Please try again.');
                setStep('resume');
                return;
            }

            const result = await analyzeResumeATS(resumeText, jobDescription);

            if (result) {
                setResults(result);
                setStep('results');
            } else {
                setError('Analysis failed. Please try again.');
                setStep('resume');
            }
        } catch (err) {
            console.error('ATS Analysis Error:', err);
            setError('Something went wrong. Please try again.');
            setStep('resume');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'job':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-gold/20 rounded-xl">
                                <Briefcase className="text-gold" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Step 1: Job Description</h3>
                                <p className="text-sm text-jalanea-400">Paste the job posting you're applying for</p>
                            </div>
                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here..."
                            className="w-full h-48 px-4 py-3 bg-jalanea-800/50 border border-jalanea-700 rounded-xl text-white placeholder-jalanea-500 focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none text-sm"
                        />

                        <div className="flex justify-end">
                            <Button
                                onClick={() => setStep('resume')}
                                disabled={!jobDescription.trim() || jobDescription.length < 50}
                                variant="primary"
                                className="flex items-center gap-2"
                            >
                                Next <ArrowRight size={16} />
                            </Button>
                        </div>
                    </div>
                );

            case 'resume':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-gold/20 rounded-xl">
                                <FileText className="text-gold" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Step 2: Your Resume</h3>
                                <p className="text-sm text-jalanea-400">Paste your resume text to analyze</p>
                            </div>
                        </div>

                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume content here (plain text works best)..."
                            className="w-full h-48 px-4 py-3 bg-jalanea-800/50 border border-jalanea-700 rounded-xl text-white placeholder-jalanea-500 focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none text-sm"
                        />

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button
                                onClick={() => setStep('job')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back
                            </Button>
                            <Button
                                onClick={handleAnalyze}
                                disabled={!resumeText.trim() || resumeText.length < 100}
                                variant="primary"
                                className="flex items-center gap-2"
                            >
                                <Sparkles size={16} /> Analyze ATS Score
                            </Button>
                        </div>
                    </div>
                );

            case 'analyzing':
                return (
                    <div className="text-center py-12">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center">
                                    <Loader2 className="text-gold animate-spin" size={40} />
                                </div>
                                <div className="absolute inset-0 rounded-full border-4 border-gold/30 animate-ping" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Resume</h3>
                        <p className="text-jalanea-400 text-sm">
                            Comparing keywords, skills, and experience match...
                        </p>
                    </div>
                );

            case 'results':
                if (!results) return null;
                return (
                    <div className="space-y-6">
                        {/* Score Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">ATS Analysis Complete</h3>
                                <p className="text-sm text-jalanea-400">{results.summary}</p>
                            </div>
                            <div className={`flex items-center gap-4 p-4 rounded-xl border ${getGradeBg(results.grade)}`}>
                                <div className="text-center">
                                    <div className={`text-4xl font-bold ${getGradeColor(results.grade)}`}>
                                        {results.grade}
                                    </div>
                                    <div className="text-xs text-jalanea-400">Grade</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                                        {results.overallScore}
                                    </div>
                                    <div className="text-xs text-jalanea-400">Score</div>
                                </div>
                            </div>
                        </div>

                        {/* Section Breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'skills', icon: Target, label: 'Skills Match' },
                                { key: 'experience', icon: Briefcase, label: 'Experience' },
                                { key: 'education', icon: BookOpen, label: 'Education' },
                                { key: 'formatting', icon: Layout, label: 'Formatting' },
                            ].map(({ key, icon: Icon, label }) => {
                                const section = results.sectionBreakdown[key as keyof typeof results.sectionBreakdown];
                                return (
                                    <div key={key} className="bg-jalanea-800/50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Icon size={14} className="text-jalanea-400" />
                                                <span className="text-sm text-white">{label}</span>
                                            </div>
                                            <span className={`text-sm font-bold ${getScoreColor(section.score)}`}>
                                                {section.score}
                                            </span>
                                        </div>
                                        <p className="text-xs text-jalanea-400 line-clamp-2">{section.feedback}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Keywords */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Matched */}
                            <div>
                                <h4 className="text-sm font-semibold text-green-400 flex items-center gap-1.5 mb-2">
                                    <CheckCircle size={14} /> Matched Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {results.matchedKeywords.slice(0, 8).map((kw, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Missing */}
                            <div>
                                <h4 className="text-sm font-semibold text-red-400 flex items-center gap-1.5 mb-2">
                                    <AlertCircle size={14} /> Missing Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {results.missingKeywords.slice(0, 8).map((kw, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-xs">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div>
                            <h4 className="text-sm font-semibold text-gold flex items-center gap-1.5 mb-3">
                                <Wand2 size={14} /> Improvement Suggestions
                            </h4>
                            <ul className="space-y-2">
                                {results.suggestions.map((suggestion, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-jalanea-300">
                                        <span className="text-gold mt-0.5">•</span>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between pt-4 border-t border-jalanea-700">
                            <Button
                                onClick={() => {
                                    setStep('resume');
                                    setResults(null);
                                }}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={16} /> Try Again
                            </Button>
                            <Button onClick={handleClose} variant="primary">
                                Done
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-jalanea-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
                {/* Header */}
                <div className="sticky top-0 bg-jalanea-900 border-b border-jalanea-700 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-gold to-amber-500 rounded-lg">
                            <Target className="text-jalanea-950" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-display font-bold text-white">ATS Score Checker</h2>
                            <p className="text-xs text-jalanea-400">See how well your resume matches the job</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-jalanea-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Step Indicators */}
                {step !== 'results' && (
                    <div className="px-6 pt-4">
                        <div className="flex items-center gap-2">
                            {['job', 'resume', 'analyzing'].map((s, i) => (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                                        step === s
                                            ? 'bg-gold text-jalanea-950'
                                            : ['job', 'resume', 'analyzing'].indexOf(step) > i
                                                ? 'bg-green-500 text-white'
                                                : 'bg-jalanea-700 text-jalanea-400'
                                    }`}>
                                        {['job', 'resume', 'analyzing'].indexOf(step) > i ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    {i < 2 && (
                                        <div className={`flex-1 h-0.5 transition-colors ${
                                            ['job', 'resume', 'analyzing'].indexOf(step) > i
                                                ? 'bg-green-500'
                                                : 'bg-jalanea-700'
                                        }`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default ATSScoreModal;
