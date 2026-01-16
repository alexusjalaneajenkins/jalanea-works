/**
 * Terms of Service Page
 * Legal terms and conditions for using Jalanea Works
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Jalanea Works',
  description: 'Terms and conditions for using the Jalanea Works job search platform.'
}

export default function TermsOfServicePage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
        <p className="text-gray-700 mb-4">
          By accessing or using Jalanea Works (&quot;the Service&quot;), you agree to be bound by these
          Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not
          access the Service.
        </p>
        <p className="text-gray-700">
          These Terms apply to all visitors, users, and others who access or use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
        <p className="text-gray-700 mb-4">
          Jalanea Works is a job search platform designed specifically for Valencia College graduates
          in the Orlando, Florida area. The Service includes:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Job search and discovery with scam protection</li>
          <li>LYNX public transit commute calculations</li>
          <li>AI-powered Job Pockets (career intelligence reports)</li>
          <li>Resume building and ATS optimization tools</li>
          <li>Daily application planning assistance</li>
          <li>Valencia College program-to-job matching</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">3.1 Account Creation</h3>
        <p className="text-gray-700 mb-4">
          To use certain features, you must create an account. You agree to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your information as needed</li>
          <li>Keep your password secure and confidential</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized access</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">3.2 Account Restrictions</h3>
        <p className="text-gray-700 mb-4">
          You must be at least 16 years old to create an account. By creating an account, you
          represent that you meet this age requirement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Subscription Tiers and Payments</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">4.1 Subscription Plans</h3>
        <p className="text-gray-700 mb-4">
          Jalanea Works offers the following subscription tiers:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Essential ($15/month):</strong> Basic job search and Tier 1 Job Pockets</li>
          <li><strong>Starter ($25/month):</strong> Enhanced features and Tier 2 Job Pockets</li>
          <li><strong>Premium ($75/month):</strong> Full features with Tier 3 Job Pockets (5/month)</li>
          <li><strong>Unlimited ($150/month):</strong> All features with extended Deep Research reports (10/month)</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">4.2 Billing</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Subscriptions are billed monthly in advance</li>
          <li>Payments are processed securely through Stripe</li>
          <li>You authorize us to charge your payment method on each billing date</li>
          <li>Prices may change with 30 days&apos; notice</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">4.3 Cancellation and Refunds</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>You may cancel your subscription at any time from your account settings</li>
          <li>Cancellation takes effect at the end of the current billing period</li>
          <li>No refunds are provided for partial months</li>
          <li>We may offer prorated refunds at our discretion for service issues</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Acceptable Use</h2>
        <p className="text-gray-700 mb-4">
          You agree NOT to use the Service to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Violate any laws or regulations</li>
          <li>Post false, misleading, or fraudulent information</li>
          <li>Impersonate another person or entity</li>
          <li>Scrape, harvest, or collect data without permission</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Attempt to gain unauthorized access to any systems</li>
          <li>Use automated systems (bots, scrapers) without permission</li>
          <li>Post spam, advertisements, or promotional content</li>
          <li>Harass, threaten, or abuse other users</li>
          <li>Upload malware, viruses, or harmful code</li>
          <li>Circumvent security measures or access controls</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Job Listings and Content</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">6.1 Third-Party Job Listings</h3>
        <p className="text-gray-700 mb-4">
          Job listings displayed on Jalanea Works are aggregated from third-party sources
          (Indeed, employer websites, etc.). We do not:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Guarantee the accuracy or availability of any job listing</li>
          <li>Endorse any employer or job posting</li>
          <li>Guarantee employment outcomes</li>
          <li>Control hiring decisions made by employers</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">6.2 Scam Shield</h3>
        <p className="text-gray-700 mb-4">
          Our Scam Shield feature attempts to identify potentially fraudulent job listings.
          However, we cannot guarantee detection of all scams. You should:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Exercise your own judgment when applying to jobs</li>
          <li>Never pay money to apply for a job</li>
          <li>Research employers independently</li>
          <li>Report suspicious listings to us</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">6.3 AI-Generated Content</h3>
        <p className="text-gray-700 mb-4">
          Job Pockets and other AI-generated content are for informational purposes only.
          This content:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>May contain inaccuracies or outdated information</li>
          <li>Should not be relied upon as professional career advice</li>
          <li>Does not constitute a guarantee of job offer or salary</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">7.1 Our Content</h3>
        <p className="text-gray-700 mb-4">
          The Service and its original content (excluding user content), features, and
          functionality are owned by Jalanea Works and are protected by copyright, trademark,
          and other intellectual property laws.
        </p>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">7.2 Your Content</h3>
        <p className="text-gray-700 mb-4">
          You retain ownership of content you submit (resumes, profile information). By
          submitting content, you grant us a license to use, store, and process it to
          provide the Service. You represent that you own or have rights to all content
          you submit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Privacy</h2>
        <p className="text-gray-700">
          Your use of the Service is also governed by our{' '}
          <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>,
          which is incorporated into these Terms by reference. Please review the Privacy Policy
          to understand how we collect and use your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Disclaimers</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">9.1 Service Provided &quot;As Is&quot;</h3>
        <p className="text-gray-700 mb-4">
          THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Merchantability or fitness for a particular purpose</li>
          <li>Non-infringement</li>
          <li>Accuracy, reliability, or completeness of content</li>
          <li>Uninterrupted or error-free operation</li>
          <li>Security from unauthorized access</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">9.2 No Employment Guarantee</h3>
        <p className="text-gray-700">
          JALANEA WORKS DOES NOT GUARANTEE EMPLOYMENT. We provide tools to assist your job
          search, but hiring decisions are made solely by employers. Results vary based on
          individual qualifications, market conditions, and other factors beyond our control.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, JALANEA WORKS SHALL NOT BE LIABLE FOR:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Any indirect, incidental, special, consequential, or punitive damages</li>
          <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
          <li>Damages resulting from unauthorized access to your account</li>
          <li>Damages from third-party content, including job listings</li>
          <li>Any amount exceeding the fees you paid in the past 12 months</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Indemnification</h2>
        <p className="text-gray-700">
          You agree to indemnify and hold harmless Jalanea Works and its officers, directors,
          employees, and agents from any claims, damages, losses, or expenses (including
          reasonable attorneys&apos; fees) arising from your use of the Service, violation of
          these Terms, or infringement of any third-party rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Termination</h2>
        <p className="text-gray-700 mb-4">
          We may terminate or suspend your account and access to the Service immediately,
          without prior notice, for:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Violation of these Terms</li>
          <li>Fraudulent or illegal activity</li>
          <li>Non-payment of subscription fees</li>
          <li>At our sole discretion for any reason</li>
        </ul>
        <p className="text-gray-700 mt-4">
          Upon termination, your right to use the Service ceases immediately. Provisions
          that should survive termination (intellectual property, disclaimers, limitations
          of liability) will remain in effect.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Dispute Resolution</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">13.1 Informal Resolution</h3>
        <p className="text-gray-700 mb-4">
          Before filing a formal dispute, you agree to try to resolve any issues informally
          by contacting us at{' '}
          <a href="mailto:support@jalanea.works" className="text-primary-600 hover:underline">
            support@jalanea.works
          </a>. We will attempt to resolve the issue within 30 days.
        </p>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">13.2 Arbitration</h3>
        <p className="text-gray-700 mb-4">
          If informal resolution fails, any disputes shall be resolved through binding
          arbitration in Orange County, Florida, in accordance with the rules of the
          American Arbitration Association. You waive the right to participate in class
          actions or class arbitrations.
        </p>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">13.3 Exceptions</h3>
        <p className="text-gray-700">
          Either party may seek injunctive relief in court for intellectual property
          infringement or unauthorized access to the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. Governing Law</h2>
        <p className="text-gray-700">
          These Terms shall be governed by and construed in accordance with the laws of
          the State of Florida, without regard to conflict of law principles. Any legal
          action not subject to arbitration shall be brought in the courts of Orange
          County, Florida.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">15. Changes to Terms</h2>
        <p className="text-gray-700">
          We reserve the right to modify these Terms at any time. We will provide notice
          of material changes by email and/or prominent notice on the Service. Your continued
          use after changes constitutes acceptance. If you disagree with changes, you must
          stop using the Service and cancel your subscription.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">16. General Provisions</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Jalanea Works</li>
          <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect</li>
          <li><strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver</li>
          <li><strong>Assignment:</strong> You may not assign these Terms; we may assign them freely</li>
          <li><strong>Notices:</strong> We may provide notices via email or posting on the Service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">17. Contact Information</h2>
        <p className="text-gray-700 mb-4">
          For questions about these Terms of Service:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
          <p><strong>Jalanea Works</strong></p>
          <p>Email: <a href="mailto:legal@jalanea.works" className="text-primary-600 hover:underline">legal@jalanea.works</a></p>
          <p>Orlando, Florida, USA</p>
        </div>
      </section>
    </div>
  )
}
