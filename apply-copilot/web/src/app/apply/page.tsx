'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Copy, Check, SkipForward, CheckCircle } from 'lucide-react';
import { useVaultStore, useJobsStore } from '@/stores';
import { Button, Card, CardHeader, CardContent } from '@/components/ui';
import { getBoardDisplayName } from '@/lib/adapters';

export default function ApplySprintPage() {
  const { vault, loadVault } = useVaultStore();
  const { jobs, loadJobs, getQueuedJobs, startApplyTask, completeApplyTask, cancelApplyTask, currentTask, updateJob } = useJobsStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadVault();
    loadJobs();
  }, [loadVault, loadJobs]);

  const queuedJobs = getQueuedJobs();
  const currentJob = currentTask
    ? jobs.find((j) => j.id === currentTask.jobLeadId)
    : queuedJobs[0];

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleOpenJob = () => {
    if (currentJob) {
      window.open(currentJob.url, '_blank');
      // Start task if not already started
      if (!currentTask) {
        startApplyTask(currentJob.id);
      }
    }
  };

  const handleMarkSubmitted = () => {
    setShowSuccess(true);
    completeApplyTask({
      id: `proof-${Date.now()}`,
      jobLeadId: currentJob?.id || '',
      capturedAt: new Date().toISOString(),
      userConfirmed: true,
    });
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSkip = () => {
    if (currentJob) {
      updateJob(currentJob.id, { status: 'skipped' });
      if (currentTask) {
        cancelApplyTask();
      }
    }
  };

  if (!vault) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Please set up your vault first</p>
          <Link href="/vault">
            <Button>Go to Vault</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <main className="min-h-screen pb-20">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-semibold">Apply Sprint</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <p className="text-gray-500 mb-4">No jobs in queue</p>
          <Link href="/jobs">
            <Button>Add Jobs to Queue</Button>
          </Link>
        </div>
      </main>
    );
  }

  const copyButtons = [
    { label: 'Full Name', value: `${vault.firstName} ${vault.lastName}`, key: 'name' },
    { label: 'Email', value: vault.email, key: 'email' },
    { label: 'Phone', value: vault.phone, key: 'phone' },
    { label: 'Location', value: vault.location, key: 'location' },
    { label: 'LinkedIn', value: vault.linkedInUrl || '', key: 'linkedin' },
  ].filter((item) => item.value);

  return (
    <main className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold truncate max-w-[200px]">{currentJob.title}</h1>
              <p className="text-sm text-gray-500 truncate max-w-[200px]">{currentJob.company}</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            {getBoardDisplayName(currentJob.source)}
          </span>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Open Job Button */}
        <Button className="w-full text-lg py-4" onClick={handleOpenJob}>
          <ExternalLink className="w-5 h-5 mr-2" />
          Open Job &amp; Start Applying
        </Button>

        {/* Quick Copy Section */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Copy</h2>
            <p className="text-sm text-gray-500">Tap to copy, then paste into the application form</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {copyButtons.map((item) => (
                <button
                  key={item.key}
                  onClick={() => copyToClipboard(item.value, item.key)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    copiedField === item.key
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">{item.label}</span>
                    {copiedField === item.key ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="text-sm font-medium truncate">{item.value}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Work History Quick Copy */}
        {vault.workHistory.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Work Experience</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {vault.workHistory.slice(0, 3).map((job) => (
                <button
                  key={job.id}
                  onClick={() => copyToClipboard(
                    `${job.title} at ${job.company}, ${job.location} (${job.startDate} - ${job.isCurrent ? 'Present' : job.endDate})`,
                    `work-${job.id}`
                  )}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    copiedField === `work-${job.id}`
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.company}</div>
                    </div>
                    {copiedField === `work-${job.id}` ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education Quick Copy */}
        {vault.education.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Education</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {vault.education.slice(0, 2).map((edu) => (
                <button
                  key={edu.id}
                  onClick={() => copyToClipboard(
                    `${edu.degree} in ${edu.fieldOfStudy}, ${edu.institution}`,
                    `edu-${edu.id}`
                  )}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    copiedField === `edu-${edu.id}`
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{edu.degree} in {edu.fieldOfStudy}</div>
                      <div className="text-sm text-gray-500">{edu.institution}</div>
                    </div>
                    {copiedField === `edu-${edu.id}` ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <Button
          className={`w-full text-lg py-4 ${showSuccess ? 'bg-green-500 hover:bg-green-600' : ''}`}
          onClick={handleMarkSubmitted}
          disabled={showSuccess}
        >
          {showSuccess ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Submitted!
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Submitted
            </>
          )}
        </Button>
        <Button variant="ghost" className="w-full" onClick={handleSkip}>
          <SkipForward className="w-5 h-5 mr-2" />
          Skip This Job
        </Button>
        <p className="text-center text-xs text-gray-400">
          {Math.max(0, queuedJobs.length - 1)} more job{Math.max(0, queuedJobs.length - 1) !== 1 ? 's' : ''} in queue
        </p>
      </div>

      {/* Copied Toast */}
      {copiedField && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-pulse z-50">
          Copied to clipboard!
        </div>
      )}
    </main>
  );
}
