import React, { useState, useEffect, useMemo } from 'react';
import {
    BookOpen, GraduationCap, Star, ChevronDown, ChevronUp,
    Loader2, Sparkles, CheckCircle, Award, Briefcase, Lightbulb,
    AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from './Button';
import { analyzeCourseworkMatch, CourseMatchAnalysis, CourseMatchResult } from '../services/geminiService';
import { getCoursesByProgram, getProgramByName, ValenciaCourse } from '../data/valenciaCourses';

// ============================================
// TYPES
// ============================================

interface ValenciaCourseMapperProps {
    jobDescription: string;
    userProgram: string; // Program name from user's education
    onAnalysisComplete?: (analysis: CourseMatchAnalysis) => void;
    className?: string;
}

// ============================================
// HELPER COMPONENTS
// ============================================

const RelevanceBar: React.FC<{ score: number }> = ({ score }) => {
    const getColor = () => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
                className={`h-full ${getColor()} transition-all duration-500`}
                style={{ width: `${score}%` }}
            />
        </div>
    );
};

const CourseCard: React.FC<{
    course: CourseMatchResult;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ course, isExpanded, onToggle }) => {
    return (
        <div className={`rounded-xl border transition-all ${
            course.isCapstone
                ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-600/40'
                : 'bg-slate-800/50 border-slate-700'
        }`}>
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-start gap-3 text-left"
            >
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                    course.isCapstone
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : course.isProjectBased
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-700 text-slate-400'
                }`}>
                    {course.isCapstone ? (
                        <Award size={18} />
                    ) : course.isProjectBased ? (
                        <Briefcase size={18} />
                    ) : (
                        <BookOpen size={18} />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{course.code}</span>
                        {course.isCapstone && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded-full uppercase">
                                Capstone
                            </span>
                        )}
                        {course.isProjectBased && !course.isCapstone && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full uppercase">
                                Project
                            </span>
                        )}
                    </div>
                    <h4 className="font-bold text-white mt-1">{course.name}</h4>

                    {/* Relevance Score */}
                    <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1">
                            <RelevanceBar score={course.relevanceScore} />
                        </div>
                        <span className={`text-sm font-bold ${
                            course.relevanceScore >= 80 ? 'text-green-400' :
                            course.relevanceScore >= 60 ? 'text-yellow-400' : 'text-orange-400'
                        }`}>
                            {course.relevanceScore}%
                        </span>
                    </div>
                </div>

                <div className="flex-shrink-0 text-slate-500">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-700/50 pt-3">
                    {/* Match Reason */}
                    <p className="text-sm text-slate-300">{course.matchReason}</p>

                    {/* Matched Skills */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Matching Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                            {course.matchedSkills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Capstone Highlight */}
                    {course.isCapstone && (
                        <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                            <p className="text-sm text-yellow-300 flex items-start gap-2">
                                <Sparkles size={14} className="flex-shrink-0 mt-0.5" />
                                <span>
                                    <strong>Capstone Advantage:</strong> Your capstone project demonstrates hands-on experience directly relevant to this role.
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ValenciaCourseMapper: React.FC<ValenciaCourseMapperProps> = ({
    jobDescription,
    userProgram,
    onAnalysisComplete,
    className = ''
}) => {
    const [analysis, setAnalysis] = useState<CourseMatchAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

    // Get courses for the user's program
    const programInfo = useMemo(() => getProgramByName(userProgram), [userProgram]);
    const courses = useMemo(() => getCoursesByProgram(userProgram), [userProgram]);

    const handleAnalyze = async () => {
        if (!jobDescription || !courses || courses.length === 0) {
            setError('Please enter a job description and ensure your program has course data.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await analyzeCourseworkMatch(
                jobDescription,
                courses,
                programInfo?.programName || userProgram
            );

            if (result) {
                setAnalysis(result);
                onAnalysisComplete?.(result);
                // Auto-expand capstone courses
                const capstoneCodes = result.matchedCourses
                    .filter(c => c.isCapstone)
                    .map(c => c.code);
                setExpandedCourses(new Set(capstoneCodes));
            } else {
                setError('Analysis failed. Please try again.');
            }
        } catch (err) {
            console.error('Course analysis error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleCourse = (code: string) => {
        setExpandedCourses(prev => {
            const next = new Set(prev);
            if (next.has(code)) {
                next.delete(code);
            } else {
                next.add(code);
            }
            return next;
        });
    };

    // No program found
    if (!programInfo || !courses) {
        return (
            <div className={`bg-slate-800 rounded-xl p-6 ${className}`}>
                <div className="text-center py-8">
                    <GraduationCap size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="font-bold text-slate-400 mb-2">Program Not Found</h3>
                    <p className="text-sm text-slate-500">
                        We couldn't find course data for "{userProgram}".
                        <br />
                        Try updating your education in your profile.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <GraduationCap size={20} className="text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Valencia Coursework Alignment</h3>
                            <p className="text-xs text-slate-400">{programInfo.programName}</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !jobDescription}
                        icon={isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black"
                    >
                        {isAnalyzing ? 'Analyzing...' : analysis ? 'Re-analyze' : 'Analyze Match'}
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
                <div className="bg-slate-800 rounded-xl p-8 text-center">
                    <div className="relative inline-block">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <Loader2 size={32} className="text-yellow-400 animate-spin" />
                        </div>
                    </div>
                    <h3 className="font-bold text-white mt-4">Analyzing Your Coursework</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Matching your Valencia courses to job requirements...
                    </p>
                </div>
            )}

            {/* Results */}
            {!isAnalyzing && analysis && (
                <>
                    {/* Overall Score */}
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-400">Program Relevance</span>
                            <span className={`text-2xl font-bold ${
                                analysis.totalRelevanceScore >= 70 ? 'text-green-400' :
                                analysis.totalRelevanceScore >= 50 ? 'text-yellow-400' : 'text-orange-400'
                            }`}>
                                {analysis.totalRelevanceScore}%
                            </span>
                        </div>
                        <RelevanceBar score={analysis.totalRelevanceScore} />

                        {/* Key Skills */}
                        {analysis.keySkillsFromCourses.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Key Skills from Your Coursework</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {analysis.keySkillsFromCourses.slice(0, 8).map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-lg"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggested Highlights */}
                    {analysis.suggestedHighlights.length > 0 && (
                        <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-xl p-4 border border-yellow-600/30">
                            <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-2 mb-3">
                                <Lightbulb size={16} />
                                Resume Highlights to Add
                            </h4>
                            <ul className="space-y-2">
                                {analysis.suggestedHighlights.map((highlight, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-yellow-200/90">
                                        <CheckCircle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Matched Courses */}
                    {analysis.matchedCourses.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                <BookOpen size={14} />
                                Relevant Courses ({analysis.matchedCourses.length})
                            </h4>
                            {analysis.matchedCourses.map((course) => (
                                <CourseCard
                                    key={course.code}
                                    course={course}
                                    isExpanded={expandedCourses.has(course.code)}
                                    onToggle={() => toggleCourse(course.code)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-800 rounded-xl p-6 text-center">
                            <AlertCircle size={32} className="mx-auto text-orange-400 mb-3" />
                            <h3 className="font-bold text-slate-300">Limited Course Match</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Your coursework has limited direct overlap with this job's requirements.
                                Consider highlighting transferable skills instead.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Initial State - No Analysis Yet */}
            {!isAnalyzing && !analysis && !error && (
                <div className="bg-slate-800 rounded-xl p-6 text-center">
                    <BookOpen size={40} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="font-bold text-slate-300 mb-2">Ready to Analyze</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Click "Analyze Match" to see how your Valencia coursework
                        aligns with this job's requirements.
                    </p>
                    <div className="text-xs text-slate-600">
                        {courses.length} courses available for {programInfo.programName}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValenciaCourseMapper;
