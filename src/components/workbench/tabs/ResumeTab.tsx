'use client'

/**
 * ResumeTab - Resume tailoring workspace
 * Fork from master resume, tailor for this job
 */

import { useState } from 'react'
import {
  FileText,
  Copy,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react'

interface Resume {
  id: string
  name: string
  template: string
  updatedAt: string
  atsScore?: number
}

interface ResumeTabProps {
  availableResumes: Resume[]
  selectedResumeId?: string
  onForkResume: (resumeId: string) => void
  forkedResumeId?: string
  jobTitle: string
  companyName: string
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function ResumeTab({
  availableResumes,
  selectedResumeId,
  onForkResume,
  forkedResumeId,
  jobTitle,
  companyName
}: ResumeTabProps) {
  const [selectedForFork, setSelectedForFork] = useState<string | null>(selectedResumeId || null)

  const handleFork = () => {
    if (selectedForFork) {
      onForkResume(selectedForFork)
    }
  }

  // If already forked, show the forked resume
  if (forkedResumeId) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Resume Created for This Job</h3>
              <p className="text-sm text-slate-500">Tailored for {jobTitle} at {companyName}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`/dashboard/resume?id=${forkedResumeId}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffc425] text-slate-900 font-medium hover:bg-[#ffcd4a] transition-colors"
            >
              <FileText size={16} />
              Edit Resume
            </a>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              <ExternalLink size={16} />
              Preview
            </button>
          </div>
        </Card>

        {/* AI Suggestions Placeholder */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-[#ffc425]" />
            <h3 className="font-semibold text-slate-900">AI Suggestions</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Based on the job requirements, consider highlighting these in your resume:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-slate-600 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <Sparkles size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span>Emphasize customer service experience and satisfaction metrics</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <Sparkles size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span>Add any experience with healthcare or medical terminology</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <Sparkles size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span>Highlight reliability and attendance record</span>
            </li>
          </ul>
        </Card>
      </div>
    )
  }

  // Fork selection view
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Create a Tailored Resume</h3>
        <p className="text-sm text-slate-500 mb-6">
          Choose a master resume to fork. We'll create a job-specific copy that you can tailor for {companyName}.
        </p>

        {availableResumes.length > 0 ? (
          <>
            <div className="space-y-3 mb-6">
              {availableResumes.map((resume) => (
                <button
                  key={resume.id}
                  onClick={() => setSelectedForFork(resume.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    selectedForFork === resume.id
                      ? 'border-[#ffc425] bg-[#ffc425]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedForFork === resume.id ? 'bg-[#ffc425]/20' : 'bg-slate-100'
                    }`}>
                      <FileText size={20} className={selectedForFork === resume.id ? 'text-[#ffc425]' : 'text-slate-400'} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{resume.name}</p>
                      <p className="text-sm text-slate-500">
                        {resume.template} • Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {resume.atsScore && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-sm text-slate-600">
                      ATS: {resume.atsScore}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleFork}
              disabled={!selectedForFork}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#ffc425] text-slate-900 font-semibold hover:bg-[#ffcd4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy size={18} />
              Fork & Customize for This Job
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">No resumes found</p>
            <a
              href="/dashboard/resume"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
            >
              Create Your First Resume
              <ArrowRight size={16} />
            </a>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ResumeTab
