import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UpgradeModal } from '../components/UpgradeModal';
import { useAuth } from '../contexts/AuthContext';
import { getCareerAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import {
    Send, Sparkles, Bot, User, Trash2,
    MessageSquare, Briefcase, FileText, Target,
    TrendingUp, Lightbulb, ArrowRight
} from 'lucide-react';

// Markdown parser for chat messages
const formatMessage = (text: string): string => {
    return text
        // Bold: **text**
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-jalanea-900">$1</strong>')
        // Italic: *text*
        .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic">$1</em>')
        // Bullet points: - or * at start of line
        .replace(/(?:^|\n)[-•]\s+(.+)/g, '<br/><span class="flex items-start gap-2 my-1"><span class="text-gold font-bold">•</span><span>$1</span></span>')
        .replace(/(?:^|\n)\*\s+(.+)/g, '<br/><span class="flex items-start gap-2 my-1"><span class="text-gold font-bold">•</span><span>$1</span></span>')
        // Numbered lists
        .replace(/(?:^|\n)(\d+)\.\s+(.+)/g, '<br/><span class="flex items-start gap-2 my-1"><span class="text-gold font-bold">$1.</span><span>$2</span></span>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4 class="font-bold text-jalanea-900 mt-3 mb-1">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 class="font-bold text-jalanea-900 text-lg mt-4 mb-2">$1</h3>')
        // Line breaks
        .replace(/\n/g, '<br/>');
};

// Quick prompts for common actions
const QUICK_PROMPTS = [
    { icon: Briefcase, label: 'Job Search Strategy', prompt: 'Help me create a job search strategy for finding an entry-level position' },
    { icon: FileText, label: 'Resume Tips', prompt: 'Give me tips to improve my resume for tech roles' },
    { icon: Target, label: 'Interview Prep', prompt: 'Help me prepare for a behavioral interview' },
    { icon: TrendingUp, label: 'Market Trends', prompt: 'Research current job market trends in tech for 2024' },
    { icon: Lightbulb, label: 'Career Path', prompt: 'Suggest career paths for someone with a computing technology degree' },
];

export const AIAssistant: React.FC = () => {
    const { currentUser, userProfile, useCredit, canUseCredits, isTrialActive } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'model',
            sender: 'ai',
            text: `Hello${userProfile?.fullName ? `, ${userProfile.fullName.split(' ')[0]}` : ''}! 👋\n\nI'm your AI Career Coach. I can help you with:\n\n- **Job search strategies** tailored to your background\n- **Resume and cover letter** advice\n- **Interview preparation** and practice questions\n- **Career research** with real-time market data\n- **Skill development** recommendations\n\nWhat would you like to work on today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState<'no_credits' | 'trial_expired'>('no_credits');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

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
        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
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

            const responseText = await getCareerAdvice(messageToSend);
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
                text: "I'm having trouble connecting right now. This might be a temporary issue - please try again in a moment!",
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
        <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-gold to-amber-500 rounded-xl text-jalanea-950 shadow-lg">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-jalanea-900">AI Career Coach</h1>
                        <p className="text-sm text-jalanea-500">Your personal career intelligence assistant</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChat}
                    icon={<Trash2 size={16} />}
                    className="text-jalanea-400 hover:text-red-500"
                >
                    Clear Chat
                </Button>
            </div>

            {/* Main Chat Area */}
            <Card variant="solid-white" className="flex-1 flex flex-col overflow-hidden" noPadding>
                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${msg.role === 'user'
                                    ? 'bg-jalanea-900 text-white'
                                    : 'bg-gradient-to-br from-gold to-amber-400 text-jalanea-900'
                                }`}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>

                            {/* Message */}
                            <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`inline-block rounded-2xl px-5 py-4 shadow-sm ${msg.role === 'user'
                                        ? 'bg-jalanea-900 text-white rounded-tr-none'
                                        : 'bg-jalanea-50 text-jalanea-700 rounded-tl-none border border-jalanea-100'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    ) : (
                                        <div
                                            className="text-sm leading-relaxed [&>br:first-child]:hidden"
                                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                                        />
                                    )}
                                </div>
                                <p className={`text-xs text-jalanea-400 mt-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-amber-400 text-jalanea-900 flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div className="bg-jalanea-50 border border-jalanea-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                                <div className="flex space-x-2">
                                    <div className="w-2.5 h-2.5 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2.5 h-2.5 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2.5 h-2.5 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Prompts - Only show when few messages */}
                {messages.length <= 2 && (
                    <div className="px-6 pb-4">
                        <p className="text-xs font-bold text-jalanea-400 uppercase tracking-wider mb-3">Quick Actions</p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(prompt.prompt)}
                                    disabled={isLoading}
                                    className="group flex items-center gap-2 px-3 py-2 bg-white border border-jalanea-200 hover:border-gold hover:bg-gold/5 rounded-xl text-sm font-medium text-jalanea-600 hover:text-jalanea-900 transition-all shadow-sm"
                                >
                                    <prompt.icon size={14} className="text-gold" />
                                    {prompt.label}
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-jalanea-100 p-4 bg-white">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything about your career..."
                                rows={1}
                                className="w-full px-4 py-3 bg-jalanea-50 border border-jalanea-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-none placeholder-jalanea-400 max-h-[150px]"
                            />
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="h-[46px] px-5"
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                    <p className="text-xs text-jalanea-400 mt-2 text-center">
                        Press <kbd className="px-1.5 py-0.5 bg-jalanea-100 rounded text-jalanea-600 font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-jalanea-100 rounded text-jalanea-600 font-mono">Shift+Enter</kbd> for new line
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
        </div>
    );
};
