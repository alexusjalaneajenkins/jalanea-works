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

/**
 * Check if an email has owner privileges
 */
export function isOwner(email: string | undefined | null): boolean {
  if (!email) return false
  return OWNER_EMAILS.includes(email.toLowerCase())
}

/**
 * Get the display tier for an owner (shows "Owner" instead of "Unlimited")
 */
export function getOwnerTier(): string {
  return 'Owner'
}

/**
 * Get the effective subscription tier for a user
 * Owners get 'unlimited' access
 */
export function getEffectiveTier(
  email: string | undefined | null,
  actualTier: string | undefined
): string {
  if (isOwner(email)) {
    return 'unlimited'
  }
  return actualTier || 'essential'
}
