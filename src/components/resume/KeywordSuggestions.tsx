'use client'

/**
 * KeywordSuggestions - Display keyword analysis and suggestions
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Search,
  Copy,
  Check
} from 'lucide-react'

export interface KeywordAnalysis {
  matched: string[]
  missing: string[]
  recommended?: string[]
}

export interface KeywordSuggestionsProps {
  keywords: KeywordAnalysis
  jobTitle?: string
  onAddKeyword?: (keyword: string) => void
  onCopyKeywords?: (keywords: string[]) => void
}

export function KeywordSuggestions({
  keywords,
  jobTitle,
  onAddKeyword,
  onCopyKeywords
}: KeywordSuggestionsProps) {
  const [showAllMatched, setShowAllMatched] = useState(false)
  const [showAllMissing, setShowAllMissing] = useState(false)
  const [copiedKeywords, setCopiedKeywords] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const matchRate = keywords.matched.length + keywords.missing.length > 0
    ? Math.round((keywords.matched.length / (keywords.matched.length + keywords.missing.length)) * 100)
    : 0

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword)
    setCopiedKeywords(prev => [...prev, keyword])
    setTimeout(() => {
      setCopiedKeywords(prev => prev.filter(k => k !== keyword))
    }, 2000)
  }

  const handleCopyAllMissing = () => {
    if (onCopyKeywords) {
      onCopyKeywords(keywords.missing)
    } else {
      navigator.clipboard.writeText(keywords.missing.join(', '))
    }
  }

  const filteredMatched = searchTerm
    ? keywords.matched.filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    : keywords.matched

  const filteredMissing = searchTerm
    ? keywords.missing.filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    : keywords.missing

  const displayedMatched = showAllMatched ? filteredMatched : filteredMatched.slice(0, 8)
  const displayedMissing = showAllMissing ? filteredMissing : filteredMissing.slice(0, 8)

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Search size={20} className="text-[#ffc425]" />
          Keyword Analysis
        </h3>
        <div className="text-sm">
          <span className={matchRate >= 70 ? 'text-green-400' : matchRate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
            {matchRate}%
          </span>
          <span className="text-slate-400 ml-1">match rate</span>
        </div>
      </div>

      {jobTitle && (
        <p className="text-sm text-slate-400 mb-4">
          Analyzing keywords for: <span className="text-white">{jobTitle}</span>
        </p>
      )}

      {/* Search Filter */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter keywords..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50 text-sm"
        />
      </div>

      {/* Matched Keywords */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
            <CheckCircle size={16} />
            Found in Resume ({filteredMatched.length})
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {displayedMatched.map((keyword, index) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.02 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-sm border border-green-500/20"
              >
                <CheckCircle size={12} />
                {keyword}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {filteredMatched.length > 8 && (
          <button
            onClick={() => setShowAllMatched(!showAllMatched)}
            className="flex items-center gap-1 mt-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            {showAllMatched ? (
              <>
                <ChevronUp size={14} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Show {filteredMatched.length - 8} more
              </>
            )}
          </button>
        )}
      </div>

      {/* Missing Keywords */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
            <XCircle size={16} />
            Missing from Resume ({filteredMissing.length})
          </h4>
          {filteredMissing.length > 0 && (
            <button
              onClick={handleCopyAllMissing}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Copy size={12} />
              Copy all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {displayedMissing.map((keyword, index) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.02 }}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
                onClick={() => handleCopyKeyword(keyword)}
              >
                {copiedKeywords.includes(keyword) ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <XCircle size={12} />
                )}
                {keyword}
                {onAddKeyword && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddKeyword(keyword)
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {filteredMissing.length > 8 && (
          <button
            onClick={() => setShowAllMissing(!showAllMissing)}
            className="flex items-center gap-1 mt-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            {showAllMissing ? (
              <>
                <ChevronUp size={14} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Show {filteredMissing.length - 8} more
              </>
            )}
          </button>
        )}
      </div>

      {/* Recommended Keywords */}
      {keywords.recommended && keywords.recommended.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-[#ffc425] flex items-center gap-2 mb-3">
            <Lightbulb size={16} />
            Recommended to Add
          </h4>

          <div className="flex flex-wrap gap-2">
            {keywords.recommended.slice(0, 6).map((keyword, index) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ffc425]/10 text-[#ffc425] text-sm border border-[#ffc425]/20 cursor-pointer hover:bg-[#ffc425]/20 transition-colors"
                onClick={() => handleCopyKeyword(keyword)}
              >
                {copiedKeywords.includes(keyword) ? (
                  <Check size={12} />
                ) : (
                  <Lightbulb size={12} />
                )}
                {keyword}
                {onAddKeyword && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddKeyword(keyword)
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-3 bg-slate-800/50 rounded-xl">
        <p className="text-xs text-slate-400">
          <strong className="text-slate-300">Tip:</strong> Click on missing keywords to copy them.
          Add them naturally to your experience bullets or skills section. Only include keywords that
          truthfully reflect your experience.
        </p>
      </div>
    </div>
  )
}

export default KeywordSuggestions
