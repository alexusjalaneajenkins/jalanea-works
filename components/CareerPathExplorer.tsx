import React, { useState, useMemo } from 'react';
import { RefreshCw, Filter, Sparkles, ChevronDown, Check, Bookmark } from 'lucide-react';
import { CareerPathCard, CareerPath } from './CareerPathCard';
import { Button } from './Button';

interface CareerPathExplorerProps {
    suggestedCareers: CareerPath[];
    onSelectionChange: (selectedIds: string[]) => void;
    onBookmarksChange?: (bookmarkedIds: string[]) => void;
    onRefresh?: () => void;
    minSelections?: number;
    degreeInfo?: {
        name: string;
        field: string;
    };
}

type FilterCategory = 'all' | 'Technology' | 'Healthcare' | 'Business' | 'Creative/Design' | 'Manufacturing' | 'Hospitality';

export const CareerPathExplorer: React.FC<CareerPathExplorerProps> = ({
    suggestedCareers,
    onSelectionChange,
    onBookmarksChange,
    onRefresh,
    minSelections = 1,
    degreeInfo
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter careers
    const filteredCareers = useMemo(() => {
        return suggestedCareers.filter(career => {
            if (filterCategory !== 'all' && career.field !== filterCategory) return false;
            return true;
        });
    }, [suggestedCareers, filterCategory]);

    // Visible careers (not dismissed)
    const visibleCareers = filteredCareers.filter(c => !dismissedIds.has(c.id));

    const handleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        onSelectionChange(Array.from(newSelected));
    };

    const handleDismiss = (id: string) => {
        const newDismissed = new Set(dismissedIds);
        if (newDismissed.has(id)) {
            newDismissed.delete(id);
        } else {
            // Remove from selected if dismissing
            const newSelected = new Set(selectedIds);
            newSelected.delete(id);
            setSelectedIds(newSelected);
            onSelectionChange(Array.from(newSelected));
            newDismissed.add(id);
        }
        setDismissedIds(newDismissed);
    };

    const handleBookmark = (id: string) => {
        const newBookmarked = new Set(bookmarkedIds);
        if (newBookmarked.has(id)) {
            newBookmarked.delete(id);
        } else {
            newBookmarked.add(id);
        }
        setBookmarkedIds(newBookmarked);
        onBookmarksChange?.(Array.from(newBookmarked));
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh?.();
        // Reset dismissed for refresh
        setDismissedIds(new Set());
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const categories: FilterCategory[] = ['all', 'Technology', 'Healthcare', 'Business', 'Creative/Design', 'Manufacturing', 'Hospitality'];

    return (
        <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
                    <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" /> Choose Your Path
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-jalanea-900">
                    Explore Career Paths
                </h2>
                <p className="text-sm sm:text-base text-jalanea-600 mt-1 px-2">
                    {degreeInfo
                        ? `Based on your ${degreeInfo.name}, here are careers that match your skills.`
                        : 'Select the careers that interest you. You can always change your mind later.'
                    }
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`
                        flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all
                        ${showFilters
                            ? 'bg-jalanea-900 text-white border-jalanea-900'
                            : 'bg-white text-jalanea-700 border-jalanea-200 hover:border-jalanea-300'
                        }
                    `}
                >
                    <Filter size={14} className="sm:w-4 sm:h-4" />
                    Filter
                    <ChevronDown size={12} className={`sm:w-3.5 sm:h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Selection Counter & Refresh */}
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className={`font-bold ${selectedIds.size >= minSelections ? 'text-green-600' : 'text-jalanea-500'}`}>
                            {selectedIds.size} selected
                        </span>
                        {selectedIds.size < minSelections && (
                            <span className="text-jalanea-400 hidden sm:inline">(min {minSelections})</span>
                        )}
                    </div>

                    {bookmarkedIds.size > 0 && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gold">
                            <Bookmark size={12} className="sm:w-3.5 sm:h-3.5" />
                            <span className="font-medium">{bookmarkedIds.size}</span>
                        </div>
                    )}

                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        icon={<RefreshCw size={12} className={`sm:w-3.5 sm:h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
                        className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                        <span className="hidden sm:inline">{isRefreshing ? 'Loading...' : 'More Options'}</span>
                        <span className="sm:hidden">{isRefreshing ? '...' : 'More'}</span>
                    </Button>
                </div>
            </div>

            {/* Filter Pills - Horizontal scroll on mobile */}
            {showFilters && (
                <div className="overflow-x-auto -mx-2 px-2 pb-2">
                    <div className="flex gap-2 p-3 sm:p-4 bg-jalanea-50 rounded-xl animate-in slide-in-from-top-2 duration-200 min-w-max sm:min-w-0 sm:flex-wrap">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`
                                    px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap
                                    ${filterCategory === cat
                                        ? 'bg-jalanea-900 text-white'
                                        : 'bg-white text-jalanea-600 hover:bg-jalanea-100 border border-jalanea-200'
                                    }
                                `}
                            >
                                {cat === 'all' ? 'All' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Career Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2">
                {visibleCareers.map(career => (
                    <CareerPathCard
                        key={career.id}
                        career={career}
                        isSelected={selectedIds.has(career.id)}
                        isDismissed={dismissedIds.has(career.id)}
                        isBookmarked={bookmarkedIds.has(career.id)}
                        onSelect={() => handleSelect(career.id)}
                        onDismiss={() => handleDismiss(career.id)}
                        onBookmark={() => handleBookmark(career.id)}
                    />
                ))}
            </div>

            {/* Empty State */}
            {visibleCareers.length === 0 && (
                <div className="text-center py-12 bg-jalanea-50 rounded-2xl">
                    <p className="text-jalanea-500 mb-4">
                        {dismissedIds.size > 0
                            ? "You've dismissed all visible careers."
                            : "No careers match your filter."
                        }
                    </p>
                    <Button variant="primary" onClick={handleRefresh} icon={<RefreshCw size={16} />}>
                        Load More Careers
                    </Button>
                </div>
            )}

            {/* Selection Summary */}
            {selectedIds.size > 0 && (
                <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gold text-jalanea-950 flex items-center justify-center">
                            <Check size={16} strokeWidth={3} />
                        </div>
                        <div>
                            <h4 className="font-bold text-jalanea-900">Your Target Careers</h4>
                            <p className="text-xs text-jalanea-600">We'll prioritize jobs in these fields</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(selectedIds).map((id: string) => {
                            const career = suggestedCareers.find(c => c.id === id);
                            if (!career) return null;
                            return (
                                <span
                                    key={id}
                                    className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-jalanea-800 shadow-sm"
                                >
                                    {career.title}
                                    <button
                                        onClick={() => handleSelect(id)}
                                        className="text-jalanea-400 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerPathExplorer;
