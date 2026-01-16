'use client'

/**
 * Translation Preview Component
 *
 * Shows before/after comparison for a single bullet point translation.
 * Allows editing and toggling selection.
 */

import { useState } from 'react'
import { Check, X, Edit2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface TranslationPreviewProps {
  original: string
  translated: string
  skills: string[]
  confidence: number
  isSelected: boolean
  onToggle: () => void
  onEdit: (newText: string) => void
}

export default function TranslationPreview({
  original,
  translated,
  skills,
  confidence,
  isSelected,
  onToggle,
  onEdit
}: TranslationPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(translated)
  const [expanded, setExpanded] = useState(false)

  const handleSaveEdit = () => {
    onEdit(editText)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditText(translated)
    setIsEditing(false)
  }

  // Confidence indicator color
  const confidenceColor = confidence >= 0.8
    ? 'text-green-600 bg-green-100'
    : confidence >= 0.6
      ? 'text-yellow-600 bg-yellow-100'
      : 'text-orange-600 bg-orange-100'

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'border-primary-300 bg-primary-50/50'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Selection Toggle */}
          <button
            onClick={onToggle}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {isSelected && <Check className="w-4 h-4" />}
          </button>

          {/* Confidence Badge */}
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${confidenceColor}`}>
            {Math.round(confidence * 100)}% match
          </span>

          {/* AI indicator */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Sparkles className="w-3 h-3" />
            <span>AI Enhanced</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Edit translation"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Before/After Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Original
            </span>
            <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
              {original}
            </p>
          </div>

          {/* Translated */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              Translated
            </span>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-sm border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-900 bg-primary-50 p-3 rounded-md border border-primary-200">
                {translated}
              </p>
            )}
          </div>
        </div>

        {/* Skills - Expanded View */}
        {expanded && skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Skills Highlighted
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills Preview - Collapsed View */}
        {!expanded && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
