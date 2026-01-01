import React, { useState, useEffect } from 'react';
import { X, Loader2, Building2, Rocket, BookOpen, Check, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { generateResume, WritingTone } from '../services/geminiService';
import { ResumeType } from '../types';

// Re-export WritingTone for convenience
export type { WritingTone };

interface ToneComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTone: (tone: WritingTone, content: string) => void;
    jobDescription: string;
    resumeType: ResumeType;
    userData: any;
}

interface TonePreview {
    tone: WritingTone;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    content: string | null;
    isLoading: boolean;
    error: string | null;
}

export const ToneComparisonModal: React.FC<ToneComparisonModalProps> = ({
    isOpen,
    onClose,
    onSelectTone,
    jobDescription,
    resumeType,
    userData
}) => {
    const [previews, setPreviews] = useState<TonePreview[]>([
        {
            tone: 'formal',
            label: 'Formal',
            icon: <Building2 size={18} />,
            description: 'Traditional corporate language',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-400',
            content: null,
            isLoading: false,
            error: null
        },
        {
            tone: 'innovative',
            label: 'Innovative',
            icon: <Rocket size={18} />,
            description: 'Dynamic & action-oriented',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-400',
            content: null,
            isLoading: false,
            error: null
        },
        {
            tone: 'narrative',
            label: 'Narrative',
            icon: <BookOpen size={18} />,
            description: 'Story-driven & personal',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-400',
            content: null,
            isLoading: false,
            error: null
        }
    ]);

    const [selectedTone, setSelectedTone] = useState<WritingTone | null>(null);

    // Generate all tone variations when modal opens
    useEffect(() => {
        if (isOpen && jobDescription) {
            generateAllPreviews();
        }
    }, [isOpen]);

    const generateAllPreviews = async () => {
        // Set all to loading
        setPreviews(prev => prev.map(p => ({ ...p, isLoading: true, error: null, content: null })));

        // Generate all three in parallel
        const tones: WritingTone[] = ['formal', 'innovative', 'narrative'];

        await Promise.all(tones.map(async (tone) => {
            try {
                const content = await generateResume(resumeType, userData, jobDescription, tone);
                setPreviews(prev => prev.map(p =>
                    p.tone === tone ? { ...p, content, isLoading: false } : p
                ));
            } catch (error) {
                console.error(`Error generating ${tone} preview:`, error);
                setPreviews(prev => prev.map(p =>
                    p.tone === tone ? { ...p, error: 'Generation failed', isLoading: false } : p
                ));
            }
        }));
    };

    const handleSelect = () => {
        if (selectedTone) {
            const preview = previews.find(p => p.tone === selectedTone);
            if (preview?.content) {
                onSelectTone(selectedTone, preview.content);
                onClose();
            }
        }
    };

    // Extract first bullet/paragraph for preview
    const getPreviewSnippet = (content: string | null): string => {
        if (!content) return '';
        // Get first substantial line after header
        const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
        const bulletLine = lines.find(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
        if (bulletLine) {
            return bulletLine.replace(/^[-*]\s*/, '').substring(0, 150) + (bulletLine.length > 150 ? '...' : '');
        }
        return lines[0]?.substring(0, 150) + (lines[0]?.length > 150 ? '...' : '') || '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-jalanea-900 to-jalanea-800 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Compare Writing Tones</h2>
                                <p className="text-sm text-white/70">See how your resume sounds in each style</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {previews.map((preview) => (
                            <div
                                key={preview.tone}
                                onClick={() => !preview.isLoading && preview.content && setSelectedTone(preview.tone)}
                                className={`relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden
                                    ${selectedTone === preview.tone
                                        ? `${preview.borderColor} ${preview.bgColor} ring-2 ring-offset-2 ${preview.borderColor.replace('border', 'ring')}`
                                        : 'border-jalanea-200 hover:border-jalanea-300 bg-white'
                                    }
                                    ${preview.isLoading || !preview.content ? 'cursor-not-allowed' : ''}
                                `}
                            >
                                {/* Selection Indicator */}
                                {selectedTone === preview.tone && (
                                    <div className={`absolute top-3 right-3 p-1 rounded-full ${preview.bgColor} ${preview.color}`}>
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}

                                {/* Header */}
                                <div className={`p-4 border-b ${selectedTone === preview.tone ? preview.borderColor : 'border-jalanea-100'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${preview.bgColor} ${preview.color}`}>
                                            {preview.icon}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${selectedTone === preview.tone ? preview.color : 'text-jalanea-900'}`}>
                                                {preview.label}
                                            </h3>
                                            <p className="text-xs text-jalanea-500">{preview.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Preview */}
                                <div className="p-4 min-h-[200px]">
                                    {preview.isLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full py-8">
                                            <div className={`p-3 rounded-full ${preview.bgColor}`}>
                                                <Loader2 size={24} className={`${preview.color} animate-spin`} />
                                            </div>
                                            <p className="text-sm text-jalanea-500 mt-3">Generating {preview.label.toLowerCase()} version...</p>
                                        </div>
                                    ) : preview.error ? (
                                        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                            <div className="p-3 rounded-full bg-red-50">
                                                <X size={24} className="text-red-500" />
                                            </div>
                                            <p className="text-sm text-red-600 mt-3">{preview.error}</p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    generateAllPreviews();
                                                }}
                                                className="text-xs text-jalanea-500 hover:text-jalanea-700 mt-2 underline"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    ) : preview.content ? (
                                        <div className="space-y-3">
                                            {/* Sample Bullet */}
                                            <div>
                                                <p className="text-[10px] font-bold text-jalanea-400 uppercase mb-1">Sample Bullet</p>
                                                <p className="text-sm text-jalanea-700 italic leading-relaxed">
                                                    "{getPreviewSnippet(preview.content)}"
                                                </p>
                                            </div>

                                            {/* Word Count */}
                                            <div className="flex items-center gap-4 pt-2 border-t border-jalanea-100">
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-jalanea-900">
                                                        {preview.content.split(/\s+/).length}
                                                    </p>
                                                    <p className="text-[10px] text-jalanea-400 uppercase">Words</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-jalanea-900">
                                                        {(preview.content.match(/^[-*]/gm) || []).length}
                                                    </p>
                                                    <p className="text-[10px] text-jalanea-400 uppercase">Bullets</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tone Characteristics */}
                    <div className="mt-6 p-4 bg-jalanea-50 rounded-xl">
                        <h4 className="text-xs font-bold text-jalanea-500 uppercase mb-3">Tone Characteristics</h4>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                                <p className="font-bold text-blue-600 mb-1">Formal</p>
                                <ul className="text-jalanea-600 space-y-1">
                                    <li>- Professional vocabulary</li>
                                    <li>- Third-person perspective</li>
                                    <li>- Structured format</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold text-orange-600 mb-1">Innovative</p>
                                <ul className="text-jalanea-600 space-y-1">
                                    <li>- Action verbs & energy</li>
                                    <li>- Results-focused</li>
                                    <li>- Modern language</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold text-purple-600 mb-1">Narrative</p>
                                <ul className="text-jalanea-600 space-y-1">
                                    <li>- Personal storytelling</li>
                                    <li>- Emotional connection</li>
                                    <li>- Human touch</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-jalanea-200 p-4 bg-jalanea-50 flex justify-between items-center">
                    <p className="text-sm text-jalanea-500">
                        {selectedTone
                            ? `${previews.find(p => p.tone === selectedTone)?.label} tone selected`
                            : 'Select a tone to use'
                        }
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSelect}
                            disabled={!selectedTone || !previews.find(p => p.tone === selectedTone)?.content}
                            icon={<Check size={16} />}
                        >
                            Use {selectedTone ? previews.find(p => p.tone === selectedTone)?.label : ''} Tone
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToneComparisonModal;
