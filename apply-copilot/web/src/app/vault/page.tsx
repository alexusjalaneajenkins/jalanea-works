'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Share2, Copy, Download, Check } from 'lucide-react';
import { useVaultStore } from '@/stores';
import { Button, Input, Card, CardHeader, CardContent } from '@/components/ui';
import type { WorkHistoryItem, EducationItem, WorkAuthorization } from '@apply-copilot/shared';

type Section = 'profile' | 'work' | 'education';

export default function VaultSetupPage() {
  const { vault, isLoading, loadVault, updateVault, addWorkHistory, updateWorkHistory, removeWorkHistory, addEducation, updateEducation, removeEducation } = useVaultStore();
  const [expandedSection, setExpandedSection] = useState<Section>('profile');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  if (isLoading || !vault) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading vault...</div>
      </div>
    );
  }

  const toggleSection = (section: Section) => {
    setExpandedSection(expandedSection === section ? 'profile' : section);
  };

  /**
   * Current vault export schema version
   * Must match VAULT_SCHEMA_VERSION in extension
   */
  const VAULT_SCHEMA_VERSION = 1;

  /**
   * Generate vault export data for Chrome extension
   * Only exports fields needed for form filling (no files/sensitive data)
   */
  const getExportData = () => {
    if (!vault) return null;
    return {
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
        // Note: workHistory and education are NOT exported to extension
        // to minimize stored data. Extension only needs text fields for filling.
      },
    };
  };

  /**
   * Copy vault data to clipboard
   */
  const handleCopyExport = async () => {
    const exportData = getExportData();
    if (!exportData) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Download vault data as JSON file
   */
  const handleDownloadExport = () => {
    const exportData = getExportData();
    if (!exportData) return;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apply-copilot-vault.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-semibold">Application Vault</h1>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Export Vault for Extension</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export your vault data to use with the Apply Co-Pilot Chrome extension.
              Copy to clipboard or download as a JSON file.
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleCopyExport}
              >
                {exportCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy to Clipboard
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleDownloadExport}
              >
                <Download className="w-5 h-5" />
                Download JSON File
              </Button>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                After exporting, open the Chrome extension popup and click &ldquo;Import Vault&rdquo;
                to paste or upload your vault data.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Profile Section */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('profile')}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Personal Info</h2>
              {expandedSection === 'profile' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSection === 'profile' && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={vault.firstName}
                  onChange={(e) => updateVault({ firstName: e.target.value })}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  value={vault.lastName}
                  onChange={(e) => updateVault({ lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={vault.email}
                onChange={(e) => updateVault({ email: e.target.value })}
                placeholder="john@example.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={vault.phone}
                onChange={(e) => updateVault({ phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
              <Input
                label="Location"
                value={vault.location}
                onChange={(e) => updateVault({ location: e.target.value })}
                placeholder="San Francisco, CA"
              />
              <Input
                label="LinkedIn URL"
                type="url"
                value={vault.linkedInUrl || ''}
                onChange={(e) => updateVault({ linkedInUrl: e.target.value })}
                placeholder="https://linkedin.com/in/johndoe"
              />

              {/* Work Authorization */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Work Authorization
                </label>
                <select
                  value={vault.workAuthorization}
                  onChange={(e) => updateVault({ workAuthorization: e.target.value as WorkAuthorization })}
                  className="w-full px-4 py-3 min-h-[44px] text-base rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="us_citizen">US Citizen</option>
                  <option value="permanent_resident">Permanent Resident</option>
                  <option value="work_visa">Work Visa</option>
                  <option value="student_visa">Student Visa</option>
                  <option value="requires_sponsorship">Requires Sponsorship</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sponsorship"
                  checked={vault.requiresSponsorship}
                  onChange={(e) => updateVault({ requiresSponsorship: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <label htmlFor="sponsorship" className="text-sm text-gray-700 dark:text-gray-300">
                  Requires visa sponsorship now or in the future
                </label>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Work History Section */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('work')}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Work History ({vault.workHistory.length})</h2>
              {expandedSection === 'work' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSection === 'work' && (
            <CardContent className="space-y-4">
              {vault.workHistory.map((item) => (
                <WorkHistoryCard
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => updateWorkHistory(item.id, updates)}
                  onRemove={() => removeWorkHistory(item.id)}
                />
              ))}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => addWorkHistory({
                  company: '',
                  title: '',
                  location: '',
                  startDate: '',
                  isCurrent: false,
                  description: '',
                  highlights: [],
                })}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Work Experience
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('education')}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Education ({vault.education.length})</h2>
              {expandedSection === 'education' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSection === 'education' && (
            <CardContent className="space-y-4">
              {vault.education.map((item) => (
                <EducationCard
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => updateEducation(item.id, updates)}
                  onRemove={() => removeEducation(item.id)}
                />
              ))}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => addEducation({
                  institution: '',
                  degree: '',
                  fieldOfStudy: '',
                  location: '',
                  startDate: '',
                })}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Education
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  );
}

interface WorkHistoryCardProps {
  item: WorkHistoryItem;
  onUpdate: (updates: Partial<WorkHistoryItem>) => void;
  onRemove: () => void;
}

function WorkHistoryCard({ item, onUpdate, onRemove }: WorkHistoryCardProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <Input
            label="Job Title"
            value={item.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Software Engineer"
          />
          <Input
            label="Company"
            value={item.company}
            onChange={(e) => onUpdate({ company: e.target.value })}
            placeholder="Acme Corp"
          />
          <Input
            label="Location"
            value={item.location}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="San Francisco, CA"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="month"
              value={item.startDate}
              onChange={(e) => onUpdate({ startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="month"
              value={item.endDate || ''}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              disabled={item.isCurrent}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`current-${item.id}`}
              checked={item.isCurrent}
              onChange={(e) => onUpdate({ isCurrent: e.target.checked, endDate: e.target.checked ? undefined : item.endDate })}
              className="w-5 h-5 rounded border-gray-300"
            />
            <label htmlFor={`current-${item.id}`} className="text-sm text-gray-700 dark:text-gray-300">
              I currently work here
            </label>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-600 ml-2">
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

interface EducationCardProps {
  item: EducationItem;
  onUpdate: (updates: Partial<EducationItem>) => void;
  onRemove: () => void;
}

function EducationCard({ item, onUpdate, onRemove }: EducationCardProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <Input
            label="Institution"
            value={item.institution}
            onChange={(e) => onUpdate({ institution: e.target.value })}
            placeholder="Stanford University"
          />
          <Input
            label="Degree"
            value={item.degree}
            onChange={(e) => onUpdate({ degree: e.target.value })}
            placeholder="Bachelor of Science"
          />
          <Input
            label="Field of Study"
            value={item.fieldOfStudy}
            onChange={(e) => onUpdate({ fieldOfStudy: e.target.value })}
            placeholder="Computer Science"
          />
          <Input
            label="Location"
            value={item.location}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="Stanford, CA"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="month"
              value={item.startDate}
              onChange={(e) => onUpdate({ startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="month"
              value={item.endDate || ''}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
            />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-600 ml-2">
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
