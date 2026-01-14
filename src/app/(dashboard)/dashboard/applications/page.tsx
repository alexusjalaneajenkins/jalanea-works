'use client'

import { FolderOpen, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// ============================================
// APPLICATIONS PAGE (Empty State)
// ============================================
// Task 4.1: Create empty applications page
// Will be implemented in Week 8 with application tracking

export default function ApplicationsPage() {
  // Tab filters
  const tabs = [
    { label: 'All', count: 0 },
    { label: 'Applied', count: 0 },
    { label: 'Interviewing', count: 0 },
    { label: 'Offers', count: 0 },
    { label: 'Rejected', count: 0 },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Applications</h1>
          <p className="text-slate-400 mt-1">
            Track your job applications
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors touch-target w-fit">
          <Plus size={20} />
          <span>Add Application</span>
        </button>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
              transition-colors touch-target
              ${index === 0
                ? 'bg-[#ffc425]/10 text-[#ffc425] border border-[#ffc425]/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
          >
            <span>{tab.label}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs
              ${index === 0 ? 'bg-[#ffc425]/20' : 'bg-slate-700'}
            `}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
            <FolderOpen size={40} className="text-slate-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No applications yet
          </h2>
          <p className="text-slate-400 max-w-md mb-6">
            Start by searching for jobs and applying! We&apos;ll help you track every
            application from discovery to offer.
          </p>
          <Link
            href="/dashboard/jobs"
            className="flex items-center gap-2 px-6 py-3 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors touch-target"
          >
            <span>Search Jobs</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  )
}
