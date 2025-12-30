import React, { useState, useEffect, useMemo } from 'react';
import {
    GraduationCap, Hammer, BookOpen, Check,
    ArrowRight, Search, Zap, Plus, Trash2, Pencil, X
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
    educationStack: EducationEntry[];
    onAddEntry: () => void;
    onUpdateEntry: (id: string, field: keyof EducationEntry, value: string) => void;
    onRemoveEntry: (id: string) => void;
    onNext: () => void;
    onBack: () => void;
}

// ==================== SCHOOL CONFIG ====================
const SCHOOLS: { name: SchoolName; emoji: string; color: string; bg: string; border: string }[] = [
    { name: "Valencia College", emoji: "📕", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { name: "Seminole State College", emoji: "📘", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { name: "Orange Technical College", emoji: "📙", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { name: "Other", emoji: "📓", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" }
];

const getSchoolEmoji = (school: string): string => {
    return SCHOOLS.find(s => s.name === school)?.emoji || "🎓";
};

// ==================== COMPACT CREDENTIAL CARD ====================
const CompactCredentialCard: React.FC<{
    entry: EducationEntry;
    onEdit: () => void;
    onRemove: () => void;
}> = ({ entry, onEdit, onRemove }) => (
    <div className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-2xl shadow-inner">
                {getSchoolEmoji(entry.school)}
            </div>
            <div>
                <h4 className="font-bold text-gray-900">{entry.program}</h4>
                <p className="text-sm text-gray-500">
                    {entry.school} • {entry.status} ({entry.gradYear})
                </p>
            </div>
        </div>

        <div className="flex gap-1">
            <button type="button" onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={onRemove} className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    </div>
);

// ==================== CREDENTIAL BUILDER FORM ====================
const CredentialBuilderForm: React.FC<{
    entry: EducationEntry;
    onUpdate: (field: keyof EducationEntry, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    showCancel: boolean;
}> = ({ entry, onUpdate, onSave, onCancel, showCancel }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // LOCAL optimistic state for instant UI
    const [localSchool, setLocalSchool] = useState(entry.school || "");
    const [localProgram, setLocalProgram] = useState(entry.program || "");
    const [localStatus, setLocalStatus] = useState<'Alumni' | 'Student'>(entry.status || 'Alumni');
    const [localYear, setLocalYear] = useState(entry.gradYear || "");

    // Program list
    const availablePrograms = useMemo(() => {
        if (!localSchool || localSchool === 'Other' || !CENTRAL_FL_DATA[localSchool]) return [];
        const programs: { label: string; type: string }[] = [];
        Object.entries(CENTRAL_FL_DATA[localSchool]).forEach(([type, progList]) => {
            progList.forEach(prog => programs.push({ label: prog, type }));
        });
        return programs;
    }, [localSchool]);

    const filteredPrograms = useMemo(() => {
        if (!searchTerm.trim()) return availablePrograms.slice(0, 8);
        return availablePrograms.filter(p => p.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [availablePrograms, searchTerm]);

    // Handlers that update LOCAL state instantly, then sync to parent
    const handleSelectSchool = (schoolName: string) => {
        setLocalSchool(schoolName);
        setLocalProgram("");
        setSearchTerm("");
        onUpdate('school', schoolName);
        onUpdate('program', '');
        onUpdate('degreeType', '');
    };

    const handleSelectProgram = (programName: string, degreeType: string) => {
        setLocalProgram(programName);
        setSearchTerm("");
        onUpdate('program', programName);
        onUpdate('degreeType', degreeType);
    };

    const handleStatusChange = (status: 'Alumni' | 'Student') => {
        setLocalStatus(status);
        onUpdate('status', status);
    };

    const handleYearChange = (year: string) => {
        setLocalYear(year);
        onUpdate('gradYear', year);
    };

    // Check if form is complete using LOCAL state
    const isComplete = localSchool && localProgram && localYear;

    const handleSaveClick = () => {
        if (isComplete) {
            console.log("✅ Saving credential:", { localSchool, localProgram, localYear });
            onSave();
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900 text-lg">Add Credential</h3>
                {showCancel && (
                    <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Step 1: School Selection */}
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    1. Select School
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {SCHOOLS.map((school) => {
                        const isSelected = localSchool === school.name;
                        return (
                            <button
                                type="button"
                                key={school.name}
                                onClick={() => handleSelectSchool(school.name)}
                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${isSelected
                                    ? `${school.bg} ${school.border} shadow-sm`
                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <span className="text-xl">{school.emoji}</span>
                                <span className={`text-sm font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {school.name.replace(' College', '')}
                                </span>
                                {isSelected && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 2: Program Selection (only show after school) */}
            {localSchool && localSchool !== 'Other' && (
                <div className="mb-4 animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        2. Select Program
                    </label>

                    {!localProgram ? (
                        <div>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    autoComplete="off"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search programs..."
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-white"
                                />
                            </div>
                            <div className="mt-2 bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto">
                                {filteredPrograms.length > 0 ? (
                                    <div className="p-1">
                                        {filteredPrograms.map((prog) => (
                                            <button
                                                type="button"
                                                key={prog.label}
                                                onClick={() => handleSelectProgram(prog.label, prog.type)}
                                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm transition-colors"
                                            >
                                                <span className="font-medium text-slate-700">{prog.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-slate-400 text-sm">No programs found</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-slate-900 text-sm">{localProgram}</span>
                            </div>
                            <button type="button" onClick={() => { setLocalProgram(""); onUpdate('program', ''); }} className="text-xs text-slate-500 hover:text-slate-900 underline">
                                Change
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Other School - Manual Input */}
            {localSchool === 'Other' && (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        2. Program Name
                    </label>
                    <input
                        type="text"
                        value={localProgram}
                        onChange={(e) => { setLocalProgram(e.target.value); onUpdate('program', e.target.value); }}
                        placeholder="Enter your program..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                    />
                </div>
            )}

            {/* Step 3 & 4: Status & Year - ALWAYS show after program is selected */}
            {localProgram && (
                <div className="grid grid-cols-2 gap-4 mb-5 animate-in fade-in duration-200">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            3. Status
                        </label>
                        <div className="flex gap-2">
                            {(['Alumni', 'Student'] as const).map((s) => (
                                <button
                                    type="button"
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${localStatus === s
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            4. Year
                        </label>
                        <input
                            type="number"
                            value={localYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            placeholder="2024"
                            min="1990"
                            max="2030"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                        />
                    </div>
                </div>
            )}

            {/* Save Button */}
            <button
                type="button"
                onClick={handleSaveClick}
                disabled={!isComplete}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Check className="h-5 w-5" />
                Save & Collapse
            </button>

            {/* Debug info - shows what's missing */}
            {!isComplete && (
                <p className="text-xs text-center text-slate-400 mt-2">
                    {!localSchool && "Select a school → "}
                    {localSchool && !localProgram && "Select a program → "}
                    {localSchool && localProgram && !localYear && "Enter graduation year"}
                </p>
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
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Get completed entries
    const completedEntries = educationStack.filter(e => e.school && e.program && e.gradYear);
    const hasCompletedEntries = completedEntries.length > 0;

    // Get current entry being worked on
    const currentEntry = editingId
        ? educationStack.find(e => e.id === editingId)
        : educationStack.find(e => !e.program); // Find first incomplete entry

    // Auto-open form if no completed entries and there's an entry to edit
    useEffect(() => {
        if (!hasCompletedEntries && educationStack.length > 0) {
            setIsFormOpen(true);
            setEditingId(educationStack[0].id);
        }
    }, []);

    // Handle adding new entry
    const handleAddNew = () => {
        onAddEntry();
        setIsFormOpen(true);
        // Set editing ID to the newest entry after a tick
        requestAnimationFrame(() => {
            const lastEntry = educationStack[educationStack.length - 1];
            if (lastEntry) setEditingId(lastEntry.id);
        });
    };

    // Handle edit
    const handleEdit = (id: string) => {
        setEditingId(id);
        setIsFormOpen(true);
    };

    // Handle save (collapse)
    const handleSave = () => {
        console.log("💾 Collapsing form");
        setIsFormOpen(false);
        setEditingId(null);
    };

    // Handle cancel
    const handleCancel = () => {
        if (editingId) {
            const entry = educationStack.find(e => e.id === editingId);
            if (entry && !entry.program) {
                onRemoveEntry(editingId);
            }
        }
        setIsFormOpen(false);
        setEditingId(null);
    };

    const isValid = hasCompletedEntries;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-full">
                    <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Build Your Stack</h2>
                    <p className="text-slate-500">Add your credentials - degrees, certificates, training</p>
                </div>
            </div>

            {/* Completed Cards */}
            {completedEntries.length > 0 && (
                <div className="space-y-3">
                    {completedEntries.map((entry) => (
                        <CompactCredentialCard
                            key={entry.id}
                            entry={entry}
                            onEdit={() => handleEdit(entry.id)}
                            onRemove={() => onRemoveEntry(entry.id)}
                        />
                    ))}
                </div>
            )}

            {/* Builder Form */}
            {isFormOpen && currentEntry && (
                <CredentialBuilderForm
                    entry={currentEntry}
                    onUpdate={(field, value) => onUpdateEntry(currentEntry.id, field, value)}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    showCancel={hasCompletedEntries}
                />
            )}

            {/* Add Another Button */}
            {!isFormOpen && hasCompletedEntries && (
                <button
                    type="button"
                    onClick={handleAddNew}
                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-green-500 hover:text-green-600 hover:bg-green-50/50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Another Credential
                </button>
            )}

            {/* Stack Summary */}
            {completedEntries.length > 0 && !isFormOpen && (
                <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                            {completedEntries.length} Credential{completedEntries.length > 1 ? 's' : ''} Ready
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {completedEntries.map((e) => (
                            <span key={e.id} className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium border border-white/20">
                                {e.program}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation */}
            {!isFormOpen && (
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 z-40 p-6 -mx-6 -mb-6 mt-8 rounded-b-2xl flex items-center gap-4">
                    <button type="button" onClick={onBack} className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
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
            )}
        </div>
    );
};
