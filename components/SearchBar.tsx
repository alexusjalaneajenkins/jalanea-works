import React from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Search, MapPin, Sparkles, Filter, X, Loader2 } from 'lucide-react';
import { JobFilter } from '../types';

interface SearchBarProps {
    searchQuery: string;
    searchLocation: string;
    isSearching: boolean;
    availableFilters: JobFilter[];
    activeFilter: string | null;
    onSearchQueryChange: (value: string) => void;
    onSearchLocationChange: (value: string) => void;
    onSearch: () => void;
    onFilterClick: (filterUds: string | null) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    searchLocation,
    isSearching,
    availableFilters,
    activeFilter,
    onSearchQueryChange,
    onSearchLocationChange,
    onSearch,
    onFilterClick,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="sticky top-0 z-20 -mx-4 px-4 md:-mx-8 md:px-8 py-4 bg-jalanea-50/95 backdrop-blur-md border-b border-white/10 transition-all shadow-sm">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Search Inputs */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Search by title (e.g., Marketing, Designer)..."
                            icon={<Search size={18} />}
                            className="border-none shadow-sm focus:ring-2 focus:ring-gold bg-white"
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="w-full md:w-1/4">
                        <Input
                            placeholder="Location (e.g., Orlando, FL)"
                            icon={<MapPin size={18} />}
                            className="border-none shadow-sm focus:ring-2 focus:ring-gold bg-white"
                            value={searchLocation}
                            onChange={(e) => onSearchLocationChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <Button
                        variant="primary"
                        icon={isSearching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        onClick={onSearch}
                        disabled={isSearching}
                        className="whitespace-nowrap"
                    >
                        {isSearching ? 'Searching...' : 'Search Jobs'}
                    </Button>
                </div>

                {/* Filter Chips */}
                {availableFilters.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-jalanea-500 uppercase tracking-wider">Quick Filters:</span>
                        {availableFilters.map((filter, idx) => (
                            <button
                                key={idx}
                                onClick={() => onFilterClick(filter.uds === activeFilter ? null : filter.uds)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter.uds === activeFilter
                                        ? 'bg-gold text-jalanea-900 shadow-md'
                                        : 'bg-white text-jalanea-600 border border-jalanea-200 hover:border-gold hover:text-gold'
                                    }`}
                            >
                                <Filter size={12} />
                                {filter.name}
                                {filter.uds === activeFilter && <X size={12} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
