'use client'

/**
 * Fund Stats Component
 *
 * Displays key community fund statistics.
 */

import { Heart, Users, GraduationCap, DollarSign } from 'lucide-react'

interface FundStatsProps {
  stats: {
    formattedTotalRaised: string
    contributorsCount: number
    studentsHelped: number
    formattedAverageGrant: string
  }
}

export default function FundStats({ stats }: FundStatsProps) {
  const statItems = [
    {
      label: 'Total Raised',
      value: stats.formattedTotalRaised,
      icon: Heart,
      color: 'pink',
      description: 'From subscriber contributions'
    },
    {
      label: 'Contributors',
      value: stats.contributorsCount.toString(),
      icon: Users,
      color: 'purple',
      description: 'Valencia community members'
    },
    {
      label: 'Students Helped',
      value: stats.studentsHelped.toString(),
      icon: GraduationCap,
      color: 'blue',
      description: 'Received assistance'
    },
    {
      label: 'Average Grant',
      value: stats.formattedAverageGrant,
      icon: DollarSign,
      color: 'green',
      description: 'Per student helped'
    }
  ]

  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    pink: { bg: 'bg-pink-100', icon: 'text-pink-600', text: 'text-pink-600' },
    purple: { bg: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-600' }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, idx) => {
        const colors = colorClasses[item.color]
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border p-4 text-center"
          >
            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <item.icon className={`w-6 h-6 ${colors.icon}`} />
            </div>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {item.value}
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
          </div>
        )
      })}
    </div>
  )
}
