import React, { useState, useMemo } from 'react';
import {
    Target, Lightbulb, CheckCircle, AlertCircle, XCircle,
    Sparkles, ChevronDown, ChevronUp, Loader2, Wand2,
    Star, BookOpen, Zap
} from 'lucide-react';
import { Button } from './Button';

// ============================================
// TYPES
// ============================================

export type BulletStrength = 'strong' | 'missing_impact' | 'task_only';

export interface AnalyzedBullet {
    text: string;
    lineIndex: number;
    strength: BulletStrength;
    reason: string;
    suggestion?: string;
}

export interface BulletAnalysisResult {
    bullets: AnalyzedBullet[];
    strongCount: number;
    missingImpactCount: number;
    taskOnlyCount: number;
    overallScore: number; // 0-100
}

// ============================================
// BULLET ANALYSIS HEURISTICS
// ============================================

// Weak indicators - task-focused language
const WEAK_PATTERNS = [
    /^responsible for/i,
    /^duties included/i,
    /^tasked with/i,
    /^helped with/i,
    /^assisted with/i,
    /^worked on/i,
    /^participated in/i,
    /^involved in/i,
    /^handled/i,
    /^managed daily/i,
];

// Strong indicators - accomplishment-focused
const STRONG_PATTERNS = [
    /\d+%/,                           // Percentages
    /\$[\d,]+/,                       // Dollar amounts
    /\d+ (customers|users|clients|people|students|projects|accounts)/i,
    /resulting in/i,
    /leading to/i,
    /achieving/i,
    /increased.*by/i,
    /decreased.*by/i,
    /reduced.*by/i,
    /improved.*by/i,
    /generated/i,
    /saved/i,
    /grew/i,
    /boosted/i,
    /launched/i,
    /delivered/i,
    /exceeded/i,
    /awarded/i,
    /recognized/i,
    /promoted/i,
];

// Action verbs (good, but need impact)
const ACTION_VERBS = [
    /^(created|designed|developed|built|implemented|led|coordinated|organized|managed|trained|mentored|analyzed|streamlined|optimized|established|initiated|spearheaded)/i
];

export function analyzeBulletPoint(text: string): { strength: BulletStrength; reason: string } {
    const trimmed = text.trim();

    // Check for weak patterns first
    for (const pattern of WEAK_PATTERNS) {
        if (pattern.test(trimmed)) {
            return {
                strength: 'task_only',
                reason: 'Starts with task-focused language. Focus on what you accomplished, not just what you did.'
            };
        }
    }

    // Check for strong patterns (has metrics/impact)
    for (const pattern of STRONG_PATTERNS) {
        if (pattern.test(trimmed)) {
            return {
                strength: 'strong',
                reason: 'Great! Includes measurable impact or specific achievements.'
            };
        }
    }

    // Check if it has action verbs but no impact
    for (const pattern of ACTION_VERBS) {
        if (pattern.test(trimmed)) {
            return {
                strength: 'missing_impact',
                reason: 'Good action verb, but missing measurable results. Add numbers or outcomes.'
            };
        }
    }

    // Default: missing impact (has content but no clear metrics)
    if (trimmed.length > 20) {
        return {
            strength: 'missing_impact',
            reason: 'Consider adding specific metrics or outcomes to strengthen this bullet.'
        };
    }

    return {
        strength: 'task_only',
        reason: 'Too brief or vague. Add specific actions and measurable results.'
    };
}

export function analyzeAllBullets(content: string): BulletAnalysisResult {
    const lines = content.split('\n');
    const bullets: AnalyzedBullet[] = [];

    lines.forEach((line, index) => {
        // Match bullet points (- or * or •)
        const bulletMatch = line.match(/^[\s]*[-*•]\s+(.+)$/);
        if (bulletMatch) {
            const bulletText = bulletMatch[1];
            const analysis = analyzeBulletPoint(bulletText);
            bullets.push({
                text: bulletText,
                lineIndex: index,
                strength: analysis.strength,
                reason: analysis.reason
            });
        }
    });

    const strongCount = bullets.filter(b => b.strength === 'strong').length;
    const missingImpactCount = bullets.filter(b => b.strength === 'missing_impact').length;
    const taskOnlyCount = bullets.filter(b => b.strength === 'task_only').length;

    const total = bullets.length;
    const overallScore = total > 0
        ? Math.round((strongCount * 100 + missingImpactCount * 50) / total)
        : 0;

    return {
        bullets,
        strongCount,
        missingImpactCount,
        taskOnlyCount,
        overallScore
    };
}

// ============================================
// STAR METHOD GUIDE COMPONENT
// ============================================

interface STARGuideProps {
    isExpanded: boolean;
    onToggle: () => void;
}

export const STARGuide: React.FC<STARGuideProps> = ({ isExpanded, onToggle }) => {
    return (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-yellow-200 rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-yellow-100/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star size={18} className="text-yellow-600" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-jalanea-900">STAR Method Guide</h4>
                        <p className="text-xs text-jalanea-500">Write impactful bullet points</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-jalanea-400" /> : <ChevronDown size={18} className="text-jalanea-400" />}
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { letter: 'S', title: 'Situation', prompt: 'What was the context or challenge?', example: 'During peak season with 2x normal volume...' },
                            { letter: 'T', title: 'Task', prompt: 'What were you responsible for?', example: 'I was tasked with reducing wait times...' },
                            { letter: 'A', title: 'Action', prompt: 'What specific steps did you take?', example: 'Implemented a new queueing system and trained 5 team members...' },
                            { letter: 'R', title: 'Result', prompt: 'What was the measurable outcome?', example: 'Reduced average wait time by 40%, increasing customer satisfaction scores by 25%' },
                        ].map((item) => (
                            <div key={item.letter} className="bg-white rounded-lg p-3 border border-yellow-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center">
                                        {item.letter}
                                    </span>
                                    <span className="font-bold text-sm text-jalanea-900">{item.title}</span>
                                </div>
                                <p className="text-xs text-jalanea-600 mb-2">{item.prompt}</p>
                                <p className="text-xs text-jalanea-400 italic">"{item.example}"</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-yellow-100">
                        <h5 className="text-xs font-bold text-jalanea-700 mb-2 flex items-center gap-1">
                            <Lightbulb size={12} className="text-yellow-500" /> Pro Tips
                        </h5>
                        <ul className="text-xs text-jalanea-600 space-y-1">
                            <li>• Start with a strong action verb (Led, Created, Increased)</li>
                            <li>• Include numbers whenever possible (%, $, #)</li>
                            <li>• Focus on outcomes, not just activities</li>
                            <li>• Keep each bullet to 1-2 lines max</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================
// BULLET SCORE SUMMARY COMPONENT
// ============================================

interface BulletScoreSummaryProps {
    analysis: BulletAnalysisResult;
    onImproveAll?: () => void;
    isImproving?: boolean;
}

export const BulletScoreSummary: React.FC<BulletScoreSummaryProps> = ({
    analysis,
    onImproveAll,
    isImproving
}) => {
    const { strongCount, missingImpactCount, taskOnlyCount, overallScore, bullets } = analysis;
    const total = bullets.length;

    if (total === 0) {
        return (
            <div className="bg-jalanea-50 rounded-xl p-4 text-center">
                <BookOpen size={24} className="mx-auto text-jalanea-300 mb-2" />
                <p className="text-sm text-jalanea-500">No bullet points detected yet</p>
            </div>
        );
    }

    const getScoreColor = () => {
        if (overallScore >= 70) return 'text-green-500';
        if (overallScore >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreLabel = () => {
        if (overallScore >= 70) return 'Strong Resume';
        if (overallScore >= 40) return 'Needs Polish';
        return 'Needs Work';
    };

    return (
        <div className="bg-white border border-jalanea-200 rounded-xl p-4 space-y-4">
            {/* Score Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${getScoreColor()}`}>
                        {overallScore}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-jalanea-900">{getScoreLabel()}</p>
                        <p className="text-xs text-jalanea-500">{strongCount}/{total} bullets are accomplishment-focused</p>
                    </div>
                </div>
                {(missingImpactCount > 0 || taskOnlyCount > 0) && onImproveAll && (
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={onImproveAll}
                        disabled={isImproving}
                        icon={isImproving ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        {isImproving ? 'Improving...' : 'Improve All'}
                    </Button>
                )}
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <CheckCircle size={12} />
                        <span className="text-lg font-bold">{strongCount}</span>
                    </div>
                    <p className="text-[10px] font-medium text-green-700">Strong</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-100">
                    <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                        <AlertCircle size={12} />
                        <span className="text-lg font-bold">{missingImpactCount}</span>
                    </div>
                    <p className="text-[10px] font-medium text-yellow-700">Missing Impact</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100">
                    <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                        <XCircle size={12} />
                        <span className="text-lg font-bold">{taskOnlyCount}</span>
                    </div>
                    <p className="text-[10px] font-medium text-red-700">Task-Only</p>
                </div>
            </div>
        </div>
    );
};

// ============================================
// BULLET LIST WITH INDICATORS
// ============================================

interface BulletListProps {
    analysis: BulletAnalysisResult;
    onImproveBullet?: (bullet: AnalyzedBullet) => void;
    improvingIndex?: number | null;
}

export const BulletList: React.FC<BulletListProps> = ({
    analysis,
    onImproveBullet,
    improvingIndex
}) => {
    const { bullets } = analysis;

    if (bullets.length === 0) return null;

    const getStrengthIcon = (strength: BulletStrength) => {
        switch (strength) {
            case 'strong':
                return <CheckCircle size={14} className="text-green-500" />;
            case 'missing_impact':
                return <AlertCircle size={14} className="text-yellow-500" />;
            case 'task_only':
                return <XCircle size={14} className="text-red-500" />;
        }
    };

    const getStrengthBg = (strength: BulletStrength) => {
        switch (strength) {
            case 'strong':
                return 'bg-green-50 border-green-100';
            case 'missing_impact':
                return 'bg-yellow-50 border-yellow-100';
            case 'task_only':
                return 'bg-red-50 border-red-100';
        }
    };

    const getStrengthLabel = (strength: BulletStrength) => {
        switch (strength) {
            case 'strong':
                return 'Strong';
            case 'missing_impact':
                return 'Missing Impact';
            case 'task_only':
                return 'Task-Only';
        }
    };

    // Only show non-strong bullets for improvement suggestions
    const bulletsToShow = bullets.filter(b => b.strength !== 'strong');

    if (bulletsToShow.length === 0) {
        return (
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium text-green-700">All bullets are accomplishment-focused!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-bold text-jalanea-700 flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" />
                Bullets to Improve ({bulletsToShow.length})
            </h4>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {bulletsToShow.map((bullet, idx) => (
                    <div
                        key={bullet.lineIndex}
                        className={`rounded-lg p-3 border ${getStrengthBg(bullet.strength)}`}
                    >
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex-shrink-0">
                                {getStrengthIcon(bullet.strength)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-jalanea-800 break-words">
                                    {bullet.text}
                                </p>
                                <p className="text-xs text-jalanea-500 mt-1">
                                    {bullet.reason}
                                </p>
                            </div>
                            {onImproveBullet && (
                                <button
                                    onClick={() => onImproveBullet(bullet)}
                                    disabled={improvingIndex === bullet.lineIndex}
                                    className="flex-shrink-0 p-1.5 rounded-lg bg-white border border-jalanea-200 hover:border-purple-300 hover:bg-purple-50 text-jalanea-500 hover:text-purple-600 transition-colors disabled:opacity-50"
                                    title="Improve with AI"
                                >
                                    {improvingIndex === bullet.lineIndex ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={12} />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// MAIN STAR METHOD HELPER PANEL
// ============================================

interface STARMethodHelperProps {
    content: string;
    onContentChange?: (newContent: string) => void;
    onImproveBullet?: (bullet: AnalyzedBullet) => Promise<string | null>;
    className?: string;
}

export const STARMethodHelper: React.FC<STARMethodHelperProps> = ({
    content,
    onContentChange,
    onImproveBullet,
    className = ''
}) => {
    const [showGuide, setShowGuide] = useState(true);
    const [improvingIndex, setImprovingIndex] = useState<number | null>(null);
    const [isImprovingAll, setIsImprovingAll] = useState(false);

    const analysis = useMemo(() => analyzeAllBullets(content), [content]);

    const handleImproveBullet = async (bullet: AnalyzedBullet) => {
        if (!onImproveBullet || !onContentChange) return;

        setImprovingIndex(bullet.lineIndex);

        try {
            const improved = await onImproveBullet(bullet);
            if (improved) {
                // Replace the bullet in content
                const lines = content.split('\n');
                const originalLine = lines[bullet.lineIndex];
                // Preserve the bullet prefix (-, *, •)
                const prefixMatch = originalLine.match(/^([\s]*[-*•]\s+)/);
                if (prefixMatch) {
                    lines[bullet.lineIndex] = prefixMatch[1] + improved;
                    onContentChange(lines.join('\n'));
                }
            }
        } finally {
            setImprovingIndex(null);
        }
    };

    const handleImproveAll = async () => {
        if (!onImproveBullet || !onContentChange) return;

        setIsImprovingAll(true);

        try {
            const bulletsToImprove = analysis.bullets.filter(b => b.strength !== 'strong');
            let updatedContent = content;

            for (const bullet of bulletsToImprove) {
                setImprovingIndex(bullet.lineIndex);
                const improved = await onImproveBullet(bullet);

                if (improved) {
                    const lines = updatedContent.split('\n');
                    const originalLine = lines[bullet.lineIndex];
                    const prefixMatch = originalLine.match(/^([\s]*[-*•]\s+)/);
                    if (prefixMatch) {
                        lines[bullet.lineIndex] = prefixMatch[1] + improved;
                        updatedContent = lines.join('\n');
                    }
                }
            }

            onContentChange(updatedContent);
        } finally {
            setImprovingIndex(null);
            setIsImprovingAll(false);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* STAR Guide */}
            <STARGuide isExpanded={showGuide} onToggle={() => setShowGuide(!showGuide)} />

            {/* Bullet Score Summary */}
            <BulletScoreSummary
                analysis={analysis}
                onImproveAll={onImproveBullet ? handleImproveAll : undefined}
                isImproving={isImprovingAll}
            />

            {/* Bullet List with Improvement Options */}
            <BulletList
                analysis={analysis}
                onImproveBullet={onImproveBullet ? handleImproveBullet : undefined}
                improvingIndex={improvingIndex}
            />
        </div>
    );
};

export default STARMethodHelper;
