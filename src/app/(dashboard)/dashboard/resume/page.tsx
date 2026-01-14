'use client'

import { FileText, Plus, Sparkles, ArrowRight } from 'lucide-react'

// ============================================
// RESUME PAGE (Empty State)
// ============================================
// Task 4.1: Create empty resume page
// Will be implemented in Week 9 with Resume Studio

export default function ResumePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Resume</h1>
          <p className="text-slate-400 mt-1">
            Build and optimize your resume
          </p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
            <FileText size={40} className="text-slate-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Create your first resume
          </h2>
          <p className="text-slate-400 max-w-md mb-6">
            Our Resume Studio helps you build an ATS-optimized resume that
            gets past automated filters and into human hands.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors touch-target">
            <Plus size={20} />
            <span>Create Resume</span>
          </button>
        </div>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            ATS Optimization
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Get a score out of 100 and suggestions to improve your resume&apos;s
            chances of passing automated screening systems.
          </p>
          <div className="text-sm text-slate-500">Coming Soon</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
            <ArrowRight size={24} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Skills Translation
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Transform retail/service experience into professional language
            that office employers want to see.
          </p>
          <div className="text-sm text-[#ffc425]">Starter Tier</div>
        </div>
      </div>
    </div>
  )
}
