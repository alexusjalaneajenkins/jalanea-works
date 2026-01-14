'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardSidebar, DashboardBottomNav, DashboardHeader } from '@/components/dashboard'

// ============================================
// DASHBOARD LAYOUT
// ============================================
// - Desktop: Sidebar on left (fixed)
// - Mobile: Bottom navigation bar
// - Header: User profile button (top-right), Logo (mobile only)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#ffc425] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-dvh bg-[#020617]">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="px-4 py-6 lg:px-6 lg:py-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <DashboardBottomNav />
    </div>
  )
}
