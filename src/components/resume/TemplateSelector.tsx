'use client'

/**
 * TemplateSelector - Choose resume template
 */

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { type ResumeTemplate, templateConfig } from './types'

interface TemplateSelectorProps {
  selected: ResumeTemplate
  onSelect: (template: ResumeTemplate) => void
}

const templates: ResumeTemplate[] = ['professional', 'modern', 'simple']

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {templates.map((template) => {
        const config = templateConfig[template]
        const isSelected = selected === template

        return (
          <motion.button
            key={template}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(template)}
            className={`relative p-4 rounded-xl border-2 transition-colors text-left ${
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border/80'
            }`}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check size={14} className="text-primary-foreground" />
              </div>
            )}

            {/* Preview swatch */}
            <div
              className="w-full h-24 rounded-lg mb-3 flex items-end p-2"
              style={{ backgroundColor: config.colors.primary }}
            >
              <div className="w-full space-y-1">
                <div
                  className="h-2 rounded"
                  style={{ backgroundColor: config.colors.secondary, width: '60%' }}
                />
                <div
                  className="h-1.5 rounded"
                  style={{ backgroundColor: 'white', opacity: 0.5, width: '80%' }}
                />
                <div
                  className="h-1.5 rounded"
                  style={{ backgroundColor: 'white', opacity: 0.3, width: '40%' }}
                />
              </div>
            </div>

            {/* Info */}
            <h3 className="font-semibold text-foreground mb-1">{config.name}</h3>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </motion.button>
        )
      })}
    </div>
  )
}

export default TemplateSelector
