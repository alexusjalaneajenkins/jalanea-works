/**
 * User Tier Management Utility
 * 
 * This module provides functions to programmatically set a user's subscription tier.
 * Useful for testing and admin purposes.
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TIER_CREDITS, UserTier } from '../services/creditsService';

export type SettableTier = 'trialing' | 'starter' | 'pro' | 'unlimited';

/**
 * Set a user's subscription tier and update their credits accordingly
 * 
 * @param userId - Firebase user ID
 * @param tier - Target tier: 'trialing' | 'starter' | 'pro' | 'unlimited'
 * @returns Promise<boolean> - true if successful
 */
export async function setUserTier(userId: string, tier: SettableTier): Promise<boolean> {
    try {
        const credits = TIER_CREDITS[tier];
        const isUnlimited = tier === 'unlimited';

        await updateDoc(doc(db, 'users', userId), {
            tier: tier,
            credits: isUnlimited ? 999999 : credits, // Use large number for Infinity storage
            creditsUsedThisMonth: 0,
            monthlyCreditsLimit: isUnlimited ? 999999 : credits,
            lastCreditReset: Timestamp.fromDate(new Date()),
            subscriptionStatus: tier === 'trialing' ? 'trialing' : 'active',
            // For non-trial tiers, clear trial expiration
            ...(tier !== 'trialing' && { trialEndsAt: null }),
        });

        console.log(`[Tier Admin] Set user ${userId} to ${tier} tier with ${credits} credits`);
        return true;
    } catch (error) {
        console.error('[Tier Admin] Failed to set tier:', error);
        return false;
    }
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: SettableTier): { name: string; credits: number | string; color: string } {
    switch (tier) {
        case 'trialing':
            return { name: 'Trial', credits: 50, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
        case 'starter':
            return { name: 'Starter', credits: 300, color: 'bg-blue-100 text-blue-800 border-blue-300' };
        case 'pro':
            return { name: 'Pro', credits: 1200, color: 'bg-purple-100 text-purple-800 border-purple-300' };
        case 'unlimited':
            return { name: 'Unlimited', credits: '∞', color: 'bg-gradient-to-r from-gold/20 to-amber-100 text-amber-800 border-gold' };
        default:
            return { name: 'Unknown', credits: 0, color: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
}
