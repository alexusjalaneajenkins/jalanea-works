import React, { useMemo } from 'react';
import { X, TrendingUp, FileText, Briefcase, Sparkles, Target, Zap, Hash } from 'lucide-react';
import { Button } from './Button';

// ============================================
// TYPES
// ============================================

interface ExperienceItem {
    id?: string;
    role: string;
    company: string;
    duration: string;
    description: string[] | string;
}

interface BeforeAfterModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalExperience: ExperienceItem[];
    enhancedResume: string;
    jobDescription: string;
    originalSummary?: string;
}

interface ATSScoreResult {
    score: number;
    keywordMatches: number;
    totalKeywords: number;
    actionVerbCount: number;
    metricsCount: number;
    formattingScore: number;
}

interface HighlightedText {
    text: string;
    type: 'normal' | 'metric' | 'verb' | 'keyword';
}

// ============================================
// ATS SCORE CALCULATION
// ============================================

const STRONG_ACTION_VERBS = [
    'achieved', 'accelerated', 'architected', 'automated', 'built', 'championed',
    'created', 'delivered', 'designed', 'developed', 'drove', 'enhanced',
    'established', 'exceeded', 'expanded', 'generated', 'grew', 'implemented',
    'improved', 'increased', 'initiated', 'launched', 'led', 'managed',
    'mentored', 'optimized', 'orchestrated', 'pioneered', 'reduced', 'redesigned',
    'revamped', 'scaled', 'secured', 'spearheaded', 'streamlined', 'surpassed',
    'transformed', 'tripled', 'doubled', 'quadrupled'
];

const extractKeywords = (jobDescription: string): string[] => {
    // Extract important keywords from job description
    const text = jobDescription.toLowerCase();
    const words = text.match(/\b[a-z]{4,}\b/g) || [];

    // Filter out common words
    const stopWords = new Set([
        'this', 'that', 'with', 'from', 'have', 'will', 'your', 'about',
        'what', 'when', 'where', 'which', 'would', 'could', 'should',
        'their', 'there', 'these', 'those', 'been', 'being', 'some',
        'such', 'only', 'other', 'into', 'over', 'also', 'more', 'most',
        'must', 'than', 'then', 'very', 'just', 'through', 'during'
    ]);

    const filtered = words.filter(w => !stopWords.has(w));

    // Get unique keywords, prioritizing longer words (likely more specific)
    const unique = [...new Set(filtered)];
    return unique.sort((a, b) => b.length - a.length).slice(0, 30);
};

const calculateATSScore = (text: string, jobDescription: string): ATSScoreResult => {
    const lowerText = text.toLowerCase();
    const keywords = extractKeywords(jobDescription);

    // Keyword match rate (40% of score)
    const matchedKeywords = keywords.filter(kw => lowerText.includes(kw));
    const keywordScore = keywords.length > 0
        ? (matchedKeywords.length / keywords.length) * 40
        : 20;

    // Action verb usage (20% of score)
    const foundVerbs = STRONG_ACTION_VERBS.filter(verb =>
        lowerText.includes(verb.toLowerCase())
    );
    const actionVerbScore = Math.min(foundVerbs.length * 2, 20);

    // Quantified achievements (20% of score)
    const metricsPattern = /\d+%|\$[\d,]+|\d+\+?(?:\s+(?:years?|months?|customers?|users?|projects?|clients?|team members?))?/gi;
    const metrics = text.match(metricsPattern) || [];
    const metricsScore = Math.min(metrics.length * 4, 20);

    // Formatting score (10% of score)
    const hasBullets = /^[-•*]\s/m.test(text) || /\n[-•*]\s/m.test(text);
    const hasSections = /^#{1,3}\s/m.test(text) || /\n#{1,3}\s/m.test(text);
    const hasProperLength = text.length > 500 && text.length < 5000;
    const formattingScore = (hasBullets ? 4 : 0) + (hasSections ? 3 : 0) + (hasProperLength ? 3 : 0);

    // Length appropriateness (10% of score)
    const wordCount = text.split(/\s+/).length;
    let lengthScore = 10;
    if (wordCount < 150) lengthScore = 4;
    else if (wordCount < 300) lengthScore = 7;
    else if (wordCount > 1000) lengthScore = 6;

    const totalScore = Math.round(keywordScore + actionVerbScore + metricsScore + formattingScore + lengthScore);

    return {
        score: Math.min(totalScore, 100),
        keywordMatches: matchedKeywords.length,
        totalKeywords: keywords.length,
        actionVerbCount: foundVerbs.length,
        metricsCount: metrics.length,
        formattingScore
    };
};

// ============================================
// TEXT HIGHLIGHTING
// ============================================

const highlightText = (text: string, jobDescription: string): HighlightedText[] => {
    const keywords = extractKeywords(jobDescription);
    const result: HighlightedText[] = [];

    // Split text into words while preserving spaces and punctuation
    const tokens = text.split(/(\s+)/);

    for (const token of tokens) {
        if (/^\s+$/.test(token)) {
            // Preserve whitespace
            if (result.length > 0 && result[result.length - 1].type === 'normal') {
                result[result.length - 1].text += token;
            } else {
                result.push({ text: token, type: 'normal' });
            }
            continue;
        }

        const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Check for metrics (numbers, percentages, dollar amounts)
        if (/\d+%|\$[\d,]+|\d+\+?/.test(token)) {
            result.push({ text: token, type: 'metric' });
        }
        // Check for strong action verbs
        else if (STRONG_ACTION_VERBS.some(verb => cleanToken === verb || cleanToken.startsWith(verb))) {
            result.push({ text: token, type: 'verb' });
        }
        // Check for job keywords
        else if (keywords.some(kw => cleanToken.includes(kw) || kw.includes(cleanToken))) {
            result.push({ text: token, type: 'keyword' });
        }
        // Normal text
        else {
            if (result.length > 0 && result[result.length - 1].type === 'normal') {
                result[result.length - 1].text += token;
            } else {
                result.push({ text: token, type: 'normal' });
            }
        }
    }

    return result;
};

const HighlightedSpan: React.FC<{ segments: HighlightedText[] }> = ({ segments }) => {
    return (
        <>
            {segments.map((seg, i) => {
                switch (seg.type) {
                    case 'metric':
                        return <span key={i} className="bg-green-200 px-0.5 rounded font-semibold">{seg.text}</span>;
                    case 'verb':
                        return <span key={i} className="bg-blue-200 px-0.5 rounded font-semibold">{seg.text}</span>;
                    case 'keyword':
                        return <span key={i} className="bg-yellow-200 px-0.5 rounded">{seg.text}</span>;
                    default:
                        return <span key={i}>{seg.text}</span>;
                }
            })}
        </>
    );
};

// ============================================
// RESUME PARSING
// ============================================

const parseEnhancedResume = (resumeContent: string) => {
    const lines = resumeContent.split('\n');
    let summary = '';
    const experiences: { company: string; role: string; bullets: string[] }[] = [];

    let currentSection = '';
    let currentExperience: { company: string; role: string; bullets: string[] } | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Detect section headers
        if (/^##\s*(Professional\s+)?Summary/i.test(trimmedLine)) {
            currentSection = 'summary';
            continue;
        }
        if (/^##\s*(Work\s+)?Experience/i.test(trimmedLine)) {
            currentSection = 'experience';
            continue;
        }
        if (/^##\s*(Education|Skills|Certifications)/i.test(trimmedLine)) {
            currentSection = 'other';
            continue;
        }

        // Parse summary
        if (currentSection === 'summary' && trimmedLine && !trimmedLine.startsWith('#')) {
            summary += (summary ? ' ' : '') + trimmedLine;
        }

        // Parse experience
        if (currentSection === 'experience') {
            // Company/role header (### or bold)
            if (/^###\s+/.test(trimmedLine) || /^\*\*[^*]+\*\*/.test(trimmedLine)) {
                if (currentExperience) {
                    experiences.push(currentExperience);
                }
                const headerText = trimmedLine.replace(/^###\s+/, '').replace(/\*\*/g, '');
                // Try to extract company and role
                const parts = headerText.split(/\s+(?:at|@|-|–|—)\s+/i);
                currentExperience = {
                    role: parts[0]?.trim() || headerText,
                    company: parts[1]?.trim() || '',
                    bullets: []
                };
            }
            // Bullet points
            else if (/^[-•*]\s+/.test(trimmedLine) && currentExperience) {
                currentExperience.bullets.push(trimmedLine.replace(/^[-•*]\s+/, ''));
            }
        }
    }

    // Don't forget the last experience
    if (currentExperience) {
        experiences.push(currentExperience);
    }

    return { summary, experiences };
};

// ============================================
// SCORE DISPLAY COMPONENT
// ============================================

const ScoreCard: React.FC<{
    label: string;
    score: number;
    details: ATSScoreResult;
    variant: 'before' | 'after';
}> = ({ label, score, details, variant }) => {
    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-600';
        if (s >= 60) return 'text-yellow-600';
        if (s >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getBarColor = (s: number) => {
        if (s >= 80) return 'bg-green-500';
        if (s >= 60) return 'bg-yellow-500';
        if (s >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className={`p-4 rounded-xl ${variant === 'before' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-xs font-bold uppercase mb-1 ${variant === 'before' ? 'text-red-600' : 'text-green-600'}`}>
                {label}
            </p>
            <div className="flex items-end gap-2 mb-2">
                <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                <span className="text-lg text-gray-500 mb-1">/ 100</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                    className={`h-full ${getBarColor(score)} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                    <Target size={12} className="text-gray-500" />
                    <span className="text-gray-600">{details.keywordMatches}/{details.totalKeywords} keywords</span>
                </div>
                <div className="flex items-center gap-1">
                    <Zap size={12} className="text-gray-500" />
                    <span className="text-gray-600">{details.actionVerbCount} action verbs</span>
                </div>
                <div className="flex items-center gap-1">
                    <Hash size={12} className="text-gray-500" />
                    <span className="text-gray-600">{details.metricsCount} metrics</span>
                </div>
                <div className="flex items-center gap-1">
                    <FileText size={12} className="text-gray-500" />
                    <span className="text-gray-600">Format: {details.formattingScore}/10</span>
                </div>
            </div>
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const BeforeAfterModal: React.FC<BeforeAfterModalProps> = ({
    isOpen,
    onClose,
    originalExperience,
    enhancedResume,
    jobDescription,
    originalSummary
}) => {
    // Parse enhanced resume
    const enhancedData = useMemo(() => parseEnhancedResume(enhancedResume), [enhancedResume]);

    // Build original text for ATS scoring
    const originalText = useMemo(() => {
        const expText = originalExperience.map(exp => {
            const desc = Array.isArray(exp.description)
                ? exp.description.join('\n')
                : exp.description;
            return `${exp.role} at ${exp.company}\n${desc}`;
        }).join('\n\n');
        return (originalSummary || '') + '\n\n' + expText;
    }, [originalExperience, originalSummary]);

    // Calculate ATS scores
    const originalScore = useMemo(() => calculateATSScore(originalText, jobDescription), [originalText, jobDescription]);
    const enhancedScore = useMemo(() => calculateATSScore(enhancedResume, jobDescription), [enhancedResume, jobDescription]);

    const improvement = enhancedScore.score - originalScore.score;

    // Count total improvements
    const totalImprovements = useMemo(() => {
        let count = 0;
        // Count added metrics
        count += Math.max(0, enhancedScore.metricsCount - originalScore.metricsCount);
        // Count added action verbs
        count += Math.max(0, enhancedScore.actionVerbCount - originalScore.actionVerbCount);
        // Count added keywords
        count += Math.max(0, enhancedScore.keywordMatches - originalScore.keywordMatches);
        return count;
    }, [enhancedScore, originalScore]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-jalanea-900 to-jalanea-800 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Before & After Comparison</h2>
                                <p className="text-sm text-white/70">See how AI enhanced your resume</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* ATS Score Comparison */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-jalanea-600 uppercase mb-4 flex items-center gap-2">
                            <TrendingUp size={16} />
                            ATS Score Comparison
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <ScoreCard
                                label="Original"
                                score={originalScore.score}
                                details={originalScore}
                                variant="before"
                            />
                            <ScoreCard
                                label="AI-Enhanced"
                                score={enhancedScore.score}
                                details={enhancedScore}
                                variant="after"
                            />
                        </div>

                        {/* Improvement Banner */}
                        {improvement > 0 && (
                            <div className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">+{improvement}% Improvement</p>
                                        <p className="text-sm text-white/80">{totalImprovements} enhancements made</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-white/80">Score increased from</p>
                                    <p className="font-bold">{originalScore.score}% → {enhancedScore.score}%</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="mb-6 p-3 bg-gray-50 rounded-lg flex flex-wrap gap-4 text-xs">
                        <span className="font-bold text-gray-600">Highlight Legend:</span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-green-200 rounded"></span>
                            Metrics/Numbers
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-blue-200 rounded"></span>
                            Action Verbs
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-yellow-200 rounded"></span>
                            Job Keywords
                        </span>
                    </div>

                    {/* Professional Summary Comparison */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-jalanea-600 uppercase mb-4 flex items-center gap-2">
                            <FileText size={16} />
                            Professional Summary
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Original */}
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-xs font-bold text-red-600 uppercase mb-2">Original</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {originalSummary || <span className="italic text-gray-400">No summary provided</span>}
                                </p>
                            </div>

                            {/* Enhanced */}
                            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                <p className="text-xs font-bold text-green-600 uppercase mb-2">AI-Enhanced</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {enhancedData.summary ? (
                                        <HighlightedSpan segments={highlightText(enhancedData.summary, jobDescription)} />
                                    ) : (
                                        <span className="italic text-gray-400">No summary in generated resume</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Experience Comparisons */}
                    <div>
                        <h3 className="text-sm font-bold text-jalanea-600 uppercase mb-4 flex items-center gap-2">
                            <Briefcase size={16} />
                            Experience Bullets
                        </h3>

                        <div className="space-y-6">
                            {originalExperience.map((exp, index) => {
                                const originalBullets = Array.isArray(exp.description)
                                    ? exp.description
                                    : exp.description.split('\n').filter(b => b.trim());

                                // Try to find matching enhanced experience
                                const enhancedExp = enhancedData.experiences.find(e =>
                                    e.company.toLowerCase().includes(exp.company.toLowerCase()) ||
                                    exp.company.toLowerCase().includes(e.company.toLowerCase()) ||
                                    e.role.toLowerCase().includes(exp.role.toLowerCase())
                                ) || enhancedData.experiences[index];

                                return (
                                    <div key={exp.id || index} className="border border-gray-200 rounded-xl overflow-hidden">
                                        {/* Company Header */}
                                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                            <h4 className="font-bold text-jalanea-900">{exp.role}</h4>
                                            <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                                        </div>

                                        {/* Bullets Comparison */}
                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                            {/* Original Bullets */}
                                            <div className="p-4 bg-red-50/50">
                                                <p className="text-xs font-bold text-red-600 uppercase mb-3">Original</p>
                                                <ul className="space-y-2">
                                                    {originalBullets.map((bullet, bi) => (
                                                        <li key={bi} className="flex items-start gap-2 text-sm text-gray-700">
                                                            <span className="text-red-400 mt-1">•</span>
                                                            <span>{bullet.replace(/^[-•*]\s*/, '')}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Enhanced Bullets */}
                                            <div className="p-4 bg-green-50/50">
                                                <p className="text-xs font-bold text-green-600 uppercase mb-3">AI-Enhanced</p>
                                                <ul className="space-y-2">
                                                    {enhancedExp?.bullets.map((bullet, bi) => (
                                                        <li key={bi} className="flex items-start gap-2 text-sm text-gray-700">
                                                            <span className="text-green-500 mt-1">•</span>
                                                            <span>
                                                                <HighlightedSpan segments={highlightText(bullet, jobDescription)} />
                                                            </span>
                                                        </li>
                                                    )) || (
                                                        <li className="italic text-gray-400">No matching enhanced content</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        <span className="font-bold text-green-600">{totalImprovements}</span> improvements detected
                    </div>
                    <Button variant="primary" onClick={onClose}>
                        Close Comparison
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BeforeAfterModal;
