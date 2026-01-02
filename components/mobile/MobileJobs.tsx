import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, DollarSign, Building2, Filter, List, Layers } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';

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

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { haptics.light(); setViewMode('cards'); }}
            className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-gold text-black' : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}
          >
            <Layers size={18} />
          </button>
          <button
            onClick={() => { haptics.light(); setViewMode('list'); }}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gold text-black' : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}
          >
            <List size={18} />
          </button>
        </div>
        <button className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {viewMode === 'cards' ? (
        /* Card Stack View */
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {hasMoreJobs ? (
            <>
              {/* Card Stack */}
              <div className="relative w-full max-w-sm h-[420px]">
                <AnimatePresence>
                  <motion.div
                    key={currentJob.id}
                    className={`absolute inset-0 rounded-3xl overflow-hidden shadow-xl ${
                      isLight ? 'bg-white' : 'bg-slate-800'
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
                    {/* Company Logo */}
                    <div className={`h-32 flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>
                      <img
                        src={currentJob.logo}
                        alt={currentJob.company}
                        className="w-16 h-16 rounded-xl object-contain bg-white p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${currentJob.company}&background=FFC425&color=000`;
                        }}
                      />
                    </div>

                    {/* Job Details */}
                    <div className="p-5">
                      <h2 className={`text-xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {currentJob.title}
                      </h2>
                      <div className={`flex items-center gap-2 mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <Building2 size={14} />
                        <span className="text-sm">{currentJob.company}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-700 text-slate-300'}`}>
                          <MapPin size={12} />
                          {currentJob.location}
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${isLight ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400'}`}>
                          <DollarSign size={12} />
                          {currentJob.salary}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {currentJob.tags.map(tag => (
                          <span
                            key={tag}
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${isLight ? 'bg-gold/10 text-gold-dark' : 'bg-gold/20 text-gold'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Match Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Match Score</span>
                          <span className="text-sm font-bold text-gold">{currentJob.matchScore}%</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`}>
                          <div
                            className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full"
                            style={{ width: `${currentJob.matchScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Swipe Hint */}
                      <div className={`text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        ← Swipe to skip • Swipe to save →
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <button
                  onClick={() => handleSwipe('left')}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform ${
                    isLight ? 'bg-white text-red-500' : 'bg-slate-800 text-red-400'
                  }`}
                >
                  <X size={28} />
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <Heart size={32} className="text-black" />
                </button>
              </div>
            </>
          ) : (
            /* No More Cards */
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <Heart size={32} className="text-gold" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                You've seen all jobs!
              </h3>
              <p className={`text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Saved {savedJobs.length} jobs
              </p>
              <button
                onClick={resetCards}
                className="px-6 py-3 bg-gold text-black font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            {mockJobs.map(job => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${job.company}&background=FFC425&color=000`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {job.title}
                    </h3>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {job.company} • {job.salary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-gold">{job.matchScore}% match</span>
                      {job.remote && (
                        <span className={`text-xs px-2 py-0.5 rounded ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
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
                    className="p-2"
                  >
                    <Heart
                      size={20}
                      className={savedJobs.includes(job.id) ? 'text-red-500 fill-red-500' : isLight ? 'text-slate-300' : 'text-slate-600'}
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
