'use client'

/**
 * AllocationChart - Pie chart showing revenue allocation
 *
 * Displays how subscription revenue is distributed across
 * Operations, Community Fund, Expansion, and Scholarships.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface AllocationChartProps {
  showTitle?: boolean
  height?: number
}

// Revenue allocation percentages
const ALLOCATION_DATA = [
  { name: 'Operations', value: 40, color: '#3b82f6', description: 'Platform development & support' },
  { name: 'Community Fund', value: 30, color: '#ffc425', description: 'Grants for Valencia grad businesses' },
  { name: 'Expansion', value: 20, color: '#22c55e', description: 'Replicate in other cities' },
  { name: 'Scholarships', value: 10, color: '#a855f7', description: 'Pell Grant recipient support' }
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      description: string
      color: string
    }
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white rounded-lg shadow-lg border p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-semibold text-gray-900">{data.name}</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{data.value}%</p>
        <p className="text-sm text-gray-600 mt-1">{data.payload.description}</p>
      </div>
    )
  }
  return null
}

interface LegendPayload {
  value: string
  color: string
  payload: {
    value: number
  }
}

function CustomLegend({ payload }: { payload?: LegendPayload[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700">
            {entry.value} ({entry.payload.value}%)
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AllocationChart({
  showTitle = true,
  height = 300
}: AllocationChartProps) {
  return (
    <div className="bg-white rounded-xl border p-6">
      {showTitle && (
        <div className="text-center mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">
            How Every Dollar Is Split
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Revenue allocation breakdown
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={ALLOCATION_DATA}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {ALLOCATION_DATA.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Detailed Breakdown */}
      <div className="mt-6 space-y-3">
        {ALLOCATION_DATA.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            <span
              className="text-lg font-bold"
              style={{ color: item.color }}
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
