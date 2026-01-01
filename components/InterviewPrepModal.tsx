import React, { useState, useMemo } from 'react';
import {
    X, Target, Briefcase, Clock, ChevronRight, Loader2,
    CheckCircle2, Star, Award, MessageSquare, Lightbulb,
    AlertCircle, RefreshCw, Save, Sparkles, Play, SkipForward
} from 'lucide-react';
import { Button } from './Button';
import { SavedJob } from '../types';
import {
    generateInterviewQuestions,
    generateGeneralInterviewQuestions,
    evaluateInterviewResponse,
    InterviewQuestion,
    InterviewFeedback,
    InterviewJobContext,
    InterviewUserContext
} from '../services/geminiService';

// ============================================
// TYPES
// ============================================

type ModalView = 'job_selection' | 'loading' | 'interview' | 'feedback' | 'complete';

interface InterviewPrepModalProps {
    isOpen: boolean;
    onClose: () => void;
    savedJobs?: SavedJob[];
    userProfile?: {
        fullName?: string;
        education?: any[];
        experience?: any[];
        preferences?: {
            targetRoles?: string[];
        };
    };
    onSaveSession?: (session: InterviewSession) => void;
}

interface InterviewSession {
    id: string;
    jobId: string;
    company: string;
    role: string;
    date: string;
    overallScore: number;
    questionsAnswered: number;
    strengths: string[];
    improvements: string[];
}

interface AnswerRecord {
    questionId: string;
    response: string;
    feedback: InterviewFeedback;
}

// ============================================
// CONSTANTS
// ============================================

const QUESTION_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    behavioral: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Behavioral' },
    technical: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Technical' },
    situational: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Situational' },
    company_specific: { bg: 'bg-green-100', text: 'text-green-700', label: 'Company' }
};

// ============================================
// MAIN COMPONENT
// ============================================

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({
    isOpen,
    onClose,
    savedJobs = [],
    userProfile,
    onSaveSession
}) => {
    // View state
    const [view, setView] = useState<ModalView>('job_selection');
    const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
    const [isGeneralPractice, setIsGeneralPractice] = useState(false);

    // Interview state
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userResponse, setUserResponse] = useState('');
    const [answers, setAnswers] = useState<AnswerRecord[]>([]);
    const [currentFeedback, setCurrentFeedback] = useState<InterviewFeedback | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Timer state (optional)
    const [useTimer, setUseTimer] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes

    // Build user context for AI
    const userContext: InterviewUserContext = useMemo(() => ({
        name: userProfile?.fullName,
        education: userProfile?.education?.map(e => e.degree || e.program).join(', '),
        experience: userProfile?.experience?.map(e => e.role).join(', '),
        skills: userProfile?.education?.flatMap(e => e.skills || []),
        targetRoles: userProfile?.preferences?.targetRoles
    }), [userProfile]);

    // Build job context
    const jobContext: InterviewJobContext | undefined = useMemo(() => {
        if (!selectedJob) return undefined;
        return {
            id: selectedJob.job.id,
            title: selectedJob.job.title,
            company: selectedJob.job.company,
            description: selectedJob.job.description,
            skills: selectedJob.job.skills
        };
    }, [selectedJob]);

    // Current question
    const currentQuestion = questions[currentQuestionIndex];

    // Calculate overall score
    const overallScore = useMemo(() => {
        if (answers.length === 0) return 0;
        const total = answers.reduce((sum, a) => sum + a.feedback.score, 0);
        return Math.round(total / answers.length);
    }, [answers]);

    // Aggregate strengths and improvements
    const aggregatedFeedback = useMemo(() => {
        const allStrengths = answers.flatMap(a => a.feedback.strengths);
        const allImprovements = answers.flatMap(a => a.feedback.improvements);

        // Count occurrences and get top items
        const strengthCounts = new Map<string, number>();
        const improvementCounts = new Map<string, number>();

        allStrengths.forEach(s => strengthCounts.set(s, (strengthCounts.get(s) || 0) + 1));
        allImprovements.forEach(i => improvementCounts.set(i, (improvementCounts.get(i) || 0) + 1));

        const topStrengths = [...strengthCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([s]) => s);

        const topImprovements = [...improvementCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([i]) => i);

        return { strengths: topStrengths, improvements: topImprovements };
    }, [answers]);

    // Reset modal state
    const resetModal = () => {
        setView('job_selection');
        setSelectedJob(null);
        setIsGeneralPractice(false);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserResponse('');
        setAnswers([]);
        setCurrentFeedback(null);
        setTimeRemaining(120);
    };

    // Handle close
    const handleClose = () => {
        resetModal();
        onClose();
    };

    // Start interview with selected job
    const handleStartInterview = async (job?: SavedJob) => {
        setView('loading');

        try {
            let generatedQuestions: InterviewQuestion[];

            if (job) {
                setSelectedJob(job);
                setIsGeneralPractice(false);
                const jobCtx: InterviewJobContext = {
                    id: job.job.id,
                    title: job.job.title,
                    company: job.job.company,
                    description: job.job.description,
                    skills: job.job.skills
                };
                generatedQuestions = await generateInterviewQuestions(jobCtx, userContext);
            } else {
                setIsGeneralPractice(true);
                generatedQuestions = await generateGeneralInterviewQuestions(userContext);
            }

            setQuestions(generatedQuestions);
            setCurrentQuestionIndex(0);
            setView('interview');
        } catch (error) {
            console.error('Error generating questions:', error);
            // Still show interview with fallback questions
            setView('interview');
        }
    };

    // Submit answer
    const handleSubmitAnswer = async () => {
        if (!userResponse.trim() || !currentQuestion) return;

        setIsEvaluating(true);

        try {
            const feedback = await evaluateInterviewResponse(
                currentQuestion,
                userResponse,
                jobContext,
                userContext
            );

            setCurrentFeedback(feedback);
            setAnswers(prev => [...prev, {
                questionId: currentQuestion.id,
                response: userResponse,
                feedback
            }]);
            setView('feedback');
        } catch (error) {
            console.error('Error evaluating response:', error);
            // Show fallback feedback
            setCurrentFeedback({
                score: 60,
                strengths: ['You provided a response'],
                improvements: ['Try to add more specific examples'],
                suggestedAnswer: 'Consider using the STAR method for behavioral questions.'
            });
            setView('feedback');
        } finally {
            setIsEvaluating(false);
        }
    };

    // Skip question
    const handleSkipQuestion = () => {
        setAnswers(prev => [...prev, {
            questionId: currentQuestion.id,
            response: '[Skipped]',
            feedback: {
                score: 0,
                strengths: [],
                improvements: ['Question was skipped'],
                suggestedAnswer: ''
            }
        }]);
        handleNextQuestion();
    };

    // Move to next question
    const handleNextQuestion = () => {
        setUserResponse('');
        setCurrentFeedback(null);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setView('interview');
            setTimeRemaining(120);
        } else {
            setView('complete');
        }
    };

    // Save session
    const handleSaveSession = () => {
        if (!onSaveSession) return;

        const session: InterviewSession = {
            id: `session-${Date.now()}`,
            jobId: selectedJob?.job.id || 'general',
            company: selectedJob?.job.company || 'General Practice',
            role: selectedJob?.job.title || 'General Interview',
            date: new Date().toISOString(),
            overallScore,
            questionsAnswered: answers.filter(a => a.response !== '[Skipped]').length,
            strengths: aggregatedFeedback.strengths,
            improvements: aggregatedFeedback.improvements
        };

        onSaveSession(session);
        handleClose();
    };

    // Practice again
    const handlePracticeAgain = () => {
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserResponse('');
        setAnswers([]);
        setCurrentFeedback(null);
        setView('job_selection');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-[900px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Target size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Interview Prep Mode</h2>
                                <p className="text-sm text-white/80">
                                    {view === 'job_selection' && 'Practice makes perfect. Let\'s prepare for your interview.'}
                                    {view === 'loading' && 'Generating personalized questions...'}
                                    {view === 'interview' && (selectedJob ? `Practicing for ${selectedJob.job.company}` : 'General Practice')}
                                    {view === 'feedback' && 'Review your feedback'}
                                    {view === 'complete' && 'Great job completing your mock interview!'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress bar for interview */}
                    {(view === 'interview' || view === 'feedback') && questions.length > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-white/70 mb-1">
                                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                                <span>{Math.round(((currentQuestionIndex + (view === 'feedback' ? 1 : 0)) / questions.length) * 100)}% complete</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + (view === 'feedback' ? 1 : 0)) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* VIEW 1: Job Selection */}
                    {view === 'job_selection' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Select a job to practice for:</h3>
                                <p className="text-sm text-gray-500">
                                    We'll generate tailored questions based on the job requirements and your background.
                                </p>
                            </div>

                            {/* Saved Jobs List */}
                            {savedJobs.length > 0 ? (
                                <div className="space-y-3">
                                    {savedJobs.map((savedJob) => (
                                        <button
                                            key={savedJob.id}
                                            onClick={() => handleStartInterview(savedJob)}
                                            className="w-full p-4 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-xl transition-all text-left group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-violet-100 transition-colors">
                                                        <Briefcase size={20} className="text-gray-400 group-hover:text-violet-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 group-hover:text-violet-700">
                                                            {savedJob.job.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{savedJob.job.company}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {savedJob.job.matchScore && (
                                                        <span className="text-sm font-medium text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                                                            {savedJob.job.matchScore}% Match
                                                        </span>
                                                    )}
                                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-violet-600" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                                    <Briefcase size={32} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-gray-500 text-sm">No saved jobs yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Save jobs from the Job Board to practice for specific interviews</p>
                                </div>
                            )}

                            {/* General Practice Option */}
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleStartInterview()}
                                    className="w-full p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-dashed border-violet-300 hover:border-violet-400 rounded-xl transition-all text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-violet-100 rounded-lg">
                                            <Sparkles size={20} className="text-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-violet-700">Practice General Questions</h4>
                                            <p className="text-sm text-violet-500">
                                                Practice common interview questions that apply to most roles
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VIEW 2: Loading */}
                    {view === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600" />
                                <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-600" />
                            </div>
                            <p className="mt-6 text-lg font-medium text-gray-900">
                                Generating interview questions...
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                {selectedJob
                                    ? `Tailoring questions for ${selectedJob.job.title} at ${selectedJob.job.company}`
                                    : 'Preparing general practice questions'
                                }
                            </p>
                        </div>
                    )}

                    {/* VIEW 3: Interview */}
                    {view === 'interview' && currentQuestion && (
                        <div className="space-y-6">
                            {/* Question Card */}
                            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        QUESTION_TYPE_COLORS[currentQuestion.type]?.bg || 'bg-gray-100'
                                    } ${QUESTION_TYPE_COLORS[currentQuestion.type]?.text || 'text-gray-700'}`}>
                                        {QUESTION_TYPE_COLORS[currentQuestion.type]?.label || currentQuestion.type}
                                    </span>
                                    {useTimer && (
                                        <div className="flex items-center gap-1 text-sm font-mono text-violet-600">
                                            <Clock size={14} />
                                            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {currentQuestion.question}
                                </h3>

                                {currentQuestion.tips && (
                                    <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg">
                                        <Lightbulb size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-600">{currentQuestion.tips}</p>
                                    </div>
                                )}
                            </div>

                            {/* Response Area */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Your Response
                                </label>
                                <textarea
                                    value={userResponse}
                                    onChange={(e) => setUserResponse(e.target.value)}
                                    placeholder="Type your answer here... Think about specific examples and use the STAR method for behavioral questions."
                                    rows={8}
                                    className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-400">
                                        {userResponse.length} characters
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Aim for 150-300 words for a complete answer
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleSkipQuestion}
                                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                                >
                                    <SkipForward size={16} />
                                    Skip Question
                                </button>
                                <Button
                                    onClick={handleSubmitAnswer}
                                    disabled={!userResponse.trim() || isEvaluating}
                                    icon={isEvaluating ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                                    className="bg-violet-600 hover:bg-violet-700"
                                >
                                    {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* VIEW 4: Feedback */}
                    {view === 'feedback' && currentFeedback && (
                        <div className="space-y-6">
                            {/* Score */}
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 border-4 border-violet-200">
                                    <span className="text-3xl font-bold text-violet-700">{currentFeedback.score}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Score out of 100</p>
                            </div>

                            {/* Star Rating Visual */}
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={24}
                                        className={currentFeedback.score >= star * 20
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300'
                                        }
                                    />
                                ))}
                            </div>

                            {/* Your Response */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Your Response</h4>
                                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 max-h-32 overflow-y-auto">
                                    {userResponse}
                                </div>
                            </div>

                            {/* Feedback Sections */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Strengths */}
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-green-700 font-bold mb-3">
                                        <CheckCircle2 size={18} />
                                        Strengths
                                    </h4>
                                    <ul className="space-y-2">
                                        {currentFeedback.strengths.map((strength, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-green-600">
                                                <span className="text-green-400 mt-1">+</span>
                                                {strength}
                                            </li>
                                        ))}
                                        {currentFeedback.strengths.length === 0 && (
                                            <li className="text-sm text-green-500 italic">Keep practicing to identify strengths</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-amber-700 font-bold mb-3">
                                        <AlertCircle size={18} />
                                        Areas to Improve
                                    </h4>
                                    <ul className="space-y-2">
                                        {currentFeedback.improvements.map((improvement, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-amber-600">
                                                <span className="text-amber-400 mt-1">-</span>
                                                {improvement}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* STAR Analysis (for behavioral) */}
                            {currentFeedback.starAnalysis && (
                                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-violet-700 font-bold mb-3">
                                        <Star size={18} />
                                        STAR Method Analysis
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(currentFeedback.starAnalysis).map(([key, value]) => (
                                            <div key={key} className="bg-white rounded-lg p-3">
                                                <span className="text-xs font-bold text-violet-600 uppercase">{key}</span>
                                                <p className="text-sm text-gray-600 mt-1">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggested Answer */}
                            {currentFeedback.suggestedAnswer && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                                        <Lightbulb size={18} />
                                        Suggestion
                                    </h4>
                                    <p className="text-sm text-blue-600">{currentFeedback.suggestedAnswer}</p>
                                </div>
                            )}

                            {/* Next Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <Button
                                    onClick={handleNextQuestion}
                                    icon={currentQuestionIndex < questions.length - 1 ? <ChevronRight size={16} /> : <Award size={16} />}
                                    className="bg-violet-600 hover:bg-violet-700"
                                >
                                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* VIEW 5: Complete */}
                    {view === 'complete' && (
                        <div className="space-y-6">
                            {/* Celebration Header */}
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white mb-4">
                                    <Award size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Great Job!</h3>
                                <p className="text-gray-500 mt-1">You completed your mock interview</p>
                            </div>

                            {/* Overall Score */}
                            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-6 text-center">
                                <p className="text-sm font-bold text-violet-600 uppercase mb-2">Overall Score</p>
                                <div className="text-5xl font-bold text-violet-700">{overallScore}</div>
                                <div className="flex justify-center gap-1 mt-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={28}
                                            className={overallScore >= star * 20
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-300'
                                            }
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-3">
                                    {answers.filter(a => a.response !== '[Skipped]').length} of {questions.length} questions answered
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Top Strengths */}
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-green-700 font-bold mb-3">
                                        <CheckCircle2 size={18} />
                                        Key Strengths
                                    </h4>
                                    <ul className="space-y-2">
                                        {aggregatedFeedback.strengths.map((strength, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-green-600">
                                                <span className="text-green-400 mt-1">+</span>
                                                {strength}
                                            </li>
                                        ))}
                                        {aggregatedFeedback.strengths.length === 0 && (
                                            <li className="text-sm text-green-500 italic">Complete more questions to see patterns</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Focus Areas */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-amber-700 font-bold mb-3">
                                        <Lightbulb size={18} />
                                        Focus Areas
                                    </h4>
                                    <ul className="space-y-2">
                                        {aggregatedFeedback.improvements.map((improvement, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-amber-600">
                                                <span className="text-amber-400 mt-1">-</span>
                                                {improvement}
                                            </li>
                                        ))}
                                        {aggregatedFeedback.improvements.length === 0 && (
                                            <li className="text-sm text-amber-500 italic">Great job! Keep practicing to refine your skills</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    onClick={handlePracticeAgain}
                                    icon={<RefreshCw size={16} />}
                                >
                                    Practice Again
                                </Button>
                                {onSaveSession && (
                                    <Button
                                        onClick={handleSaveSession}
                                        icon={<Save size={16} />}
                                        className="bg-violet-600 hover:bg-violet-700"
                                    >
                                        Save Results
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewPrepModal;
