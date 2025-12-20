import React, { useEffect, useState } from 'react';
import { Zap, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeTransitionProps {
    userName?: string;
    userPhoto?: string;
    onComplete: () => void;
}

export const WelcomeTransition: React.FC<WelcomeTransitionProps> = ({
    userName,
    userPhoto,
    onComplete
}) => {
    const [phase, setPhase] = useState<'greeting' | 'loading' | 'ready'>('greeting');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, 100));
        }, 30);

        // Phase transitions
        const greetingTimer = setTimeout(() => setPhase('loading'), 800);
        const loadingTimer = setTimeout(() => setPhase('ready'), 2000);
        const completeTimer = setTimeout(() => onComplete(), 2800);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(greetingTimer);
            clearTimeout(loadingTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const firstName = userName?.split(' ')[0] || 'there';

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-jalanea-900 via-jalanea-950 to-black flex items-center justify-center overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-gold/20 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />

            <div className="relative z-10 text-center px-6 max-w-lg">
                {/* Logo */}
                <div className={`mb-8 transition-all duration-700 ${phase === 'greeting' ? 'scale-100 opacity-100' : 'scale-90 opacity-80'}`}>
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-2xl shadow-gold/30 animate-pulse">
                        <Zap size={40} className="text-jalanea-900" fill="currentColor" />
                    </div>
                </div>

                {/* User photo (if available) */}
                {userPhoto && phase !== 'greeting' && (
                    <div className="mb-6 animate-in fade-in zoom-in duration-500">
                        <img
                            src={userPhoto}
                            alt={userName || 'User'}
                            className="w-16 h-16 rounded-full mx-auto border-3 border-gold shadow-lg"
                        />
                    </div>
                )}

                {/* Greeting text */}
                <div className={`transition-all duration-500 ${phase === 'greeting' ? 'opacity-100 translate-y-0' : ''}`}>
                    {phase === 'greeting' && (
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                            Hey, <span className="text-gold">{firstName}!</span>
                        </h1>
                    )}

                    {phase === 'loading' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                                Setting up your career launchpad...
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-gold/80">
                                <Sparkles size={18} className="animate-spin" />
                                <span className="text-sm font-medium">Preparing personalized experience</span>
                            </div>
                        </div>
                    )}

                    {phase === 'ready' && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                                Let's get started! <span className="text-gold">🚀</span>
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-gold">
                                <ArrowRight size={20} className="animate-bounce-x" />
                                <span className="font-bold">Opening onboarding...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="mt-10 mx-auto max-w-xs">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-100 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Skip button (appears after delay) */}
                {phase === 'loading' && (
                    <button
                        onClick={onComplete}
                        className="mt-8 text-sm text-white/40 hover:text-white/70 transition-colors animate-in fade-in duration-500 delay-700"
                    >
                        Skip animation →
                    </button>
                )}
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <style>{`
                @keyframes bounce-x {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(4px); }
                }
                .animate-bounce-x {
                    animation: bounce-x 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default WelcomeTransition;
