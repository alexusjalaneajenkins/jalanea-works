'use client'

/**
 * Prep Checklist Component
 *
 * Interactive checklist for interview preparation.
 */

import { useState } from 'react'
import { Check, Circle, AlertCircle, Clock } from 'lucide-react'

interface ChecklistItem {
  task: string
  priority: 'high' | 'medium' | 'low'
  completed?: boolean
}

interface PrepChecklistProps {
  items: ChecklistItem[]
  onChange?: (completedCount: number) => void
  interviewDate?: Date
}

export default function PrepChecklist({
  items,
  onChange,
  interviewDate
}: PrepChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  // Toggle item
  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedItems(newChecked)

    if (onChange) {
      onChange(newChecked.size)
    }
  }

  // Calculate days until interview
  const daysUntil = interviewDate
    ? Math.ceil((interviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // Group by priority
  const highPriority = items.filter(i => i.priority === 'high')
  const mediumPriority = items.filter(i => i.priority === 'medium')
  const lowPriority = items.filter(i => i.priority === 'low')

  const completedCount = checkedItems.size
  const progress = (completedCount / items.length) * 100

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-blue-200 bg-blue-50'
  }

  const priorityBadges = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Interview Prep Checklist</h3>
          <p className="text-sm text-gray-500">
            {completedCount} of {items.length} tasks completed
          </p>
        </div>
        {daysUntil !== null && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            daysUntil <= 1 ? 'bg-red-100 text-red-700' :
            daysUntil <= 3 ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {daysUntil === 0 ? 'Today!' :
               daysUntil === 1 ? 'Tomorrow' :
               `${daysUntil} days left`}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            progress >= 80 ? 'bg-green-500' :
            progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist Groups */}
      <div className="space-y-4">
        {/* High Priority */}
        {highPriority.length > 0 && (
          <div className={`rounded-lg border p-4 ${priorityColors.high}`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityBadges.high}`}>
                High Priority
              </span>
            </div>
            <ul className="space-y-2">
              {highPriority.map((item, index) => {
                const globalIndex = items.indexOf(item)
                const isChecked = checkedItems.has(globalIndex)

                return (
                  <li key={index}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 group-hover:border-green-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.task}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <div className={`rounded-lg border p-4 ${priorityColors.medium}`}>
            <div className="flex items-center gap-2 mb-3">
              <Circle className="w-4 h-4 text-yellow-600" />
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityBadges.medium}`}>
                Medium Priority
              </span>
            </div>
            <ul className="space-y-2">
              {mediumPriority.map((item, index) => {
                const globalIndex = items.indexOf(item)
                const isChecked = checkedItems.has(globalIndex)

                return (
                  <li key={index}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 group-hover:border-green-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.task}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Low Priority */}
        {lowPriority.length > 0 && (
          <div className={`rounded-lg border p-4 ${priorityColors.low}`}>
            <div className="flex items-center gap-2 mb-3">
              <Circle className="w-4 h-4 text-blue-600" />
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityBadges.low}`}>
                Nice to Have
              </span>
            </div>
            <ul className="space-y-2">
              {lowPriority.map((item, index) => {
                const globalIndex = items.indexOf(item)
                const isChecked = checkedItems.has(globalIndex)

                return (
                  <li key={index}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 group-hover:border-green-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.task}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
