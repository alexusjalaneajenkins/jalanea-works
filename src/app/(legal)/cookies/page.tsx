/**
 * Cookie Policy Page
 * Detailed information about cookies and tracking technologies
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Jalanea Works',
  description: 'Learn about how Jalanea Works uses cookies and similar tracking technologies.'
}

export default function CookiePolicyPage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. What Are Cookies?</h2>
        <p className="text-gray-700 mb-4">
          Cookies are small text files stored on your device when you visit a website.
          They help websites remember your preferences and improve your experience.
        </p>
        <p className="text-gray-700">
          This policy explains how Jalanea Works uses cookies and similar technologies
          (local storage, session storage, and pixels).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Cookies</h2>
        <p className="text-gray-700 mb-4">
          We use cookies to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Keep you signed in to your account</li>
          <li>Remember your preferences and settings</li>
          <li>Understand how you use our Service</li>
          <li>Improve performance and user experience</li>
          <li>Protect against fraud and unauthorized access</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Types of Cookies We Use</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Required?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Essential</td>
                <td className="px-4 py-3 text-sm text-gray-700">Authentication, security, and basic functionality</td>
                <td className="px-4 py-3 text-sm text-gray-700">Session - 7 days</td>
                <td className="px-4 py-3 text-sm text-gray-700">Yes</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Functional</td>
                <td className="px-4 py-3 text-sm text-gray-700">Preferences, language, and personalization</td>
                <td className="px-4 py-3 text-sm text-gray-700">1 year</td>
                <td className="px-4 py-3 text-sm text-gray-700">No</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">Analytics</td>
                <td className="px-4 py-3 text-sm text-gray-700">Usage statistics and service improvement</td>
                <td className="px-4 py-3 text-sm text-gray-700">26 months</td>
                <td className="px-4 py-3 text-sm text-gray-700">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Specific Cookies We Use</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">4.1 Essential Cookies</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Provider</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Purpose</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">sb-*-auth-token</td>
                <td className="px-3 py-2 text-gray-700">Supabase</td>
                <td className="px-3 py-2 text-gray-700">User authentication session</td>
                <td className="px-3 py-2 text-gray-700">7 days</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">sb-*-auth-token-code-verifier</td>
                <td className="px-3 py-2 text-gray-700">Supabase</td>
                <td className="px-3 py-2 text-gray-700">OAuth PKCE verification</td>
                <td className="px-3 py-2 text-gray-700">Session</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">__stripe_mid</td>
                <td className="px-3 py-2 text-gray-700">Stripe</td>
                <td className="px-3 py-2 text-gray-700">Payment fraud prevention</td>
                <td className="px-3 py-2 text-gray-700">1 year</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">__stripe_sid</td>
                <td className="px-3 py-2 text-gray-700">Stripe</td>
                <td className="px-3 py-2 text-gray-700">Payment session tracking</td>
                <td className="px-3 py-2 text-gray-700">30 min</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">4.2 Functional Cookies</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Provider</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Purpose</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">jw_cookie_consent</td>
                <td className="px-3 py-2 text-gray-700">Jalanea Works</td>
                <td className="px-3 py-2 text-gray-700">Cookie preference settings</td>
                <td className="px-3 py-2 text-gray-700">1 year</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">jw_theme</td>
                <td className="px-3 py-2 text-gray-700">Jalanea Works</td>
                <td className="px-3 py-2 text-gray-700">Dark/light mode preference</td>
                <td className="px-3 py-2 text-gray-700">1 year</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">jw_location</td>
                <td className="px-3 py-2 text-gray-700">Jalanea Works</td>
                <td className="px-3 py-2 text-gray-700">Default search location</td>
                <td className="px-3 py-2 text-gray-700">30 days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">4.3 Analytics Cookies</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Provider</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Purpose</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">_ga</td>
                <td className="px-3 py-2 text-gray-700">Google Analytics</td>
                <td className="px-3 py-2 text-gray-700">Distinguish users</td>
                <td className="px-3 py-2 text-gray-700">2 years</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">_ga_*</td>
                <td className="px-3 py-2 text-gray-700">Google Analytics</td>
                <td className="px-3 py-2 text-gray-700">Persist session state</td>
                <td className="px-3 py-2 text-gray-700">2 years</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 text-sm mt-2 italic">
          Note: Analytics cookies are only set if you consent to non-essential cookies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Local Storage</h2>
        <p className="text-gray-700 mb-4">
          In addition to cookies, we use browser local storage for:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Key</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Purpose</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Data Stored</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">jw_onboarding_progress</td>
                <td className="px-3 py-2 text-gray-700">Track onboarding completion</td>
                <td className="px-3 py-2 text-gray-700">Step numbers, timestamps</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">jw_recent_searches</td>
                <td className="px-3 py-2 text-gray-700">Recent job search history</td>
                <td className="px-3 py-2 text-gray-700">Search queries (last 10)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">jw_saved_jobs</td>
                <td className="px-3 py-2 text-gray-700">Offline-first saved jobs</td>
                <td className="px-3 py-2 text-gray-700">Job IDs, basic details</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">jw_daily_plan_cache</td>
                <td className="px-3 py-2 text-gray-700">Cache daily plan for offline</td>
                <td className="px-3 py-2 text-gray-700">Plan data, completion status</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Third-Party Cookies</h2>
        <p className="text-gray-700 mb-4">
          Some cookies are set by third-party services we use:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <strong>Supabase:</strong> Authentication and database services
            (<a href="https://supabase.com/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
          </li>
          <li>
            <strong>Stripe:</strong> Payment processing
            (<a href="https://stripe.com/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
          </li>
          <li>
            <strong>Google:</strong> Analytics and Maps services
            (<a href="https://policies.google.com/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Managing Your Cookie Preferences</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">7.1 Our Cookie Banner</h3>
        <p className="text-gray-700 mb-4">
          When you first visit Jalanea Works, you&apos;ll see a cookie consent banner. You can:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Accept All:</strong> Enable all cookies including analytics</li>
          <li><strong>Essential Only:</strong> Only enable cookies required for the site to function</li>
          <li><strong>Customize:</strong> Choose which categories to enable</li>
        </ul>
        <p className="text-gray-700 mt-4">
          You can change your preferences at any time by clicking &quot;Cookie Settings&quot; in the
          footer or visiting your account settings.
        </p>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">7.2 Browser Settings</h3>
        <p className="text-gray-700 mb-4">
          Most browsers allow you to control cookies through their settings:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <a href="https://support.google.com/chrome/answer/95647" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Microsoft Edge
            </a>
          </li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">7.3 Opt-Out Links</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            Google Analytics Opt-out:{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Browser Add-on
            </a>
          </li>
          <li>
            Your Online Choices (EU):{' '}
            <a href="https://www.youronlinechoices.eu/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Opt-out Page
            </a>
          </li>
          <li>
            Network Advertising Initiative:{' '}
            <a href="https://optout.networkadvertising.org/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Opt-out Page
            </a>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Do Not Track</h2>
        <p className="text-gray-700">
          Some browsers have a &quot;Do Not Track&quot; (DNT) feature. Currently, there is no industry
          standard for DNT. We do not respond to DNT signals, but we honor your cookie
          preferences set through our consent banner.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to This Policy</h2>
        <p className="text-gray-700">
          We may update this Cookie Policy to reflect changes in our practices or for
          legal/regulatory reasons. We will post changes here and update the &quot;Last updated&quot;
          date. Significant changes will be communicated via our cookie banner.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
        <p className="text-gray-700 mb-4">
          Questions about our use of cookies? Contact us:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
          <p><strong>Jalanea Works</strong></p>
          <p>Email: <a href="mailto:privacy@jalanea.works" className="text-primary-600 hover:underline">privacy@jalanea.works</a></p>
          <p>Orlando, Florida, USA</p>
        </div>
      </section>
    </div>
  )
}
