import React, { useState, useEffect, useRef } from 'react';
import { Search, GraduationCap, ChevronDown, X, Briefcase, DollarSign, Check } from 'lucide-react';
import {
    DegreeProgram,
    getAutocompleteSuggestions,
    ALL_DEGREE_PROGRAMS,
    DegreeLevel
} from '../data/degreeDatabase';

interface DegreeSearchSelectProps {
    onSelect: (program: DegreeProgram) => void;
    selectedProgram?: DegreeProgram | null;
    placeholder?: string;
    showCareers?: boolean;
}

export const DegreeSearchSelect: React.FC<DegreeSearchSelectProps> = ({
    onSelect,
    selectedProgram,
    placeholder = "Search your degree or certificate...",
    showCareers = true
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<DegreeProgram[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update suggestions when query changes
    useEffect(() => {
        if (query.length >= 2) {
            const results = getAutocompleteSuggestions(query, 8);
            setSuggestions(results);
            setHighlightedIndex(0);
        } else if (query.length === 0 && isOpen) {
            // Show popular programs when empty
            setSuggestions(ALL_DEGREE_PROGRAMS.slice(0, 8));
        } else {
            setSuggestions([]);
        }
    }, [query, isOpen]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && suggestions[highlightedIndex]) {
            e.preventDefault();
            handleSelect(suggestions[highlightedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleSelect = (program: DegreeProgram) => {
        onSelect(program);
        setQuery('');
        setIsOpen(false);
    };

    const clearSelection = () => {
        onSelect(null as any);
        setQuery('');
        inputRef.current?.focus();
    };

    const getLevelBadgeColor = (level: DegreeLevel) => {
        switch (level) {
            case 'Technical Certificate':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Advanced Technical Certificate':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Associate of Science (A.S.)':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Bachelor of Applied Science (B.A.S.)':
                return 'bg-gold/20 text-gold-dark border-gold/30';
            default:
                return 'bg-jalanea-100 text-jalanea-700 border-jalanea-200';
        }
    };

    const getLevelShort = (level: DegreeLevel) => {
        switch (level) {
            case 'Technical Certificate': return 'TC';
            case 'Advanced Technical Certificate': return 'ATC';
            case 'Associate of Science (A.S.)': return 'A.S.';
            case 'Associate of Arts (A.A.)': return 'A.A.';
            case 'Bachelor of Applied Science (B.A.S.)': return 'B.A.S.';
            case 'Bachelor of Science (B.S.)': return 'B.S.';
            default: return level;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Program Display */}
            {selectedProgram ? (
                <div className="bg-white border-2 border-gold rounded-xl p-4 relative">
                    <button
                        onClick={clearSelection}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-jalanea-100 text-jalanea-400 hover:text-jalanea-600 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-gold shrink-0">
                            <GraduationCap size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getLevelBadgeColor(selectedProgram.level)}`}>
                                    {getLevelShort(selectedProgram.level)}
                                </span>
                                <span className="text-xs text-jalanea-500">{selectedProgram.institution}</span>
                            </div>
                            <h4 className="font-bold text-jalanea-900 mt-1">{selectedProgram.name}</h4>

                            {/* Career Preview */}
                            {showCareers && selectedProgram.entryLevelCareers.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-jalanea-100">
                                    <p className="text-xs font-bold text-jalanea-600 mb-2 flex items-center gap-1">
                                        <Briefcase size={12} />
                                        Entry-Level Careers You Qualify For:
                                    </p>
                                    <div className="space-y-1.5">
                                        {selectedProgram.entryLevelCareers.slice(0, 3).map((career, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-jalanea-700">{career.title}</span>
                                                <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                                                    <DollarSign size={10} />
                                                    {career.averageSalary}
                                                </span>
                                            </div>
                                        ))}
                                        {selectedProgram.entryLevelCareers.length > 3 && (
                                            <p className="text-xs text-jalanea-400">
                                                +{selectedProgram.entryLevelCareers.length - 3} more careers
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Search Input */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-jalanea-400">
                            <Search size={18} />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full bg-white border-2 border-jalanea-200 rounded-xl py-3.5 pl-12 pr-10 text-jalanea-900 placeholder-jalanea-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all font-medium"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-jalanea-400">
                            <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Dropdown */}
                    {isOpen && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-jalanea-200 rounded-xl shadow-xl overflow-hidden max-h-[320px] overflow-y-auto">
                            {suggestions.map((program, index) => (
                                <button
                                    key={program.id}
                                    onClick={() => handleSelect(program)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${index === highlightedIndex ? 'bg-gold/10' : 'hover:bg-jalanea-50'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-jalanea-100 flex items-center justify-center text-jalanea-600 shrink-0 mt-0.5">
                                        <GraduationCap size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getLevelBadgeColor(program.level)}`}>
                                                {getLevelShort(program.level)}
                                            </span>
                                        </div>
                                        <h4 className="font-medium text-jalanea-900 text-sm mt-0.5 truncate">{program.name}</h4>
                                        <p className="text-xs text-jalanea-500 truncate">{program.institution} • {program.field}</p>
                                    </div>
                                    {index === highlightedIndex && (
                                        <Check size={16} className="text-gold shrink-0 mt-1" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {isOpen && query.length >= 2 && suggestions.length === 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-jalanea-200 rounded-xl shadow-xl p-6 text-center">
                            <GraduationCap size={32} className="mx-auto text-jalanea-300 mb-2" />
                            <p className="text-jalanea-600 font-medium">No programs found</p>
                            <p className="text-sm text-jalanea-400 mt-1">Try a different search term</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DegreeSearchSelect;
