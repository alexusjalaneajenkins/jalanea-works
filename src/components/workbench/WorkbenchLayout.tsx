'use client'

/**
 * WorkbenchLayout - Main page shell for the Job Pocket Workbench
 * Clean, modern design with horizontal tabs
 */

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  ExternalLink,
  Briefcase,
  FileText,
  Mail,
  ListChecks,
  MessageSquare
} from 'lucide-react'

export type WorkbenchTab = 'intel' | 'resume' | 'cover-letter' | 'tracker' | 'prep'

interface WorkbenchLayoutProps {
  jobTitle: string
  companyName: string
  applicationUrl?: string
  onApply?: () => void
  activeTab: WorkbenchTab
  onTabChange: (tab: WorkbenchTab) => void
  children: ReactNode
}

const tabs: { id: WorkbenchTab; label: string; icon: typeof Briefcase }[] = [
  { id: 'intel', label: 'Job Intel', icon: Briefcase },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'cover-letter', label: 'Cover Letter', icon: Mail },
  { id: 'tracker', label: 'Tracker', icon: ListChecks },
  { id: 'prep', label: 'Prep', icon: MessageSquare },
]

export function WorkbenchLayout({
  jobTitle,
  companyName,
  applicationUrl,
  onApply,
  activeTab,
  onTabChange,
  children
}: WorkbenchLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Back + Title */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/pockets"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </Link>

              <div className="h-6 w-px bg-slate-200" />

              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-slate-900 truncate">
                  {jobTitle}
                </h1>
                <p className="text-sm text-slate-500 truncate">
                  {companyName}
                </p>
              </div>
            </div>

            {/* Apply Button */}
            {applicationUrl && (
              <button
                onClick={onApply}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ffc425] text-slate-900 font-semibold hover:bg-[#ffcd4a] transition-colors shadow-sm"
              >
                <ExternalLink size={16} />
                <span className="hidden sm:inline">Apply Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}

                  {isActive && (
                    <motion.div
                      layoutId="activeWorkbenchTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffc425]"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default WorkbenchLayout
