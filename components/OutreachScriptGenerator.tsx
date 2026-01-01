import React, { useState } from 'react';
import { X, Users, Copy, RefreshCw, Loader2, Check, MessageSquare, Mail, Coffee, Heart, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { generateOutreachScript, OutreachScriptType } from '../services/geminiService';

// ============================================
// TYPES
// ============================================

interface OutreachScriptGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile?: {
        fullName?: string;
        targetRoles?: string[];
        education?: any[];
        experience?: any[];
    };
}

interface ScriptTypeOption {
    id: OutreachScriptType;
    label: string;
    icon: React.ReactNode;
    description: string;
    placeholder: string;
}

// ============================================
// CONSTANTS
// ============================================

const SCRIPT_TYPES: ScriptTypeOption[] = [
    {
        id: 'connection_request',
        label: 'Connection Request',
        icon: <Users size={18} />,
        description: 'Initial message to connect on LinkedIn',
        placeholder: 'A short, personalized request to connect'
    },
    {
        id: 'follow_up',
        label: 'Follow-Up Message',
        icon: <MessageSquare size={18} />,
        description: 'Follow up after connecting or meeting',
        placeholder: 'Continue the conversation after initial contact'
    },
    {
        id: 'informational_interview',
        label: 'Informational Interview',
        icon: <Coffee size={18} />,
        description: 'Request a brief chat to learn about their career',
        placeholder: 'Ask for 15-20 minutes of their time'
    },
    {
        id: 'thank_you',
        label: 'Thank You Message',
        icon: <Heart size={18} />,
        description: 'Express gratitude after a meeting or help',
        placeholder: 'Show appreciation and maintain the relationship'
    }
];

// ============================================
// MAIN COMPONENT
// ============================================

export const OutreachScriptGenerator: React.FC<OutreachScriptGeneratorProps> = ({
    isOpen,
    onClose,
    userProfile
}) => {
    const [selectedType, setSelectedType] = useState<OutreachScriptType>('connection_request');
    const [targetName, setTargetName] = useState('');
    const [targetCompany, setTargetCompany] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [howFound, setHowFound] = useState('');
    const [specificTopic, setSpecificTopic] = useState('');
    const [generatedScript, setGeneratedScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedScript('');

        try {
            const script = await generateOutreachScript({
                type: selectedType,
                targetName: targetName || undefined,
                targetCompany: targetCompany || undefined,
                targetRole: targetRole || undefined,
                howFound: howFound || undefined,
                specificTopic: specificTopic || undefined,
                userBackground: {
                    name: userProfile?.fullName,
                    targetRoles: userProfile?.targetRoles,
                    education: userProfile?.education?.map(e => e.degree || e.fieldOfStudy).join(', '),
                    experience: userProfile?.experience?.map(e => e.role).join(', ')
                }
            });
            setGeneratedScript(script);
        } catch (error) {
            console.error('Error generating script:', error);
            setGeneratedScript('Failed to generate script. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = () => {
        handleGenerate();
    };

    const selectedTypeInfo = SCRIPT_TYPES.find(t => t.id === selectedType);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Outreach Script Generator</h2>
                                <p className="text-sm text-white/80">Create personalized networking messages</p>
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
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Script Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Script Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {SCRIPT_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                        selectedType === type.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={selectedType === type.id ? 'text-blue-600' : 'text-gray-400'}>
                                            {type.icon}
                                        </div>
                                        <span className={`font-bold text-sm ${selectedType === type.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {type.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Context Inputs */}
                    <div className="space-y-4 mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase">Personalization (Optional)</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Their Name</label>
                                <input
                                    type="text"
                                    value={targetName}
                                    onChange={(e) => setTargetName(e.target.value)}
                                    placeholder="e.g., Sarah Johnson"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Their Company</label>
                                <input
                                    type="text"
                                    value={targetCompany}
                                    onChange={(e) => setTargetCompany(e.target.value)}
                                    placeholder="e.g., Google"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Their Role</label>
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="e.g., Senior UX Designer"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">How You Found Them</label>
                                <input
                                    type="text"
                                    value={howFound}
                                    onChange={(e) => setHowFound(e.target.value)}
                                    placeholder="e.g., LinkedIn, conference, mutual connection"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Specific Topic to Discuss</label>
                            <input
                                type="text"
                                value={specificTopic}
                                onChange={(e) => setSpecificTopic(e.target.value)}
                                placeholder="e.g., their recent article on design systems, career transition advice"
                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Generate Button */}
                    {!generatedScript && (
                        <Button
                            fullWidth
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            icon={isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Script'}
                        </Button>
                    )}

                    {/* Generated Script */}
                    {generatedScript && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                                    {selectedTypeInfo?.icon}
                                    {selectedTypeInfo?.label}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={isGenerating}
                                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                        <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                                        Regenerate
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {isGenerating ? (
                                        <span className="flex items-center gap-2 text-gray-400">
                                            <Loader2 size={14} className="animate-spin" />
                                            Generating your personalized script...
                                        </span>
                                    ) : generatedScript}
                                </p>
                            </div>

                            {/* Tips */}
                            <div className="mt-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <p className="text-xs font-bold text-blue-700 mb-1">Tips for Success</p>
                                <ul className="text-xs text-blue-600 space-y-1">
                                    <li>• Personalize the [bracketed] sections with specific details</li>
                                    <li>• Keep messages under 300 characters for connection requests</li>
                                    <li>• Send during business hours (Tue-Thu 9am-11am works best)</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                            Scripts are customized based on your profile
                        </p>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutreachScriptGenerator;
