'use client'

/**
 * GrantRecipients - Display Valencia grad business grant recipients
 *
 * Shows businesses started by Valencia graduates that have received
 * grants from the Community Fund.
 */

import { Building2, GraduationCap, ExternalLink, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/community-fund'

export interface GrantRecipient {
  id: string
  businessName: string
  businessIcon: string
  grantAmount: number
  valenciaProgram: string
  graduationYear: string
  description: string
  status: 'active' | 'awarded' | 'disbursed'
  website?: string
}

interface GrantRecipientsProps {
  recipients: GrantRecipient[]
  totalDisbursed?: number
  grantCount?: number
  showApplyButton?: boolean
  onApply?: () => void
}

// Demo grant recipients (Valencia grad businesses)
export const DEMO_GRANT_RECIPIENTS: GrantRecipient[] = [
  {
    id: '1',
    businessName: "Maria's Bakery",
    businessIcon: '🏪',
    grantAmount: 1000,
    valenciaProgram: 'Culinary Arts',
    graduationYear: '2023',
    description: 'Starting my empanada business',
    status: 'disbursed'
  },
  {
    id: '2',
    businessName: 'TechStart Orlando',
    businessIcon: '💻',
    grantAmount: 1000,
    valenciaProgram: 'Information Technology',
    graduationYear: '2024',
    description: 'Launching web design services',
    status: 'disbursed'
  },
  {
    id: '3',
    businessName: 'AutoDetail Pro',
    businessIcon: '📱',
    grantAmount: 500,
    valenciaProgram: 'Business Administration',
    graduationYear: '2023',
    description: 'Mobile car detailing equipment',
    status: 'disbursed'
  },
  {
    id: '4',
    businessName: 'Green Thumb Gardens',
    businessIcon: '🌱',
    grantAmount: 750,
    valenciaProgram: 'Horticulture',
    graduationYear: '2024',
    description: 'Urban farming and landscaping startup',
    status: 'awarded'
  },
  {
    id: '5',
    businessName: 'PixelPerfect Media',
    businessIcon: '🎬',
    grantAmount: 800,
    valenciaProgram: 'Digital Media',
    graduationYear: '2023',
    description: 'Video production for small businesses',
    status: 'disbursed'
  }
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  awarded: { label: 'Awarded', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  disbursed: { label: 'Disbursed', color: 'text-green-700', bgColor: 'bg-green-100' }
}

export default function GrantRecipients({
  recipients,
  totalDisbursed,
  grantCount,
  showApplyButton = true,
  onApply
}: GrantRecipientsProps) {
  // Calculate totals if not provided
  const calculatedTotal = totalDisbursed ?? recipients
    .filter(r => r.status === 'disbursed')
    .reduce((sum, r) => sum + r.grantAmount, 0)

  const calculatedCount = grantCount ?? recipients.filter(r => r.status === 'disbursed').length

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Valencia Grad Businesses
            </h3>
            <p className="text-sm text-gray-500">
              Grant recipients from the Community Fund
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(calculatedTotal)}
            </p>
            <p className="text-xs text-gray-500">Total Disbursed</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-2xl font-bold text-amber-600">{calculatedCount}</p>
            <p className="text-xs text-gray-500">Grants Awarded</p>
          </div>
        </div>
      </div>

      {/* Recipients List */}
      <div className="divide-y">
        {recipients.map((recipient) => {
          const statusConfig = STATUS_CONFIG[recipient.status]
          return (
            <div key={recipient.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Business Icon */}
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{recipient.businessIcon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {recipient.businessName}
                        </h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        &ldquo;{recipient.description}&rdquo;
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(recipient.grantAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Valencia Info */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      <GraduationCap className="w-3 h-3" />
                      Valencia {recipient.valenciaProgram} &apos;{recipient.graduationYear.slice(-2)}
                    </span>
                    {recipient.website && (
                      <a
                        href={recipient.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Apply CTA */}
      {showApplyButton && (
        <div className="p-6 bg-gray-50 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Are you a Valencia graduate starting a business?
            </p>
            <button
              onClick={onApply}
              className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Apply for Grant
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Grants up to $1,000 for Valencia alumni entrepreneurs
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
