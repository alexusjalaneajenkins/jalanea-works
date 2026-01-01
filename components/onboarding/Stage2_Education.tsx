import React, { useState } from 'react';
import { PlusCircle, Trash2, GraduationCap } from 'lucide-react';
import { Combobox } from '../Combobox';
import { searchSchoolPrograms } from '../../data/centralFloridaPrograms';

// --- DATA & TYPES ---
const CENTRAL_FL_SCHOOLS = [
    { id: 'valencia', name: 'Valencia College', logo: 'https://valenciacollege.edu/android-chrome-192x192.png' },
    { id: 'seminole', name: 'Seminole State', logo: 'https://www.seminolestate.edu/ssap/assets/source/website/branding/apple-touch-icon.png' },
    { id: 'orange', name: 'Orange Technical College', logo: 'https://www.orangetechcollege.net/cms/lib/FL50000515/Centricity/Template/GlobalAssets/images///Logos/Logo.png' },
    { id: 'fullsail', name: 'Full Sail University', logo: 'https://www.fullsail.edu/apple-touch-icon-precomposed.png' },
    { id: 'other', name: 'Other / Self-Taught', logo: null }
];

// Map school names to IDs for program lookup
const schoolNameToId: Record<string, string> = {
    'Valencia College': 'valencia',
    'Seminole State': 'seminole',
    'Orange Technical College': 'orange',
    'Full Sail University': 'fullsail',
    'Other / Self-Taught': 'other'
};

interface EducationEntry {
    id: string;
    school: string;
    program: string;
    degreeType: string;
    status: string;
    gradYear: string;
}

// Helper to render school logo or icon
const SchoolLogo = ({ school, size = 'md' }: { school: typeof CENTRAL_FL_SCHOOLS[number], size?: 'sm' | 'md' }) => {
    const containerClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

    // Other / Self-Taught - use GraduationCap icon
    if (!school.logo) {
        return (
            <div className={`${containerClasses} bg-yellow-500/20 rounded-lg flex items-center justify-center`}>
                <GraduationCap className={`${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'} text-yellow-500`} />
            </div>
        );
    }

    // Full Sail - dark background, subtle corner radius (not circular)
    if (school.id === 'fullsail') {
        return (
            <div className={`${containerClasses} rounded-md overflow-hidden flex items-center justify-center bg-slate-900`}>
                <img
                    src={school.logo}
                    alt={school.name}
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    // Orange Tech - Use clean SVG text logo (external URLs often pixelate)
    if (school.id === 'orange') {
        return (
            <div className={`${containerClasses} rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm`}>
                <span className={`font-black text-white ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>OTC</span>
            </div>
        );
    }

    // Valencia and Seminole - square icons, display normally
    return (
        <div className={`${containerClasses} rounded-lg overflow-hidden flex items-center justify-center bg-slate-700`}>
            <img
                src={school.logo}
                alt={school.name}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

// Get school by name
const getSchoolByName = (name: string) => CENTRAL_FL_SCHOOLS.find(s => s.name === name);

// Determine student status based on graduation year
const getStudentStatus = (gradYear: string): string => {
    const currentYear = new Date().getFullYear();
    const year = parseInt(gradYear, 10);
    if (isNaN(year)) return 'Alumni'; // Default if invalid
    return year > currentYear ? 'Current Student' : 'Alumni';
};

export const Stage2_Education = ({ formData, updateFormData }: any) => {
    // 1. THE STACK - Filter out any empty/incomplete entries from stale state
    const initialStack = (formData.educationHistory || []).filter(
        (e: any) => e && e.school && e.program
    );
    const [educationStack, setEducationStack] = useState<EducationEntry[]>(initialStack);

    // 2. UI STATE - Open form if no valid entries
    const [isFormOpen, setIsFormOpen] = useState(initialStack.length === 0);

    // 3. BUILDER STATE (The Draft)
    const [draft, setDraft] = useState({
        school: "",
        program: "",
        status: "Alumni",
        gradYear: new Date().getFullYear().toString()
    });

    // --- HANDLERS ---

    const handleSave = () => {
        if (!draft.school || !draft.program) return;

        // Dynamically determine status based on graduation year
        const status = getStudentStatus(draft.gradYear);

        const newEntry: EducationEntry = {
            id: crypto.randomUUID(),
            school: draft.school,
            program: draft.program,
            degreeType: "Certificate", // Default for now
            status: status,
            gradYear: draft.gradYear
        };

        // Update UI Instantly
        const newStack = [...educationStack, newEntry];
        setEducationStack(newStack);

        // Sync Parent
        updateFormData("educationHistory", newStack);

        // Reset & Close
        setDraft({ ...draft, program: "" }); // Keep school, clear program
        setIsFormOpen(false);
    };

    const handleRemove = (id: string) => {
        const newStack = educationStack.filter(e => e.id !== id);
        setEducationStack(newStack);
        updateFormData("educationHistory", newStack);

        // If empty, force open form
        if (newStack.length === 0) setIsFormOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-500/20 rounded-2xl">
                    <GraduationCap className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your <span className="text-amber-600">Foundation</span></h2>
                    <p className="text-slate-600">Add your education and credentials to unlock matched opportunities.</p>
                </div>
            </div>

            {/* 1. THE STACK (Visible Items) */}
            <div className="space-y-3">
                {educationStack.map((entry) => {
                    const school = getSchoolByName(entry.school);
                    return (
                        <div key={entry.id} className="bg-slate-100 border border-slate-200 p-4 rounded-2xl flex justify-between items-center animate-in fade-in">
                            <div className="flex items-center gap-3">
                                {school ? (
                                    <SchoolLogo school={school} size="md" />
                                ) : (
                                    <div className="h-10 w-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-amber-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-slate-900">{entry.program}</p>
                                    <p className="text-sm text-slate-500">{entry.school} • {entry.status}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(entry.id)}
                                aria-label={`Remove ${entry.program} credential`}
                                className="p-2.5 min-h-[44px] min-w-[44px] text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* 2. THE FORM (Conditionally Rendered) */}
            {isFormOpen ? (
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 animate-in zoom-in-95">
                    <h3 className="font-bold text-slate-900 mb-4">Add Credential</h3>

                    {/* School Selector */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Select School</label>
                        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select school">
                            {CENTRAL_FL_SCHOOLS.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setDraft({ ...draft, school: s.name, program: "" })}
                                    aria-pressed={draft.school === s.name}
                                    className={`p-3 min-h-[44px] rounded-xl border-2 text-sm font-bold transition-all flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${draft.school === s.name
                                        ? "border-amber-500 bg-amber-50 text-slate-900"
                                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                                    }`}
                                >
                                    <SchoolLogo school={s} size="sm" />
                                    <span className="text-left leading-tight">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Program Input - Combobox for known schools, text input for Other */}
                    <div className="mb-4">
                        <label htmlFor="program-input" className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Program Name</label>
                        {draft.school === 'Other / Self-Taught' ? (
                            <input
                                type="text"
                                id="program-input"
                                placeholder="e.g. Welding Technology"
                                value={draft.program}
                                onChange={(e) => setDraft({ ...draft, program: e.target.value })}
                                className="w-full p-3.5 min-h-[44px] border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
                            />
                        ) : (
                            <Combobox
                                value={draft.program}
                                onChange={(value) => setDraft({ ...draft, program: value })}
                                options={searchSchoolPrograms(schoolNameToId[draft.school] || '', draft.program)}
                                placeholder="Start typing to search programs..."
                                darkMode={false}
                            />
                        )}
                    </div>

                    {/* Year Input */}
                    <div className="mb-6">
                        <label htmlFor="grad-year" className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Graduation Year</label>
                        <input
                            type="number"
                            id="grad-year"
                            placeholder="2024"
                            value={draft.gradYear}
                            onChange={(e) => setDraft({ ...draft, gradYear: e.target.value })}
                            className="w-full p-3.5 min-h-[44px] border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Save Actions */}
                    <div className="flex gap-3">
                        {educationStack.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-5 py-3 min-h-[44px] text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!draft.school || !draft.program}
                            className="flex-1 min-h-[44px] bg-amber-500 hover:bg-amber-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                        >
                            Save Credential
                        </button>
                    </div>
                </div>
            ) : (
                /* 3. THE TRIGGER (Always visible if form closed) */
                <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="w-full py-6 min-h-[44px] border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-amber-500 hover:text-amber-600 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                >
                    <PlusCircle className="h-5 w-5" />
                    Add Another Credential
                </button>
            )}

        </div>
    );
};
