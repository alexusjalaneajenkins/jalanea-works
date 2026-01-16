/**
 * Settings & Subscription types
 */

// Subscription tiers (4 tiers)
export type SubscriptionTier = 'essential' | 'starter' | 'premium' | 'unlimited'

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
    id: 'premium',
    name: 'Premium',
    price: 75,
    billingPeriod: 'monthly',
    description: 'The complete toolkit for landing your dream job',
    features: [
      'Everything in Starter, plus:',
      '5 Advanced Job Pockets per month (Tier 3)',
      '8-page deep-dive reports',
      'Personalized career coaching',
      'Salary negotiation guides',
      'Company culture analysis',
      'LinkedIn connection mapping',
      'Priority support with 24hr response'
    ],
    limitations: [
      'Limited to 5 Advanced Pockets/month'
    ]
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 150,
    billingPeriod: 'monthly',
    description: 'Go all-in on landing your dream role',
    features: [
      'Everything in Premium, plus:',
      '10 Advanced Job Pockets per month',
      '12-page Deep Research reports',
      'Daily AI Strategy Sessions',
      'Salary Negotiation Coaching',
      'Priority 4-hour support',
      'Success Dashboard with Analytics',
      'Monthly Success Coach call',
      'Custom branding on exports',
      'Unlimited job pockets',
      'Unlimited AI messages',
      'Unlimited resume versions'
    ],
    limitations: []
  }
]

// Helper to get plan by tier
export function getPlanByTier(tier: SubscriptionTier): SubscriptionPlan {
  return subscriptionPlans.find(p => p.id === tier) || subscriptionPlans[0]
}

// Helper to check feature access
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: 'tier2Pockets' | 'tier3Pockets' | 'advancedPockets' | 'unlimitedApps' | 'aiSuggestions' | 'allTemplates' | 'unlimitedAI' | 'successCoach' | 'customBranding'
): boolean {
  switch (feature) {
    case 'tier2Pockets':
      return tier === 'starter' || tier === 'premium' || tier === 'unlimited'
    case 'tier3Pockets':
      return tier === 'premium' || tier === 'unlimited'
    case 'advancedPockets':
      return tier === 'unlimited'
    case 'unlimitedApps':
      return tier === 'starter' || tier === 'premium' || tier === 'unlimited'
    case 'aiSuggestions':
      return tier === 'starter' || tier === 'premium' || tier === 'unlimited'
    case 'allTemplates':
      return tier === 'starter' || tier === 'premium' || tier === 'unlimited'
    case 'unlimitedAI':
      return tier === 'unlimited'
    case 'successCoach':
      return tier === 'unlimited'
    case 'customBranding':
      return tier === 'unlimited'
    default:
      return false
  }
}

// Get tier level for comparison (higher = more features)
export function getTierLevel(tier: SubscriptionTier): number {
  const levels: Record<SubscriptionTier, number> = {
    essential: 1,
    starter: 2,
    premium: 3,
    unlimited: 4
  }
  return levels[tier]
}

// Check if upgrade is available
export function canUpgradeTo(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  return getTierLevel(targetTier) > getTierLevel(currentTier)
}
