import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Sparkles, FileText, DollarSign, Users, Briefcase, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';
import { getCareerAdvice, AIUserContext } from '../../services/geminiService';
import { MakeItWork } from '../MakeItWork';

/**
 * MobileCoach - Research-driven design applying:
 * - Conversational UI patterns: Natural chat flow reduces cognitive load
 * - Progressive disclosure: Quick actions shown initially, fade after use
 * - Brand consistency: Gold-themed AI avatar and accent colors
 * - Immediate feedback: Typing indicator, haptic responses
 */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: Briefcase, label: 'Interview Prep', prompt: 'Help me prepare for an upcoming job interview' },
  { icon: FileText, label: 'Resume Review', prompt: 'Can you review and improve my resume?' },
  { icon: DollarSign, label: 'Salary Tips', prompt: 'How should I negotiate my salary offer?' },
  { icon: Users, label: 'Networking', prompt: 'Give me tips for professional networking' },
];

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hi! I'm your AI Career Coach. I can help you with interview prep, resume tips, salary negotiation, and job search strategies. What would you like to work on today?",
    timestamp: new Date(),
  },
];

export const MobileCoach: React.FC = () => {
  const { isLight } = useTheme();
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMakeItWork, setShowMakeItWork] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build user context for personalized AI responses
  const buildUserContext = (): AIUserContext => {
    return {
      name: userProfile?.displayName || null,
      school: userProfile?.school || null,
      program: userProfile?.program || null,
      skills: userProfile?.skills || null,
      targetSalary: userProfile?.targetSalary || undefined,
      availability: userProfile?.availability || null,
      challenges: userProfile?.challenges || undefined,
      location: userProfile?.location || null,
    };
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    haptics.light();
    setInputValue('');

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Get real AI response
    setIsTyping(true);

    try {
      const userContext = buildUserContext();
      const response = await getCareerAdvice(messageText, userContext);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      haptics.success();
    } catch (error) {
      console.error('AI Coach error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
      haptics.error();
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    haptics.medium();
    handleSend(prompt);
  };

  // Glass panel styles matching desktop design system
  const glassPanel = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg'
    : 'bg-slate-900/60 backdrop-blur-xl border border-white/10';

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gold text-black rounded-br-sm shadow-lg shadow-gold/20'
                    : isLight
                      ? 'bg-white/90 backdrop-blur-sm shadow-sm rounded-bl-sm border border-slate-100'
                      : 'bg-slate-800/80 backdrop-blur-sm rounded-bl-sm border border-white/5'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gold flex items-center justify-center">
                      <Zap size={14} className="text-black" />
                    </div>
                    <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      AI Coach
                    </span>
                  </div>
                )}
                <p
                  className={`text-sm whitespace-pre-wrap leading-relaxed ${
                    message.role === 'user'
                      ? 'text-black'
                      : isLight
                        ? 'text-slate-700'
                        : 'text-slate-200'
                  }`}
                >
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Make It Work - Featured prominently for users facing barriers */}
        {messages.length <= 1 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-2 py-4"
          >
            <button
              onClick={() => {
                haptics.medium();
                setShowMakeItWork(true);
              }}
              className={`
                w-full p-4 rounded-2xl
                bg-gradient-to-r from-gold via-amber-500 to-gold
                shadow-lg shadow-gold/25
                active:scale-[0.98] transition-all
              `}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-black font-bold text-lg">Make It Work</p>
                  <p className="text-black/70 text-sm">Facing barriers? Let's find another way.</p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Suggested Topics - Fill empty space when chat is new */}
        {messages.length <= 1 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-2 py-4"
          >
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              What I can help with
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '🎯', title: 'Interview Prep', desc: 'Practice questions & tips' },
                { emoji: '📄', title: 'Resume Polish', desc: 'Make your resume shine' },
                { emoji: '💰', title: 'Salary Negotiation', desc: 'Get what you deserve' },
                { emoji: '🤝', title: 'Networking', desc: 'Build connections' },
                { emoji: '🔍', title: 'Job Search', desc: 'Find the right fit' },
                { emoji: '📈', title: 'Career Growth', desc: 'Plan your next move' },
              ].map((topic) => (
                <button
                  key={topic.title}
                  onClick={() => handleQuickAction(`Help me with ${topic.title.toLowerCase()}`)}
                  className={`p-3 rounded-xl text-left active:scale-[0.98] transition-all ${
                    isLight
                      ? 'bg-white/60 border border-slate-200/50 hover:bg-white/80'
                      : 'bg-slate-800/40 border border-white/5 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xl mb-1 block">{topic.emoji}</span>
                  <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {topic.title}
                  </p>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {topic.desc}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className={`rounded-2xl px-4 py-3 rounded-bl-sm ${
              isLight
                ? 'bg-white/90 backdrop-blur-sm shadow-sm border border-slate-100'
                : 'bg-slate-800/80 backdrop-blur-sm border border-white/5'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gold flex items-center justify-center">
                  <Zap size={14} className="text-black" />
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gold"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Shown at start for progressive disclosure */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className={`text-xs font-medium mb-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Quick start:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl whitespace-nowrap active:scale-95 transition-all ${
                  isLight
                    ? 'bg-gold/10 border border-gold/20 hover:bg-gold/20'
                    : 'bg-gold/10 border border-gold/20 hover:bg-gold/20'
                }`}
              >
                <action.icon size={14} className="text-gold" />
                <span className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Glassmorphism style */}
      <div
        className={`px-4 py-3 ${
          isLight
            ? 'bg-white/80 backdrop-blur-xl border-t border-slate-200/50'
            : 'bg-slate-900/80 backdrop-blur-xl border-t border-white/5'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl ${
              isLight ? 'bg-slate-100/80' : 'bg-slate-800/80'
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your career coach..."
              className={`flex-1 bg-transparent text-sm outline-none ${
                isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
              }`}
            />
            <button
              onClick={() => { haptics.light(); }}
              className={`p-1.5 rounded-lg active:scale-90 transition-all ${
                isLight ? 'text-slate-400 hover:bg-slate-200' : 'text-slate-500 hover:bg-slate-700'
              }`}
            >
              <Mic size={18} />
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              inputValue.trim()
                ? 'bg-gold text-black shadow-lg shadow-gold/30'
                : isLight
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-slate-800 text-slate-600'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Make It Work Modal */}
      <MakeItWork
        isOpen={showMakeItWork}
        onClose={() => setShowMakeItWork(false)}
        onPathSelected={(path) => {
          // Add a message about the selected path
          const message: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Great choice! You've selected: **${path.title}**\n\n${path.description}\n\nI've saved your action plan. Ready to help you make it work! 💪`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, message]);
        }}
      />
    </div>
  );
};

export default MobileCoach;
