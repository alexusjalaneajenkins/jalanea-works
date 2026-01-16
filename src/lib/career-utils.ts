/**
 * Utility functions for career path mapping
 */

import type { GrowthRate } from '@/types/career'

/**
 * Generate a program key from school ID and program name
 * This must match the logic in the seed script
 */
export function generateProgramKey(schoolId: string, programName: string): string {
  const cleanName = programName
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // Remove degree type in parentheses
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores

  return `${schoolId}_${cleanName}`
}

/**
 * Format salary range for display
 */
export function formatSalaryRange(min?: number, max?: number): string {
  if (!min && !max) return 'Salary varies'

  const formatK = (n: number) => {
    if (n >= 1000) {
      return `$${Math.round(n / 1000)}K`
    }
    return `$${n.toLocaleString()}`
  }

  if (min && max) {
    return `${formatK(min)} - ${formatK(max)}`
  }

  if (min) return `${formatK(min)}+`
  if (max) return `Up to ${formatK(max)}`

  return 'Salary varies'
}

/**
 * Get growth rate display info
 */
export function getGrowthRateInfo(growthRate?: GrowthRate): {
  label: string
  labelEs: string
  emoji: string
  color: string
} {
  const rates: Record<string, { label: string; labelEs: string; emoji: string; color: string }> = {
    'very high': {
      label: 'Very High Growth',
      labelEs: 'Crecimiento Muy Alto',
      emoji: '🚀',
      color: 'text-green-400',
    },
    'high': {
      label: 'High Growth',
      labelEs: 'Alto Crecimiento',
      emoji: '📈',
      color: 'text-green-400',
    },
    'moderate-high': {
      label: 'Moderate-High Growth',
      labelEs: 'Crecimiento Moderado-Alto',
      emoji: '📈',
      color: 'text-emerald-400',
    },
    'moderate': {
      label: 'Moderate Growth',
      labelEs: 'Crecimiento Moderado',
      emoji: '📊',
      color: 'text-yellow-400',
    },
    'low-moderate': {
      label: 'Low-Moderate Growth',
      labelEs: 'Crecimiento Bajo-Moderado',
      emoji: '📊',
      color: 'text-orange-400',
    },
    'low': {
      label: 'Low Growth',
      labelEs: 'Bajo Crecimiento',
      emoji: '📉',
      color: 'text-red-400',
    },
  }

  return rates[growthRate || 'moderate'] || rates['moderate']
}

/**
 * Get skill category display info
 */
export function getSkillCategoryInfo(category: string): {
  label: string
  labelEs: string
  bgColor: string
} {
  const categories: Record<string, { label: string; labelEs: string; bgColor: string }> = {
    'technical': {
      label: 'Technical',
      labelEs: 'Técnico',
      bgColor: 'bg-blue-500/20 text-blue-300',
    },
    'soft_skill': {
      label: 'Soft Skill',
      labelEs: 'Habilidad Blanda',
      bgColor: 'bg-purple-500/20 text-purple-300',
    },
    'tool': {
      label: 'Tool',
      labelEs: 'Herramienta',
      bgColor: 'bg-green-500/20 text-green-300',
    },
    'process': {
      label: 'Process',
      labelEs: 'Proceso',
      bgColor: 'bg-orange-500/20 text-orange-300',
    },
  }

  return categories[category] || categories['technical']
}
