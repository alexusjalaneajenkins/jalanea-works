'use client'

/**
 * Category Breakdown Component
 *
 * Shows how funds are allocated across categories.
 */

interface Category {
  id: string
  name: string
  icon: string
  description: string
  color: string
  percentage: number
  allocated: number
  formattedAmount: string
}

interface CategoryBreakdownProps {
  categories: Category[]
  totalAllocated: string
}

export default function CategoryBreakdown({
  categories,
  totalAllocated
}: CategoryBreakdownProps) {
  const colorClasses: Record<string, { bg: string; bar: string; text: string }> = {
    red: { bg: 'bg-red-50', bar: 'bg-red-500', text: 'text-red-700' },
    blue: { bg: 'bg-blue-50', bar: 'bg-blue-500', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', bar: 'bg-purple-500', text: 'text-purple-700' },
    green: { bg: 'bg-green-50', bar: 'bg-green-500', text: 'text-green-700' },
    amber: { bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700' }
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="font-semibold text-gray-900">Fund Allocation</h3>
        <p className="text-sm text-gray-500 mt-1">
          How {totalAllocated} has been distributed
        </p>
      </div>

      {/* Visual Breakdown Bar */}
      <div className="px-6 pt-4">
        <div className="h-4 rounded-full overflow-hidden flex">
          {categories.map((cat, idx) => {
            const colors = colorClasses[cat.color] || colorClasses.purple
            return (
              <div
                key={cat.id}
                className={`${colors.bar} transition-all`}
                style={{ width: `${cat.percentage}%` }}
                title={`${cat.name}: ${cat.percentage}%`}
              />
            )
          })}
        </div>
      </div>

      {/* Category List */}
      <div className="p-6 space-y-4">
        {categories.map(cat => {
          const colors = colorClasses[cat.color] || colorClasses.purple
          return (
            <div
              key={cat.id}
              className={`${colors.bg} rounded-lg p-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h4 className={`font-medium ${colors.text}`}>{cat.name}</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{cat.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${colors.text}`}>{cat.formattedAmount}</p>
                  <p className="text-sm text-gray-500">{cat.percentage}%</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
