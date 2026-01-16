'use client'

/**
 * Skills Translator Component
 *
 * Transforms retail/service experience into professional language
 * for target industries. Shows before/after comparison.
 */

import { useState, useEffect } from 'react'
import { ArrowRight, Sparkles, Check, X, Edit2, RefreshCw, Lock } from 'lucide-react'
import TranslationPreview from './TranslationPreview'

interface TranslationResult {
  original: string
  translated: string
  skills: string[]
  keywords: string[]
  confidence: number
  source: 'predefined' | 'ai'
}

interface Industry {
  value: string
  label: string
  icon: string
}

interface SkillsTranslatorProps {
  bullets: string[]
  onApplyTranslations: (translations: Array<{ original: string; translated: string }>) => void
  userTier?: 'essential' | 'starter' | 'premium' | 'unlimited'
  onUpgradeClick?: () => void
}

export default function SkillsTranslator({
  bullets,
  onApplyTranslations,
  userTier = 'starter',
  onUpgradeClick
}: SkillsTranslatorProps) {
  const [sourceIndustries, setSourceIndustries] = useState<Industry[]>([])
  const [targetIndustries, setTargetIndustries] = useState<Industry[]>([])
  const [sourceIndustry, setSourceIndustry] = useState('')
  const [targetIndustry, setTargetIndustry] = useState('')
  const [translations, setTranslations] = useState<TranslationResult[]>([])
  const [selectedTranslations, setSelectedTranslations] = useState<Set<number>>(new Set())
  const [editedTranslations, setEditedTranslations] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillsSummary, setSkillsSummary] = useState<string[]>([])

  // Check if user has access
  const hasAccess = userTier !== 'essential'

  // Fetch industries on mount
  useEffect(() => {
    fetchIndustries()
  }, [])

  // Fetch available targets when source changes
  useEffect(() => {
    if (sourceIndustry) {
      fetchAvailableTargets(sourceIndustry)
    }
  }, [sourceIndustry])

  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/resume/translate')
      if (response.ok) {
        const data = await response.json()
        setSourceIndustries(data.sourceIndustries)
        setTargetIndustries(data.targetIndustries)
      }
    } catch (err) {
      console.error('Failed to fetch industries:', err)
    }
  }

  const fetchAvailableTargets = async (source: string) => {
    try {
      const response = await fetch(`/api/resume/translate?source=${source}`)
      if (response.ok) {
        const data = await response.json()
        // If specific targets available, filter to those
        if (data.availableTargets?.length > 0) {
          setTargetIndustries(data.availableTargets)
        }
      }
    } catch (err) {
      console.error('Failed to fetch targets:', err)
    }
  }

  const handleTranslate = async () => {
    if (!sourceIndustry || !targetIndustry || bullets.length === 0) {
      return
    }

    setLoading(true)
    setError(null)
    setTranslations([])
    setSelectedTranslations(new Set())
    setEditedTranslations(new Map())

    try {
      const response = await fetch('/api/resume/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullets,
          sourceIndustry,
          targetIndustry
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed')
      }

      setTranslations(data.translations)
      setSkillsSummary(data.skillsSummary || [])

      // Auto-select all translations by default
      setSelectedTranslations(new Set(data.translations.map((_: TranslationResult, i: number) => i)))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleTranslation = (index: number) => {
    const newSelected = new Set(selectedTranslations)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTranslations(newSelected)
  }

  const handleEdit = (index: number, newText: string) => {
    const newEdited = new Map(editedTranslations)
    newEdited.set(index, newText)
    setEditedTranslations(newEdited)
  }

  const applyTranslations = () => {
    const toApply = translations
      .filter((_, i) => selectedTranslations.has(i))
      .map((t, i) => ({
        original: t.original,
        translated: editedTranslations.get(i) || t.translated
      }))

    onApplyTranslations(toApply)
  }

  // Show upgrade prompt for Essential tier
  if (!hasAccess) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-full">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Skills Translation (Starter+)
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Transform your retail and service experience into professional language
              that resonates with office, tech, and healthcare employers.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                Retail → Office
              </span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                Service → Tech
              </span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                Food → Healthcare
              </span>
            </div>
            {onUpgradeClick && (
              <button
                onClick={onUpgradeClick}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md transition-colors"
              >
                Upgrade to Starter
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Skills Translation</h3>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {userTier === 'premium' || userTier === 'unlimited' ? 'Premium' : 'Starter'}
        </span>
      </div>

      {/* Industry Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Industry */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your Experience Industry
          </label>
          <select
            value={sourceIndustry}
            onChange={(e) => setSourceIndustry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select your background...</option>
            {sourceIndustries.map((industry) => (
              <option key={industry.value} value={industry.value}>
                {industry.icon} {industry.label}
              </option>
            ))}
          </select>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-gray-400" />
        </div>

        {/* Target Industry */}
        <div className="space-y-2 md:col-start-2">
          <label className="block text-sm font-medium text-gray-700">
            Target Industry
          </label>
          <select
            value={targetIndustry}
            onChange={(e) => setTargetIndustry(e.target.value)}
            disabled={!sourceIndustry}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select target industry...</option>
            {targetIndustries.map((industry) => (
              <option key={industry.value} value={industry.value}>
                {industry.icon} {industry.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Translate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleTranslate}
          disabled={!sourceIndustry || !targetIndustry || bullets.length === 0 || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Translate {bullets.length} Bullet{bullets.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* No bullets warning */}
      {bullets.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Add experience bullet points to your resume first, then use this tool to translate them.
          </p>
        </div>
      )}

      {/* Translation Results */}
      {translations.length > 0 && (
        <div className="space-y-4">
          {/* Skills Summary */}
          {skillsSummary.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                Skills highlighted in translation:
              </p>
              <div className="flex flex-wrap gap-2">
                {skillsSummary.map((skill, i) => (
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

          {/* Translation List */}
          <div className="space-y-3">
            {translations.map((translation, index) => (
              <TranslationPreview
                key={index}
                original={translation.original}
                translated={editedTranslations.get(index) || translation.translated}
                skills={translation.skills}
                confidence={translation.confidence}
                isSelected={selectedTranslations.has(index)}
                onToggle={() => toggleTranslation(index)}
                onEdit={(text) => handleEdit(index, text)}
              />
            ))}
          </div>

          {/* Apply Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {selectedTranslations.size} of {translations.length} translations selected
            </p>
            <button
              onClick={applyTranslations}
              disabled={selectedTranslations.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Apply to Resume
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
