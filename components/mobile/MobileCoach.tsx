import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Sparkles, FileText, DollarSign, Users, Briefcase } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate AI response
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(messageText),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
    haptics.success();
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('interview')) {
      return "Great choice focusing on interview prep! Here are my top tips:\n\n1. **Research the company** - Know their mission, recent news, and culture\n2. **Practice STAR method** - Structure your answers with Situation, Task, Action, Result\n3. **Prepare questions** - Have 3-5 thoughtful questions ready\n4. **Mock interviews** - Practice with a friend or record yourself\n\nWant me to run through some common interview questions with you?";
    }

    if (lowerQuery.includes('resume')) {
      return "I'd love to help with your resume! Key areas to focus on:\n\n1. **Strong action verbs** - Led, Developed, Achieved, Implemented\n2. **Quantify achievements** - Use numbers and percentages\n3. **Tailor to the job** - Match keywords from the job description\n4. **Clean formatting** - Use consistent fonts and spacing\n\nWould you like me to review specific sections of your resume?";
    }

    if (lowerQuery.includes('salary') || lowerQuery.includes('negotiate')) {
      return "Salary negotiation is crucial! Here's my approach:\n\n1. **Research market rates** - Use Glassdoor, LinkedIn, Levels.fyi\n2. **Know your worth** - List your achievements and unique value\n3. **Let them go first** - Try to get their range before sharing yours\n4. **Consider total comp** - Benefits, equity, and PTO matter too\n\nWhat's your current situation - new offer or asking for a raise?";
    }

    if (lowerQuery.includes('network')) {
      return "Networking is key to career growth! Try these strategies:\n\n1. **LinkedIn optimization** - Update your headline and engage with content\n2. **Informational interviews** - Ask for 15-min coffee chats\n3. **Industry events** - Attend meetups and conferences\n4. **Give first** - Share resources and make introductions\n\nWould you like help crafting a networking message?";
    }

    return "That's a great question! I'm here to help with your career journey. I can assist with:\n\n• Interview preparation and practice\n• Resume and cover letter reviews\n• Salary negotiation strategies\n• Job search optimization\n• Networking tips\n• Career planning advice\n\nWhat specific area would you like to focus on?";
  };

  const handleQuickAction = (prompt: string) => {
    haptics.medium();
    handleSend(prompt);
  };

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
                    ? 'bg-gold text-black rounded-br-md'
                    : isLight
                      ? 'bg-white shadow-sm rounded-bl-md'
                      : 'bg-slate-800 rounded-bl-md'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      AI Coach
                    </span>
                  </div>
                )}
                <p
                  className={`text-sm whitespace-pre-wrap ${
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

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className={`rounded-2xl px-4 py-3 rounded-bl-md ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800'}`}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-300' : 'bg-slate-600'}`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap ${
                  isLight
                    ? 'bg-white shadow-sm border border-slate-100'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <action.icon size={14} className="text-gold" />
                <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        className={`px-4 py-3 border-t ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl ${
              isLight ? 'bg-slate-100' : 'bg-slate-800'
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
              className={`p-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}
            >
              <Mic size={18} />
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              inputValue.trim()
                ? 'bg-gold text-black'
                : isLight
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-slate-800 text-slate-600'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCoach;
