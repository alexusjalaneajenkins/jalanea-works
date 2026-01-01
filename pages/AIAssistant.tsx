import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UpgradeModal } from '../components/UpgradeModal';
import { OutreachScriptGenerator } from '../components/OutreachScriptGenerator';
import { InterviewPrepModal } from '../components/InterviewPrepModal';
import { OrlandoMarketInsights } from '../components/OrlandoMarketInsights';
import { SavedConversations } from '../components/SavedConversations';
import { SocialPostAssistant } from '../components/SocialPostAssistant';
import { ScheduleConnection } from '../components/ScheduleConnection';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { getCareerAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import {
    Send, Sparkles, Bot, User, Trash2,
    Briefcase, FileText, Target,
    TrendingUp, Lightbulb, Users, Mic, MapPin, FolderOpen, Save, Linkedin, CalendarClock
} from 'lucide-react';

// Conversation thread interface
interface ConversationThread {
    id: string;
    title: string;
    topic: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
    preview: string;
}

// Topic detection based on conversation content
const detectTopic = (messages: ChatMessage[]): string => {
    const allText = messages.map(m => m.text.toLowerCase()).join(' ');

    if (allText.includes('resume') || allText.includes('cv') || allText.includes('cover letter')) {
        return 'resume';
    }
    if (allText.includes('interview') || allText.includes('behavioral') || allText.includes('star method')) {
        return 'interview';
    }
    if (allText.includes('job search') || allText.includes('apply') || allText.includes('application') || allText.includes('hiring')) {
        return 'job-search';
    }
    if (allText.includes('network') || allText.includes('linkedin') || allText.includes('connect') || allText.includes('outreach')) {
        return 'networking';
    }
    if (allText.includes('skill') || allText.includes('learn') || allText.includes('course') || allText.includes('certification')) {
        return 'skills';
    }
    if (allText.includes('career') || allText.includes('path') || allText.includes('growth') || allText.includes('promotion')) {
        return 'career-advice';
    }
    return 'general';
};

// Generate a title from the first user message
const generateTitle = (messages: ChatMessage[]): string => {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (!firstUserMsg) return 'New Conversation';

    // Truncate to first 50 chars
    const text = firstUserMsg.text;
    if (text.length <= 50) return text;
    return text.substring(0, 47) + '...';
};

const STORAGE_KEY = 'jalanea_saved_conversations';

// Markdown parser for chat messages - cleaner inline styling
const formatMessage = (text: string): string => {
    return text
        // Bold: **text**
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic: *text* (not at start of line)
        .replace(/(?<!\n)(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
        // Bullet points: - or * at start of line -> clean list item
        .replace(/(?:^|\n)[-•*]\s+(.+)/g, '<li>$1</li>')
        // Numbered lists
        .replace(/(?:^|\n)(\d+)\.\s+(.+)/g, '<li><span class="text-gold font-semibold mr-1">$1.</span>$2</li>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4 class="font-bold text-jalanea-900 mt-3 mb-1 text-base">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 class="font-bold text-jalanea-900 text-lg mt-4 mb-2">$1</h3>')
        // Wrap consecutive li in ul
        .replace(/(<li>.*?<\/li>)+/gs, '<ul class="space-y-1 my-2 ml-4">$&</ul>')
        // Line breaks
        .replace(/\n/g, '<br/>');
};

// Quick prompts for common actions (Interview Prep is handled separately via modal)
const QUICK_PROMPTS = [
    { icon: Briefcase, label: 'Job Search', prompt: 'Help me create a job search strategy for finding an entry-level position' },
    { icon: FileText, label: 'Resume Tips', prompt: 'Give me tips to improve my resume for tech roles' },
    { icon: TrendingUp, label: 'Market Trends', prompt: 'Research current job market trends in tech for 2024' },
    { icon: Lightbulb, label: 'Career Path', prompt: 'Suggest career paths for someone with a computing technology degree' },
];

export const AIAssistant: React.FC = () => {
    const { currentUser, userProfile, useCredit, canUseCredits, isTrialActive } = useAuth();
    const {
        name,
        primarySchool,
        primaryProgram,
        skills,
        hasSkills,
        salaryMin,
        salaryMax,
        availability,
        challenges,
        location,
        commuteMethod,
        commuteWillingness,
        getAIContext
    } = useUserProfile();

    // Build personalized welcome message
    const buildWelcomeMessage = (): string => {
        const firstName = name?.split(' ')[0] || '';
        let intro = `Hi${firstName ? ` ${firstName}` : ''}! 👋\n\nI'm your AI Career Coach.`;

        // Add personalized context if available
        if (primaryProgram && primarySchool) {
            intro += ` I see you're studying **${primaryProgram}** at **${primarySchool}** - great choice!`;
        }

        intro += `\n\nI can help you with:\n\n`;
        intro += `- **Job search strategies** tailored to your background\n`;
        intro += `- **Resume and cover letter** advice\n`;
        intro += `- **Interview preparation** and practice questions\n`;
        intro += `- **Career research** with real-time market data\n`;
        intro += `- **Skill development** recommendations\n\n`;
        intro += `What would you like to work on today?`;

        return intro;
    };

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'model',
            sender: 'ai',
            text: buildWelcomeMessage(),
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState<'no_credits' | 'trial_expired'>('no_credits');
    const [showOutreachScripts, setShowOutreachScripts] = useState(false);
    const [showInterviewPrep, setShowInterviewPrep] = useState(false);
    const [showMarketInsights, setShowMarketInsights] = useState(false);
    const [showSavedConversations, setShowSavedConversations] = useState(false);
    const [showSocialPost, setShowSocialPost] = useState(false);
    const [showScheduleConnection, setShowScheduleConnection] = useState(false);
    const [savedThreads, setSavedThreads] = useState<ConversationThread[]>([]);
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Load saved conversations from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Convert date strings back to Date objects
                const threads = parsed.map((t: any) => ({
                    ...t,
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt),
                    messages: t.messages.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }))
                }));
                setSavedThreads(threads);
            }
        } catch (err) {
            console.error('Error loading saved conversations:', err);
        }
    }, []);

    // Save current conversation to a thread
    const saveCurrentConversation = useCallback(() => {
        // Only save if there are user messages
        const hasUserMessages = messages.some(m => m.role === 'user');
        if (!hasUserMessages) return;

        const now = new Date();
        const topic = detectTopic(messages);
        const title = generateTitle(messages);
        const preview = messages.filter(m => m.role === 'model').slice(-1)[0]?.text.substring(0, 100) || '';

        if (currentThreadId) {
            // Update existing thread
            setSavedThreads(prev => {
                const updated = prev.map(t =>
                    t.id === currentThreadId
                        ? { ...t, messages, updatedAt: now, topic, preview }
                        : t
                );
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        } else {
            // Create new thread
            const newThread: ConversationThread = {
                id: Date.now().toString(),
                title,
                topic,
                messages,
                createdAt: now,
                updatedAt: now,
                preview
            };
            setCurrentThreadId(newThread.id);
            setSavedThreads(prev => {
                const updated = [newThread, ...prev];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        }
    }, [messages, currentThreadId]);

    // Load a saved thread
    const handleLoadThread = (thread: ConversationThread) => {
        setMessages(thread.messages);
        setCurrentThreadId(thread.id);
        setShowSavedConversations(false);
    };

    // Delete a thread
    const handleDeleteThread = (threadId: string) => {
        setSavedThreads(prev => {
            const updated = prev.filter(t => t.id !== threadId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        if (currentThreadId === threadId) {
            setCurrentThreadId(null);
        }
    };

    // Start a new conversation
    const handleNewThread = () => {
        // Save current conversation first if it has content
        const hasUserMessages = messages.some(m => m.role === 'user');
        if (hasUserMessages) {
            saveCurrentConversation();
        }

        // Reset to fresh state
        setMessages([{
            id: Date.now().toString(),
            role: 'model',
            sender: 'ai',
            text: buildWelcomeMessage(),
            timestamp: new Date()
        }]);
        setCurrentThreadId(null);
        setShowSavedConversations(false);
    };

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    const handleSend = async (messageOverride?: string) => {
        const messageToSend = messageOverride || input;
        if (!messageToSend.trim()) return;

        // Check trial status
        if (!isTrialActive()) {
            setUpgradeReason('trial_expired');
            setShowUpgradeModal(true);
            return;
        }

        // Check credits
        if (!canUseCredits('aiChatMessage')) {
            setUpgradeReason('no_credits');
            setShowUpgradeModal(true);
            return;
        }

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            sender: 'user',
            text: messageToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }
        setIsLoading(true);

        try {
            // Deduct credit
            const creditResult = await useCredit('aiChatMessage');
            if (!creditResult.success) {
                setUpgradeReason('no_credits');
                setShowUpgradeModal(true);
                setIsLoading(false);
                return;
            }

            // Build user context for personalized AI responses
            const userContext = getAIContext();
            const responseText = await getCareerAdvice(messageToSend, userContext);
            const modelMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                sender: 'ai',
                text: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, modelMsg]);
        } catch (err) {
            console.error('AI Chat Error:', err);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                sender: 'ai',
                text: "I'm having trouble connecting right now. Please try again in a moment!",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        if (window.confirm('Clear all messages and start fresh?')) {
            setMessages([{
                id: Date.now().toString(),
                role: 'model',
                sender: 'ai',
                text: 'Chat cleared! How can I help you today?',
                timestamp: new Date()
            }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] flex flex-col animate-in fade-in duration-500">
            {/* Header - Mobile optimized */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-2 md:p-2.5 bg-gradient-to-br from-gold to-amber-500 rounded-lg md:rounded-xl text-jalanea-950 shadow-lg">
                        <Sparkles size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-display font-bold text-jalanea-900">AI Career Coach</h1>
                        <p className="text-xs md:text-sm text-jalanea-500 hidden sm:block">Your personal career intelligence assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Save Current Conversation */}
                    <button
                        onClick={saveCurrentConversation}
                        disabled={!messages.some(m => m.role === 'user')}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-xs md:text-sm text-jalanea-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Save conversation"
                    >
                        <Save size={14} />
                        <span className="hidden sm:inline">Save</span>
                    </button>
                    {/* Open Saved Conversations */}
                    <button
                        onClick={() => setShowSavedConversations(true)}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-xs md:text-sm text-jalanea-400 hover:text-jalanea-600 hover:bg-jalanea-100 rounded-lg transition-colors"
                        title="Saved conversations"
                    >
                        <FolderOpen size={14} />
                        <span className="hidden sm:inline">History</span>
                        {savedThreads.length > 0 && (
                            <span className="bg-gold text-jalanea-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {savedThreads.length}
                            </span>
                        )}
                    </button>
                    {/* Clear Chat */}
                    <button
                        onClick={handleClearChat}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-xs md:text-sm text-jalanea-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <Card variant="solid-white" className="flex-1 flex flex-col overflow-hidden min-h-0" noPadding>
                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${msg.role === 'user'
                                    ? 'bg-jalanea-900 text-white'
                                    : 'bg-gradient-to-br from-gold to-amber-400 text-jalanea-900'
                                }`}>
                                {msg.role === 'user' ? <User size={16} className="md:w-5 md:h-5" /> : <Bot size={16} className="md:w-5 md:h-5" />}
                            </div>

                            {/* Message */}
                            <div className={`flex-1 max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`inline-block rounded-2xl px-3 py-2.5 md:px-4 md:py-3 shadow-sm text-left ${msg.role === 'user'
                                        ? 'bg-jalanea-900 text-white rounded-tr-sm'
                                        : 'bg-jalanea-50 text-jalanea-700 rounded-tl-sm border border-jalanea-100'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    ) : (
                                        <div
                                            className="text-sm leading-relaxed prose prose-sm max-w-none
                                                [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1
                                                [&_li]:text-jalanea-700 [&_li]::marker:text-gold
                                                [&_strong]:text-jalanea-900 [&_strong]:font-semibold
                                                [&>br:first-child]:hidden"
                                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                                        />
                                    )}
                                </div>
                                <p className={`text-[10px] md:text-xs text-jalanea-400 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-2 md:gap-3">
                            <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-gold to-amber-400 text-jalanea-900 flex items-center justify-center">
                                <Bot size={16} className="md:w-5 md:h-5" />
                            </div>
                            <div className="bg-jalanea-50 border border-jalanea-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Prompts - Only show when few messages */}
                {messages.length <= 2 && (
                    <div className="px-3 md:px-6 pb-3 md:pb-4 border-t border-jalanea-100 pt-3">
                        <p className="text-[10px] md:text-xs font-bold text-jalanea-400 uppercase tracking-wider mb-2">Quick Actions</p>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {QUICK_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(prompt.prompt)}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-white border border-jalanea-200 hover:border-gold hover:bg-gold/5 rounded-lg text-xs md:text-sm font-medium text-jalanea-600 hover:text-jalanea-900 transition-all shadow-sm"
                                >
                                    <prompt.icon size={12} className="text-gold md:w-3.5 md:h-3.5" />
                                    <span className="truncate">{prompt.label}</span>
                                </button>
                            ))}
                            {/* Interview Prep - Opens Modal */}
                            <button
                                onClick={() => setShowInterviewPrep(true)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-violet-50 border border-violet-200 hover:border-violet-400 hover:bg-violet-100 rounded-lg text-xs md:text-sm font-medium text-violet-600 hover:text-violet-800 transition-all shadow-sm"
                            >
                                <Target size={12} className="text-violet-500 md:w-3.5 md:h-3.5" />
                                <span className="truncate">Interview Prep</span>
                            </button>
                            {/* Outreach Scripts - Opens Modal */}
                            <button
                                onClick={() => setShowOutreachScripts(true)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-blue-50 border border-blue-200 hover:border-blue-400 hover:bg-blue-100 rounded-lg text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800 transition-all shadow-sm"
                            >
                                <Users size={12} className="text-blue-500 md:w-3.5 md:h-3.5" />
                                <span className="truncate">Outreach Scripts</span>
                            </button>
                            {/* Market Insights - Opens Modal */}
                            <button
                                onClick={() => setShowMarketInsights(true)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-emerald-50 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 rounded-lg text-xs md:text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-all shadow-sm"
                            >
                                <MapPin size={12} className="text-emerald-500 md:w-3.5 md:h-3.5" />
                                <span className="truncate">Market Insights</span>
                            </button>
                            {/* Social Post Assistant - Opens Modal */}
                            <button
                                onClick={() => setShowSocialPost(true)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-sky-50 border border-sky-200 hover:border-sky-400 hover:bg-sky-100 rounded-lg text-xs md:text-sm font-medium text-sky-600 hover:text-sky-800 transition-all shadow-sm"
                            >
                                <Linkedin size={12} className="text-sky-500 md:w-3.5 md:h-3.5" />
                                <span className="truncate">Social Posts</span>
                            </button>
                            {/* Schedule Connection - Opens Modal */}
                            <button
                                onClick={() => setShowScheduleConnection(true)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-orange-50 border border-orange-200 hover:border-orange-400 hover:bg-orange-100 rounded-lg text-xs md:text-sm font-medium text-orange-600 hover:text-orange-800 transition-all shadow-sm"
                            >
                                <CalendarClock size={12} className="text-orange-500 md:w-3.5 md:h-3.5" />
                                <span className="truncate">Schedule</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-jalanea-100 p-3 md:p-4 bg-white">
                    <div className="flex gap-2 md:gap-3 items-end">
                        <div className="flex-1">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything about your career..."
                                rows={1}
                                className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-jalanea-50 border border-jalanea-200 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-none placeholder-jalanea-400 max-h-[120px]"
                            />
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="h-10 md:h-[46px] w-10 md:w-auto md:px-5 flex items-center justify-center"
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                    <p className="text-[10px] md:text-xs text-jalanea-400 mt-2 text-center hidden md:block">
                        Press <kbd className="px-1 py-0.5 bg-jalanea-100 rounded text-jalanea-600 font-mono text-[10px]">Enter</kbd> to send
                    </p>
                </div>
            </Card>

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                reason={upgradeReason}
                action="aiChatMessage"
            />

            {/* Outreach Script Generator Modal */}
            <OutreachScriptGenerator
                isOpen={showOutreachScripts}
                onClose={() => setShowOutreachScripts(false)}
                userProfile={{
                    fullName: userProfile?.fullName,
                    targetRoles: userProfile?.preferences?.targetRoles,
                    education: userProfile?.education,
                    experience: userProfile?.experience
                }}
            />

            {/* Interview Prep Modal */}
            <InterviewPrepModal
                isOpen={showInterviewPrep}
                onClose={() => setShowInterviewPrep(false)}
                savedJobs={userProfile?.savedJobs}
                userProfile={{
                    fullName: userProfile?.fullName,
                    education: userProfile?.education,
                    experience: userProfile?.experience,
                    preferences: userProfile?.preferences
                }}
            />

            {/* Orlando Market Insights Modal */}
            <OrlandoMarketInsights
                isOpen={showMarketInsights}
                onClose={() => setShowMarketInsights(false)}
            />

            {/* Saved Conversations Modal */}
            <SavedConversations
                isOpen={showSavedConversations}
                onClose={() => setShowSavedConversations(false)}
                threads={savedThreads}
                onLoadThread={handleLoadThread}
                onDeleteThread={handleDeleteThread}
                onNewThread={handleNewThread}
                currentThreadId={currentThreadId || undefined}
            />

            {/* Social Post Assistant Modal */}
            <SocialPostAssistant
                isOpen={showSocialPost}
                onClose={() => setShowSocialPost(false)}
                userProfile={{
                    fullName: userProfile?.fullName,
                    education: userProfile?.education,
                    experience: userProfile?.experience
                }}
            />

            {/* Schedule Connection Modal */}
            <ScheduleConnection
                isOpen={showScheduleConnection}
                onClose={() => setShowScheduleConnection(false)}
                workSchedule={userProfile?.workSchedule}
                classSchedule={userProfile?.classSchedule}
                availability={availability}
            />
        </div>
    );
};
