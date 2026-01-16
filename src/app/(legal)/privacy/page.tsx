/**
 * Privacy Policy Page
 * GDPR and CCPA compliant privacy policy for Jalanea Works
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Jalanea Works',
  description: 'Learn how Jalanea Works collects, uses, and protects your personal information.'
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
        <p className="text-gray-700 mb-4">
          Jalanea Works (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information
          when you use our job search platform designed for Valencia College graduates in the Orlando, Florida area.
        </p>
        <p className="text-gray-700 mb-4">
          Please read this privacy policy carefully. By using Jalanea Works, you consent to the
          practices described in this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">2.1 Information You Provide</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
          <li><strong>Profile Information:</strong> Education history, work experience, skills, and career preferences</li>
          <li><strong>Resume Data:</strong> Any resume or CV information you upload or enter</li>
          <li><strong>Location Data:</strong> Your address or general location for commute calculations</li>
          <li><strong>Payment Information:</strong> Billing details processed through our secure payment provider (Stripe)</li>
          <li><strong>Communications:</strong> Messages you send us through support channels</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">2.2 Information Collected Automatically</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Usage Data:</strong> Pages visited, features used, job searches performed, and applications tracked</li>
          <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
          <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
          <li><strong>Cookies:</strong> Session and preference cookies (see our Cookie Policy for details)</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">2.3 Information from Third Parties</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Job Listings:</strong> We aggregate job data from public job boards (Indeed, etc.)</li>
          <li><strong>Transit Information:</strong> Real-time transit data from Google Maps for LYNX bus routes</li>
          <li><strong>Authentication:</strong> If you sign in with Google, we receive basic profile information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">We use your information to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Provide and personalize job recommendations based on your profile and preferences</li>
          <li>Calculate commute times using LYNX public transit routes</li>
          <li>Generate AI-powered Job Pockets with career intelligence tailored to you</li>
          <li>Analyze your resume against job descriptions (ATS optimization)</li>
          <li>Match your Valencia College education with relevant job opportunities</li>
          <li>Detect and filter potential job scams (Scam Shield feature)</li>
          <li>Process payments for subscription tiers</li>
          <li>Send important updates about your account and job applications</li>
          <li>Improve our services through anonymous analytics</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. AI and Automated Processing</h2>
        <p className="text-gray-700 mb-4">
          Jalanea Works uses artificial intelligence (Google Gemini) to enhance your job search experience:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Job Pockets:</strong> AI-generated career intelligence reports based on job listings and your profile</li>
          <li><strong>ATS Scoring:</strong> Automated analysis of resume-job compatibility</li>
          <li><strong>Daily Plans:</strong> Personalized job application recommendations</li>
          <li><strong>Scam Detection:</strong> Pattern recognition to identify potentially fraudulent job listings</li>
        </ul>
        <p className="text-gray-700 mt-4">
          You have the right to request human review of any automated decision that significantly affects you.
          Contact us at support@jalanea.works to request a review.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Information Sharing</h2>
        <p className="text-gray-700 mb-4">
          We do not sell your personal information. We may share information with:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Service Providers:</strong> Companies that help us operate (Supabase for database, Stripe for payments, Google for AI and maps)</li>
          <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
        </ul>
        <p className="text-gray-700 mt-4">
          <strong>Important:</strong> We never share your resume or personal details directly with employers
          without your explicit action (clicking &quot;Apply&quot;).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
        <p className="text-gray-700 mb-4">
          We retain your data for as long as your account is active or as needed to provide services:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Account Data:</strong> Retained until you delete your account</li>
          <li><strong>Job Search History:</strong> 2 years from the search date</li>
          <li><strong>Generated Job Pockets:</strong> 7 days (cached for performance)</li>
          <li><strong>Payment Records:</strong> 7 years (legal requirement)</li>
          <li><strong>Analytics Data:</strong> Anonymized after 26 months</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
        <p className="text-gray-700 mb-4">
          Depending on your location, you may have the following rights:
        </p>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">All Users</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Export:</strong> Download your data in a portable format (JSON)</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">European Users (GDPR)</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
          <li><strong>Restrict:</strong> Request limited processing of your data</li>
          <li><strong>Portability:</strong> Receive data in machine-readable format</li>
          <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
          <li><strong>Lodge Complaint:</strong> File a complaint with your data protection authority</li>
        </ul>

        <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">California Users (CCPA)</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Know:</strong> Know what personal information is collected</li>
          <li><strong>Delete:</strong> Request deletion of personal information</li>
          <li><strong>Opt-Out:</strong> Opt out of sale of personal information (we do not sell data)</li>
          <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
        </ul>

        <p className="text-gray-700 mt-4">
          To exercise these rights, visit your account settings or contact us at{' '}
          <a href="mailto:privacy@jalanea.works" className="text-primary-600 hover:underline">
            privacy@jalanea.works
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Data Security</h2>
        <p className="text-gray-700 mb-4">
          We implement appropriate security measures to protect your information:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
          <li>Secure authentication with Supabase Auth</li>
          <li>Row-level security (RLS) in our database</li>
          <li>Regular security audits and penetration testing</li>
          <li>Limited employee access on a need-to-know basis</li>
          <li>PCI-DSS compliant payment processing via Stripe</li>
        </ul>
        <p className="text-gray-700 mt-4">
          No system is 100% secure. If you discover a security vulnerability, please report it to{' '}
          <a href="mailto:security@jalanea.works" className="text-primary-600 hover:underline">
            security@jalanea.works
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. International Data Transfers</h2>
        <p className="text-gray-700 mb-4">
          Your data may be processed in the United States. If you are located outside the US,
          your information will be transferred to and processed in the US where our servers
          and third-party service providers are located.
        </p>
        <p className="text-gray-700">
          For European users, we rely on Standard Contractual Clauses (SCCs) approved by the
          European Commission to ensure adequate protection of your data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Children&apos;s Privacy</h2>
        <p className="text-gray-700">
          Jalanea Works is not intended for users under 16 years of age. We do not knowingly
          collect information from children. If you believe we have collected data from a child,
          please contact us immediately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to This Policy</h2>
        <p className="text-gray-700">
          We may update this privacy policy from time to time. We will notify you of significant
          changes by email and/or a prominent notice on our platform. Your continued use after
          changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
        <p className="text-gray-700 mb-4">
          If you have questions about this privacy policy or our data practices:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
          <p><strong>Jalanea Works</strong></p>
          <p>Email: <a href="mailto:privacy@jalanea.works" className="text-primary-600 hover:underline">privacy@jalanea.works</a></p>
          <p>Orlando, Florida, USA</p>
        </div>
        <p className="text-gray-700 mt-4">
          For GDPR inquiries, our Data Protection Officer can be reached at{' '}
          <a href="mailto:dpo@jalanea.works" className="text-primary-600 hover:underline">
            dpo@jalanea.works
          </a>
        </p>
      </section>
    </div>
  )
}
