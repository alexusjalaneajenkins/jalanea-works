/**
 * Application Tracker Types
 * Updated to match the new API response format
 */

export type ApplicationStatus =
  | 'discovered'        // Job discovered/saved
  | 'pocketed'          // Job pocket generated
  | 'applied'           // Application submitted
  | 'interviewing'      // In interview process
  | 'offer_received'    // Received offer
  | 'offer_accepted'    // Accepted offer
  | 'rejected'          // Rejected by company
  | 'withdrawn'         // Withdrawn by user
  | 'archived'          // Archived
  // Legacy statuses for backward compatibility
  | 'saved'
  | 'screening'
  | 'offer'
  | 'accepted'

export type InterviewType =
  | 'phone'
  | 'video'
  | 'onsite'
  | 'technical'
  | 'behavioral'
  | 'panel'
  | 'case'
  | 'other'
  | 'final'

export interface Interview {
  id: string
  applicationId?: string
  round?: number
  type: InterviewType
  scheduledAt: string
  duration?: number // minutes
  location?: string // for onsite
  locationLat?: number
  locationLng?: number
  transitTimeMinutes?: number
  transitRoute?: string
  meetingLink?: string // for video
  interviewers?: string[] | { name: string; title?: string }[]
  prepCompleted?: boolean
  prepNotes?: string
  notes?: string
  completed: boolean
  completedAt?: string
  outcome?: string
  outcomeNotes?: string
  feedback?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApplicationNote {
  id: string
  applicationId?: string
  content: string
  createdAt: string
  updatedAt?: string
}

export interface ApplicationReminder {
  id: string
  applicationId?: string
  type: 'follow_up' | 'interview_prep' | 'deadline' | 'custom'
  message: string
  dueAt: string
  completed: boolean
  completedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface Application {
  id: string
  userId: string

  // Job info
  jobId?: string // Link to job if from our platform
  jobTitle: string
  company: string
  companyLogo?: string
  companyWebsite?: string
  location: string
  locationAddress?: string
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  jobUrl?: string // External application URL
  description?: string
  requirements?: string
  benefits?: string
  postedAt?: string

  // Application status
  status: ApplicationStatus
  discoveredAt?: string
  pocketedAt?: string
  appliedAt?: string
  firstInterviewAt?: string
  offerReceivedAt?: string
  offerAcceptedAt?: string
  rejectedAt?: string
  applicationMethod?: string
  appliedViaPocket?: boolean

  // Interview tracking
  interviews: Interview[]
  nextInterview?: Interview

  // Offer details
  offerAmount?: number
  offerSalary?: number
  offerEquity?: number
  offerBenefits?: string
  offerDeadline?: string
  offerNotes?: string

  // Rejection details
  rejectionReason?: string
  rejectionFeedback?: string

  // Notes & reminders
  notes: ApplicationNote[]
  reminders: ApplicationReminder[]
  userNotes?: string

  // Job Pocket (if generated)
  hasPocket?: boolean
  pocket?: {
    id: string
    tier: string
    createdAt: string
    expiresAt?: string
  }
  pocketTier?: 'essential' | 'starter' | 'premium' | 'unlimited'
  pocketId?: string

  // Valencia info
  valenciaMatch?: boolean
  valenciaMatchScore?: number
  scamSeverity?: string
  scamFlags?: string[]

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface ApplicationStats {
  total: number
  saved: number
  applied: number
  interviewing: number
  offers: number
  rejected: number
  withdrawn: number
  archived?: number
  responseRate?: number // percentage
  avgTimeToResponse?: number // days
}

export interface UpcomingEvents {
  interviews: Array<{
    id: string
    applicationId: string
    jobTitle: string
    company: string
    type: string
    scheduledAt: string
    duration?: number
    location?: string
    prepCompleted?: boolean
    notes?: string
  }>
  reminders: Array<{
    id: string
    applicationId: string
    jobTitle: string
    company: string
    type: string
    message: string
    dueAt: string
  }>
  summary: {
    totalInterviews: number
    totalReminders: number
    todayInterviews: number
    overdueReminders: number
  }
}

// Status configuration for UI - using Record<string, ...> for flexibility
export const statusConfig: Record<string, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
}> = {
  discovered: {
    label: 'Discovered',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    icon: 'search'
  },
  pocketed: {
    label: 'Pocketed',
    color: 'text-[#ffc425]',
    bgColor: 'bg-[#ffc425]/10',
    borderColor: 'border-[#ffc425]/30',
    icon: 'sparkles'
  },
  saved: {
    label: 'Saved',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    icon: 'bookmark'
  },
  applied: {
    label: 'Applied',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: 'send'
  },
  screening: {
    label: 'Screening',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    icon: 'phone'
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: 'users'
  },
  offer: {
    label: 'Offer',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    icon: 'gift'
  },
  offer_received: {
    label: 'Offer Received',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    icon: 'gift'
  },
  accepted: {
    label: 'Accepted',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: 'check-circle'
  },
  offer_accepted: {
    label: 'Accepted',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: 'check-circle'
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: 'x-circle'
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: 'log-out'
  },
  archived: {
    label: 'Archived',
    color: 'text-slate-500',
    bgColor: 'bg-slate-600/10',
    borderColor: 'border-slate-600/30',
    icon: 'archive'
  }
}

export const interviewTypeConfig: Record<string, {
  label: string
  color: string
  icon: string
}> = {
  phone: { label: 'Phone Screen', color: 'text-blue-400', icon: 'phone' },
  video: { label: 'Video Call', color: 'text-purple-400', icon: 'video' },
  onsite: { label: 'On-site', color: 'text-green-400', icon: 'building' },
  technical: { label: 'Technical', color: 'text-cyan-400', icon: 'code' },
  behavioral: { label: 'Behavioral', color: 'text-yellow-400', icon: 'message-circle' },
  panel: { label: 'Panel', color: 'text-pink-400', icon: 'users' },
  case: { label: 'Case Study', color: 'text-orange-400', icon: 'briefcase' },
  other: { label: 'Other', color: 'text-slate-400', icon: 'calendar' },
  final: { label: 'Final Round', color: 'text-emerald-400', icon: 'flag' }
}

// Helper to get status config with fallback
export function getStatusConfig(status: string) {
  return statusConfig[status] || statusConfig.applied
}

// Helper to get interview type config with fallback
export function getInterviewTypeConfig(type: string) {
  return interviewTypeConfig[type] || interviewTypeConfig.other
}
