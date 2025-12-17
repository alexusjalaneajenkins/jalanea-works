
import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { X, MessageSquare, Sparkles, Send, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'input' | 'synthesize' | 'sent'>('input');
  const [rawInput, setRawInput] = useState('');
  const [synthesizedInput, setSynthesizedInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');

  if (!isOpen) return null;

  const handleSynthesize = () => {
    if (!rawInput.trim()) return;
    setIsProcessing(true);

    // Simulate AI Synthesis
    setTimeout(() => {
        let refined = "";
        if (rawInput.length < 20) {
            refined = `User requests assistance regarding: "${rawInput}". Specific details needed for resolution.`;
        } else {
            refined = `**Subject:** ${feedbackType === 'bug' ? 'Issue Report' : 'Feature Request'}\n\n**User Statement:** ${rawInput}\n\n**Core Need:** The user is experiencing friction with the current workflow and suggests an improvement to enhance clarity and efficiency.`;
        }
        setSynthesizedInput(refined);
        setStep('synthesize');
        setIsProcessing(false);
    }, 1500);
  };

  const handleSubmit = () => {
      // API call would go here
      setStep('sent');
      setTimeout(() => {
          onClose();
          setStep('input');
          setRawInput('');
          setSynthesizedInput('');
      }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jalanea-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <Card variant="solid-white" className="relative w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 z-10" noPadding>
        <div className="p-6 border-b border-jalanea-100 flex justify-between items-center bg-jalanea-50/50 rounded-t-2xl">
            <div className="flex items-center gap-2 text-jalanea-900 font-bold">
                <MessageSquare size={18} className="text-gold" />
                <span>Help Us Improve</span>
            </div>
            <button onClick={onClose} className="text-jalanea-400 hover:text-jalanea-900"><X size={20}/></button>
        </div>

        <div className="p-6">
            {step === 'input' && (
                <div className="space-y-4">
                    <p className="text-sm text-jalanea-600">
                        Tell us what's on your mind. Our AI will help you format your feedback so we can act on it faster.
                    </p>

                    <div className="flex gap-2 p-1 bg-jalanea-50 rounded-lg">
                        {['general', 'bug', 'feature'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFeedbackType(t as any)}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${feedbackType === t ? 'bg-white shadow-sm text-jalanea-900' : 'text-jalanea-400 hover:text-jalanea-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="w-full h-32 p-3 border border-jalanea-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-none text-sm"
                        placeholder="e.g., I'm trying to add a job but the button is confusing..."
                        value={rawInput}
                        onChange={(e) => setRawInput(e.target.value)}
                    />

                    <Button 
                        fullWidth 
                        onClick={handleSynthesize} 
                        disabled={!rawInput.trim() || isProcessing}
                        icon={isProcessing ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                    >
                        {isProcessing ? 'Synthesizing...' : 'Refine with AI'}
                    </Button>
                </div>
            )}

            {step === 'synthesize' && (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gold/10 rounded-xl border border-gold/20">
                        <Sparkles size={20} className="text-gold mt-1 shrink-0" />
                        <div>
                            <h4 className="font-bold text-jalanea-900 text-sm mb-1">Here is a structured version:</h4>
                            <p className="text-sm text-jalanea-700 whitespace-pre-wrap font-medium">{synthesizedInput}</p>
                        </div>
                    </div>
                    
                    <p className="text-xs text-jalanea-500 text-center">
                        Is this what you meant? This format helps our engineering team understand the issue instantly.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => setStep('input')}>Edit Original</Button>
                        <Button variant="primary" onClick={handleSubmit} icon={<Send size={16}/>}>Submit Feedback</Button>
                    </div>
                </div>
            )}

            {step === 'sent' && (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-jalanea-900">Feedback Received!</h3>
                    <p className="text-jalanea-500 max-w-xs">
                        Thank you for helping us build a better platform. We'll review this shortly.
                    </p>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
};
