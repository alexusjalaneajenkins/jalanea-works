// Career path and skills type definitions
// For degree-to-career mapping system

export type GrowthRate = 'very high' | 'high' | 'moderate-high' | 'moderate' | 'low-moderate' | 'low'
export type SkillCategory = 'technical' | 'soft_skill' | 'tool' | 'process'
export type DegreeType = 'bachelors' | 'associates' | 'certificate' | 'other'

export interface CareerPath {
  id: string
  title: string
  titleEs?: string
  description?: string
  salaryMin?: number
  salaryMax?: number
  growthRate?: GrowthRate
}

export interface Skill {
  id: string
  name: string
  nameEs?: string
  category: SkillCategory
}

// For API responses
export interface ProgramCareerMapping {
  programKey: string
  school: string
  careerPaths: CareerPath[]
  skills: Skill[]
}

// For user selections
export interface UserCareerPath {
  id: string
  userId: string
  careerPath?: CareerPath
  isCustom: boolean
  customTitle?: string
  customTitleEs?: string
  priority: number
}

// JSON file structure (from Gemini research)
export interface CareerPathInput {
  title: string
  title_es: string
  salary_min: number
  salary_max: number
  growth: string
}

export interface SkillInput {
  name: string
  category: string
}

export interface ProgramInput {
  name: string
  degree_type: string
  career_paths: CareerPathInput[]
  skills: SkillInput[]
}

export interface SchoolDataInput {
  school: string
  programs: ProgramInput[]
}

// For the CareerPathSelector component
export interface CareerPathSelectorProps {
  programKey: string
  school: string
  selectedPaths: string[]
  customPaths: CustomCareerPath[]
  onSelectPath: (pathId: string) => void
  onDeselectPath: (pathId: string) => void
  onAddCustomPath: (title: string, titleEs?: string) => void
  onRemoveCustomPath: (title: string) => void
  language: 'en' | 'es'
}

export interface CustomCareerPath {
  title: string
  titleEs?: string
}

// For displaying career cards
export interface CareerPathCardProps {
  careerPath: CareerPath
  isSelected: boolean
  onToggle: () => void
  language: 'en' | 'es'
}
