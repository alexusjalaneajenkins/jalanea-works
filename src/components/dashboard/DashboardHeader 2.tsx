'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import {
  Zap,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'

// ============================================
// DASHBOARD HEADER
// ============================================

export function DashboardHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  // Get user display name or email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-sm border-b border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#ffc425] flex items-center justify-center">
            <Zap size={18} className="text-[#020617]" />
          </div>
          <span className="text-lg font-semibold text-white">
            Jalanea<span className="text-[#ffc425]">Works</span>
          </span>
        </Link>

        {/* Desktop spacer (sidebar contains logo) */}
        <div className="hidden lg:block" />

        {/* User Profile Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors touch-target"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#ffc425]/20 border border-[#ffc425]/30 flex items-center justify-center">
                <span className="text-xs font-semibold text-[#ffc425]">{initials}</span>
              </div>
            )}

            {/* Name (desktop only) */}
            <span className="hidden sm:block text-sm font-medium text-slate-200 max-w-[120px] truncate">
              {displayName}
            </span>

            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 py-2 bg-[#0f172a] border border-slate-700 rounded-xl shadow-xl animate-fadeIn">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
