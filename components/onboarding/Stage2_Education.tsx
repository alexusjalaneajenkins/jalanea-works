import React, { useState, useMemo } from 'react';
import {
    GraduationCap, Hammer, BookOpen, Check,
    Search, Zap, Plus, Trash2, Pencil, X, PlusCircle
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

interface BuilderState {
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
const SCHOOLS: { name: SchoolName; emoji: string; bg: string; border: string }[] = [
    { name: "Valencia College", emoji: "📕", bg: "bg-red-50", border: "border-red-200" },
    { name: "Seminole State College", emoji: "📘", bg: "bg-blue-50", border: "border-blue-200" },
    { name: "Orange Technical College", emoji: "📙", bg: "bg-orange-50", border: "border-orange-200" },
    { name: "Other", emoji: "📓", bg: "bg-slate-50", border: "border-slate-200" }
];

const getSchoolEmoji = (school: string): string => SCHOOLS.find(s => s.name === school)?.emoji || "🎓";

// ==================== COMPACT CARD ====================
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

// ==================== MAIN COMPONENT ====================
export const Stage2_Education: React.FC<Stage2Props> = ({
    educationStack,
    onAddEntry,
    onUpdateEntry,
    onRemoveEntry,
    // onNext and onBack are NOT used - parent handles navigation
}) => {
    // === STATE ===
    // Form starts OPEN if no completed entries exist
    const completedEntries = educationStack.filter(e => e.school && e.program && e.gradYear);
    const [isFormOpen, setIsFormOpen] = useState(completedEntries.length === 0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [builder, setBuilder] = useState<BuilderState>({
        school: '',
        degreeType: '',
        program: '',
        gradYear: '',
        status: 'Alumni'
    });

    // === DERIVED STATE ===
    const isBuilderComplete = builder.school && builder.program && builder.gradYear;

    const availablePrograms = useMemo(() => {
        if (!builder.school || builder.school === 'Other' || !CENTRAL_FL_DATA[builder.school]) return [];
        const programs: { label: string; type: string }[] = [];
        Object.entries(CENTRAL_FL_DATA[builder.school]).forEach(([type, progList]) => {
            progList.forEach(prog => programs.push({ label: prog, type }));
        });
        return programs;
    }, [builder.school]);

    const filteredPrograms = useMemo(() => {
        if (!searchTerm.trim()) return availablePrograms.slice(0, 8);
        return availablePrograms.filter(p => p.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [availablePrograms, searchTerm]);

    // === HANDLERS ===
    const updateBuilder = (field: keyof BuilderState, value: string) => {
        setBuilder(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectSchool = (schoolName: string) => {
        setBuilder({
            school: schoolName,
            degreeType: '',
            program: '',
            gradYear: builder.gradYear,
            status: builder.status
        });
        setSearchTerm("");
    };

    const handleSelectProgram = (programName: string, degreeType: string) => {
        setBuilder(prev => ({ ...prev, program: programName, degreeType }));
        setSearchTerm("");
    };

    const handleSave = () => {
        if (!builder.school || !builder.program || !builder.gradYear) {
            console.warn("❌ Missing data:", builder);
            return;
        }

        console.log("✅ Saving:", builder);

        if (editingId) {
            onUpdateEntry(editingId, 'school', builder.school);
            onUpdateEntry(editingId, 'program', builder.program);
            onUpdateEntry(editingId, 'degreeType', builder.degreeType || 'Certificate');
            onUpdateEntry(editingId, 'status', builder.status);
            onUpdateEntry(editingId, 'gradYear', builder.gradYear);
        } else {
            onAddEntry();
            requestAnimationFrame(() => {
                const newEntry = educationStack[educationStack.length - 1];
                if (newEntry) {
                    onUpdateEntry(newEntry.id, 'school', builder.school);
                    onUpdateEntry(newEntry.id, 'program', builder.program);
                    onUpdateEntry(newEntry.id, 'degreeType', builder.degreeType || 'Certificate');
                    onUpdateEntry(newEntry.id, 'status', builder.status);
                    onUpdateEntry(newEntry.id, 'gradYear', builder.gradYear);
                }
            });
        }

        setBuilder({ school: '', degreeType: '', program: '', gradYear: '', status: 'Alumni' });
        setSearchTerm("");
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleAddNew = () => {
        setBuilder({ school: '', degreeType: '', program: '', gradYear: '', status: 'Alumni' });
        setSearchTerm("");
        setEditingId(null);
        setIsFormOpen(true);
    };

    const handleEdit = (entry: EducationEntry) => {
        setBuilder({
            school: entry.school,
            degreeType: entry.degreeType,
            program: entry.program,
            gradYear: entry.gradYear,
            status: entry.status
        });
        setEditingId(entry.id);
        setIsFormOpen(true);
    };

    const handleCancel = () => {
        setBuilder({ school: '', degreeType: '', program: '', gradYear: '', status: 'Alumni' });
        setSearchTerm("");
        setIsFormOpen(false);
        setEditingId(null);
    };

    // === RENDER ===
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

            {/* 1. THE STACK (List of cards) */}
            {completedEntries.length > 0 && (
                <div className="space-y-3">
                    {completedEntries.map((entry) => (
                        <CompactCredentialCard
                            key={entry.id}
                            entry={entry}
                            onEdit={() => handleEdit(entry)}
                            onRemove={() => onRemoveEntry(entry.id)}
                        />
                    ))}
                </div>
            )}

            {/* 2. THE BUILDER FORM (Collapsible) */}
            {isFormOpen ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="font-bold text-gray-900 text-lg">
                            {editingId ? 'Edit Credential' : 'Add Credential'}
                        </h3>
                        {completedEntries.length > 0 && (
                            <button type="button" onClick={handleCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Step 1: School */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. School</label>
                        <div className="grid grid-cols-2 gap-2">
                            {SCHOOLS.map((school) => (
                                <button
                                    type="button"
                                    key={school.name}
                                    onClick={() => handleSelectSchool(school.name)}
                                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${builder.school === school.name
                                        ? `${school.bg} ${school.border} shadow-sm`
                                        : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <span className="text-xl">{school.emoji}</span>
                                    <span className={`text-sm font-semibold ${builder.school === school.name ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {school.name.replace(' College', '')}
                                    </span>
                                    {builder.school === school.name && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Program */}
                    {builder.school && builder.school !== 'Other' && (
                        <div className="mb-4 animate-in fade-in duration-200">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Program</label>
                            {!builder.program ? (
                                <div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search programs..."
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
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
                                        <span className="font-semibold text-slate-900 text-sm">{builder.program}</span>
                                    </div>
                                    <button type="button" onClick={() => updateBuilder('program', '')} className="text-xs text-slate-500 hover:text-slate-900 underline">
                                        Change
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Other School */}
                    {builder.school === 'Other' && (
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Program Name</label>
                            <input
                                type="text"
                                value={builder.program}
                                onChange={(e) => updateBuilder('program', e.target.value)}
                                placeholder="Enter your program..."
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                            />
                        </div>
                    )}

                    {/* Step 3 & 4 */}
                    {builder.program && (
                        <div className="grid grid-cols-2 gap-4 mb-5 animate-in fade-in duration-200">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">3. Status</label>
                                <div className="flex gap-2">
                                    {(['Alumni', 'Student'] as const).map((s) => (
                                        <button
                                            type="button"
                                            key={s}
                                            onClick={() => updateBuilder('status', s)}
                                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${builder.status === s
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
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">4. Year</label>
                                <input
                                    type="number"
                                    value={builder.gradYear}
                                    onChange={(e) => updateBuilder('gradYear', e.target.value)}
                                    placeholder="2024"
                                    min="1990"
                                    max="2030"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Form Buttons */}
                    <div className="flex gap-3 mt-6">
                        {completedEntries.length > 0 && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-3 text-slate-500 hover:text-slate-900 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!isBuilderComplete}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Check className="h-5 w-5" />
                            Save Credential
                        </button>
                    </div>

                    {!isBuilderComplete && (
                        <p className="text-xs text-center text-slate-400 mt-3">
                            {!builder.school && "Select a school → "}
                            {builder.school && !builder.program && "Select a program → "}
                            {builder.school && builder.program && !builder.gradYear && "Enter graduation year"}
                        </p>
                    )}
                </div>
            ) : (
                /* 3. THE TRIGGER BUTTON (Always visible when form is closed) */
                <button
                    type="button"
                    onClick={handleAddNew}
                    className="w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-medium hover:border-green-500 hover:text-green-600 hover:bg-green-50/50 transition-all flex flex-col items-center justify-center gap-2"
                >
                    <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100">
                        <PlusCircle className="h-6 w-6" />
                    </div>
                    <span className="text-base">
                        {completedEntries.length === 0 ? "Add Your First Credential" : "Add Another Credential"}
                    </span>
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

            {/* NO NAVIGATION BUTTONS - Parent handles this via the main "Continue" button */}
        </div>
    );
};
