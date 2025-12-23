
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Zap } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { getCareerAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

// Simple markdown parser for chat messages
const formatMessage = (text: string): string => {
  return text
    // Bold: **text** or __text__ (process first)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-jalanea-900">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="font-bold text-jalanea-900">$1</strong>')
    // Italic: *text* (single asterisk, after bold is handled)
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    // Numbered lists: 1. text -> styled line break and number
    .replace(/(\d+)\.\s+/g, '<br/><span class="inline-flex items-center gap-1"><span class="text-gold font-bold">$1.</span></span> ')
    // Line breaks for better readability
    .replace(/\n/g, '<br/>');
};

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', sender: 'ai', text: 'Hello! I am your strategic career architect. What is your goal today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for custom event to open chat with context
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent<{ message: string }>) => {
      setIsOpen(true);
      if (event.detail?.message) {
        setInput(event.detail.message);
      }
    };

    window.addEventListener('open-ai-chat' as any, handleOpenChat as any);
    return () => window.removeEventListener('open-ai-chat' as any, handleOpenChat as any);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const userQuestion = input; // Save for retry
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getCareerAdvice(userQuestion);
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card variant="glass-light" className="w-80 md:w-96 h-[500px] shadow-2xl border-jalanea-200 flex flex-col mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden" noPadding>
          {/* Header */}
          <div className="bg-jalanea-900 text-white p-4 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gold rounded text-jalanea-950"><Sparkles size={14} fill="currentColor" /></div>
              <h3 className="font-bold text-sm">Jalanea Intelligence</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm
                  ${msg.role === 'user'
                    ? 'bg-jalanea-900 text-white rounded-br-none font-medium'
                    : 'bg-white border border-jalanea-200 text-jalanea-700 rounded-bl-none'}`}
                >
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    <div
                      className="leading-relaxed [&>br:first-child]:hidden"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                    />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-jalanea-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-jalanea-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-jalanea-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for strategic advice..."
                className="flex-1 bg-jalanea-50 border-none rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-jalanea-900 outline-none placeholder-jalanea-400"
              />
              <Button size="sm" variant="primary" onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border-2 border-white/20
          ${isOpen ? 'bg-jalanea-800 text-white' : 'bg-gold text-jalanea-950'}
        `}
      >
        <MessageSquare size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};
