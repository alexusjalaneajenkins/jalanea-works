import React, { useState, useEffect, useMemo } from 'react';
import {
    GraduationCap, Hammer, BookOpen, Check,
    ArrowRight, Search, Zap, Plus, Trash2, X
} from 'lucide-react';
import { CENTRAL_FL_DATA, SchoolName } from '../../data/centralFloridaPrograms';

// ==================== TYPE DEFINITIONS ====================
interface EducationEntry {
    id: string;
    school: string;
    degreeType: string;
    program: string;
    gradYear: string;
    status: 'Alumni' | 'Student';
}

interface Stage2Props {
    // Now receives the FULL education array
    educationStack: EducationEntry[];
    onAddEntry: () => void;
    onUpdateEntry: (id: string, field: keyof EducationEntry, value: string) => void;
    onRemoveEntry: (id: string) => void;
    onNext: () => void;
    onBack: () => void;
}

// ==================== SKILL GENERATOR ====================
const getSkillAssets = (program: string): string[] => {
    const p = program.toLowerCase();
    if (p.includes('nursing') || p.includes('medical') || p.includes('health')) return ['Patient Care', 'Medical Terminology', 'Clinical Safety'];
    if (p.includes('business') || p.includes('management') || p.includes('admin')) return ['Leadership', 'Project Management', 'Communication'];
    if (p.includes('it') || p.includes('tech') || p.includes('cyber') || p.includes('software')) return ['Problem Solving', 'Technical Support', 'Systems Analysis'];
    if (p.includes('welding') || p.includes('construction') || p.includes('manufacturing')) return ['Blueprints', 'Safety Compliance', 'Fabrication'];
    if (p.includes('culinary') || p.includes('baking') || p.includes('hospitality')) return ['Food Safety', 'Team Coordination', 'Customer Service'];
    return ['Critical Thinking', 'Adaptability', 'Professionalism'];
};

// ==================== SCHOOL CONFIG ====================
const SCHOOLS: { name: SchoolName; color: string; bg: string; border: string; icon: React.ReactNode }[] = [
    { name: "Valencia College", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: <BookOpen className="w-6 h-6" /> },
    { name: "Seminole State College", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: <GraduationCap className="w-6 h-6" /> },
    { name: "Orange Technical College", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: <Hammer className="w-6 h-6" /> },
    { name: "Other", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: <Zap className="w-6 h-6" /> }
];

// ==================== SINGLE CREDENTIAL CARD ====================
interface CredentialCardProps {
    entry: EducationEntry;
    index: number;
    canRemove: boolean;
    onUpdate: (field: keyof EducationEntry, value: string) => void;
    onRemove: () => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ entry, index, canRemove, onUpdate, onRemove }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(!entry.program);

    // Local optimistic state
    const [localProgram, setLocalProgram] = useState<string | null>(entry.program || null);
    const [localDegreeType, setLocalDegreeType] = useState<string | null>(entry.degreeType || null);

    // Sync from parent
    useEffect(() => {
        if (entry.program) setLocalProgram(entry.program);
        if (entry.degreeType) setLocalDegreeType(entry.degreeType);
    }, [entry.program, entry.degreeType]);

    // Program list for selected school
    const availablePrograms = useMemo(() => {
        if (!entry.school || entry.school === 'Other' || !CENTRAL_FL_DATA[entry.school]) return [];
        const programs: { label: string; type: string }[] = [];
        const schoolData = CENTRAL_FL_DATA[entry.school];
        Object.entries(schoolData).forEach(([type, progList]) => {
            progList.forEach(prog => programs.push({ label: prog, type }));
        });
        return programs;
    }, [entry.school]);

    // Filter
    const filteredPrograms = useMemo(() => {
        if (!searchTerm.trim()) return availablePrograms.slice(0, 8);
        return availablePrograms.filter(p => p.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [availablePrograms, searchTerm]);

    // Handlers
    const handleSelectSchool = (schoolName: string) => {
        setLocalProgram(null);
        setLocalDegreeType(null);
        setIsSearching(true);
        setSearchTerm("");
        onUpdate('school', schoolName);
        onUpdate('program', '');
        onUpdate('degreeType', '');
    };

    const handleSelectProgram = (programName: string, degreeType: string) => {
        setLocalProgram(programName);
        setLocalDegreeType(degreeType);
        setIsSearching(false);
        setSearchTerm("");
        onUpdate('program', programName);
        onUpdate('degreeType', degreeType);
    };

    const clearProgram = () => {
        setLocalProgram(null);
        setLocalDegreeType(null);
        setIsSearching(true);
        setSearchTerm("");
        onUpdate('program', '');
        onUpdate('degreeType', '');
    };

    return (
        <div className="relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                    </div>
                    <span className="font-bold text-slate-700">
                        {entry.program ? entry.program : 'Add Credential'}
                    </span>
                </div>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* School Selection */}
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    School
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {SCHOOLS.map((school) => {
                        const isSelected = entry.school === school.name;
                        return (
                            <button
                                type="button"
                                key={school.name}
                                onClick={() => handleSelectSchool(school.name)}
                                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center ${isSelected
                                    ? `${school.bg} ${school.border} ring-1 ring-offset-1 ring-slate-200`
                                    : 'bg-slate-50 border-slate-100 hover:bg-white'
                                    }`}
                            >
                                <div className={`${school.color}`}>{school.icon}</div>
                                <span className={`text-xs font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {school.name.replace(' College', '')}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Program Selection - Ticket Swap with Optimistic UI */}
            {entry.school && entry.school !== 'Other' && (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Program
                    </label>

                    {!localProgram ? (
                        // Search Interface
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                autoComplete="off"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search programs..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                            />
                            <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow max-h-48 overflow-y-auto">
                                {filteredPrograms.length > 0 ? (
                                    <div className="p-1">
                                        {filteredPrograms.map((prog) => (
                                            <button
                                                type="button"
                                                key={prog.label}
                                                onMouseDown={() => handleSelectProgram(prog.label, prog.type)}
                                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm transition-colors"
                                            >
                                                <span className="font-medium text-slate-700">{prog.label}</span>
                                                <span className="ml-2 text-xs text-slate-400">{prog.type}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-slate-400 text-sm">No programs found</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Success Ticket
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-1.5 rounded-full">
                                    <Check className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">{localProgram}</p>
                                    <p className="text-xs text-slate-500">{localDegreeType}</p>
                                </div>
                            </div>
                            <button type="button" onClick={clearProgram} className="text-xs text-slate-500 hover:text-slate-900 underline">
                                Change
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Other School - Manual Input */}
            {entry.school === 'Other' && (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Program Name
                    </label>
                    <input
                        type="text"
                        value={entry.program}
                        onChange={(e) => {
                            setLocalProgram(e.target.value);
                            onUpdate('program', e.target.value);
                        }}
                        placeholder="Enter your program..."
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                    />
                </div>
            )}

            {/* Status & Year (Only show when program is selected) */}
            {localProgram && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                    {/* Status */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Status
                        </label>
                        <div className="flex gap-2">
                            {(['Alumni', 'Student'] as const).map((s) => (
                                <button
                                    type="button"
                                    key={s}
                                    onClick={() => onUpdate('status', s)}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${entry.status === s
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Year */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {entry.status === 'Student' ? 'Expected Year' : 'Grad Year'}
                        </label>
                        <input
                            type="number"
                            value={entry.gradYear}
                            onChange={(e) => onUpdate('gradYear', e.target.value)}
                            placeholder="2024"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Skills Preview */}
            {localProgram && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1">
                        {getSkillAssets(localProgram).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
export const Stage2_Education: React.FC<Stage2Props> = ({
    educationStack,
    onAddEntry,
    onUpdateEntry,
    onRemoveEntry,
    onNext,
    onBack
}) => {
    // Validation: At least one complete entry
    const isValid = educationStack.some(e => e.school && e.program && e.gradYear);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-full">
                    <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Build Your Education Stack</h2>
                    <p className="text-slate-500">Add all your credentials - degrees, certificates, training</p>
                </div>
            </div>

            {/* Credential Cards */}
            <div className="space-y-4">
                {educationStack.map((entry, index) => (
                    <CredentialCard
                        key={entry.id}
                        entry={entry}
                        index={index}
                        canRemove={educationStack.length > 1}
                        onUpdate={(field, value) => onUpdateEntry(entry.id, field, value)}
                        onRemove={() => onRemoveEntry(entry.id)}
                    />
                ))}
            </div>

            {/* Add Another */}
            <button
                type="button"
                onClick={onAddEntry}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50/50 transition-all flex items-center justify-center gap-2 font-semibold"
            >
                <Plus className="w-5 h-5" />
                Add Another Credential
            </button>

            {/* Summary */}
            {educationStack.filter(e => e.program).length > 0 && (
                <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Your Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {educationStack.filter(e => e.program).map((e) => (
                            <span key={e.id} className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium border border-white/20">
                                {e.program}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 z-40 p-6 -mx-6 -mb-6 mt-8 rounded-b-2xl flex items-center gap-4">
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
                    disabled={!isValid}
                    className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                    Next Step: Logistics
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
