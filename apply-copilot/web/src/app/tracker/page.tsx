'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, MessageSquare, ChevronDown } from 'lucide-react';
import { useJobsStore } from '@/stores';
import { Button, Card, CardContent } from '@/components/ui';
import { getBoardDisplayName } from '@/lib/adapters';
import type { TrackerEntry } from '@/lib/db';

type ApplicationStatus = TrackerEntry['applicationStatus'];

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'under_review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { value: 'offer_received', label: 'Offer Received', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' },
  { value: 'no_response', label: 'No Response', color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500' },
];

export default function TrackerPage() {
  const { jobs, trackerEntries, loadJobs, loadTrackerEntries, updateTrackerEntry } = useJobsStore();
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadJobs();
    loadTrackerEntries();
  }, [loadJobs, loadTrackerEntries]);

  // Get applied jobs (status = 'applied')
  const appliedJobs = jobs.filter((job) => job.status === 'applied');

  const getStatusColor = (status: ApplicationStatus) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    return option?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    return option?.label || status;
  };

  const handleStatusChange = (jobLeadId: string, newStatus: ApplicationStatus) => {
    updateTrackerEntry(jobLeadId, { applicationStatus: newStatus });
  };

  const handleNotesChange = (jobLeadId: string, newNotes: string) => {
    setNotes((prev) => ({ ...prev, [jobLeadId]: newNotes }));
  };

  const handleNotesSave = (jobLeadId: string) => {
    updateTrackerEntry(jobLeadId, { notes: notes[jobLeadId] });
  };

  const handleFollowUpChange = (jobLeadId: string, date: string) => {
    updateTrackerEntry(jobLeadId, { followUpDate: date });
  };

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">Application Tracker</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-600">{appliedJobs.length}</div>
            <div className="text-xs text-blue-600/70">Applied</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
            <div className="text-2xl font-bold text-purple-600">
              {trackerEntries.filter((e) => e.applicationStatus === 'interviewing' || e.applicationStatus === 'interview_scheduled').length}
            </div>
            <div className="text-xs text-purple-600/70">Interviewing</div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-600">
              {trackerEntries.filter((e) => e.applicationStatus === 'offer_received').length}
            </div>
            <div className="text-xs text-green-600/70">Offers</div>
          </div>
        </div>

        {/* Applied Jobs List */}
        {appliedJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No applications yet</p>
            <Link href="/jobs">
              <Button variant="secondary">Start Applying</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appliedJobs.map((job) => {
              const entry = trackerEntries.find((e) => e.jobLeadId === job.id);
              const status = entry?.applicationStatus || 'applied';
              const isExpanded = expandedJob === job.id;

              return (
                <Card key={job.id}>
                  <CardContent className="p-0">
                    {/* Main Row */}
                    <button
                      className="w-full p-4 text-left"
                      onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {job.company} • {job.location}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                            {job.appliedAt && (
                              <span className="text-xs text-gray-400">
                                {new Date(job.appliedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700 space-y-4">
                        {/* Status Selector */}
                        <div className="pt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Update Status
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {STATUS_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleStatusChange(job.id, option.value)}
                                className={`p-2 text-xs rounded-lg border transition-all ${
                                  status === option.value
                                    ? option.color + ' border-current'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Follow-up Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Follow-up Date
                          </label>
                          <input
                            type="date"
                            value={entry?.followUpDate || ''}
                            onChange={(e) => handleFollowUpChange(job.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            Notes
                          </label>
                          <textarea
                            value={notes[job.id] ?? entry?.notes ?? ''}
                            onChange={(e) => handleNotesChange(job.id, e.target.value)}
                            onBlur={() => handleNotesSave(job.id)}
                            placeholder="Add notes about this application..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 min-h-[80px] resize-none"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button variant="secondary" className="w-full" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Job
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
