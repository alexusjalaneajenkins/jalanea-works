'use client'

/**
 * StatusBadge - Displays application status with appropriate styling
 */

import {
  Bookmark,
  Send,
  Phone,
  Users,
  Gift,
  CheckCircle,
  XCircle,
  LogOut
} from 'lucide-react'
import { type ApplicationStatus, statusConfig } from './types'

interface StatusBadgeProps {
  status: ApplicationStatus
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const iconMap = {
  bookmark: Bookmark,
  send: Send,
  phone: Phone,
  users: Users,
  gift: Gift,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'log-out': LogOut
}

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    iconSize: 12,
    gap: 'gap-1'
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    iconSize: 14,
    gap: 'gap-1.5'
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    iconSize: 16,
    gap: 'gap-2'
  }
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizeStyles = sizeConfig[size]
  const Icon = iconMap[config.icon as keyof typeof iconMap]

  return (
    <span
      className={`
        inline-flex items-center ${sizeStyles.gap} ${sizeStyles.padding}
        rounded-full font-medium
        ${config.bgColor} ${config.color} border ${config.borderColor}
        ${sizeStyles.text}
      `}
    >
      {showIcon && Icon && <Icon size={sizeStyles.iconSize} />}
      {config.label}
    </span>
  )
}

export default StatusBadge
