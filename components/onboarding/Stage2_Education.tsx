import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    GraduationCap, Hammer, BookOpen, Check,
    ArrowRight, Search, Zap, X, CheckCircle2
} from 'lucide-react';
import { CENTRAL_FL_DATA, SchoolName } from '../../data/centralFloridaPrograms';

// Type Definitions
interface ValidationProps {
    data: {
        school: string;
        degreeType: string;
        program: string;
        gradYear: string;
    };
    onUpdate: (field: string, value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

// Mock Skill Generator
const getSkillAssets = (program: string): string[] => {
    const p = program.toLowerCase();
    if (p.includes('nursing') || p.includes('medical') || p.includes('health')) return ['Patient Care', 'Medical Terminology', 'Clinical Safety', 'Empathy'];
    if (p.includes('business') || p.includes('management') || p.includes('admin')) return ['Leadership', 'Project Management', 'Communication', 'Strategic Planning'];
    if (p.includes('it') || p.includes('tech') || p.includes('cyber') || p.includes('software')) return ['Problem Solving', 'Technical Support', 'Systems Analysis', 'Coding'];
    if (p.includes('welding') || p.includes('construction') || p.includes('manufacturing')) return ['Blueprints', 'Safety Compliance', 'Fabrication', 'Quality Control'];
    if (p.includes('culinary') || p.includes('baking') || p.includes('hospitality')) return ['Food Safety', 'Team Coordination', 'Inventory Mgmt', 'Customer Service'];
    if (p.includes('design') || p.includes('media') || p.includes('arts')) return ['Creative Suite', 'Visual Communication', 'UX Principles', 'Portfolio Development'];
    return ['Critical Thinking', 'Adaptability', 'Time Management', 'Professionalism'];
};

export const Stage2_Education: React.FC<ValidationProps> = ({ data, onUpdate, onNext, onBack }) => {
    const [status, setStatus] = useState<'alumni' | 'student'>('alumni');
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Sync input with external data changes
    useEffect(() => {
        if (data.program && data.program !== searchTerm) {
            setSearchTerm(data.program);
        }
    }, [data.program]);

    // Focus input when modal opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    // School Options Configuration
    const SCHOOLS: { name: SchoolName; color: string; bg: string; border: string; icon: React.ReactNode }[] = [
        {
            name: "Valencia College",
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
            icon: <BookOpen className="w-8 h-8" />
        },
        {
            name: "Seminole State College",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
            icon: <GraduationCap className="w-8 h-8" />
        },
        {
            name: "Orange Technical College",
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-200",
            icon: <Hammer className="w-8 h-8" />
        },
        {
            name: "Other",
            color: "text-slate-600",
            bg: "bg-slate-50",
            border: "border-slate-200",
            icon: <Zap className="w-8 h-8" />
        }
    ];

    // Flatten programs for the selected school to allow direct searching
    const availablePrograms = useMemo(() => {
        if (!data.school || data.school === 'Other' || !CENTRAL_FL_DATA[data.school]) return [];

        const programs: { label: string; type: string }[] = [];
        const schoolData = CENTRAL_FL_DATA[data.school];

        Object.entries(schoolData).forEach(([type, progList]) => {
            progList.forEach(prog => {
                programs.push({ label: prog, type });
            });
        });

        return programs;
    }, [data.school]);

    // Filter Logic
    const filteredPrograms = useMemo(() => {
        return availablePrograms.filter(prog =>
            prog.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availablePrograms, searchTerm]);

    // Update both program and infer degree type
    const handleSelectProgram = (programName: string) => {
        console.log("Selecting program:", programName); // Debug log
        onUpdate('program', programName);

        // Find and set the corresponding degree type
        const found = availablePrograms.find(p => p.label === programName);
        if (found) {
            onUpdate('degreeType', found.type);
        } else {
            onUpdate('degreeType', 'Other / Not Listed');
        }
        setSearchTerm(programName);
        setIsSearchOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-full">
                    <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Equip your foundation.</h2>
                    <p className="text-slate-500">Your training unlocks specific career bridges.</p>
                </div>
            </div>

            {/* 1. School Selector (Always Visible) */}
            <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                    Where are you training?
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {SCHOOLS.map((school) => {
                        const isSelected = data.school === school.name;
                        return (
                            <button
                                type="button" // Ensuring these buttons don't submit the form
                                key={school.name}
                                onClick={() => {
                                    onUpdate('school', school.name);
                                    onUpdate('program', ''); // Reset program on school change
                                    onUpdate('degreeType', '');
                                    setSearchTerm('');
                                }}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 text-center ${isSelected
                                    ? `${school.bg} ${school.border} ring-2 ring-offset-1 ring-slate-200 shadow-md`
                                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`p-3 rounded-full bg-white shadow-sm ${school.color}`}>
                                    {school.icon}
                                </div>
                                <span className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {school.name.replace(' College', '')}
                                </span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Program Input ("The Skillset") - Conditionally Rendered */}
            {data.school && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="block text-lg font-bold text-gray-900 mb-4">
                        What is your program?
                    </label>

                    {/* FAKE INPUT TRIGGER REWRITTEN */}
                    <button
                        type="button" // Prevent form submission
                        onClick={() => setIsSearchOpen(true)}
                        className={`w-full p-4 border rounded-xl flex justify-between items-center text-left transition-all group ${data.program
                            ? "bg-white border-green-500 ring-1 ring-green-500 shadow-sm" // Success State
                            : "bg-gray-50 border-gray-200 hover:bg-white" // Empty State
                            }`}
                    >
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Selected Program
                            </span>
                            <span className={`text-lg font-medium truncate ${data.program ? "text-gray-900" : "text-gray-400"}`}>
                                {data.program || "Tap to search..."}
                            </span>
                        </div>

                        {/* Icon Swaps on Success */}
                        {data.program ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                        ) : (
                            <Search className="h-5 w-5 text-gray-400 group-hover:text-green-500 shrink-0" />
                        )}
                    </button>

                    {/* The "Magic" Interaction: Skill Prediction */}
                    {data.program && (
                        <div className="mt-4 p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-slate-700 shadow-lg animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">
                                        SKILLSET DETECTED
                                    </div>
                                    <div className="text-white font-medium mb-3">
                                        Based on <span className="text-yellow-400">{data.program}</span>, we've equipped you with:
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {getSkillAssets(data.program).map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium border border-white/10 shadow-sm backdrop-blur-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 3. Status Toggle ("The Timeline") - Conditionally Rendered */}
            {data.program && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 border-t border-gray-100 pt-8">
                    <label className="block text-lg font-bold text-gray-900 mb-4">
                        When do you graduate?
                    </label>

                    <div className="p-1 bg-slate-100 rounded-xl flex mb-4">
                        <button
                            type="button"
                            onClick={() => setStatus('alumni')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${status === 'alumni' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Graduated / Alumni
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('student')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${status === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Current Student
                        </button>
                    </div>

                    <div className="relative group animate-in fade-in">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                            {status === 'alumni' ? 'Graduation Year' : 'Expected Grad Year'}
                        </label>
                        <input
                            type="number"
                            value={data.gradYear}
                            onChange={(e) => onUpdate('gradYear', e.target.value)}
                            placeholder="e.g. 2024"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                        />
                        {status === 'student' && (
                            <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
                                <Check className="w-4 h-4" />
                                <span>Internship Mode Unlocked</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-40 p-6 -mx-6 -mb-6 mt-8 rounded-b-2xl flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!data.school || !data.program || !data.gradYear}
                            className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            Next Step: Logistics
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* THE SEARCH MODAL (Rendered at Root Level) */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        {/* Modal Header / Search Bar */}
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                            <Search className="w-5 h-5 text-slate-400 shrink-0" />
                            <label htmlFor="modal-program-search" className="sr-only">Search Programs</label>
                            <input
                                id="modal-program-search"    // Matching ID
                                name="programSearch"         // Unique Name
                                autoComplete="off"           // Disable autocomplete to stop browser fights
                                autoFocus
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Search ${data.school ? data.school.split(' ')[0] : ''} programs...`}
                                className="flex-1 text-lg outline-none placeholder:text-slate-300 text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {filteredPrograms.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredPrograms.map((prog) => (
                                        <button
                                            type="button"
                                            key={prog.label}
                                            onClick={() => handleSelectProgram(prog.label)}
                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-green-50 hover:text-green-900 transition-colors flex items-center justify-between group"
                                        >
                                            <span className="font-medium text-slate-700 group-hover:text-green-900">{prog.label}</span>
                                            {data.program === prog.label && <Check className="w-4 h-4 text-green-600" />}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400">
                                    {searchTerm ? (
                                        <>No programs found matching "{searchTerm}"</>
                                    ) : (
                                        <>Start typing to find your program...</>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Hint */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
                            Can't find it? Try searching for keywords like "Nurse" or "Business"
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
