/**
 * Owner/Admin Configuration
 *
 * Owner accounts have full access to all features for testing purposes.
 * Add email addresses here to grant owner privileges.
 */

// List of owner email addresses with full access
export const OWNER_EMAILS: string[] = [
  'alexusjenkins91@gmail.com',
]

// Available tiers for testing (owners can switch between these)
export const TESTABLE_TIERS = ['essential', 'starter', 'professional', 'max'] as const
export type TestableTier = typeof TESTABLE_TIERS[number]

// Storage key for owner tier override
const TIER_OVERRIDE_KEY = 'jalanea-owner-tier-override'

/**
 * Check if an email has owner privileges
 */
export function isOwner(email: string | undefined | null): boolean {
  if (!email) return false
  return OWNER_EMAILS.includes(email.toLowerCase())
}

/**
 * Get the display tier for an owner
 * If owner has selected a tier to test, show that tier
 * Otherwise show "Owner"
 */
export function getOwnerDisplayTier(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(TIER_OVERRIDE_KEY)
    if (override && TESTABLE_TIERS.includes(override as TestableTier)) {
      // Capitalize first letter
      return override.charAt(0).toUpperCase() + override.slice(1)
    }
  }
  return 'Owner'
}

/**
 * Get the effective subscription tier for a user
 * Owners can override their tier for testing
 */
export function getEffectiveTier(
  email: string | undefined | null,
  actualTier: string | undefined
): string {
  if (isOwner(email)) {
    // Check for tier override
    if (typeof window !== 'undefined') {
      const override = localStorage.getItem(TIER_OVERRIDE_KEY)
      if (override && TESTABLE_TIERS.includes(override as TestableTier)) {
        return override
      }
    }
    return 'max' // Default owner access
  }
  return actualTier || 'essential'
}

/**
 * Set the tier override for testing (owners only)
 */
export function setTierOverride(tier: TestableTier | null): void {
  if (typeof window !== 'undefined') {
    if (tier === null) {
      localStorage.removeItem(TIER_OVERRIDE_KEY)
    } else {
      localStorage.setItem(TIER_OVERRIDE_KEY, tier)
    }
  }
}

/**
 * Get the current tier override (or null if none)
 */
export function getTierOverride(): TestableTier | null {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(TIER_OVERRIDE_KEY)
    if (override && TESTABLE_TIERS.includes(override as TestableTier)) {
      return override as TestableTier
    }
  }
  return null
}
