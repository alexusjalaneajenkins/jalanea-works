import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

// --- DATA & TYPES ---
const CENTRAL_FL_SCHOOLS = [
    { id: 'valencia', name: 'Valencia College', icon: '🍅' },
    { id: 'seminole', name: 'Seminole State', icon: '🦅' },
    { id: 'orange', name: 'Orange Technical College', icon: '🍊' },
    { id: 'other', name: 'Other / Self-Taught', icon: '🎓' }
];

interface EducationEntry {
    id: string;
    school: string;
    program: string;
    degreeType: string;
    status: string;
    year: string;
}

export const Stage2_Education = ({ formData, updateFormData }: any) => {
    // 1. THE STACK (Initialize from Parent, fallback to empty array)
    const [educationStack, setEducationStack] = useState<EducationEntry[]>(
        formData.educationHistory || []
    );

    // 2. UI STATE
    const [isFormOpen, setIsFormOpen] = useState(educationStack.length === 0);

    // 3. BUILDER STATE (The Draft)
    const [draft, setDraft] = useState({
        school: "",
        program: "",
        status: "Alumni",
        year: new Date().getFullYear().toString()
    });

    // --- HANDLERS ---

    const handleSave = () => {
        if (!draft.school || !draft.program) return;

        const newEntry: EducationEntry = {
            id: crypto.randomUUID(),
            school: draft.school,
            program: draft.program,
            degreeType: "Certificate", // Default for now
            status: draft.status,
            year: draft.year
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
        <div className="space-y-8">

            {/* 1. THE STACK (Visible Items) */}
            <div className="space-y-3">
                {educationStack.map((entry) => (
                    <div key={entry.id} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-lg">🎓</div>
                            <div>
                                <p className="font-bold text-gray-900">{entry.program}</p>
                                <p className="text-sm text-gray-500">{entry.school} • {entry.status}</p>
                            </div>
                        </div>
                        <button onClick={() => handleRemove(entry.id)} className="p-2 text-gray-400 hover:text-red-500">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* 2. THE FORM (Conditionally Rendered) */}
            {isFormOpen ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 animate-in zoom-in-95">
                    <h3 className="font-bold text-gray-900 mb-4">Add Credential</h3>

                    {/* School Selector */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {CENTRAL_FL_SCHOOLS.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setDraft({ ...draft, school: s.name })}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all text-left ${draft.school === s.name ? "border-green-500 bg-green-50 text-gray-900" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                    }`}
                            >
                                {s.icon} {s.name}
                            </button>
                        ))}
                    </div>

                    {/* Simple Program Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Program Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Welding Technology"
                            value={draft.program}
                            onChange={(e) => setDraft({ ...draft, program: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    {/* Year Input */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Graduation Year</label>
                        <input
                            type="number"
                            placeholder="2024"
                            value={draft.year}
                            onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    {/* Save Actions */}
                    <div className="flex gap-3">
                        {educationStack.length > 0 && (
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 text-gray-500 font-medium">Cancel</button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!draft.school || !draft.program}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
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
                    className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                >
                    <PlusCircle className="h-5 w-5" />
                    Add Another Credential
                </button>
            )}

        </div>
    );
};
