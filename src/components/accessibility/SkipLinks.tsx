'use client'

/**
 * Skip Links Component
 *
 * WCAG 2.1 AA compliant skip links for keyboard navigation.
 * Allows users to skip repetitive content and jump to main sections.
 */

import { skipLinkTargets } from '@/lib/accessibility'

interface SkipLink {
  href: string
  label: string
}

const defaultLinks: SkipLink[] = [
  { href: `#${skipLinkTargets.mainContent}`, label: 'Skip to main content' },
  { href: `#${skipLinkTargets.search}`, label: 'Skip to job search' },
  { href: `#${skipLinkTargets.navigation}`, label: 'Skip to navigation' }
]

interface SkipLinksProps {
  links?: SkipLink[]
}

export function SkipLinks({ links = defaultLinks }: SkipLinksProps) {
  return (
    <nav
      aria-label="Skip links"
      className="skip-links"
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-none"
        >
          {link.label}
        </a>
      ))}

      <style jsx>{`
        .skip-links {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
        }

        .skip-link:focus {
          clip: auto;
          width: auto;
          height: auto;
          margin: 0;
          overflow: visible;
          white-space: nowrap;
        }
      `}</style>
    </nav>
  )
}

export default SkipLinks
