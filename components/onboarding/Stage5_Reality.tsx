import React, { useState, useEffect, useRef } from 'react';
import {
    Heart, ShieldCheck, Mic, Sparkles,
    StopCircle, AlertCircle
} from 'lucide-react';

interface Stage5Props {
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

export const Stage5_Reality: React.FC<Stage5Props> = ({ data, onUpdate, onNext, onBack }) => {
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const [detectedTags, setDetectedTags] = useState<string[]>([]);

    // Refs to avoid stale closure issues
    const recognitionRef = useRef<any>(null);
    const accumulatedTextRef = useRef<string>('');
    const isListeningRef = useRef<boolean>(false); // Track listening state for onend handler

    // Keep isListeningRef in sync with isListening state
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    // Initialize speech recognition once on mount
    useEffect(() => {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognitionAPI) {
            setSpeechSupported(true);
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setSpeechError(null);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';

                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    }
                }

                // When we get a final result, append it to accumulated text
                if (finalTranscript) {
                    const currentAccumulated = accumulatedTextRef.current;
                    const separator = currentAccumulated.length > 0 && !currentAccumulated.endsWith(' ') ? ' ' : '';
                    const newText = currentAccumulated + separator + finalTranscript.trim();
                    accumulatedTextRef.current = newText; // Update the ref
                    onUpdate('realityContext', newText); // Update the state
                }
            };

            recognition.onerror = (event: any) => {
                // Ignore no-speech and aborted errors - these happen naturally during pauses
                if (event.error === 'no-speech' || event.error === 'aborted') {
                    return;
                }

                console.error('Speech recognition error:', event.error);

                // For real errors, show message and stop
                switch (event.error) {
                    case 'not-allowed':
                        setSpeechError('Microphone access denied. Please enable microphone permissions.');
                        break;
                    case 'audio-capture':
                        setSpeechError('No microphone found. Please check your audio settings.');
                        break;
                    case 'network':
                        setSpeechError('Network error. Please check your connection.');
                        break;
                    default:
                        setSpeechError(`Speech error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                // Use the REF not the state to check if we should restart
                if (isListeningRef.current) {
                    // Still supposed to be listening, so restart after a small delay
                    setTimeout(() => {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.log('Could not auto-restart:', e);
                            setIsListening(false);
                        }
                    }, 100);
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
        };
    }, [onUpdate]);

    // Sync the ref when user types manually or when data changes from elsewhere
    useEffect(() => {
        accumulatedTextRef.current = data.realityContext;
    }, [data.realityContext]);

    // "Active Listening" Logic - Detect context tags
    useEffect(() => {
        const tags: string[] = [];
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
        const currentPrompts = data.selectedPrompts || [];
        const isSelected = currentPrompts.includes(prompt.label);

        let newPrompts;
        if (isSelected) {
            newPrompts = currentPrompts.filter(p => p !== prompt.label);
        } else {
            newPrompts = [...currentPrompts, prompt.label];
            const currentText = data.realityContext;
            const separator = currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '';
            onUpdate('realityContext', currentText + separator + prompt.text);
        }

        onUpdate('selectedPrompts', newPrompts);
    };

    const toggleVoice = () => {
        if (!speechSupported) {
            setSpeechError('Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari.');
            return;
        }

        if (!recognitionRef.current) return;

        if (isListening) {
            // Stop - set state FIRST so onend doesn't restart
            setIsListening(false);
            try {
                recognitionRef.current.stop();
            } catch (e) {}
        } else {
            // Start
            setSpeechError(null);
            // Sync the ref with current text before starting
            accumulatedTextRef.current = data.realityContext;
            setIsListening(true);
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
                setSpeechError('Failed to start speech recognition. Please try again.');
                setIsListening(false);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-500/20 rounded-2xl">
                    <Heart className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">What's your <span className="text-amber-600">reality</span>?</h2>
                    <p className="text-slate-600">We use this to find tools that help you succeed.</p>
                </div>
            </div>

            {/* Trust Banner */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl" role="note">
                <ShieldCheck className="w-6 h-6 shrink-0 text-green-600" aria-hidden="true" />
                <div>
                    <span className="font-bold block text-sm mb-0.5 text-green-700">Safe Zone</span>
                    <span className="text-sm text-green-600 leading-snug">
                        This info is used to find support resources, NOT to filter your applications.
                    </span>
                </div>
            </div>

            {/* Interactive Topic Triggers */}
            <div className="space-y-3">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Common Challenges <span className="font-normal normal-case text-slate-400">(Tap to add)</span>
                </label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Common challenge options">
                    {REALITY_PROMPTS.map((prompt) => {
                        const isSelected = (data.selectedPrompts || []).includes(prompt.label);
                        return (
                            <button
                                key={prompt.label}
                                type="button"
                                onClick={() => handlePromptClick(prompt)}
                                aria-pressed={isSelected}
                                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-bold transition-all duration-300 border-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${isSelected
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-amber-500/50 hover:bg-amber-500/5'
                                }`}
                            >
                                {prompt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Smart Canvas & Voice */}
            <div className="relative">
                <div className="relative z-10">
                    <label htmlFor="reality-context" className="sr-only">Tell us about your situation</label>
                    <textarea
                        id="reality-context"
                        value={data.realityContext}
                        onChange={(e) => onUpdate('realityContext', e.target.value)}
                        placeholder="Tell us what you're up against. We'll handle the logistics..."
                        aria-describedby="reality-helper"
                        className="w-full h-48 px-6 py-5 rounded-2xl border border-slate-300 bg-slate-100 text-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none resize-none leading-relaxed transition-all"
                    />

                    {/* Active Listening Feedback */}
                    <div className="absolute bottom-4 left-6 right-20 flex flex-wrap gap-2 pointer-events-none" aria-live="polite">
                        {detectedTags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 animate-in zoom-in duration-300">
                                <Sparkles className="w-3 h-3" aria-hidden="true" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Voice Hero Button */}
                <button
                    type="button"
                    onClick={toggleVoice}
                    aria-label={isListening ? "Stop recording" : "Start voice input"}
                    aria-pressed={isListening}
                    className={`absolute bottom-6 right-6 z-20 w-14 h-14 min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white ${isListening
                        ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/30'
                        : 'bg-amber-500 text-white hover:bg-amber-400 shadow-amber-500/20'
                    }`}
                >
                    {isListening ? <StopCircle className="w-6 h-6" aria-hidden="true" /> : <Mic className="w-6 h-6" aria-hidden="true" />}
                </button>
            </div>

            {/* Helper text */}
            <p id="reality-helper" className="text-xs text-slate-500">
                Share your circumstances - we'll connect you with relevant support programs and resources.
            </p>

            {/* Listening Status */}
            {isListening && (
                <div className="text-center text-sm font-bold text-amber-600 animate-pulse" role="status" aria-live="polite">
                    Listening... Speak now (tap stop when done)
                </div>
            )}

            {/* Speech Error Message */}
            {speechError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm" role="alert">
                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>{speechError}</span>
                </div>
            )}

            {/* Browser Support Warning */}
            {!speechSupported && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm" role="alert">
                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Voice input is not supported in your browser. Try Chrome, Edge, or Safari for voice features.</span>
                </div>
            )}
        </div>
    );
};
