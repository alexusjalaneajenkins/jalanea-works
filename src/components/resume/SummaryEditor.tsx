'use client'

/**
 * SummaryEditor - Edit professional summary section
 */

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface SummaryEditorProps {
  summary: string
  onChange: (summary: string) => void
  jobTitle?: string // For AI suggestions
}

export function SummaryEditor({ summary, onChange, jobTitle }: SummaryEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const charCount = summary.length
  const maxChars = 500
  const isOverLimit = charCount > maxChars

  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500))

    const generatedSummary = jobTitle
      ? `Dedicated ${jobTitle} with a proven track record of delivering exceptional results. Skilled in problem-solving, communication, and team collaboration. Seeking to leverage my experience and expertise to contribute to a dynamic organization while continuing to grow professionally.`
      : `Results-driven professional with strong communication and organizational skills. Experienced in fast-paced environments with a commitment to excellence and continuous improvement. Known for reliability, adaptability, and a positive attitude.`

    onChange(generatedSummary)
    setIsGenerating(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Write a brief professional summary highlighting your key qualifications and career goals.
        </p>
        <button
          onClick={handleGenerateSummary}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {isGenerating ? 'Generating...' : 'AI Suggest'}
        </button>
      </div>

      <textarea
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Experienced professional seeking to leverage skills in..."
        rows={5}
        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50 focus:border-transparent resize-none"
      />

      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-500">
          Keep it concise - 2-4 sentences work best
        </p>
        <span className={isOverLimit ? 'text-red-400' : 'text-slate-500'}>
          {charCount}/{maxChars}
        </span>
      </div>
    </div>
  )
}

export default SummaryEditor
