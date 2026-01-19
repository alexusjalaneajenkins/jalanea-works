'use client'

/**
 * JobIntelTab - Clean job insights display
 * Modern card-based layout with white cards on light background
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Lightbulb,
  Flame,
  Calendar,
  Play,
  ExternalLink,
  Building2,
  Target
} from 'lucide-react'
import type { PocketTier1Data } from '@/components/jobs/PocketTier1'

interface JobIntelTabProps {
  data: PocketTier1Data
  jobDescription?: string
  companyInfo?: {
    name: string
    size?: string
    industry?: string
    website?: string
  }
}

// Card wrapper for consistent styling
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// Section header
function SectionHeader({ icon: Icon, title }: { icon: typeof MapPin; title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
      <Icon size={14} />
      {title}
    </h3>
  )
}

export function JobIntelTab({ data, jobDescription, companyInfo }: JobIntelTabProps) {
  const [expandedProof, setExpandedProof] = useState<number | null>(null)

  const matchScore = data.matchScore || 85
  const qualStatus = data.qualificationCheck.status

  // Status config
  const statusConfig = {
    QUALIFIED: { label: 'Fully Qualified', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    PARTIALLY_QUALIFIED: { label: 'Partially Qualified', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    NOT_QUALIFIED: { label: 'Not Qualified', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  }
  const status = statusConfig[qualStatus]

  // Format location type
  const formatLocationType = (type: string) => {
    switch (type) {
      case 'on-site': return 'On-Site'
      case 'hybrid': return 'Hybrid'
      case 'remote': return 'Remote'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Match Score */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  className="stroke-[#ffc425]" strokeWidth="3"
                  strokeDasharray={`${matchScore} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">
                {matchScore}%
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Match Score</p>
              <p className={`text-xs ${status.color}`}>{status.label}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          {/* Logistics Pills */}
          {data.logistics && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-700">
                <MapPin size={14} className="text-slate-400" />
                {formatLocationType(data.logistics.locationType)}
                {data.logistics.locationAddress && (
                  <span className="text-slate-400">• {data.logistics.locationAddress}</span>
                )}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-700">
                <Clock size={14} className="text-slate-400" />
                {data.logistics.schedule}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-700">
                <Briefcase size={14} className="text-slate-400" />
                {data.logistics.employmentType}
              </span>

              {data.logistics.payRate && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-sm text-emerald-700 font-medium">
                  <DollarSign size={14} />
                  {data.logistics.payRate}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Requirements */}
        {data.requirements && data.requirements.length > 0 && (
          <Card className="p-5">
            <SectionHeader icon={Target} title="What They Want" />
            <ul className="space-y-3">
              {data.requirements.map((req, i) => (
                <li key={i}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {req.met ? (
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-red-500 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${req.met ? 'text-slate-700' : 'text-red-600'}`}>
                        {req.text}
                      </span>
                    </div>

                    {req.proofPoint && (
                      <button
                        onClick={() => setExpandedProof(expandedProof === i ? null : i)}
                        className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                          expandedProof === i
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="How to prove this"
                      >
                        <MessageCircle size={14} />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {req.proofPoint && expandedProof === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 ml-6 p-3 rounded-lg bg-amber-50 border border-amber-100">
                          <div className="flex items-start gap-2">
                            <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">{req.proofPoint}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Mission / Company Info */}
        <Card className="p-5">
          <SectionHeader icon={Building2} title="The Mission" />
          {data.mission ? (
            <blockquote className="text-slate-700 italic text-base leading-relaxed border-l-4 border-slate-200 pl-4">
              "{data.mission}"
            </blockquote>
          ) : (
            <p className="text-sm text-slate-400">No mission statement available</p>
          )}

          {companyInfo && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap gap-4 text-sm">
                {companyInfo.industry && (
                  <span className="text-slate-600">
                    <span className="text-slate-400">Industry:</span> {companyInfo.industry}
                  </span>
                )}
                {companyInfo.size && (
                  <span className="text-slate-600">
                    <span className="text-slate-400">Size:</span> {companyInfo.size}
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Reality Check */}
      {data.realityCheck && data.realityCheck.length > 0 && (
        <Card className="p-5">
          <SectionHeader icon={AlertTriangle} title="Reality Check" />
          <div className="space-y-3">
            {data.realityCheck.map((item, i) => {
              const intensityConfig = {
                low: { label: 'Easy', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                medium: { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                high: { label: 'Intense', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
              }
              const config = intensityConfig[item.intensity]

              return (
                <div key={i} className={`p-4 rounded-lg ${config.bg} border ${config.border}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Official</p>
                      <p className="text-sm text-slate-600 mb-3">"{item.official}"</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Reality</p>
                      <p className="text-sm text-slate-900 font-medium">{item.reality}</p>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                      {item.intensity === 'high' && <Flame size={12} className="inline mr-1" />}
                      {config.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Skill Gaps */}
      {data.skillGaps && data.skillGaps.length > 0 && (
        <Card className="p-5">
          <SectionHeader icon={AlertTriangle} title="Skill Gaps to Close" />
          <div className="space-y-3">
            {data.skillGaps.map((gap, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div>
                  <p className="font-medium text-slate-900">{gap.skill}</p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Watch "{gap.resourceTitle}"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} />
                    {gap.learnTime}
                  </span>
                  {gap.resourceUrl ? (
                    <a
                      href={gap.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                      <Play size={12} />
                      Watch
                    </a>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-500 text-sm">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Day Timeline */}
      {data.dayTimeline && data.dayTimeline.length > 0 && (
        <Card className="p-5">
          <SectionHeader icon={Calendar} title="A Day in the Life" />
          <div className="relative pl-6 space-y-4">
            {/* Timeline line */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />

            {data.dayTimeline.map((slot, i) => {
              const dotConfig = {
                calm: 'bg-emerald-400',
                busy: 'bg-amber-400',
                rush: 'bg-red-400'
              }

              return (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full ${dotConfig[slot.intensity]} ring-4 ring-white`} />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{slot.time}</span>
                      {slot.intensity === 'rush' && <Flame size={12} className="text-red-400" />}
                    </div>
                    <p className="font-medium text-slate-900">{slot.activity}</p>
                    <p className="text-sm text-slate-500">{slot.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Red Flags */}
      {data.redFlags && data.redFlags.length > 0 && (
        <Card className="p-5 border-red-200 bg-red-50">
          <SectionHeader icon={AlertTriangle} title="Heads Up" />
          <ul className="space-y-2">
            {data.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                {flag}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

export default JobIntelTab
