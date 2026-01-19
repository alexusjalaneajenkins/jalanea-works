'use client'

/**
 * SearchOverlay.tsx
 *
 * Command palette style search overlay for quick navigation.
 * Features:
 * - Keyboard navigation
 * - Recent searches
 * - Quick actions
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Briefcase,
  Clock,
  Compass,
  FileText,
  FolderOpen,
  Search,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { navItems } from './nav'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  href: string
}

const quickActions: QuickAction[] = [
  {
    id: 'jobs',
    label: 'Browse Jobs',
    description: 'Find entry-level opportunities',
    icon: <Compass size={18} />,
    href: '/dashboard/jobs'
  },
  {
    id: 'pocket',
    label: 'New Job Pocket',
    description: 'Create a job intelligence report',
    icon: <FolderOpen size={18} />,
    href: '/dashboard/pockets'
  },
  {
    id: 'resume',
    label: 'Resume Builder',
    description: 'Build and optimize your resume',
    icon: <FileText size={18} />,
    href: '/dashboard/resume'
  },
  {
    id: 'applications',
    label: 'Applications',
    description: 'Track your job applications',
    icon: <Briefcase size={18} />,
    href: '/dashboard/applications'
  }
]

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter actions based on query
  const filteredActions = query.trim()
    ? quickActions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase())
      )
    : quickActions

  // Also search nav items
  const filteredNavItems = query.trim()
    ? navItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const allResults = [...filteredActions, ...filteredNavItems.map(item => ({
    id: item.key,
    label: item.label,
    description: item.description || '',
    icon: item.icon,
    href: item.to
  }))]

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (allResults[selectedIndex]) {
            router.push(allResults[selectedIndex].href)
            onClose()
          }
          break
      }
    },
    [open, onClose, allResults, selectedIndex, router]
  )

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  // Keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-[15vh] -translate-x-1/2 w-full max-w-lg px-4">
        <div className="rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search size={20} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Search pages, actions..."
              className="flex-1 bg-transparent text-foreground text-base placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {allResults.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No results found</p>
              </div>
            ) : (
              <>
                {!query.trim() && (
                  <div className="px-3 py-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Quick Actions
                    </span>
                  </div>
                )}

                <ul className="space-y-1">
                  {allResults.map((item, index) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          router.push(item.href)
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200',
                          selectedIndex === index
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted/30'
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-10 w-10 place-items-center rounded-xl',
                            selectedIndex === index
                              ? 'bg-primary/15 text-primary'
                              : 'bg-muted/50 text-muted-foreground'
                          )}
                        >
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">{item.label}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                        <ArrowRight
                          size={16}
                          className={cn(
                            'text-muted-foreground shrink-0 transition-opacity',
                            selectedIndex === index ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
