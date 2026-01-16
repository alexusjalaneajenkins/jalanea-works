'use client'

/**
 * CustomCareerInput - Add custom career path input
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Sparkles } from 'lucide-react'
import type { CustomCareerPath } from '@/types/career'

interface CustomCareerInputProps {
  customPaths: CustomCareerPath[]
  onAddCustomPath: (title: string, titleEs?: string) => void
  onRemoveCustomPath: (title: string) => void
  language: 'en' | 'es'
}

export function CustomCareerInput({
  customPaths,
  onAddCustomPath,
  onRemoveCustomPath,
  language
}: CustomCareerInputProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed && !customPaths.some(p => p.title.toLowerCase() === trimmed.toLowerCase())) {
      onAddCustomPath(trimmed)
      setInputValue('')
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false)
      setInputValue('')
    }
  }

  const labels = {
    en: {
      addCustom: 'Add a custom career path',
      placeholder: 'Enter career title...',
      add: 'Add',
      cancel: 'Cancel',
      yourGoals: 'Your custom goals'
    },
    es: {
      addCustom: 'Agregar una carrera personalizada',
      placeholder: 'Ingrese el título de la carrera...',
      add: 'Agregar',
      cancel: 'Cancelar',
      yourGoals: 'Tus metas personalizadas'
    }
  }

  const t = labels[language]

  return (
    <div className="space-y-3">
      {/* Custom paths list */}
      <AnimatePresence>
        {customPaths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">
              {t.yourGoals}
            </p>
            {customPaths.map((path) => (
              <motion.div
                key={path.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 p-3 rounded-lg border border-[#ffc425]/30 bg-[#ffc425]/10"
              >
                <Sparkles size={16} className="text-[#ffc425] flex-shrink-0" />
                <span className="flex-1 text-sm text-[#e2e8f0]">
                  {language === 'es' && path.titleEs ? path.titleEs : path.title}
                </span>
                <button
                  onClick={() => onRemoveCustomPath(path.title)}
                  className="p-1 rounded-full hover:bg-[#334155] transition-colors"
                  aria-label="Remove"
                >
                  <X size={14} className="text-[#94a3b8]" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add custom input */}
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.form
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#1e293b] border border-[#334155] focus:border-[#ffc425] focus:ring-1 focus:ring-[#ffc425] text-[#e2e8f0] placeholder-[#64748b] outline-none transition-all"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-[#ffc425] text-[#0f172a] font-medium text-sm hover:bg-[#ffd85d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {t.add}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false)
                  setInputValue('')
                }}
                className="px-4 py-2 rounded-lg border border-[#334155] text-[#94a3b8] font-medium text-sm hover:bg-[#1e293b] transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            key="button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setIsAdding(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-[#334155] hover:border-[#475569] text-[#94a3b8] hover:text-[#e2e8f0] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">{t.addCustom}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomCareerInput
