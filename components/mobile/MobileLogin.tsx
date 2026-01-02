import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Sparkles, ChevronLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';

/**
 * MobileLogin - Native app-style login experience
 * - Welcome screen with app branding
 * - Google Sign In as primary (most common on mobile)
 * - Email option as secondary
 * - Glassmorphism design matching mobile shell
 */

type LoginView = 'welcome' | 'email';

export const MobileLogin: React.FC = () => {
  const { isLight } = useTheme();
  const { login, loginWithGoogle, signup } = useAuth();

  const [view, setView] = useState<LoginView>('welcome');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // iOS Safari fix: Lock body scroll
  React.useEffect(() => {
    document.documentElement.style.cssText = `
      position: fixed;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `;
    document.body.style.cssText = `
      position: fixed;
      width: 100%;
      height: 100%;
      overflow: hidden;
      margin: 0;
      padding: 0;
    `;
    return () => {
      document.documentElement.style.cssText = '';
      document.body.style.cssText = '';
    };
  }, []);

  const glassPanel = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg'
    : 'bg-slate-900/60 backdrop-blur-xl border border-white/10';

  const handleGoogleSignIn = async () => {
    haptics.medium();
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      haptics.error();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isSignUp && !name) return;

    haptics.medium();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      haptics.success();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      haptics.error();
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen - Primary entry point
  const WelcomeScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12"
    >
      {/* App Logo & Branding */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-2xl shadow-gold/30">
          <Zap size={48} className="text-black" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className={`text-3xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Jalanea<span className="text-gold">Works</span>
        </h1>
        <p className={`text-base ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Your AI-powered career launchpad
        </p>
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`w-full max-w-sm p-4 rounded-2xl mb-8 ${glassPanel}`}
      >
        <div className="space-y-3">
          {[
            { icon: '🎯', text: 'AI-matched job recommendations' },
            { icon: '📄', text: 'Smart resume builder' },
            { icon: '💬', text: 'Career coaching assistant' },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{feature.icon}</span>
              <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Auth Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        {/* Google Sign In - Primary */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all active:scale-[0.98] ${
            isLight
              ? 'bg-white border-2 border-slate-200 text-slate-700 shadow-lg'
              : 'bg-white text-slate-800 shadow-lg'
          } ${loading ? 'opacity-50' : ''}`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className={`flex-1 h-px ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`} />
          <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>or</span>
          <div className={`flex-1 h-px ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`} />
        </div>

        {/* Email Option - Secondary */}
        <button
          onClick={() => { haptics.light(); setView('email'); }}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all active:scale-[0.98] ${
            isLight
              ? 'bg-slate-100 text-slate-700'
              : 'bg-slate-800 text-slate-200'
          }`}
        >
          <Mail size={20} />
          <span>Continue with Email</span>
        </button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-red-500 text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Terms */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`mt-8 text-xs text-center px-6 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy
      </motion.p>
    </motion.div>
  );

  // Email Login/Signup Screen
  const EmailScreen = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-screen px-6 py-12"
    >
      {/* Back Button */}
      <button
        onClick={() => { haptics.light(); setView('welcome'); setError(''); }}
        className={`flex items-center gap-1 mb-8 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {isSignUp
            ? 'Start your career journey with JalaneaWorks'
            : 'Sign in to continue your job search'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4 flex-1">
        {isSignUp && (
          <div>
            <label className={`text-sm font-medium mb-2 block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Full Name
            </label>
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl ${glassPanel}`}>
              <Sparkles size={18} className="text-gold" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={`flex-1 bg-transparent text-sm outline-none ${
                  isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
                }`}
              />
            </div>
          </div>
        )}

        <div>
          <label className={`text-sm font-medium mb-2 block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Email
          </label>
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl ${glassPanel}`}>
            <Mail size={18} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`flex-1 bg-transparent text-sm outline-none ${
                isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`text-sm font-medium mb-2 block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Password
          </label>
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl ${glassPanel}`}>
            <Lock size={18} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`flex-1 bg-transparent text-sm outline-none ${
                isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={isLight ? 'text-slate-400' : 'text-slate-500'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !email || !password || (isSignUp && !name)}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all active:scale-[0.98] ${
            loading || !email || !password || (isSignUp && !name)
              ? 'bg-gold/50 text-black/50'
              : 'bg-gold text-black shadow-lg shadow-gold/30'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Toggle Sign Up / Sign In */}
      <div className="mt-6 text-center">
        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => { haptics.light(); setIsSignUp(!isSignUp); setError(''); }}
            className="ml-1 text-gold font-semibold"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </motion.div>
  );

  return (
    <div
      className={`min-h-screen ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <AnimatePresence mode="wait">
        {view === 'welcome' ? (
          <WelcomeScreen key="welcome" />
        ) : (
          <EmailScreen key="email" />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileLogin;
