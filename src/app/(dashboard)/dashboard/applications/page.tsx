'use client'

/**
 * Applications Tracker Page
 * Track job applications with status updates, interviews, and reminders
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  XCircle,
  Gift,
  Users,
  Send,
  Search,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

import {
  type Application,
  type ApplicationStatus,
  type ApplicationStats,
  ApplicationList,
  ApplicationDetailModal,
  AddApplicationModal,
  UpcomingEventsCard
} from '@/components/applications'

type FilterTab = 'all' | 'saved' | 'applied' | 'interviewing' | 'offers' | 'rejected' | 'archived'

const filterTabs: { id: FilterTab; label: string; statusMatch: ApplicationStatus[] }[] = [
  { id: 'all', label: 'All', statusMatch: [] },
  { id: 'saved', label: 'Saved', statusMatch: ['discovered', 'pocketed', 'saved'] },
  { id: 'applied', label: 'Applied', statusMatch: ['applied'] },
  { id: 'interviewing', label: 'Interviewing', statusMatch: ['screening', 'interviewing'] },
  { id: 'offers', label: 'Offers', statusMatch: ['offer', 'offer_received', 'accepted', 'offer_accepted'] },
  { id: 'rejected', label: 'Rejected', statusMatch: ['rejected', 'withdrawn'] },
  { id: 'archived', label: 'Archived', statusMatch: ['archived'] }
]

export default function ApplicationsPage() {
  const router = useRouter()

  // Data state
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/applications')
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      const data = await response.json()
      setApplications(data.applications || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Filter applications by tab and search
  const filteredApplications = applications.filter(app => {
    // Tab filter
    if (activeTab !== 'all') {
      const tab = filterTabs.find(t => t.id === activeTab)
      if (!tab?.statusMatch.includes(app.status)) return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        app.jobTitle.toLowerCase().includes(query) ||
        app.company.toLowerCase().includes(query) ||
        app.location?.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Get counts for tabs
  const getTabCount = (tabId: FilterTab): number => {
    if (tabId === 'all') return applications.length
    const tab = filterTabs.find(t => t.id === tabId)
    return applications.filter(app => tab?.statusMatch.includes(app.status)).length
  }

  // Handlers
  const handleApplicationClick = useCallback((application: Application) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }, [])

  const handleAddApplication = useCallback(async (
    applicationData: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      })

      if (response.ok) {
        const { application } = await response.json()
        setApplications(prev => [application, ...prev])
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            total: stats.total + 1,
            applied: stats.applied + (application.status === 'applied' ? 1 : 0)
          })
        }
      }
    } catch (err) {
      console.error('Error adding application:', err)
    }
  }, [stats])

  const handleUpdateApplication = useCallback(async (updatedApp: Application) => {
    try {
      const response = await fetch(`/api/applications/${updatedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedApp)
      })

      if (response.ok) {
        const { application } = await response.json()
        setApplications(prev =>
          prev.map(app => app.id === application.id ? { ...app, ...application } : app)
        )
        setSelectedApplication(prev => prev ? { ...prev, ...application } : null)
      }
    } catch (err) {
      console.error('Error updating application:', err)
    }
  }, [])

  const handleDeleteApplication = useCallback(async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== applicationId))
        setIsDetailModalOpen(false)
        setSelectedApplication(null)
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            total: stats.total - 1
          })
        }
      }
    } catch (err) {
      console.error('Error deleting application:', err)
    }
  }, [stats])

  const handleViewPocket = useCallback((application: Application) => {
    if (application.pocketId) {
      router.push(`/dashboard/pockets/${application.pocketId}`)
    } else if (application.jobId) {
      router.push(`/dashboard/jobs/${application.jobId}`)
    }
  }, [router])

  const handleUpcomingEventClick = useCallback((applicationId: string) => {
    const application = applications.find(app => app.id === applicationId)
    if (application) {
      handleApplicationClick(application)
    }
  }, [applications, handleApplicationClick])

  // Error state
  if (error && !isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <XCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Applications</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-6 py-3 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!isLoading && applications.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Applications</h1>
            <p className="text-slate-400 mt-1">Track your job applications</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors touch-target w-fit"
          >
            <Plus size={20} />
            <span>Add Application</span>
          </button>
        </div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 sm:p-12"
        >
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/jobs"
                className="flex items-center gap-2 px-6 py-3 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors touch-target"
              >
                <span>Search Jobs</span>
                <ArrowRight size={20} />
              </Link>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors touch-target"
              >
                <Plus size={20} />
                <span>Add Manually</span>
              </button>
            </div>
          </div>
        </motion.div>

        <AddApplicationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddApplication}
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Applications</h1>
          <p className="text-slate-400 mt-1">Track your job applications</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors touch-target w-fit"
        >
          <Plus size={20} />
          <span>Add Application</span>
        </button>
      </div>

      {/* Upcoming Events */}
      <UpcomingEventsCard onEventClick={handleUpcomingEventClick} />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0f172a] border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Send size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.applied}</p>
                <p className="text-sm text-slate-400">Applied</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#0f172a] border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.interviewing}</p>
                <p className="text-sm text-slate-400">Interviewing</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0f172a] border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Gift size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.offers}</p>
                <p className="text-sm text-slate-400">Offers</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#0f172a] border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ffc425]/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#ffc425]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-slate-400">Total</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search applications..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0f172a] border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50 focus:border-transparent"
        />
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {filterTabs.map((tab) => {
          const count = getTabCount(tab.id)
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                transition-colors touch-target
                ${isActive
                  ? 'bg-[#ffc425]/10 text-[#ffc425] border border-[#ffc425]/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              <span>{tab.label}</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs
                ${isActive ? 'bg-[#ffc425]/20' : 'bg-slate-700'}
              `}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Application List */}
      <ApplicationList
        applications={filteredApplications}
        isLoading={isLoading}
        onApplicationClick={handleApplicationClick}
        onEdit={handleApplicationClick}
        onDelete={handleDeleteApplication}
        onViewPocket={handleViewPocket}
      />

      {/* No results */}
      {!isLoading && filteredApplications.length === 0 && applications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search size={40} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No matching applications</h3>
          <p className="text-slate-400">
            {searchQuery
              ? `No applications match "${searchQuery}"`
              : `No applications with ${activeTab} status`}
          </p>
        </motion.div>
      )}

      {/* Modals */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddApplication}
      />

      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedApplication(null)
        }}
        application={selectedApplication}
        onUpdate={handleUpdateApplication}
        onDelete={handleDeleteApplication}
      />
    </div>
  )
}
