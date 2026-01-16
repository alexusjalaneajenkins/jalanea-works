/**
 * Settings & Subscription types
 */

// Subscription tiers (4 tiers + owner for admin access)
export type SubscriptionTier = 'essential' | 'starter' | 'professional' | 'max' | 'owner'

export interface SubscriptionPlan {
  id: SubscriptionTier
  name: string
  price: number
  billingPeriod: 'monthly' | 'yearly'
  description: string
  features: string[]
  limitations: string[]
  highlighted?: boolean
}

export interface UserSubscription {
  tier: SubscriptionTier
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

// Usage tracking
export interface UsageStats {
  pocketsGenerated: number
  pocketsLimit: number | null // null = unlimited
  advancedPocketsGenerated: number // 12-page Deep Research reports (Unlimited tier)
  advancedPocketsLimit: number | null
  resumesCreated: number
  resumesLimit: number | null
  applicationsTracked: number
  applicationsLimit: number | null // null = unlimited
  aiSuggestionsUsed: number
  aiSuggestionsLimit: number | null
  aiMessagesUsed: number
  aiMessagesLimit: number | null
}

// User profile
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  location?: string
  linkedinUrl?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// Notification preferences
export interface NotificationPreferences {
  emailApplicationUpdates: boolean
  emailJobAlerts: boolean
  emailWeeklyDigest: boolean
  emailProductUpdates: boolean
  pushInterviewReminders: boolean
  pushApplicationDeadlines: boolean
  pushNewMatches: boolean
}

// Privacy settings
export interface PrivacySettings {
  profileVisible: boolean
  allowDataAnalytics: boolean
  allowPersonalization: boolean
}

// Combined settings state
export interface UserSettings {
  profile: UserProfile
  subscription: UserSubscription
  usage: UsageStats
  notifications: NotificationPreferences
  privacy: PrivacySettings
}

// Subscription plan configurations (4 tiers)
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'essential',
    name: 'Essential',
    price: 15,
    billingPeriod: 'monthly',
    description: 'Perfect for getting started with your job search',
    features: [
      'Access to local job listings',
      'Basic resume builder',
      '5 Job Pockets per month (Tier 1)',
      'Application tracking (up to 20)',
      'LYNX transit integration',
      'Scam Shield protection',
      'Email support'
    ],
    limitations: [
      'Limited AI suggestions',
      'No advanced analytics',
      'Basic resume templates only'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 25,
    billingPeriod: 'monthly',
    description: 'For serious job seekers ready to level up',
    features: [
      'Everything in Essential, plus:',
      '15 Job Pockets per month (Tier 1 & 2)',
      'Unlimited application tracking',
      'AI-powered resume suggestions',
      'Skills Translation Engine',
      'Interview preparation tips',
      'All resume templates',
      'Priority email support'
    ],
    limitations: [
      'No premium deep-dive reports',
      'Limited AI messages'
    ],
    highlighted: true
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 50,
    billingPeriod: 'monthly',
    description: 'For serious job seekers targeting $60k-100k+ roles',
    features: [
      'Everything in Starter, plus:',
      'Unlimited Job Pockets',
      '5 Advanced Job Pockets per month',
      'Unlimited AI messages',
      'Unlimited resume versions',
      '5 Deep Research Reports/month',
      'Economic Events Dashboard',
      'Apply Copilot Enhanced (Smart Answers)',
      'Monthly 15-min strategy call'
    ],
    limitations: []
  },
  {
    id: 'max',
    name: 'Max',
    price: 100,
    billingPeriod: 'monthly',
    description: 'White-glove executive job search support',
    features: [
      'Everything in Professional, plus:',
      '10 Advanced Job Pockets per month',
      '10 Deep Research Reports/month',
      'AI Job Market Analyst',
      'SMS job alerts',
      'Personal career coach (30 min/week)',
      'LinkedIn optimization',
      'Application Concierge (5 jobs/week)',
      'Direct Slack/text access',
      '2-hour priority support'
    ],
    limitations: []
  }
]

// Helper to get plan by tier
export function getPlanByTier(tier: SubscriptionTier): SubscriptionPlan {
  return subscriptionPlans.find(p => p.id === tier) || subscriptionPlans[0]
}

// Helper to check feature access (owner has access to everything)
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: 'tier2Pockets' | 'tier3Pockets' | 'advancedPockets' | 'unlimitedApps' | 'aiSuggestions' | 'allTemplates' | 'unlimitedAI' | 'successCoach' | 'customBranding'
): boolean {
  // Owner has access to all features
  if (tier === 'owner') return true

  switch (feature) {
    case 'tier2Pockets':
      return tier === 'starter' || tier === 'professional' || tier === 'max'
    case 'tier3Pockets':
      return tier === 'professional' || tier === 'max'
    case 'advancedPockets':
      return tier === 'max'
    case 'unlimitedApps':
      return tier === 'starter' || tier === 'professional' || tier === 'max'
    case 'aiSuggestions':
      return tier === 'starter' || tier === 'professional' || tier === 'max'
    case 'allTemplates':
      return tier === 'starter' || tier === 'professional' || tier === 'max'
    case 'unlimitedAI':
      return tier === 'max'
    case 'successCoach':
      return tier === 'max'
    case 'customBranding':
      return tier === 'max'
    default:
      return false
  }
}

// Get tier level for comparison (higher = more features, owner is highest)
export function getTierLevel(tier: SubscriptionTier): number {
  const levels: Record<SubscriptionTier, number> = {
    essential: 1,
    starter: 2,
    professional: 3,
    max: 4,
    owner: 5
  }
  return levels[tier]
}

// Check if upgrade is available
export function canUpgradeTo(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  return getTierLevel(targetTier) > getTierLevel(currentTier)
}
