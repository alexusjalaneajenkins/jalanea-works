'use client'

/**
 * CoverLetterTab - Cover letter workspace
 * Template selection and editor
 */

import { useState } from 'react'
import {
  FileText,
  Sparkles,
  Download,
  Eye,
  CheckCircle
} from 'lucide-react'

interface CoverLetterTabProps {
  jobTitle: string
  companyName: string
  coverLetter: string
  onCoverLetterChange: (content: string) => void
  template: 'professional' | 'casual' | 'direct'
  onTemplateChange: (template: 'professional' | 'casual' | 'direct') => void
  isGenerating?: boolean
  onGenerate?: () => void
}

const templates = [
  {
    id: 'professional' as const,
    name: 'Professional',
    description: 'Formal tone, traditional structure',
    preview: 'Dear Hiring Manager, I am writing to express my interest...'
  },
  {
    id: 'casual' as const,
    name: 'Conversational',
    description: 'Friendly tone, approachable style',
    preview: "Hi! I'm excited to apply for the position of..."
  },
  {
    id: 'direct' as const,
    name: 'Direct',
    description: 'Straight to the point, results-focused',
    preview: 'I bring 5 years of customer service experience and a proven track record...'
  }
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CoverLetterTab({
  jobTitle,
  companyName,
  coverLetter,
  onCoverLetterChange,
  template,
  onTemplateChange,
  isGenerating,
  onGenerate
}: CoverLetterTabProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Choose a Style</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                template === t.id
                  ? 'border-[#ffc425] bg-[#ffc425]/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">{t.name}</span>
                {template === t.id && (
                  <CheckCircle size={16} className="text-[#ffc425]" />
                )}
              </div>
              <p className="text-sm text-slate-500 mb-3">{t.description}</p>
              <p className="text-xs text-slate-400 italic line-clamp-2">{t.preview}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* AI Generate */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#ffc425]" />
            <h3 className="font-semibold text-slate-900">AI Draft</h3>
          </div>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Draft
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Generate a personalized cover letter based on your resume and the job requirements for {jobTitle} at {companyName}.
        </p>
      </Card>

      {/* Editor */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Your Cover Letter</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showPreview
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Eye size={14} />
              Preview
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 min-h-[400px]">
            <div className="max-w-[600px] mx-auto bg-white p-8 shadow-sm rounded-lg">
              <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap">
                {coverLetter || (
                  <p className="text-slate-400 italic">Your cover letter will appear here...</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <textarea
            value={coverLetter}
            onChange={(e) => onCoverLetterChange(e.target.value)}
            placeholder={`Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at ${companyName}...

[Continue writing your cover letter here]

Best regards,
[Your Name]`}
            className="w-full h-[400px] p-4 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50 focus:border-[#ffc425] font-mono"
          />
        )}
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Tips for a Great Cover Letter</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
            <span>Keep it to one page (300-400 words)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
            <span>Address the specific job requirements</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
            <span>Show enthusiasm for the company</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
            <span>Include specific examples from your experience</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}

export default CoverLetterTab
