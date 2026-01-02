import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Building2, Calendar, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';

type ApplicationStatus = 'applied' | 'review' | 'interview' | 'offer';

interface Application {
  id: string;
  company: string;
  position: string;
  logo: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdate: string;
  salary?: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  applied: { label: 'Applied', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  review: { label: 'In Review', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  interview: { label: 'Interview', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  offer: { label: 'Offer', color: 'text-green-500', bgColor: 'bg-green-500/10' },
};

const mockApplications: Application[] = [
  {
    id: '1',
    company: 'Stripe',
    position: 'Product Designer',
    logo: 'https://logo.clearbit.com/stripe.com',
    status: 'interview',
    appliedDate: 'Dec 15, 2025',
    lastUpdate: '2 days ago',
    salary: '$120k - $150k',
  },
  {
    id: '2',
    company: 'Netflix',
    position: 'Frontend Engineer',
    logo: 'https://logo.clearbit.com/netflix.com',
    status: 'applied',
    appliedDate: 'Dec 20, 2025',
    lastUpdate: '5 days ago',
    salary: '$140k - $180k',
  },
  {
    id: '3',
    company: 'Airbnb',
    position: 'UX Researcher',
    logo: 'https://logo.clearbit.com/airbnb.com',
    status: 'review',
    appliedDate: 'Dec 18, 2025',
    lastUpdate: '3 days ago',
    salary: '$100k - $130k',
  },
  {
    id: '4',
    company: 'Google',
    position: 'Software Engineer',
    logo: 'https://logo.clearbit.com/google.com',
    status: 'offer',
    appliedDate: 'Nov 28, 2025',
    lastUpdate: 'Yesterday',
    salary: '$150k - $200k',
  },
  {
    id: '5',
    company: 'Meta',
    position: 'Product Manager',
    logo: 'https://logo.clearbit.com/meta.com',
    status: 'applied',
    appliedDate: 'Dec 22, 2025',
    lastUpdate: '1 day ago',
    salary: '$130k - $170k',
  },
];

export const MobileTracker: React.FC = () => {
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all');
  const [applications] = useState<Application[]>(mockApplications);

  const filteredApplications = activeTab === 'all'
    ? applications
    : applications.filter(app => app.status === activeTab);

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    review: applications.filter(a => a.status === 'review').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
  };

  const tabs = [
    { id: 'all' as const, label: 'All', count: statusCounts.all },
    { id: 'applied' as const, label: 'Applied', count: statusCounts.applied },
    { id: 'review' as const, label: 'Review', count: statusCounts.review },
    { id: 'interview' as const, label: 'Interview', count: statusCounts.interview },
    { id: 'offer' as const, label: 'Offers', count: statusCounts.offer },
  ];

  return (
    <div className="flex flex-col">
      {/* Stats Summary */}
      <div className="px-4 py-3">
        <div className={`grid grid-cols-4 gap-2 p-3 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}>
          {(['applied', 'review', 'interview', 'offer'] as ApplicationStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => { haptics.light(); setActiveTab(status); }}
              className="text-center"
            >
              <div className={`text-xl font-bold ${statusConfig[status].color}`}>
                {statusCounts[status]}
              </div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {statusConfig[status].label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { haptics.light(); setActiveTab(tab.id); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-gold text-black'
                  : isLight
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-slate-800 text-slate-400'
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
              {filteredApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={app.logo}
                      alt={app.company}
                      className="w-12 h-12 rounded-xl object-contain bg-white p-1"
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
                          className={`p-1.5 rounded-lg ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}
                        >
                          <MoreHorizontal size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusConfig[app.status].bgColor} ${statusConfig[app.status].color}`}>
                          {statusConfig[app.status].label}
                        </span>
                        {app.salary && (
                          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {app.salary}
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center justify-between mt-3 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-700'}`}>
                        <div className={`flex items-center gap-1 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Calendar size={12} />
                          Applied {app.appliedDate}
                        </div>
                        <button
                          onClick={() => haptics.light()}
                          className="flex items-center gap-1 text-xs text-gold font-medium"
                        >
                          View <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <Building2 size={28} className={isLight ? 'text-slate-400' : 'text-slate-600'} />
              </div>
              <h3 className={`font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                No applications yet
              </h3>
              <p className={`text-sm text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Start applying to jobs to track your progress here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Application FAB */}
      <button
        onClick={() => haptics.medium()}
        className="fixed right-4 bottom-24 w-14 h-14 bg-gold rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        style={{ zIndex: 40 }}
      >
        <Plus size={24} className="text-black" />
      </button>
    </div>
  );
};

export default MobileTracker;
