'use client'

import { Search, MapPin, Filter } from 'lucide-react'

// ============================================
// JOBS PAGE (Empty State)
// ============================================
// Task 4.1: Create empty jobs page
// Will be implemented in Week 5 with Indeed API integration

export default function JobsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Jobs</h1>
        <p className="text-slate-400 mt-1">
          Find jobs that match your skills and location
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Job title, keywords..."
            className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-[#ffc425] focus:ring-1 focus:ring-[#ffc425] focus:outline-none transition-colors"
          />
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Orlando, FL"
            defaultValue="Orlando, FL"
            className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-[#ffc425] focus:ring-1 focus:ring-[#ffc425] focus:outline-none transition-colors"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors touch-target">
          <Filter size={20} />
          <span className="sm:hidden">Filters</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
            <Search size={40} className="text-slate-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Job search coming soon!
          </h2>
          <p className="text-slate-400 max-w-md mb-6">
            We&apos;re integrating with job boards to bring you the best entry-level
            positions in Orlando. Check your Daily Plan for curated jobs in the meantime.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors touch-target"
          >
            View Daily Plan
          </button>
        </div>
      </div>
    </div>
  )
}
