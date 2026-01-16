/**
 * Application State Machine
 * Manages application status transitions with validation
 */

import type { ApplicationStatus } from '@/components/applications/types'

// State configuration with allowed transitions
export const APPLICATION_STATES: Record<string, {
  label: string
  color: string
  description: string
  next: ApplicationStatus[]
}> = {
  discovered: {
    label: 'Discovered',
    color: 'gray',
    description: 'Job discovered but not yet saved',
    // Allow direct apply without pocketing (quick apply flow)
    next: ['pocketed', 'applied', 'archived']
  },
  pocketed: {
    label: 'Pocketed',
    color: 'yellow',
    description: 'Job saved with pocket generated',
    next: ['applied', 'archived']
  },
  saved: {
    label: 'Saved',
    color: 'blue',
    description: 'Job saved for later',
    next: ['applied', 'archived']
  },
  applied: {
    label: 'Applied',
    color: 'blue',
    description: 'Application submitted',
    next: ['screening', 'interviewing', 'rejected', 'withdrawn', 'archived']
  },
  screening: {
    label: 'Screening',
    color: 'cyan',
    description: 'Initial screening phase',
    next: ['interviewing', 'rejected', 'withdrawn', 'archived']
  },
  interviewing: {
    label: 'Interviewing',
    color: 'purple',
    description: 'In interview process',
    next: ['offer', 'offer_received', 'rejected', 'withdrawn', 'archived']
  },
  offer: {
    label: 'Offer',
    color: 'green',
    description: 'Offer received (legacy)',
    next: ['accepted', 'offer_accepted', 'rejected', 'archived']
  },
  offer_received: {
    label: 'Offer Received',
    color: 'green',
    description: 'Offer received',
    next: ['offer_accepted', 'rejected', 'archived']
  },
  accepted: {
    label: 'Accepted',
    color: 'emerald',
    description: 'Offer accepted (legacy)',
    next: ['archived']
  },
  offer_accepted: {
    label: 'Accepted',
    color: 'emerald',
    description: 'Offer accepted',
    next: ['archived']
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    description: 'Application rejected',
    // Allow re-interviewing for callbacks/reconsiderations
    next: ['interviewing', 'archived']
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'orange',
    description: 'Application withdrawn by user',
    next: ['archived']
  },
  archived: {
    label: 'Archived',
    color: 'gray',
    description: 'Application archived',
    next: []
  }
}

/**
 * Check if a status transition is allowed
 */
export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  const fromState = APPLICATION_STATES[from]
  if (!fromState) return false
  return fromState.next.includes(to)
}

/**
 * Get allowed next statuses for a given status
 */
export function getNextStatuses(status: ApplicationStatus): ApplicationStatus[] {
  return APPLICATION_STATES[status]?.next || []
}

/**
 * Get state configuration for a status
 */
export function getStateConfig(status: ApplicationStatus) {
  return APPLICATION_STATES[status] || APPLICATION_STATES.applied
}

/**
 * Validate and perform a status transition
 * Returns the new status if valid, throws error if invalid
 */
export function transition(
  from: ApplicationStatus,
  to: ApplicationStatus
): ApplicationStatus {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid transition from "${from}" to "${to}". ` +
      `Allowed transitions: ${getNextStatuses(from).join(', ') || 'none'}`
    )
  }
  return to
}

/**
 * Get the timestamp field name for a status
 */
export function getStatusTimestampField(status: ApplicationStatus): string | null {
  const fieldMap: Partial<Record<ApplicationStatus, string>> = {
    discovered: 'discoveredAt',
    pocketed: 'pocketedAt',
    applied: 'appliedAt',
    interviewing: 'firstInterviewAt',
    offer_received: 'offerReceivedAt',
    offer_accepted: 'offerAcceptedAt',
    rejected: 'rejectedAt'
  }
  return fieldMap[status] || null
}

/**
 * Get status groups for filtering
 */
export const STATUS_GROUPS = {
  active: ['applied', 'screening', 'interviewing'] as ApplicationStatus[],
  saved: ['discovered', 'pocketed', 'saved'] as ApplicationStatus[],
  offers: ['offer', 'offer_received', 'accepted', 'offer_accepted'] as ApplicationStatus[],
  closed: ['rejected', 'withdrawn', 'archived'] as ApplicationStatus[]
}

/**
 * Check if status is in a specific group
 */
export function isInGroup(
  status: ApplicationStatus,
  group: keyof typeof STATUS_GROUPS
): boolean {
  return STATUS_GROUPS[group].includes(status)
}

/**
 * Get progress percentage for a status (for progress indicators)
 */
export function getStatusProgress(status: ApplicationStatus): number {
  const progressMap: Partial<Record<ApplicationStatus, number>> = {
    discovered: 10,
    pocketed: 15,
    saved: 15,
    applied: 25,
    screening: 40,
    interviewing: 60,
    offer: 85,
    offer_received: 85,
    accepted: 100,
    offer_accepted: 100,
    rejected: 100,
    withdrawn: 100,
    archived: 100
  }
  return progressMap[status] || 0
}

/**
 * Get status priority for sorting (lower = more important)
 */
export function getStatusPriority(status: ApplicationStatus): number {
  const priorityMap: Partial<Record<ApplicationStatus, number>> = {
    offer_received: 1,
    offer: 1,
    offer_accepted: 2,
    accepted: 2,
    interviewing: 3,
    screening: 4,
    applied: 5,
    pocketed: 6,
    saved: 6,
    discovered: 7,
    rejected: 8,
    withdrawn: 9,
    archived: 10
  }
  return priorityMap[status] || 99
}

/**
 * Format status for display
 */
export function formatStatus(status: ApplicationStatus): string {
  return APPLICATION_STATES[status]?.label || status
}

export default {
  APPLICATION_STATES,
  canTransition,
  getNextStatuses,
  getStateConfig,
  transition,
  getStatusTimestampField,
  STATUS_GROUPS,
  isInGroup,
  getStatusProgress,
  getStatusPriority,
  formatStatus
}
