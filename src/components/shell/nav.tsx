'use client'

/**
 * nav.tsx
 *
 * Central navigation definitions for the JalaneaWorks dashboard shell.
 */

import {
  Briefcase,
  Compass,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Calendar,
  Users,
  CreditCard,
  MessageSquare
} from 'lucide-react'
import type { ReactNode } from 'react'

export type NavKey =
  | 'home'
  | 'jobs'
  | 'pockets'
  | 'applications'
  | 'resume'
  | 'calendar'
  | 'coach'
  | 'community'
  | 'subscription'
  | 'settings'

export interface NavItem {
  key: NavKey
  label: string
  to: string
  icon: ReactNode
  description?: string
}

export const navItems: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    to: '/dashboard',
    icon: <LayoutDashboard size={18} />,
    description: 'Mission Control dashboard'
  },
  {
    key: 'jobs',
    label: 'Job Search',
    to: '/dashboard/jobs',
    icon: <Compass size={18} />,
    description: 'Browse entry-level opportunities'
  },
  {
    key: 'pockets',
    label: 'My Pockets',
    to: '/dashboard/pockets',
    icon: <FolderOpen size={18} />,
    description: 'Your job intelligence reports'
  },
  {
    key: 'applications',
    label: 'Applications',
    to: '/dashboard/applications',
    icon: <Briefcase size={18} />,
    description: 'Track your applications'
  },
  {
    key: 'resume',
    label: 'Resume',
    to: '/dashboard/resume',
    icon: <FileText size={18} />,
    description: 'Build your resume'
  },
  {
    key: 'calendar',
    label: 'Calendar',
    to: '/dashboard/calendar',
    icon: <Calendar size={18} />,
    description: 'Shadow calendar'
  },
  {
    key: 'coach',
    label: 'Coach',
    to: '/dashboard/coach',
    icon: <MessageSquare size={18} />,
    description: 'Career coaching AI'
  },
  {
    key: 'community',
    label: 'Community',
    to: '/dashboard/community',
    icon: <Users size={18} />,
    description: 'Connect with others'
  },
  {
    key: 'subscription',
    label: 'Subscription',
    to: '/dashboard/subscription',
    icon: <CreditCard size={18} />,
    description: 'Manage your plan'
  },
  {
    key: 'settings',
    label: 'Settings',
    to: '/dashboard/settings',
    icon: <Settings size={18} />,
    description: 'Account settings'
  }
]

// Primary navigation items shown in sidebar
export const primaryNavItems = navItems.filter(item =>
  ['home', 'jobs', 'pockets', 'applications', 'resume'].includes(item.key)
)

// Secondary navigation items
export const secondaryNavItems = navItems.filter(item =>
  ['calendar', 'coach', 'community'].includes(item.key)
)

// Footer navigation items
export const footerNavItems = navItems.filter(item =>
  ['subscription', 'settings'].includes(item.key)
)
