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

const skipLinksStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 100
}

const skipLinkStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
}

export function SkipLinks({ links = defaultLinks }: SkipLinksProps) {
  return (
    <nav aria-label="Skip links" style={skipLinksStyle}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link focus:static focus:w-auto focus:h-auto focus:p-0 focus:m-0 focus:overflow-visible focus:clip-auto focus:whitespace-normal focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 focus:z-[100]"
          style={skipLinkStyle}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}

export default SkipLinks
