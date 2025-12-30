import React, { useState, useMemo } from 'react';
import {
    GraduationCap, Hammer, BookOpen, Check,
    ArrowRight, Search, Zap
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

    // Flatten programs for the selected school
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
        if (!searchTerm.trim()) return availablePrograms.slice(0, 10); // Show first 10 when empty
        return availablePrograms.filter(prog =>
            prog.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availablePrograms, searchTerm]);

    // Handle program selection
    const handleSelectProgram = (programName: string) => {
        console.log("[Stage2] Selecting program:", programName);

        // Find and set the corresponding degree type
        const found = availablePrograms.find(p => p.label === programName);
        const degreeType = found ? found.type : 'Other / Not Listed';

        // Update both fields
        onUpdate('program', programName);
        onUpdate('degreeType', degreeType);

        // Clear search
        setSearchTerm("");
    };

    // Clear program selection to go back to search
    const clearProgram = () => {
        onUpdate('program', '');
        onUpdate('degreeType', '');
        setSearchTerm("");
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

            {/* 1. School Selection (Always Visible) */}
            <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                    Where are you training?
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {SCHOOLS.map((school) => {
                        const isSelected = data.school === school.name;
                        return (
                            <button
                                type="button"
                                key={school.name}
                                onClick={() => {
                                    console.log("[Stage2] Selecting school:", school.name);
                                    onUpdate('school', school.name);
                                    onUpdate('program', '');
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

            {/* 2. Program Selection Logic - THE TICKET SWAP */}
            {data.school && data.school !== 'Other' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-lg font-bold text-gray-900">What is your program?</h3>

                    {/* CONDITIONAL SWAP */}
                    {!data.program ? (
                        // === VIEW A: SEARCH INTERFACE ===
                        <div className="relative z-20">
                            {/* Standard Input - No Fake Buttons */}
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    id="program-search"
                                    name="programSearch"
                                    autoComplete="off"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search programs (e.g. Welding, Nursing)..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-lg"
                                />
                            </div>

                            {/* Results List (Rendered Inline Below) */}
                            <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {filteredPrograms.length > 0 ? (
                                    <div className="p-2 space-y-1">
                                        {filteredPrograms.map((prog) => (
                                            <button
                                                type="button"
                                                key={prog.label}
                                                onMouseDown={() => handleSelectProgram(prog.label)}
                                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-900 transition-colors flex items-center justify-between group"
                                            >
                                                <div>
                                                    <span className="font-medium text-slate-700 group-hover:text-green-900">{prog.label}</span>
                                                    <span className="ml-2 text-xs text-slate-400">{prog.type}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-slate-400">
                                        No programs found matching "{searchTerm}"
                                    </div>
                                )}
                            </div>

                            <p className="mt-2 text-sm text-slate-400 text-center">
                                Can't find it? Try keywords like "Nurse" or "Business"
                            </p>
                        </div>
                    ) : (
                        // === VIEW B: SUCCESS TICKET (Replaces Search) ===
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2.5 rounded-full">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Selected Program</p>
                                    <p className="text-lg font-bold text-gray-900">{data.program}</p>
                                    <p className="text-sm text-slate-500">{data.degreeType}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={clearProgram}
                                className="text-sm text-gray-500 hover:text-gray-900 underline font-medium px-3 py-2 hover:bg-white/50 rounded-lg transition-colors"
                            >
                                Change
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* "Other" School - Manual Input */}
            {data.school === 'Other' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-lg font-bold text-gray-900">Tell us about your program</h3>
                    <input
                        type="text"
                        value={data.program}
                        onChange={(e) => onUpdate('program', e.target.value)}
                        placeholder="Enter your program name..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-lg"
                    />
                </div>
            )}

            {/* The "Magic" Interaction: Skill Prediction */}
            {data.program && (
                <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-slate-700 shadow-lg animate-in fade-in zoom-in-95 duration-500">
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

            {/* 3. The Reveal (Only visible if Ticket exists) */}
            {data.program && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-500 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">When do you graduate?</h3>

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
        </div>
    );
};
