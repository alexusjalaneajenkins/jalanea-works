'use client'

/**
 * SkillsEditor - Edit skills section
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Sparkles, Loader2 } from 'lucide-react'
import { type Skill } from './types'

interface SkillsEditorProps {
  skills: Skill[]
  onChange: (skills: Skill[]) => void
}

const suggestedSkills = {
  'Customer Service': [
    'Customer Relations',
    'Problem Resolution',
    'Communication',
    'Active Listening',
    'Conflict Resolution',
    'Phone Etiquette',
    'Multi-tasking',
    'CRM Software'
  ],
  'Technical': [
    'Microsoft Office',
    'Google Workspace',
    'Data Entry',
    'Typing (60+ WPM)',
    'Basic Troubleshooting',
    'POS Systems',
    'Inventory Management'
  ],
  'Soft Skills': [
    'Team Collaboration',
    'Time Management',
    'Attention to Detail',
    'Adaptability',
    'Work Ethic',
    'Reliability',
    'Leadership'
  ],
  'Languages': [
    'English',
    'Spanish',
    'Bilingual'
  ]
}

export function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
  const [newSkill, setNewSkill] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addSkill = (skillName: string) => {
    if (!skillName.trim()) return
    if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) return

    const skill: Skill = {
      id: Date.now().toString(),
      name: skillName.trim()
    }
    onChange([...skills, skill])
    setNewSkill('')
  }

  const removeSkill = (id: string) => {
    onChange(skills.filter(s => s.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill(newSkill)
    }
  }

  const generateSkills = async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock AI-generated skills
    const generatedSkills: Skill[] = [
      { id: '1', name: 'Customer Service' },
      { id: '2', name: 'Communication' },
      { id: '3', name: 'Microsoft Office' },
      { id: '4', name: 'Problem Solving' },
      { id: '5', name: 'Time Management' },
      { id: '6', name: 'Team Collaboration' },
      { id: '7', name: 'Data Entry' },
      { id: '8', name: 'Attention to Detail' }
    ]

    // Add only skills that don't already exist
    const newSkills = generatedSkills.filter(
      gen => !skills.some(s => s.name.toLowerCase() === gen.name.toLowerCase())
    )
    onChange([...skills, ...newSkills])
    setIsGenerating(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Add skills relevant to the jobs you&apos;re applying for. Include both technical and soft skills.
      </p>

      {/* Current Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {skills.map((skill) => (
              <motion.span
                key={skill.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm"
              >
                {skill.name}
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Skill Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a skill and press Enter..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={() => addSkill(newSkill)}
          disabled={!newSkill.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* AI Generate */}
      <div className="flex items-center gap-3">
        <button
          onClick={generateSkills}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {isGenerating ? 'Generating...' : 'AI Suggest Skills'}
        </button>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showSuggestions ? 'Hide suggestions' : 'Show common skills'}
        </button>
      </div>

      {/* Suggested Skills */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-border"
          >
            {Object.entries(suggestedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => {
                    const isAdded = skills.some(s => s.name.toLowerCase() === skill.toLowerCase())
                    return (
                      <button
                        key={skill}
                        onClick={() => !isAdded && addSkill(skill)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          isAdded
                            ? 'bg-background text-muted-foreground cursor-not-allowed'
                            : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {skill}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SkillsEditor
