// i18n Configuration for Jalanea Works
// Simple client-side i18n without next-intl complexity
// Updated: 2026-01-19 - Added common UI translations

import en from './messages/en.json'
import es from './messages/es.json'

export type Locale = 'en' | 'es'

export const locales: Locale[] = ['en', 'es']
export const defaultLocale: Locale = 'en'

const messages = { en, es }

type Messages = typeof en

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path // Return path as fallback if not found
    }
  }

  return typeof current === 'string' ? current : path
}

// Simple translation function
export function t(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const message = getNestedValue(messages[locale] as unknown as Record<string, unknown>, key)

  if (!params) return message

  // Replace {param} with actual values
  return message.replace(/\{(\w+)\}/g, (_, paramKey) => {
    return params[paramKey]?.toString() ?? `{${paramKey}}`
  })
}

// Hook-friendly translation getter
export function useTranslation(locale: Locale) {
  return {
    t: (key: string, params?: Record<string, string | number>) => t(locale, key, params),
    locale,
  }
}

// Export messages for type safety
export type { Messages }
export { messages }
