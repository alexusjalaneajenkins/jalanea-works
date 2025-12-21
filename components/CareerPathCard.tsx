import React from 'react';
import { TrendingUp, Check, X, Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react';

export interface CareerPath {
    id: string;
    title: string;
    field: string;
    salaryRange: string;
    matchScore: number; // 0-100
    growth: 'hot' | 'growing' | 'stable' | 'emerging';
    skills: string[];
    description: string;
    icon?: string;
}

interface CareerPathCardProps {
    career: CareerPath;
    isSelected: boolean;
    isDismissed: boolean;
    isBookmarked: boolean;
    onSelect: () => void;
    onDismiss: () => void;
    onBookmark: () => void;
    onViewDetails?: () => void;
}

const growthLabels = {
    hot: { label: '🔥 Hot', color: 'text-orange-500 bg-orange-500/10' },
    growing: { label: '📈 Growing', color: 'text-green-500 bg-green-500/10' },
    stable: { label: '✓ Stable', color: 'text-blue-500 bg-blue-500/10' },
    emerging: { label: '✨ Emerging', color: 'text-purple-500 bg-purple-500/10' }
};

// Field icons mapping
const fieldIcons: Record<string, string> = {
    'Technology': '💻',
    'Healthcare': '🏥',
    'Business': '📊',
    'Creative/Design': '🎨',
    'Criminal Justice': '⚖️',
    'Hospitality': '🍽️',
    'Manufacturing': '🏭',
    'Education': '📚',
    'Public Safety': '🚨',
    'Engineering': '⚙️'
};

export const CareerPathCard: React.FC<CareerPathCardProps> = ({
    career,
    isSelected,
    isDismissed,
    isBookmarked,
    onSelect,
    onDismiss,
    onBookmark,
    onViewDetails
}) => {
    const growth = growthLabels[career.growth];
    const fieldIcon = fieldIcons[career.field] || '💼';

    if (isDismissed) {
        return (
            <div className="bg-jalanea-50 border border-jalanea-200 rounded-2xl p-4 opacity-50 transition-all duration-300">
                <div className="flex items-center justify-between">
                    <span className="text-jalanea-500 text-sm">
                        <X size={14} className="inline mr-1" />
                        {career.title} dismissed
                    </span>
                    <button
                        onClick={onDismiss}
                        className="text-xs text-jalanea-600 hover:text-jalanea-900 font-medium"
                    >
                        Undo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`
                relative bg-white rounded-xl sm:rounded-2xl border-2 p-3 sm:p-5 transition-all duration-300 group
                hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1
                ${isSelected
                    ? 'border-gold bg-gold/5 shadow-lg shadow-gold/20'
                    : 'border-jalanea-200 hover:border-gold/50'
                }
            `}
        >
            {/* Match Score Badge */}
            <div className={`
                absolute -top-1.5 -right-1.5 sm:-top-3 sm:-right-3 w-9 h-9 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                font-bold text-[10px] sm:text-sm shadow-lg transition-transform group-hover:scale-110
                ${career.matchScore >= 80
                    ? 'bg-gradient-to-br from-gold to-amber-500 text-jalanea-950'
                    : career.matchScore >= 60
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                        : 'bg-gradient-to-br from-jalanea-400 to-jalanea-500 text-white'
                }
            `}>
                {career.matchScore}%
            </div>

            {/* Selected Checkmark */}
            {isSelected && (
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gold text-jalanea-950 flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                    <Check size={16} strokeWidth={3} />
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-jalanea-100 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                    {fieldIcon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-jalanea-900 text-base sm:text-lg leading-tight truncate">
                        {career.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-jalanea-500">{career.field}</p>
                </div>
            </div>

            {/* Salary & Growth */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-medium text-jalanea-700">{career.salaryRange}</span>
                <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full ${growth.color}`}>
                    {growth.label}
                </span>
            </div>

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                {career.skills.slice(0, 3).map((skill, idx) => (
                    <span
                        key={idx}
                        className="text-[10px] sm:text-xs bg-jalanea-100 text-jalanea-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium"
                    >
                        {skill}
                    </span>
                ))}
                {career.skills.length > 3 && (
                    <span className="text-[10px] sm:text-xs text-jalanea-400 px-1.5 py-0.5">
                        +{career.skills.length - 3} more
                    </span>
                )}
            </div>

            {/* Description Preview */}
            <p className="text-xs sm:text-sm text-jalanea-600 line-clamp-2 mb-3 sm:mb-4">
                {career.description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-1.5 sm:gap-2 pt-2 border-t border-jalanea-100">
                <button
                    onClick={onSelect}
                    className={`
                        flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all
                        ${isSelected
                            ? 'bg-gold text-jalanea-950 shadow-md'
                            : 'bg-jalanea-900 text-white hover:bg-jalanea-800'
                        }
                    `}
                >
                    {isSelected ? (
                        <>
                            <Check size={14} className="sm:w-4 sm:h-4" /> Selected
                        </>
                    ) : (
                        <>
                            <TrendingUp size={14} className="sm:w-4 sm:h-4" /> Interested
                        </>
                    )}
                </button>

                <button
                    onClick={onDismiss}
                    className="p-2 sm:p-2.5 rounded-xl border border-jalanea-200 text-jalanea-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                    title="Not for me"
                >
                    <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                <button
                    onClick={onBookmark}
                    className={`
                        p-2 sm:p-2.5 rounded-xl border transition-all
                        ${isBookmarked
                            ? 'border-gold bg-gold/10 text-gold'
                            : 'border-jalanea-200 text-jalanea-400 hover:text-gold hover:border-gold/50'
                        }
                    `}
                    title={isBookmarked ? 'Saved' : 'Save for later'}
                >
                    {isBookmarked ? <BookmarkCheck size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Bookmark size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
            </div>

            {/* View Details Link */}
            {onViewDetails && (
                <button
                    onClick={onViewDetails}
                    className="w-full mt-2 text-xs text-jalanea-500 hover:text-gold font-medium flex items-center justify-center gap-1 py-1"
                >
                    View career details <ChevronRight size={12} />
                </button>
            )}
        </div>
    );
};

export default CareerPathCard;
