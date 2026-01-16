/**
 * Accessibility Statement Page
 * WCAG 2.1 AA compliance statement for Jalanea Works
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement | Jalanea Works',
  description: 'Our commitment to digital accessibility and WCAG 2.1 AA compliance.'
}

export default function AccessibilityStatementPage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Accessibility Statement</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Our Commitment</h2>
        <p className="text-gray-700 mb-4">
          Jalanea Works is committed to ensuring digital accessibility for people with disabilities.
          We are continually improving the user experience for everyone and applying the relevant
          accessibility standards.
        </p>
        <p className="text-gray-700">
          Our goal is to help all Valencia College graduates access job opportunities,
          regardless of their abilities.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Conformance Status</h2>
        <p className="text-gray-700 mb-4">
          The Web Content Accessibility Guidelines (WCAG) defines requirements for designers
          and developers to improve accessibility for people with disabilities. It defines
          three levels of conformance: Level A, Level AA, and Level AAA.
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Jalanea Works is partially conformant with WCAG 2.1 Level AA.</strong> Partially
          conformant means that some parts of the content do not fully conform to the
          accessibility standard.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Accessibility Features</h2>
        <p className="text-gray-700 mb-4">
          We have implemented the following accessibility features:
        </p>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Navigation</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Skip links to bypass repetitive content</li>
          <li>Consistent navigation structure across all pages</li>
          <li>Keyboard-accessible menus and controls</li>
          <li>Clear focus indicators for keyboard navigation</li>
          <li>Logical heading hierarchy (H1-H6)</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Visual Design</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Color contrast ratios meeting WCAG AA standards (4.5:1 minimum)</li>
          <li>Text can be resized up to 200% without loss of content</li>
          <li>No content relies solely on color to convey meaning</li>
          <li>Support for high contrast mode</li>
          <li>Reduced motion support for users with vestibular disorders</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Screen Reader Support</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>ARIA landmarks for page regions</li>
          <li>Descriptive labels for all form inputs</li>
          <li>Alt text for all meaningful images</li>
          <li>Live region announcements for dynamic content</li>
          <li>Properly structured tables with headers</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Keyboard Accessibility</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>All functionality available via keyboard</li>
          <li>No keyboard traps</li>
          <li>Visible focus indicators</li>
          <li>Keyboard shortcuts for common actions (press ? to view)</li>
          <li>Logical tab order</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Forms and Inputs</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Clear error messages with suggestions for correction</li>
          <li>Labels associated with form controls</li>
          <li>Required fields clearly indicated</li>
          <li>Autocomplete attributes for faster form completion</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Known Limitations</h2>
        <p className="text-gray-700 mb-4">
          Despite our best efforts, some content may have accessibility limitations:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <strong>Third-party job listings:</strong> Job descriptions from external sources
            may not always be fully accessible. We recommend contacting employers directly
            for accessible alternatives.
          </li>
          <li>
            <strong>PDF exports:</strong> Some exported documents may have accessibility
            limitations. We are working to improve PDF accessibility.
          </li>
          <li>
            <strong>Maps:</strong> Interactive transit maps rely on Google Maps, which
            has its own accessibility features. Text alternatives are provided.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Assistive Technology Compatibility</h2>
        <p className="text-gray-700 mb-4">
          Jalanea Works has been tested with the following assistive technologies:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>NVDA (Windows) with Chrome and Firefox</li>
          <li>VoiceOver (macOS/iOS) with Safari</li>
          <li>TalkBack (Android) with Chrome</li>
          <li>JAWS (Windows) with Chrome</li>
        </ul>
        <p className="text-gray-700 mt-4">
          We recommend using the latest version of your browser and assistive technology
          for the best experience.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Keyboard Shortcuts</h2>
        <p className="text-gray-700 mb-4">
          Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">?</kbd> anywhere
          on the site to view available keyboard shortcuts. Common shortcuts include:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Shortcut</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2"><kbd className="px-1 bg-gray-100 border rounded">/</kbd></td>
                <td className="px-4 py-2 text-gray-700">Focus search</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2"><kbd className="px-1 bg-gray-100 border rounded">J</kbd> / <kbd className="px-1 bg-gray-100 border rounded">K</kbd></td>
                <td className="px-4 py-2 text-gray-700">Navigate job list</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><kbd className="px-1 bg-gray-100 border rounded">Enter</kbd></td>
                <td className="px-4 py-2 text-gray-700">Open selected item</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2"><kbd className="px-1 bg-gray-100 border rounded">Escape</kbd></td>
                <td className="px-4 py-2 text-gray-700">Close dialog</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><kbd className="px-1 bg-gray-100 border rounded">?</kbd></td>
                <td className="px-4 py-2 text-gray-700">Show all shortcuts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Feedback and Contact</h2>
        <p className="text-gray-700 mb-4">
          We welcome your feedback on the accessibility of Jalanea Works. If you encounter
          accessibility barriers or have suggestions for improvement, please contact us:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-gray-700 mb-4">
          <p><strong>Accessibility Feedback</strong></p>
          <p>Email: <a href="mailto:accessibility@jalanea.works" className="text-primary-600 hover:underline">accessibility@jalanea.works</a></p>
          <p>Response time: Within 5 business days</p>
        </div>
        <p className="text-gray-700">
          When reporting an accessibility issue, please include:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>The page URL where you encountered the issue</li>
          <li>A description of the problem</li>
          <li>The assistive technology you were using (if applicable)</li>
          <li>Your browser and operating system</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Enforcement Procedure</h2>
        <p className="text-gray-700 mb-4">
          If you are not satisfied with our response to your accessibility concern, you may
          contact the following organizations:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <strong>U.S. Department of Justice:</strong>{' '}
            <a href="https://www.ada.gov/filing_complaint.htm" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              File an ADA Complaint
            </a>
          </li>
          <li>
            <strong>Florida Attorney General:</strong>{' '}
            <a href="http://myfloridalegal.com/contact.nsf/contact" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Consumer Complaint
            </a>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Technical Specifications</h2>
        <p className="text-gray-700 mb-4">
          Accessibility of Jalanea Works relies on the following technologies:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>HTML5</li>
          <li>WAI-ARIA 1.2</li>
          <li>CSS3</li>
          <li>JavaScript (ES2020+)</li>
        </ul>
        <p className="text-gray-700 mt-4">
          These technologies are relied upon for conformance with the accessibility
          standards used.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Assessment Approach</h2>
        <p className="text-gray-700 mb-4">
          Jalanea Works assessed the accessibility of this website by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Self-evaluation using automated testing tools (axe, Lighthouse)</li>
          <li>Manual testing with screen readers</li>
          <li>Keyboard-only navigation testing</li>
          <li>Color contrast analysis</li>
          <li>User testing with people who have disabilities</li>
        </ul>
      </section>
    </div>
  )
}
