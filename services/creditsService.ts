import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// Credit costs for each action
export const CREDIT_COSTS = {
  jobSearch: 1,
  aiChatMessage: 1,
  smartScheduleTask: 1,
  outreachDraft: 2,
  careerPathMatch: 2,
  atsAnalysis: 2,
  readabilityAnalysis: 2,
  resumeTailoring: 3,
  coverLetter: 3,
  companyResearch: 3,
  interviewPrep: 4,
  jobDeepDive: 5,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// Tier configuration
export const TIER_CREDITS = {
  free: 0,
  trialing: 50,
  starter: 300,
  pro: 1200,
  unlimited: Infinity,
  owner: Infinity, // Owner tier
} as const;

export type UserTier = keyof typeof TIER_CREDITS;

// Owner emails - these accounts get unlimited access
const OWNER_EMAILS = [
  'jalaneajenkins@gmail.com',
  'business@jalanea.works',
  'alexxusjenkins91@gmail.com',
];

/**
 * Check if an email belongs to an owner account
 */
export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase());
}

// User credits interface
export interface UserCredits {
  tier: UserTier;
  credits: number;
  creditsUsedThisMonth: number;
  monthlyCreditsLimit: number;
  lastCreditReset: Date | null;
  trialEndsAt: Date | null;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
}

// Default credits for new users (7-day trial - enough time to see value)
export const getDefaultCredits = (): UserCredits => ({
  tier: 'trialing',
  credits: TIER_CREDITS.trialing,
  creditsUsedThisMonth: 0,
  monthlyCreditsLimit: TIER_CREDITS.trialing,
  lastCreditReset: new Date(),
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  stripeCustomerId: null,
  subscriptionId: null,
  subscriptionStatus: 'trialing',
});

/**
 * Get user's credits from Firestore
 */
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();

    // Helper to safely parse number values (prevents NaN)
    const safeNumber = (val: any, fallback: number): number => {
      const num = Number(val);
      return isNaN(num) ? fallback : num;
    };

    // Convert Firestore Timestamps to Dates, with robust NaN protection
    return {
      tier: data.tier || 'trialing',
      credits: safeNumber(data.credits, TIER_CREDITS.trialing),
      creditsUsedThisMonth: safeNumber(data.creditsUsedThisMonth, 0),
      monthlyCreditsLimit: safeNumber(data.monthlyCreditsLimit, TIER_CREDITS.trialing),
      lastCreditReset: data.lastCreditReset?.toDate() || null,
      trialEndsAt: data.trialEndsAt?.toDate() || null,
      stripeCustomerId: data.stripeCustomerId || null,
      subscriptionId: data.subscriptionId || null,
      subscriptionStatus: data.subscriptionStatus || 'trialing',
    };
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return null;
  }
}

/**
 * Initialize credits for a new user
 */
export async function initializeUserCredits(userId: string): Promise<UserCredits> {
  const defaultCredits = getDefaultCredits();

  try {
    await setDoc(doc(db, 'users', userId), {
      tier: defaultCredits.tier,
      credits: defaultCredits.credits,
      creditsUsedThisMonth: defaultCredits.creditsUsedThisMonth,
      monthlyCreditsLimit: defaultCredits.monthlyCreditsLimit,
      lastCreditReset: Timestamp.fromDate(defaultCredits.lastCreditReset!),
      trialEndsAt: Timestamp.fromDate(defaultCredits.trialEndsAt!),
      stripeCustomerId: null,
      subscriptionId: null,
      subscriptionStatus: 'trialing',
    }, { merge: true });

    return defaultCredits;
  } catch (error) {
    console.error('Error initializing user credits:', error);
    throw error;
  }
}

/**
 * Check if user has enough credits for an action
 */
export function hasEnoughCredits(userCredits: UserCredits, action: CreditAction): boolean {
  // Unlimited tier always has enough
  if (userCredits.tier === 'unlimited') {
    return true;
  }

  const cost = CREDIT_COSTS[action];
  return userCredits.credits >= cost;
}

/**
 * Check if user's trial has expired
 */
export function isTrialExpired(userCredits: UserCredits): boolean {
  if (userCredits.subscriptionStatus === 'active') {
    return false; // Paid user
  }

  if (!userCredits.trialEndsAt) {
    return true; // No trial set
  }

  return new Date() > userCredits.trialEndsAt;
}

/**
 * Deduct credits for an action
 */
export async function deductCredits(
  userId: string,
  action: CreditAction
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  try {
    const userCredits = await getUserCredits(userId);

    if (!userCredits) {
      return { success: false, remainingCredits: 0, error: 'User not found' };
    }

    // Check trial expiration
    if (isTrialExpired(userCredits) && userCredits.subscriptionStatus !== 'active') {
      return {
        success: false,
        remainingCredits: 0,
        error: 'Trial expired. Please upgrade to continue.'
      };
    }

    // Unlimited tier doesn't deduct
    if (userCredits.tier === 'unlimited') {
      return { success: true, remainingCredits: Infinity };
    }

    const cost = CREDIT_COSTS[action];

    // Check if enough credits
    if (userCredits.credits < cost) {
      return {
        success: false,
        remainingCredits: userCredits.credits,
        error: `Not enough credits. Need ${cost}, have ${userCredits.credits}.`
      };
    }

    // Deduct credits
    const newCredits = userCredits.credits - cost;
    const newUsed = userCredits.creditsUsedThisMonth + cost;

    await updateDoc(doc(db, 'users', userId), {
      credits: newCredits,
      creditsUsedThisMonth: newUsed,
    });

    return { success: true, remainingCredits: newCredits };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return { success: false, remainingCredits: 0, error: 'Failed to deduct credits' };
  }
}

/**
 * Reset monthly credits (called by webhook on subscription renewal)
 */
export async function resetMonthlyCredits(userId: string, tier: UserTier): Promise<void> {
  const monthlyLimit = TIER_CREDITS[tier];

  await updateDoc(doc(db, 'users', userId), {
    credits: monthlyLimit,
    creditsUsedThisMonth: 0,
    lastCreditReset: Timestamp.fromDate(new Date()),
    tier,
    monthlyCreditsLimit: monthlyLimit,
  });
}

/**
 * Update user's subscription status (called by webhook)
 */
export async function updateSubscription(
  userId: string,
  tier: UserTier,
  stripeCustomerId: string,
  subscriptionId: string,
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
): Promise<void> {
  const monthlyLimit = TIER_CREDITS[tier];

  await updateDoc(doc(db, 'users', userId), {
    tier,
    credits: monthlyLimit,
    creditsUsedThisMonth: 0,
    monthlyCreditsLimit: monthlyLimit,
    lastCreditReset: Timestamp.fromDate(new Date()),
    stripeCustomerId,
    subscriptionId,
    subscriptionStatus: status,
    trialEndsAt: null, // Clear trial when subscribed
  });
}

/**
 * Get credit usage percentage
 */
export function getCreditUsagePercent(userCredits: UserCredits): number {
  if (userCredits.tier === 'unlimited' || userCredits.monthlyCreditsLimit === 0) {
    return 0;
  }

  const used = userCredits.monthlyCreditsLimit - userCredits.credits;
  return Math.round((used / userCredits.monthlyCreditsLimit) * 100);
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  if (credits === Infinity) {
    return '∞';
  }
  if (isNaN(credits) || credits === null || credits === undefined) {
    return '0';
  }
  return credits.toLocaleString();
}
