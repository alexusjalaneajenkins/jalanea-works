import React, { useState, useEffect } from 'react';
import {
    Heart, ShieldCheck, Mic, Sparkles,
    ArrowRight, ArrowLeft, StopCircle
} from 'lucide-react';

interface Stage4Props {
    data: {
        realityContext: string;
        selectedPrompts: string[];
    };
    onUpdate: (field: string, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const REALITY_PROMPTS = [
    { label: 'I am a single parent', text: 'I am a single parent needing flexible hours.' },
    { label: 'No reliable car', text: 'I do not have a reliable car right now.' },
    { label: 'Health challenges', text: 'I have some health challenges to consider.' },
    { label: 'English is my 2nd language', text: 'English is my second language.' },
    { label: 'Need immediate income', text: 'I need immediate income to pay bills.' },
    { label: 'Criminal record', text: 'I have a past record I need to navigate.' },
];

export const Stage4_Reality: React.FC<Stage4Props> = ({ data, onUpdate, onNext, onBack }) => {
    const [isListening, setIsListening] = useState(false);
    const [detectedTags, setDetectedTags] = useState<string[]>([]);

    // Mock "Active Listening" Logic
    useEffect(() => {
        const tags = [];
        const text = data.realityContext.toLowerCase();

        if (text.includes('car') || text.includes('transport') || text.includes('bus')) tags.push('Transport Strategy');
        if (text.includes('kid') || text.includes('child') || text.includes('parent')) tags.push('Childcare Resources');
        if (text.includes('health') || text.includes('doctor') || text.includes('sick')) tags.push('Health Accommodation');
        if (text.includes('money') || text.includes('bill') || text.includes('income')) tags.push('Financial Bridge');
        if (text.includes('english') || text.includes('language')) tags.push('ESL Support');
        if (text.includes('record') || text.includes('felony')) tags.push('Legal/Fair Chance');

        setDetectedTags(tags);
    }, [data.realityContext]);

    const handlePromptClick = (prompt: { label: string, text: string }) => {
        // Toggle selection logic for visual chip
        const currentPrompts = data.selectedPrompts || [];
        const isSelected = currentPrompts.includes(prompt.label);

        // Update tags
        let newPrompts;
        if (isSelected) {
            newPrompts = currentPrompts.filter(p => p !== prompt.label);
        } else {
            newPrompts = [...currentPrompts, prompt.label];
            // "Drop" text into the input if adding
            const currentText = data.realityContext;
            const separator = currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '';
            onUpdate('realityContext', currentText + separator + prompt.text);
        }

        onUpdate('selectedPrompts', newPrompts);
    };

    const toggleVoice = () => {
        if (!isListening) {
            setIsListening(true);
            // Simulate voice input accumulating
            setTimeout(() => {
                const phrases = [" I'm also looking for ", "programs that help with ", "night shifts."];
                let currentChunk = 0;
                const interval = setInterval(() => {
                    if (currentChunk >= phrases.length) {
                        clearInterval(interval);
                        setIsListening(false);
                    } else {
                        onUpdate('realityContext', data.realityContext + phrases[currentChunk]);
                        currentChunk++;
                    }
                }, 1000);
            }, 500);
        } else {
            setIsListening(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-50 rounded-full">
                    <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">What is your reality?</h2>
                    <p className="text-slate-500">We use this to find tools that help you succeed.</p>
                </div>
            </div>

            {/* 1. The "Trust Banner" */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800">
                <ShieldCheck className="w-6 h-6 shrink-0 text-blue-600" />
                <div>
                    <span className="font-bold block text-sm mb-0.5">Safe Zone</span>
                    <span className="text-sm opacity-90 leading-snug">
                        This info is used to find support resources, NOT to filter your applications.
                    </span>
                </div>
            </div>

            {/* 3. Interactive "Topic Triggers" */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-jalanea-navy">
                    Common Challenges (Tap to add)
                </label>
                <div className="flex flex-wrap gap-2">
                    {REALITY_PROMPTS.map((prompt) => {
                        const isSelected = (data.selectedPrompts || []).includes(prompt.label);
                        return (
                            <button
                                key={prompt.label}
                                onClick={() => handlePromptClick(prompt)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${isSelected
                                    ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-sm transform scale-105'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300'
                                    }`}
                            >
                                {prompt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. The "Smart Canvas" & Voice Hero */}
            <div className="relative">
                <div className="relative z-10">
                    <textarea
                        value={data.realityContext}
                        onChange={(e) => onUpdate('realityContext', e.target.value)}
                        placeholder="Tell us what you're up against. We'll handle the logistics..."
                        className="w-full h-48 px-6 py-6 rounded-2xl border-0 shadow-lg text-lg text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-purple-100 outline-none resize-none leading-relaxed transition-shadow"
                    />

                    {/* 4. "Active Listening" Feedback */}
                    <div className="absolute bottom-4 left-6 right-16 flex flex-wrap gap-2 pointer-events-none">
                        {detectedTags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-bold rounded-full shadow-sm border border-purple-100 animate-in zoom-in duration-300">
                                <Sparkles className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Voice Hero Button (Floating) */}
                <button
                    onClick={toggleVoice}
                    className={`absolute bottom-6 right-6 z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 ${isListening
                        ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                    title="Tap to Speak"
                >
                    {isListening ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
            </div>

            {isListening && (
                <div className="text-center text-sm font-medium text-purple-600 animate-pulse">
                    Listening...
                </div>
            )}

            {/* Navigation */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-40 p-6 -mx-6 -mb-6 rounded-b-2xl flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!data.realityContext}
                    className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                    See Your Solutions
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
