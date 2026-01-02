import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, DollarSign, Building2, Filter, List, Layers, Bookmark, Send } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';

/**
 * MobileJobs - Research-driven design applying:
 * - Reduced cognitive load: Progressive disclosure on job cards
 * - Clear visual hierarchy: Match score is the primary differentiator
 * - Friction reduction: One-tap actions, swipe gestures
 * - Brand consistency: Gold accents, glassmorphism
 */

// Mock job data for demo
const mockJobs = [
  {
    id: '1',
    title: 'Product Designer',
    company: 'Stripe',
    location: 'Orlando, FL',
    salary: '$120k - $150k',
    remote: true,
    matchScore: 92,
    tags: ['UI/UX', 'Figma', 'Remote'],
    logo: 'https://logo.clearbit.com/stripe.com'
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Netflix',
    location: 'Remote',
    salary: '$140k - $180k',
    remote: true,
    matchScore: 85,
    tags: ['React', 'TypeScript', 'Remote'],
    logo: 'https://logo.clearbit.com/netflix.com'
  },
  {
    id: '3',
    title: 'UX Researcher',
    company: 'Airbnb',
    location: 'Miami, FL',
    salary: '$100k - $130k',
    remote: false,
    matchScore: 78,
    tags: ['Research', 'Interviews', 'Hybrid'],
    logo: 'https://logo.clearbit.com/airbnb.com'
  },
  {
    id: '4',
    title: 'Software Engineer',
    company: 'Google',
    location: 'Orlando, FL',
    salary: '$150k - $200k',
    remote: true,
    matchScore: 88,
    tags: ['Python', 'Cloud', 'Remote'],
    logo: 'https://logo.clearbit.com/google.com'
  }
];

export const MobileJobs: React.FC = () => {
  const { isLight } = useTheme();
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const currentJob = mockJobs[currentIndex];
  const hasMoreJobs = currentIndex < mockJobs.length;

  // Glass panel styles matching desktop design system
  const glassPanel = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg'
    : 'bg-slate-900/60 backdrop-blur-xl border border-white/10';

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!hasMoreJobs) return;

    if (direction === 'right') {
      haptics.success();
      setSavedJobs(prev => [...prev, currentJob.id]);
    } else {
      haptics.light();
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setSavedJobs([]);
    haptics.medium();
  };

  // Get match score color - GOLD for brand consistency
  const getMatchColor = (_score: number) => {
    return 'text-gold'; // All match scores use gold for brand consistency
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header Actions - Simplified, clear toggle */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className={`flex items-center p-1 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
          <button
            onClick={() => { haptics.light(); setViewMode('cards'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-gold text-black shadow-sm'
                : isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <Layers size={16} />
            Swipe
          </button>
          <button
            onClick={() => { haptics.light(); setViewMode('list'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-gold text-black shadow-sm'
                : isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <List size={16} />
            List
          </button>
        </div>
        <button className={`flex items-center gap-2 px-3 py-2 rounded-xl active:scale-95 transition-all ${
          isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800/50 text-slate-400'
        }`}>
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {viewMode === 'cards' ? (
        /* Card Stack View - Redesigned for clarity and brand consistency */
        <div className="flex-1 flex flex-col items-center pt-2 px-4">
          {hasMoreJobs ? (
            <>
              {/* Progress indicator */}
              <div className={`flex items-center gap-1 mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="text-xs font-medium">{currentIndex + 1} of {mockJobs.length}</span>
              </div>

              {/* Card Stack */}
              <div className="relative w-full max-w-sm h-[400px]">
                <AnimatePresence>
                  <motion.div
                    key={currentJob.id}
                    className={`absolute inset-0 rounded-3xl overflow-hidden ${
                      isLight
                        ? 'bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-xl'
                        : 'bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl'
                    }`}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ x: 300, opacity: 0, rotate: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    whileDrag={{ cursor: 'grabbing' }}
                  >
                    {/* Match Score Badge - Primary visual hierarchy (GOLD for brand consistency) */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-3 py-1.5 rounded-full font-bold text-sm bg-gold/20 text-gold border border-gold/30">
                        {currentJob.matchScore}% match
                      </div>
                    </div>

                    {/* Company Logo */}
                    <div className={`h-28 flex items-center justify-center ${
                      isLight ? 'bg-slate-50' : 'bg-slate-800/50'
                    }`}>
                      <img
                        src={currentJob.logo}
                        alt={currentJob.company}
                        className="w-14 h-14 rounded-xl object-contain bg-white p-2 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${currentJob.company}&background=FFC425&color=000`;
                        }}
                      />
                    </div>

                    {/* Job Details - Clear hierarchy */}
                    <div className="p-5">
                      <h2 className={`text-xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {currentJob.title}
                      </h2>
                      <div className={`flex items-center gap-2 mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <Building2 size={14} />
                        <span className="text-sm font-medium">{currentJob.company}</span>
                      </div>

                      {/* Key info - Reduced to essentials */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm ${
                          isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <MapPin size={14} />
                          {currentJob.location}
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${
                          isLight ? 'bg-gold/10 text-amber-700 border border-gold/20' : 'bg-gold/10 text-gold border border-gold/20'
                        }`}>
                          <DollarSign size={14} />
                          {currentJob.salary}
                        </div>
                      </div>

                      {/* Tags - Gold-themed for brand consistency */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {currentJob.tags.map(tag => (
                          <span
                            key={tag}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                              isLight ? 'bg-gold/10 text-amber-700' : 'bg-gold/20 text-gold'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Quick Apply CTA */}
                      <button
                        onClick={() => { haptics.success(); handleSwipe('right'); }}
                        className="w-full py-3 bg-gold text-black font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-gold/20"
                      >
                        <Send size={18} />
                        Quick Apply
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons - Clearer labels */}
              {/* Action Buttons - Equal size for better touch targets (44px+) */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <button
                  onClick={() => handleSwipe('left')}
                  className={`flex flex-col items-center gap-1.5 active:scale-90 transition-transform`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 ${
                    isLight ? 'bg-white text-slate-400 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <X size={28} />
                  </div>
                  <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Skip</span>
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30">
                    <Bookmark size={28} className="text-black" />
                  </div>
                  <span className="text-xs text-gold font-semibold">Save</span>
                </button>
              </div>
            </>
          ) : (
            /* No More Cards - Clearer next action */
            <div className="text-center px-6">
              <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                isLight ? 'bg-gold/10' : 'bg-gold/20'
              }`}>
                <Bookmark size={32} className="text-gold" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                All caught up!
              </h3>
              <p className={`text-sm mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                You saved <span className="font-semibold text-gold">{savedJobs.length}</span> jobs to apply to later
              </p>
              <div className="flex gap-3">
                <button
                  onClick={resetCards}
                  className={`flex-1 px-4 py-3 font-medium rounded-xl active:scale-95 transition-transform ${
                    isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Browse Again
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-gold text-black font-semibold rounded-xl active:scale-95 transition-transform shadow-lg shadow-gold/20"
                >
                  View Saved
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View - Brand-consistent with glassmorphism */
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            {mockJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-2xl active:scale-[0.98] transition-all ${glassPanel}`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1.5 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${job.company}&background=FFC425&color=000`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {job.title}
                      </h3>
                      <span className={`text-xs font-bold shrink-0 ${getMatchColor(job.matchScore)}`}>
                        {job.matchScore}%
                      </span>
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {job.company}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {job.salary}
                      </span>
                      {job.remote && (
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                          isLight ? 'bg-gold/10 text-amber-700' : 'bg-gold/20 text-gold'
                        }`}>
                          Remote
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      haptics.light();
                      setSavedJobs(prev =>
                        prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id]
                      );
                    }}
                    className={`p-2 rounded-lg active:scale-90 transition-all ${
                      savedJobs.includes(job.id)
                        ? 'bg-gold/20'
                        : isLight ? 'bg-slate-100' : 'bg-slate-800'
                    }`}
                  >
                    <Bookmark
                      size={18}
                      className={savedJobs.includes(job.id) ? 'text-gold fill-gold' : isLight ? 'text-slate-400' : 'text-slate-500'}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileJobs;
