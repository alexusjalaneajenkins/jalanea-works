'use client'

/**
 * StatsCards - Dashboard statistics display
 * Shows key metrics like applications, interviews, offers
 */

import { motion } from 'framer-motion'
import {
  Briefcase,
  MessageSquare,
  Award,
  Calendar,
  TrendingUp,
  Clock,
  type LucideIcon
} from 'lucide-react'

export interface StatCardData {
  label: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'purple' | 'green' | 'gold' | 'orange' | 'slate'
  change?: number // Percentage change from last period
  sublabel?: string
}

interface StatsCardsProps {
  stats: StatCardData[]
  isLoading?: boolean
}

const colorMap = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20'
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20'
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20'
  },
  gold: {
    bg: 'bg-[#ffc425]/10',
    text: 'text-[#ffc425]',
    border: 'border-[#ffc425]/20'
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20'
  },
  slate: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20'
  }
}

function StatCardSkeleton() {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800" />
      </div>
      <div className="h-8 w-16 bg-slate-800 rounded mb-2" />
      <div className="h-4 w-24 bg-slate-800 rounded" />
    </div>
  )
}

function StatCard({ stat, index }: { stat: StatCardData; index: number }) {
  const colors = colorMap[stat.color]
  const Icon = stat.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-6 hover:border-slate-700 transition-colors`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon size={20} className={colors.text} />
        </div>
        {stat.change !== undefined && stat.change !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            stat.change > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            <TrendingUp size={12} className={stat.change < 0 ? 'rotate-180' : ''} />
            {Math.abs(stat.change)}%
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
      <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
      {stat.sublabel && (
        <p className="text-xs text-slate-500 mt-1">{stat.sublabel}</p>
      )}
    </motion.div>
  )
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${Math.min(stats.length, 4)} gap-4`}>
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  )
}

// Pre-configured stat card generators
export function getDefaultStats(data: {
  applications?: number
  interviews?: number
  offers?: number
  daysActive?: number
}): StatCardData[] {
  return [
    {
      label: 'Applications',
      value: data.applications ?? 0,
      icon: Briefcase,
      color: 'blue'
    },
    {
      label: 'Interviews',
      value: data.interviews ?? 0,
      icon: MessageSquare,
      color: 'purple'
    },
    {
      label: 'Offers',
      value: data.offers ?? 0,
      icon: Award,
      color: 'green'
    },
    {
      label: 'Days Active',
      value: data.daysActive ?? 0,
      icon: Calendar,
      color: 'gold'
    }
  ]
}

export default StatsCards
