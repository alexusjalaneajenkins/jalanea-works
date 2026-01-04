/**
 * Apply Co-Pilot Page
 *
 * A PRO-only feature that helps users apply to jobs faster.
 * Includes: Vault, Queue, Apply Sprint, and Tracker screens.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  useVaultStore,
  useJobsStore,
  type ApplicationVault,
  type JobLead,
  type VaultExport,
  validateVaultImport,
  getBoardDisplayName,
  getJobDisplayTitle,
  getJobDisplaySubtitle,
  VAULT_SCHEMA_VERSION,
} from '../features/copilot';
import {
  Database,
  ListPlus,
  Rocket,
  BarChart3,
  User,
  Briefcase,
  GraduationCap,
  Copy,
  Check,
  Download,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  SkipForward,
  CheckCircle,
  Clock,
  FileText,
  Edit3,
  X,
  Save,
} from 'lucide-react';

// ==================== TAB NAVIGATION ====================

type CopilotTab = 'vault' | 'queue' | 'apply' | 'tracker';

const tabs: { id: CopilotTab; label: string; icon: React.ReactNode }[] = [
  { id: 'vault', label: 'Vault', icon: <Database size={18} /> },
  { id: 'queue', label: 'Queue', icon: <ListPlus size={18} /> },
  { id: 'apply', label: 'Apply', icon: <Rocket size={18} /> },
  { id: 'tracker', label: 'Tracker', icon: <BarChart3 size={18} /> },
];

// ==================== ANIMATION VARIANTS ====================

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

// ==================== VAULT TAB ====================

const VaultTab: React.FC = () => {
  const { vault, isLoading, updateVault, loadVault, error: vaultError } = useVaultStore();
  const { isDark } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ApplicationVault>>({});
  const [showExport, setShowExport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  useEffect(() => {
    if (vault) {
      setFormData(vault);
    }
  }, [vault]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateVault(formData);
      setSaveStatus('saved');
      setEditMode(false);
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('[Vault] Save failed:', error);
      setSaveStatus('error');
      // Keep error visible longer
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleExport = () => {
    if (!vault) return;
    const exportData: VaultExport = {
      schemaVersion: VAULT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      vault: {
        firstName: vault.firstName,
        lastName: vault.lastName,
        email: vault.email,
        phone: vault.phone,
        location: vault.location,
        linkedInUrl: vault.linkedInUrl,
        portfolioUrl: vault.portfolioUrl,
        githubUrl: vault.githubUrl,
        workAuthorization: vault.workAuthorization,
        requiresSponsorship: vault.requiresSponsorship,
        workHistory: vault.workHistory,
        education: vault.education,
        desiredJobTitles: vault.desiredJobTitles,
        desiredLocations: vault.desiredLocations,
        remotePreference: vault.remotePreference,
        salaryExpectation: vault.salaryExpectation,
      },
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setImportError('');
    setImportSuccess(false);
    try {
      const data = JSON.parse(importJson);
      if (!validateVaultImport(data)) {
        setImportError('Invalid vault format. Check schema version and required fields.');
        return;
      }
      await updateVault({
        ...data.vault,
        workHistory: data.vault.workHistory || [],
        education: data.vault.education || [],
        resumeAssets: [],
        desiredJobTitles: data.vault.desiredJobTitles || [],
        desiredLocations: data.vault.desiredLocations || [],
      });
      setImportSuccess(true);
      setImportJson('');
      setTimeout(() => setImportSuccess(false), 3000);
    } catch {
      setImportError('Invalid JSON. Please paste valid vault export data.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  const inputClass = `w-full px-4 py-3 rounded-xl border ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  } focus:outline-none focus:ring-2 focus:ring-gold/50`;

  const cardClass = `rounded-2xl p-6 ${
    isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
  }`;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header with actions */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Application Vault
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Your profile data for quick form filling
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Save status indicator */}
          {saveStatus === 'saved' && (
            <span className="text-green-500 text-sm flex items-center gap-1">
              <Check size={14} /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-sm">Save failed</span>
          )}
          <button
            onClick={() => setShowExport(!showExport)}
            className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
          >
            {showExport ? <Upload size={18} /> : <Download size={18} />}
          </button>
          <button
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              saveStatus === 'saving'
                ? 'bg-slate-400 text-slate-600 cursor-wait'
                : 'bg-gold text-jalanea-900 hover:bg-gold/90'
            }`}
          >
            {saveStatus === 'saving' ? 'Saving...' : editMode ? 'Save' : 'Edit'}
          </button>
        </div>
      </motion.div>

      {/* Error banner */}
      {(vaultError || saveStatus === 'error') && (
        <motion.div
          variants={fadeUp}
          className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400"
        >
          <p className="font-medium">Failed to save vault</p>
          <p className="text-sm opacity-80">{vaultError || 'Please try again. Your data is stored locally.'}</p>
        </motion.div>
      )}

      {/* Import/Export Panel */}
      {showExport && (
        <motion.div variants={fadeUp} className={cardClass}>
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Import / Export Vault
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-jalanea-900 font-medium"
            >
              <Download size={18} /> Export Vault
            </button>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste vault JSON here to import..."
              className={`${inputClass} h-32 resize-none`}
            />
            {importError && <p className="text-red-500 text-sm">{importError}</p>}
            {importSuccess && <p className="text-green-500 text-sm">Vault imported successfully!</p>}
            <button
              onClick={handleImport}
              disabled={!importJson.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gold text-gold font-medium disabled:opacity-50"
            >
              <Upload size={18} /> Import Vault
            </button>
          </div>
        </motion.div>
      )}

      {/* Personal Info */}
      <motion.div variants={fadeUp} className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-gold" />
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Personal Info</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>First Name</label>
            {editMode ? (
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={inputClass}
              />
            ) : (
              <p className={`mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{vault?.firstName || '-'}</p>
            )}
          </div>
          <div>
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Name</label>
            {editMode ? (
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={inputClass}
              />
            ) : (
              <p className={`mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{vault?.lastName || '-'}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
            {editMode ? (
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
              />
            ) : (
              <p className={`mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{vault?.email || '-'}</p>
            )}
          </div>
          <div>
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone</label>
            {editMode ? (
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
              />
            ) : (
              <p className={`mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{vault?.phone || '-'}</p>
            )}
          </div>
          <div>
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Location</label>
            {editMode ? (
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                className={inputClass}
              />
            ) : (
              <p className={`mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{vault?.location || '-'}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Links */}
      <motion.div variants={fadeUp} className={cardClass}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Links</h3>
        <div className="space-y-4">
          <div>
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>LinkedIn URL</label>
            {editMode ? (
              <input
                type="url"
                value={formData.linkedInUrl || ''}
                onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                className={inputClass}
              />
            ) : (
              <p className={`mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{vault?.linkedInUrl || '-'}</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== QUEUE TAB ====================

// Job Card Component with edit functionality
const JobCard: React.FC<{
  job: JobLead;
  onUpdate: (id: string, updates: Partial<JobLead>) => void;
  onRemove: (id: string) => void;
  isDark: boolean;
}> = ({ job, onUpdate, onRemove, isDark }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(job.title || '');
  const [editCompany, setEditCompany] = useState(job.company || '');
  const [editLocation, setEditLocation] = useState(job.location || '');

  const cardClass = `rounded-2xl p-4 ${
    isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
  }`;

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDark
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
  } focus:outline-none focus:ring-1 focus:ring-gold/50`;

  const handleSave = () => {
    onUpdate(job.id, {
      title: editTitle.trim() || '',
      company: editCompany.trim() || '',
      location: editLocation.trim() || '',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(job.title || '');
    setEditCompany(job.company || '');
    setEditLocation(job.location || '');
    setIsEditing(false);
  };

  const openJob = () => {
    window.open(job.url, '_blank', 'noopener,noreferrer');
  };

  if (isEditing) {
    return (
      <motion.div variants={fadeUp} className={cardClass}>
        <div className="space-y-3">
          <div>
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Job Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
              className={inputClass}
            />
          </div>
          <div>
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Company
            </label>
            <input
              type="text"
              value={editCompany}
              onChange={(e) => setEditCompany(e.target.value)}
              placeholder="e.g., Google"
              className={inputClass}
            />
          </div>
          <div>
            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Location
            </label>
            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              placeholder="e.g., Remote, New York, NY"
              className={inputClass}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-gold text-jalanea-900 font-medium text-sm"
            >
              <Save size={14} /> Save
            </button>
            <button
              onClick={handleCancel}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} className={cardClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {getJobDisplayTitle(job)}
          </h3>
          <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {getJobDisplaySubtitle(job)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gold/20 text-gold">
              {getBoardDisplayName(job.source)}
            </span>
            {job.sourceHostname && (
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {job.sourceHostname}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={openJob}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            title="Open job posting"
          >
            <ExternalLink size={16} className="text-gold" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            title="Edit details"
          >
            <Edit3 size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </button>
          <button
            onClick={() => onRemove(job.id)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            title="Remove from queue"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const QueueTab: React.FC = () => {
  const { jobs, isLoading, loadJobs, addJob, updateJob, removeJob, error: storeError } = useJobsStore();
  const { isDark } = useTheme();
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const queuedJobs = jobs.filter((job) => job.status === 'queued');

  useEffect(() => {
    console.log('[QueueTab] Initializing - calling loadJobs()');
    loadJobs();
  }, [loadJobs]);

  // Log when jobs change
  useEffect(() => {
    console.log('[QueueTab] Jobs state updated:', jobs.length, 'total,', queuedJobs.length, 'queued');
  }, [jobs.length, queuedJobs.length]);

  const handleAddJob = async () => {
    setError('');
    const urlToAdd = newUrl.trim();

    if (!urlToAdd) {
      setError('Please enter a job URL.');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlToAdd);
    } catch {
      setError('Please enter a valid URL.');
      return;
    }

    console.log('[QueueTab] Attempting to add job:', urlToAdd);
    setIsAdding(true);

    try {
      const job = await addJob(urlToAdd);
      console.log('[QueueTab] addJob returned:', job);

      if (job && job.id) {
        console.log('[QueueTab] ✓ Job added successfully:', job.id, job.source, job.sourceHostname);
        setNewUrl(''); // Only clear on definitive success
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 2000);
      } else {
        console.error('[QueueTab] addJob returned falsy or missing id:', job);
        setError('Failed to add job - please try again.');
      }
    } catch (err) {
      console.error('[QueueTab] Exception in addJob:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to add job: ${message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const cardClass = `rounded-2xl p-4 ${
    isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
  }`;

  const inputClass = `flex-1 px-4 py-3 rounded-xl border ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  } focus:outline-none focus:ring-2 focus:ring-gold/50`;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Job Queue</h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Add job URLs to your apply queue
        </p>
      </motion.div>

      {/* Add Job */}
      <motion.div variants={fadeUp} className={cardClass}>
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddJob()}
            placeholder="Paste any job URL..."
            className={inputClass}
            disabled={isAdding}
          />
          <button
            onClick={handleAddJob}
            disabled={isAdding}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              isAdding
                ? 'bg-slate-600 text-slate-400 cursor-wait'
                : 'bg-gold text-jalanea-900 hover:bg-gold/90'
            }`}
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-jalanea-900/30 border-t-jalanea-900 rounded-full animate-spin" />
            ) : (
              <Plus size={20} />
            )}
          </button>
        </div>
        <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Supports Indeed, LinkedIn, ZipRecruiter, Glassdoor, and other job sites
        </p>
        {error && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {storeError && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-amber-400 text-sm">Store: {storeError}</p>
          </div>
        )}
      </motion.div>

      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 flex items-center gap-2">
          <Check size={16} /> Job added to queue!
        </div>
      )}

      {/* Job List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
        </div>
      ) : queuedJobs.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-10">
          <ListPlus size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No jobs in queue</p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Add job URLs to get started
          </p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="space-y-3">
          {queuedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onUpdate={updateJob}
              onRemove={removeJob}
              isDark={isDark}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

// ==================== APPLY TAB ====================

const ApplyTab: React.FC = () => {
  const { vault } = useVaultStore();
  const { jobs, currentTask, startApplyTask, completeApplyTask, cancelApplyTask, updateJob, loadJobs } = useJobsStore();
  const { isDark } = useTheme();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const queuedJobs = jobs.filter((job) => job.status === 'queued');
  const currentJob = currentTask
    ? jobs.find((j) => j.id === currentTask.jobLeadId)
    : queuedJobs[0];

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenJob = () => {
    if (currentJob) {
      window.open(currentJob.url, '_blank', 'noopener,noreferrer');
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

  const cardClass = `rounded-2xl p-5 ${
    isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
  }`;

  if (!vault?.firstName) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center py-16">
        <Database size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Set up your vault first</p>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Add your info to the Vault tab to get started
        </p>
      </motion.div>
    );
  }

  if (!currentJob) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center py-16">
        <ListPlus size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No jobs in queue</p>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Add jobs to the Queue tab to start applying
        </p>
      </motion.div>
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
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 pb-32">
      {/* Current Job */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentJob.title}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentJob.company}
            </p>
          </div>
          <span className="px-2 py-1 rounded-full text-xs bg-gold/20 text-gold">
            {getBoardDisplayName(currentJob.source)}
          </span>
        </div>
      </motion.div>

      {/* Open Job Button */}
      <motion.div variants={fadeUp}>
        <button
          onClick={handleOpenJob}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gold text-jalanea-900 font-bold text-lg"
        >
          <ExternalLink size={20} />
          Open Job & Start Applying
        </button>
      </motion.div>

      {/* Quick Copy */}
      <motion.div variants={fadeUp} className={cardClass}>
        <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Quick Copy</h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Tap to copy, then paste into the application
        </p>
        <div className="grid grid-cols-2 gap-3">
          {copyButtons.map((item) => (
            <button
              key={item.key}
              onClick={() => copyToClipboard(item.value, item.key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                copiedField === item.key
                  ? 'bg-green-500/10 border-green-500 text-green-500'
                  : isDark
                  ? 'border-slate-700 hover:border-gold/50 hover:bg-slate-700/50'
                  : 'border-slate-200 hover:border-gold/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.label}
                </span>
                {copiedField === item.key ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </div>
              <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.value}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 bg-gradient-to-t from-jalanea-900 to-transparent pt-8 pb-6 px-4 space-y-3">
        <button
          onClick={handleMarkSubmitted}
          disabled={showSuccess}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg ${
            showSuccess ? 'bg-green-500 text-white' : 'bg-gold text-jalanea-900'
          }`}
        >
          <CheckCircle size={20} />
          {showSuccess ? 'Submitted!' : 'Mark as Submitted'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-600 text-slate-300"
        >
          <SkipForward size={18} />
          Skip This Job
        </button>
        <p className="text-center text-xs text-slate-500">
          {Math.max(0, queuedJobs.length - 1)} more job{Math.max(0, queuedJobs.length - 1) !== 1 ? 's' : ''} in queue
        </p>
      </div>

      {/* Copied Toast */}
      {copiedField && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-pulse z-50">
          Copied to clipboard!
        </div>
      )}
    </motion.div>
  );
};

// ==================== TRACKER TAB ====================

const TrackerTab: React.FC = () => {
  const { jobs, trackerEntries, loadJobs, loadTrackerEntries } = useJobsStore();
  const { isDark } = useTheme();

  useEffect(() => {
    loadJobs();
    loadTrackerEntries();
  }, [loadJobs, loadTrackerEntries]);

  const appliedJobs = jobs.filter((job) => job.status === 'applied');

  const cardClass = `rounded-2xl p-4 ${
    isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
  }`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-500/20 text-blue-400';
      case 'under_review':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'interview_scheduled':
      case 'interviewing':
        return 'bg-purple-500/20 text-purple-400';
      case 'offer_received':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Application Tracker</h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {appliedJobs.length} application{appliedJobs.length !== 1 ? 's' : ''} submitted
        </p>
      </motion.div>

      {appliedJobs.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16">
          <BarChart3 size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No applications yet</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Apply to jobs to start tracking
          </p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="space-y-3">
          {appliedJobs.map((job) => {
            const tracker = trackerEntries.find((e) => e.jobLeadId === job.id);
            const status = tracker?.applicationStatus || 'applied';
            return (
              <motion.div key={job.id} variants={fadeUp} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {job.title}
                    </h3>
                    <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {job.company}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(status)}`}>
                        {status.replace(/_/g, ' ')}
                      </span>
                      {job.appliedAt && (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Clock size={12} className="inline mr-1" />
                          {new Date(job.appliedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                  >
                    <ExternalLink size={16} className="text-gold" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

const ApplyCopilot: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<CopilotTab>('vault');

  const renderTab = () => {
    switch (activeTab) {
      case 'vault':
        return <VaultTab />;
      case 'queue':
        return <QueueTab />;
      case 'apply':
        return <ApplyTab />;
      case 'tracker':
        return <TrackerTab />;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-jalanea-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 ${isDark ? 'bg-jalanea-900/95' : 'bg-white/95'} backdrop-blur-lg border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center">
              <Rocket size={20} className="text-jalanea-900" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Apply Co-Pilot
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Apply faster with your vault
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-4 pb-3 gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gold text-jalanea-900 font-semibold'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">{renderTab()}</main>
    </div>
  );
};

export default ApplyCopilot;
