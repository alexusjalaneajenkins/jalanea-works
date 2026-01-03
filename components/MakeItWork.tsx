/**
 * MakeItWork - Empowerment Feature
 *
 * "If the system doesn't open the door, build a door."
 *
 * This feature helps users who face barriers to traditional employment
 * find creative, ethical, real-world alternatives to move forward.
 *
 * Like Nike's "Just Do It" - "Make It Work" is JelaneaWorks' rallying cry.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  X,
  ChevronRight,
  Lightbulb,
  Target,
  Calendar,
  CheckCircle2,
  Loader,
  Rocket,
  Users,
  Briefcase,
  Code,
  Palette,
  Wrench,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { haptics } from '../utils/haptics';
import { generateMakeItWorkPaths, AlternativePath, ActionPlan } from '../services/makeItWorkService';

interface MakeItWorkProps {
  // Pre-fill with user's goal if known
  initialGoal?: string;
  // Pre-fill with barriers if known
  initialBarriers?: string[];
  // Callback when user selects a path
  onPathSelected?: (path: AlternativePath) => void;
  // Trigger from parent (for embedding in other components)
  isOpen?: boolean;
  onClose?: () => void;
  // Inline mode (no modal, just the content)
  inline?: boolean;
}

// Common barriers users face
const COMMON_BARRIERS = [
  { id: 'no-experience', label: 'No experience', icon: Briefcase },
  { id: 'no-degree', label: 'No degree', icon: Target },
  { id: 'employment-gap', label: 'Employment gap', icon: Clock },
  { id: 'no-portfolio', label: 'No portfolio', icon: Palette },
  { id: 'rejected-repeatedly', label: 'Keep getting rejected', icon: X },
  { id: 'career-change', label: 'Changing careers', icon: TrendingUp },
  { id: 'caregiver', label: "Caregiver / can't work 9-5", icon: Users },
  { id: 'location', label: 'Location barriers', icon: Target },
  { id: 'other', label: 'Other challenges', icon: Wrench },
];

type Step = 'input' | 'loading' | 'paths' | 'plan';

export const MakeItWork: React.FC<MakeItWorkProps> = ({
  initialGoal = '',
  initialBarriers = [],
  onPathSelected,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  inline = false,
}) => {
  const { isLight } = useTheme();
  const { userProfile } = useAuth();

  // Internal state for standalone usage
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen ?? internalIsOpen;
  const onClose = externalOnClose ?? (() => setInternalIsOpen(false));

  // Form state
  const [step, setStep] = useState<Step>('input');
  const [goal, setGoal] = useState(initialGoal);
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>(initialBarriers);
  const [customBarrier, setCustomBarrier] = useState('');

  // Results state
  const [paths, setPaths] = useState<AlternativePath[]>([]);
  const [selectedPath, setSelectedPath] = useState<AlternativePath | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = useCallback(() => {
    haptics.medium();
    if (externalIsOpen === undefined) {
      setInternalIsOpen(true);
    }
  }, [externalIsOpen]);

  const handleClose = useCallback(() => {
    haptics.light();
    setStep('input');
    setGoal(initialGoal);
    setSelectedBarriers(initialBarriers);
    setPaths([]);
    setSelectedPath(null);
    setActionPlan(null);
    setError(null);
    onClose();
  }, [initialGoal, initialBarriers, onClose]);

  const toggleBarrier = (barrierId: string) => {
    haptics.light();
    setSelectedBarriers(prev =>
      prev.includes(barrierId)
        ? prev.filter(b => b !== barrierId)
        : [...prev, barrierId]
    );
  };

  const handleMakeItWork = async () => {
    if (!goal.trim()) {
      setError('Tell us what role or goal you\'re working towards');
      return;
    }
    if (selectedBarriers.length === 0) {
      setError('Select at least one barrier you\'re facing');
      return;
    }

    haptics.success();
    setError(null);
    setStep('loading');

    try {
      // Build barriers string
      const barrierLabels = selectedBarriers.map(id => {
        const barrier = COMMON_BARRIERS.find(b => b.id === id);
        return barrier?.label || id;
      });
      if (customBarrier.trim()) {
        barrierLabels.push(customBarrier.trim());
      }

      // Get user context for personalization
      const userContext = {
        name: userProfile?.displayName || null,
        skills: userProfile?.skills || null,
        location: userProfile?.location || null,
        school: userProfile?.school || null,
      };

      const result = await generateMakeItWorkPaths(goal, barrierLabels, userContext);
      setPaths(result.paths);
      setStep('paths');
    } catch (err) {
      console.error('Make It Work error:', err);
      setError('Something went wrong. Let\'s try again.');
      setStep('input');
    }
  };

  const handleSelectPath = async (path: AlternativePath) => {
    haptics.medium();
    setSelectedPath(path);
    onPathSelected?.(path);
    setActionPlan(path.actionPlan);
    setStep('plan');
  };

  const handleBack = () => {
    haptics.light();
    if (step === 'plan') {
      setStep('paths');
      setSelectedPath(null);
      setActionPlan(null);
    } else if (step === 'paths') {
      setStep('input');
      setPaths([]);
    }
  };

  // The main "Make It Work" button for triggering the modal
  const TriggerButton = () => (
    <motion.button
      onClick={handleOpen}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
        bg-gradient-to-r from-gold via-amber-500 to-gold
        text-black font-bold text-lg
        shadow-lg shadow-gold/25
        transition-all duration-300
        hover:shadow-xl hover:shadow-gold/30
      `}
    >
      <Zap className="w-6 h-6" />
      <span>Make It Work</span>
    </motion.button>
  );

  // Content for each step
  const renderContent = () => {
    switch (step) {
      case 'input':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-amber-600 mb-4">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Make It Work
              </h2>
              <p className={`mt-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                If the system doesn't open the door, build a door.
              </p>
            </div>

            {/* Goal input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                What role or goal are you working towards?
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Software Developer, Marketing Manager, Start my own business..."
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-colors
                  ${isLight
                    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold'
                    : 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-gold'
                  }
                  focus:outline-none focus:ring-2 focus:ring-gold/20
                `}
              />
            </div>

            {/* Barriers selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                What barriers are you facing? (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_BARRIERS.map((barrier) => {
                  const Icon = barrier.icon;
                  const isSelected = selectedBarriers.includes(barrier.id);
                  return (
                    <button
                      key={barrier.id}
                      onClick={() => toggleBarrier(barrier.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${isSelected
                          ? 'bg-gold text-black'
                          : isLight
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {barrier.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom barrier input */}
              {selectedBarriers.includes('other') && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  type="text"
                  value={customBarrier}
                  onChange={(e) => setCustomBarrier(e.target.value)}
                  placeholder="Describe your challenge..."
                  className={`
                    w-full mt-3 px-4 py-3 rounded-xl border-2 transition-colors
                    ${isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    }
                    focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
                  `}
                />
              )}
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <motion.button
              onClick={handleMakeItWork}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center justify-center gap-3 py-4 rounded-xl
                bg-gradient-to-r from-gold via-amber-500 to-gold
                text-black font-bold text-lg
                shadow-lg shadow-gold/25
                transition-all
              `}
            >
              <Zap className="w-5 h-5" />
              Make It Work
            </motion.button>
          </motion.div>
        );

      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-4 border-gold/30 border-t-gold"
              />
              <Lightbulb className="absolute inset-0 m-auto w-6 h-6 text-gold" />
            </div>
            <p className={`mt-6 text-lg font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Finding ways to make it work...
            </p>
            <p className={`mt-2 text-sm ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Analyzing creative paths forward
            </p>
          </motion.div>
        );

      case 'paths':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 mb-3">
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Here's how you can make it work
              </h3>
              <p className={`mt-1 text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {paths.length} paths to move forward
              </p>
            </div>

            {/* Paths list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {paths.map((path, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectPath(path)}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all
                    ${isLight
                      ? 'bg-white border-slate-200 hover:border-gold hover:shadow-lg'
                      : 'bg-slate-800 border-slate-700 hover:border-gold hover:shadow-lg hover:shadow-gold/10'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                      bg-gradient-to-br from-gold to-amber-600 text-black font-bold text-sm
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {path.title}
                      </h4>
                      <p className={`mt-1 text-sm line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {path.description}
                      </p>
                      <div className={`mt-2 flex items-center gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold font-medium">
                          {path.resumeSpin}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`flex-shrink-0 w-5 h-5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Back button */}
            <button
              onClick={handleBack}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              ← Try different barriers
            </button>
          </motion.div>
        );

      case 'plan':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Selected path header */}
            <div className={`p-4 rounded-xl ${isLight ? 'bg-gold/10' : 'bg-gold/10'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {selectedPath?.title}
                  </h3>
                  <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Your action plan
                  </p>
                </div>
              </div>
            </div>

            {/* Action plan timeline */}
            <div className="space-y-4">
              {/* First 24 hours */}
              <div className={`p-4 rounded-xl border-2 ${isLight ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-800'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    First 24 Hours
                  </span>
                </div>
                <ul className="space-y-2">
                  {actionPlan?.first24Hours.map((task, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* First week */}
              <div className={`p-4 rounded-xl border-2 ${isLight ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-800'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    First Week
                  </span>
                </div>
                <ul className="space-y-2">
                  {actionPlan?.firstWeek.map((task, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* First 30 days */}
              <div className={`p-4 rounded-xl border-2 ${isLight ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-800'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-gold" />
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    First 30 Days
                  </span>
                </div>
                <ul className="space-y-2">
                  {actionPlan?.first30Days.map((task, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Resume language tip */}
            {selectedPath?.resumeLanguage && (
              <div className={`p-4 rounded-xl ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                <p className={`text-sm font-medium ${isLight ? 'text-blue-900' : 'text-blue-300'}`}>
                  💼 How to put this on your resume:
                </p>
                <p className={`mt-2 text-sm italic ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                  "{selectedPath.resumeLanguage}"
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ← Other Paths
              </button>
              <button
                onClick={handleClose}
                className={`
                  flex-1 py-3 rounded-xl font-bold
                  bg-gradient-to-r from-gold to-amber-500
                  text-black transition-transform hover:scale-[1.02]
                `}
              >
                Let's Go! 🚀
              </button>
            </div>
          </motion.div>
        );
    }
  };

  // Inline mode - just render the content
  if (inline) {
    return (
      <div className={`p-6 rounded-2xl ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
        {renderContent()}
      </div>
    );
  }

  // Modal mode
  return (
    <>
      {/* Trigger button (only if not controlled externally) */}
      {externalIsOpen === undefined && <TriggerButton />}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`
                relative w-full max-w-lg max-h-[85vh] overflow-y-auto
                rounded-3xl p-6 shadow-2xl
                ${isLight ? 'bg-white' : 'bg-slate-900'}
              `}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className={`
                  absolute top-4 right-4 p-2 rounded-xl transition-colors
                  ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}
                `}
              >
                <X className={`w-5 h-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
              </button>

              {/* Content */}
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MakeItWork;
