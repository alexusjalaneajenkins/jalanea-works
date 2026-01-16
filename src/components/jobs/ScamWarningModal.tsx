'use client'

/**
 * ScamWarningModal - Warns users about HIGH severity job listings
 *
 * Shown when a user tries to view a job with HIGH scam risk.
 * Requires explicit checkbox confirmation to proceed.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ShieldAlert, X, ArrowLeft, Eye, CheckSquare, Square } from 'lucide-react'
import type { ScamFlag } from '@/lib/scam-shield'

interface ScamWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  jobTitle?: string
  companyName?: string
  flags: ScamFlag[]
}

export function ScamWarningModal({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  companyName,
  flags
}: ScamWarningModalProps) {
  // Reset checkbox state when modal opens
  const [isConfirmed, setIsConfirmed] = useState(false)

  // Reset confirmation when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsConfirmed(false)
    }
  }, [isOpen])

  // Get unique descriptions
  const flagDescriptions = [...new Set(flags.map(f => f.description))]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[50%] translate-y-[-50%] sm:inset-auto sm:left-[50%] sm:translate-x-[-50%] sm:max-w-md sm:w-full z-50"
          >
            <div className="bg-[#0f172a] border border-orange-500/30 rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-orange-500/10 border-b border-orange-500/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert size={24} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                      <AlertTriangle size={18} />
                      Potential Job Scam Warning
                    </h2>
                    <p className="text-sm text-[#94a3b8] mt-0.5">
                      Please review before proceeding
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-[#1e293b] text-[#64748b] hover:text-[#e2e8f0] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Job Info */}
                {(jobTitle || companyName) && (
                  <div className="p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]">
                    <p className="text-sm text-[#94a3b8]">Job listing:</p>
                    <p className="font-semibold text-[#e2e8f0]">{jobTitle || 'Untitled'}</p>
                    {companyName && (
                      <p className="text-sm text-[#64748b]">{companyName}</p>
                    )}
                  </div>
                )}

                {/* Warning Message */}
                <div className="space-y-3">
                  <p className="text-[#e2e8f0]">
                    This job listing has some red flags that may indicate a scam:
                  </p>

                  {/* Flag List */}
                  <ul className="space-y-2">
                    {flagDescriptions.map((description, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span className="text-[#94a3b8]">{description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="p-3 rounded-lg bg-[#1e293b]/30 border border-[#334155]">
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    This doesn't necessarily mean it's a scam, but please be cautious.
                    Never send money, share bank details, or provide sensitive personal
                    information before verifying the employer's legitimacy.
                  </p>
                </div>

                {/* Safety Tips */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                    Safety Tips
                  </p>
                  <ul className="text-xs text-[#94a3b8] space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Research the company on LinkedIn and Google
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Verify the job posting on the company's official website
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Never pay for training or equipment upfront
                    </li>
                  </ul>
                </div>

                {/* Confirmation Checkbox */}
                <button
                  type="button"
                  onClick={() => setIsConfirmed(!isConfirmed)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155] hover:border-orange-500/30 transition-colors text-left"
                >
                  {isConfirmed ? (
                    <CheckSquare size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square size={20} className="text-[#64748b] flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm text-[#94a3b8]">
                    I understand this job may be a scam and I will verify the company before
                    sharing any personal information or making any payments.
                  </span>
                </button>
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#0a0f1a] border-t border-[#1e293b] flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#334155] text-[#e2e8f0] font-medium hover:bg-[#1e293b] transition-colors"
                >
                  <ArrowLeft size={18} />
                  Go Back
                </button>
                <button
                  onClick={onConfirm}
                  disabled={!isConfirmed}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-colors ${
                    isConfirmed
                      ? 'bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30 cursor-pointer'
                      : 'bg-[#1e293b]/50 border-[#334155] text-[#64748b] cursor-not-allowed'
                  }`}
                >
                  <Eye size={18} />
                  {isConfirmed ? 'View Anyway' : 'Check box to continue'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ScamWarningModal
