import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Building2, Calendar, ChevronRight, MoreHorizontal, Send, Clock, MessageSquare, Trophy, Bookmark } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';
import type { SavedJob } from '../../types';

/**
 * MobileTracker - Research-driven design applying:
 * - Pipeline visualization: Familiar kanban-style mental model
 * - Status progression: Color-coded stages guide user through process
 * - Actionable items: Each card has clear next actions
 * - Brand consistency: Gold accents, glassmorphism
 */

type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer';

// Gold-themed status config for brand consistency
const statusConfig: Record<ApplicationStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  saved: { label: 'Saved', color: 'text-slate-500', bgColor: 'bg-slate-500/10', icon: Bookmark },
  applied: { label: 'Applied', color: 'text-gold', bgColor: 'bg-gold/10', icon: Send },
  interview: { label: 'Interview', color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: MessageSquare },
  offer: { label: 'Offer', color: 'text-green-500', bgColor: 'bg-green-500/10', icon: Trophy },
};

// Map saved job status to tracker status
const mapStatus = (status: SavedJob['status']): ApplicationStatus => {
  if (status === 'interviewing') return 'interview';
  if (status === 'rejected') return 'applied'; // Show rejected under applied
  return status as ApplicationStatus;
};

// Format date for display
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
};

// Get relative time
const getRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return 'Recently';
  }
};

export const MobileTracker: React.FC = () => {
  const { isLight } = useTheme();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all');

  // Use real saved jobs from user profile
  const savedJobs = userProfile?.savedJobs || [];

  // Transform saved jobs for display
  const applications = useMemo(() => {
    return savedJobs.map(sj => ({
      id: sj.id,
      company: sj.job.company,
      position: sj.job.title,
      logo: sj.job.logo || `https://ui-avatars.com/api/?name=${sj.job.company}&background=FFC425&color=000`,
      status: mapStatus(sj.status),
      appliedDate: formatDate(sj.savedAt),
      lastUpdate: getRelativeTime(sj.savedAt),
      salary: sj.job.salaryRange,
    }));
  }, [savedJobs]);

  // Glass panel styles matching desktop design system
  const glassPanel = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg'
    : 'bg-slate-900/60 backdrop-blur-xl border border-white/10';

  const filteredApplications = activeTab === 'all'
    ? applications
    : applications.filter(app => app.status === activeTab);

  const statusCounts = {
    all: applications.length,
    saved: applications.filter(a => a.status === 'saved').length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
  };

  const tabs = [
    { id: 'all' as const, label: 'All', count: statusCounts.all },
    { id: 'saved' as const, label: 'Saved', count: statusCounts.saved },
    { id: 'applied' as const, label: 'Applied', count: statusCounts.applied },
    { id: 'interview' as const, label: 'Interview', count: statusCounts.interview },
    { id: 'offer' as const, label: 'Offers', count: statusCounts.offer },
  ];

  return (
    <div className="flex flex-col">
      {/* Stats Summary - Visual pipeline with gold accent */}
      <div className="px-4 py-3">
        <div className={`p-4 rounded-2xl ${glassPanel}`}>
          <div className="grid grid-cols-4 gap-3">
            {(['saved', 'applied', 'interview', 'offer'] as ApplicationStatus[]).map((status) => {
              const StatusIcon = statusConfig[status].icon;
              const isActive = activeTab === status;
              return (
                <button
                  key={status}
                  onClick={() => { haptics.light(); setActiveTab(status); }}
                  className={`text-center p-2 rounded-xl transition-all ${
                    isActive
                      ? isLight ? 'bg-slate-100' : 'bg-white/10'
                      : ''
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-1 rounded-lg flex items-center justify-center ${statusConfig[status].bgColor}`}>
                    <StatusIcon size={16} className={statusConfig[status].color} />
                  </div>
                  <div className={`text-lg font-bold ${statusConfig[status].color}`}>
                    {statusCounts[status]}
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {statusConfig[status].label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs - Pill-style for quick switching */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { haptics.light(); setActiveTab(tab.id); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full whitespace-nowrap transition-all active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-gold text-black shadow-sm'
                  : isLight
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-slate-800/50 text-slate-400'
              }`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-black/20 text-black'
                  : isLight
                    ? 'bg-slate-200 text-slate-500'
                    : 'bg-slate-700 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="px-4 pb-24">
        <AnimatePresence mode="popLayout">
          {filteredApplications.length > 0 ? (
            <div className="space-y-3">
              {filteredApplications.map((app, index) => {
                const StatusIcon = statusConfig[app.status].icon;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-2xl active:scale-[0.98] transition-all ${glassPanel}`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={app.logo}
                        alt={app.company}
                        className="w-12 h-12 rounded-xl object-contain bg-white p-1.5 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${app.company}&background=FFC425&color=000`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {app.position}
                            </h3>
                            <div className={`flex items-center gap-1 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              <Building2 size={12} />
                              {app.company}
                            </div>
                          </div>
                          <button
                            onClick={() => haptics.light()}
                            className={`p-1.5 rounded-lg active:scale-90 transition-all ${
                              isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'
                            }`}
                          >
                            <MoreHorizontal size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[app.status].bgColor} ${statusConfig[app.status].color}`}>
                            <StatusIcon size={12} />
                            {statusConfig[app.status].label}
                          </span>
                          {app.salary && (
                            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {app.salary}
                            </span>
                          )}
                        </div>

                        <div className={`flex items-center justify-between mt-3 pt-3 border-t ${
                          isLight ? 'border-slate-100' : 'border-white/5'
                        }`}>
                          <div className={`flex items-center gap-1 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Calendar size={12} />
                            {app.appliedDate}
                          </div>
                          <button
                            onClick={() => haptics.light()}
                            className="flex items-center gap-1 text-xs text-gold font-medium active:scale-95 transition-all"
                          >
                            Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                isLight ? 'bg-gold/10' : 'bg-gold/20'
              }`}>
                <Building2 size={28} className="text-gold" />
              </div>
              <h3 className={`font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                No applications yet
              </h3>
              <p className={`text-sm text-center px-8 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Start applying to jobs to track your progress here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default MobileTracker;
