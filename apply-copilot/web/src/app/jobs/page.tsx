'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ExternalLink, Play } from 'lucide-react';
import { useJobsStore } from '@/stores';
import { Button, Input, Card, CardHeader, CardContent } from '@/components/ui';
import { detectJobBoard, getBoardDisplayName, getSupportedBoards } from '@/lib/adapters';
import type { JobBoard } from '@apply-copilot/shared';

export default function JobQueuePage() {
  const { jobs, isLoading, loadJobs, addJob, updateJob, removeJob, getQueuedJobs } = useJobsStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJobUrl, setNewJobUrl] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<JobBoard | null>(null);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleUrlChange = (url: string) => {
    setNewJobUrl(url);
    setUrlError('');

    if (url.trim()) {
      const detected = detectJobBoard(url);
      if (detected) {
        setSelectedBoard(detected);
      } else {
        setUrlError('URL not recognized. Please select a job board manually.');
        setSelectedBoard(null);
      }
    } else {
      setSelectedBoard(null);
    }
  };

  const handleAddJob = async () => {
    if (!newJobUrl.trim() || !selectedBoard) return;

    try {
      await addJob(selectedBoard, newJobUrl, {
        title: newJobTitle || 'Untitled Job',
        company: newJobCompany || 'Unknown Company',
        location: newJobLocation || 'Unknown Location',
      });

      // Reset form
      setNewJobUrl('');
      setNewJobTitle('');
      setNewJobCompany('');
      setNewJobLocation('');
      setSelectedBoard(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add job:', error);
    }
  };

  const queuedJobs = getQueuedJobs();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-semibold">Job Queue</h1>
          </div>
          <Button
            variant={showAddForm ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : <><Plus className="w-5 h-5 mr-1" /> Add</>}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Add Job Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Add Job to Queue</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  label="Job URL"
                  type="url"
                  value={newJobUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Paste job URL here..."
                  error={urlError}
                />
                {selectedBoard && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    Detected: {getBoardDisplayName(selectedBoard)}
                  </p>
                )}
              </div>

              {!selectedBoard && newJobUrl && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Job Board
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {getSupportedBoards().map((board) => (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => setSelectedBoard(board.id)}
                        className={`p-3 rounded-xl border text-center transition-colors ${
                          selectedBoard === board.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                        }`}
                      >
                        {board.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Input
                label="Job Title"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                placeholder="Software Engineer"
              />
              <Input
                label="Company"
                value={newJobCompany}
                onChange={(e) => setNewJobCompany(e.target.value)}
                placeholder="Acme Corp"
              />
              <Input
                label="Location"
                value={newJobLocation}
                onChange={(e) => setNewJobLocation(e.target.value)}
                placeholder="San Francisco, CA"
              />

              <Button
                className="w-full"
                disabled={!newJobUrl.trim() || !selectedBoard}
                onClick={handleAddJob}
              >
                Add to Queue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Queue Stats */}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-gray-500">
            {queuedJobs.length} job{queuedJobs.length !== 1 ? 's' : ''} in queue
          </span>
          {queuedJobs.length > 0 && (
            <Link href="/apply">
              <Button size="sm">
                <Play className="w-4 h-4 mr-1" />
                Start Sprint
              </Button>
            </Link>
          )}
        </div>

        {/* Jobs List */}
        {queuedJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No jobs in queue</p>
            <Button variant="secondary" onClick={() => setShowAddForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add your first job
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {queuedJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {job.company} • {job.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {getBoardDisplayName(job.source)}
                      </span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-500 hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeJob(job.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
