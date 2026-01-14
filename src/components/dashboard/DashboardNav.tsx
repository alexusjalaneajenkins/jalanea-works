'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Search,
  FolderOpen,
  FileText,
  Settings,
  Zap
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

// ============================================
// NAV ITEMS
// ============================================

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: <Home size={20} /> },
  { label: 'Jobs', href: '/dashboard/jobs', icon: <Search size={20} /> },
  { label: 'Applications', href: '/dashboard/applications', icon: <FolderOpen size={20} /> },
  { label: 'Resume', href: '/dashboard/resume', icon: <FileText size={20} /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
]

// ============================================
// SIDEBAR (DESKTOP)
// ============================================

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#0f172a] border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ffc425] flex items-center justify-center">
            <Zap size={18} className="text-[#020617]" />
          </div>
          <span className="text-lg font-semibold text-white">
            Jalanea<span className="text-[#ffc425]">Works</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 touch-target
                ${isActive
                  ? 'bg-[#ffc425]/10 text-[#ffc425] border border-[#ffc425]/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section - could add help/support link */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="px-3 py-2 text-xs text-slate-500">
          © 2024 Jalanea Works
        </div>
      </div>
    </aside>
  )
}

// ============================================
// BOTTOM NAV (MOBILE)
// ============================================

export function DashboardBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2
                min-w-[64px] touch-target transition-colors
                ${isActive ? 'text-[#ffc425]' : 'text-slate-400'}
              `}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
