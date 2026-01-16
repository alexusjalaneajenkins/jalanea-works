/**
 * Resume Builder Types
 */

export type ResumeTemplate = 'professional' | 'modern' | 'simple'

export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
}

export interface WorkExperience {
  id: string
  company: string
  title: string
  location: string
  startDate: string
  endDate?: string // undefined = current
  isCurrent: boolean
  description: string
  highlights: string[]
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  location: string
  graduationDate: string
  gpa?: string
  honors?: string
  relevantCourses?: string[]
}

export interface Skill {
  id: string
  name: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  expirationDate?: string
  credentialId?: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies?: string[]
  link?: string
  date?: string
}

export interface Resume {
  id: string
  userId: string
  name: string // Resume title (e.g., "Software Developer Resume")
  template: ResumeTemplate

  // Sections
  contact: ContactInfo
  summary?: string
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  certifications?: Certification[]
  projects?: Project[]

  // Metadata
  atsScore?: number
  lastUpdated: string
  createdAt: string
}

export interface ResumeSection {
  id: string
  type: 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects'
  label: string
  enabled: boolean
  order: number
}

export const defaultSections: ResumeSection[] = [
  { id: 'contact', type: 'contact', label: 'Contact Information', enabled: true, order: 0 },
  { id: 'summary', type: 'summary', label: 'Professional Summary', enabled: true, order: 1 },
  { id: 'experience', type: 'experience', label: 'Work Experience', enabled: true, order: 2 },
  { id: 'education', type: 'education', label: 'Education', enabled: true, order: 3 },
  { id: 'skills', type: 'skills', label: 'Skills', enabled: true, order: 4 },
  { id: 'certifications', type: 'certifications', label: 'Certifications', enabled: false, order: 5 },
  { id: 'projects', type: 'projects', label: 'Projects', enabled: false, order: 6 }
]

export const templateConfig: Record<ResumeTemplate, {
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    muted: string
  }
}> = {
  professional: {
    name: 'Professional',
    description: 'Clean and traditional - perfect for corporate roles',
    colors: {
      primary: '#1e3a5f',
      secondary: '#2563eb',
      accent: '#3b82f6',
      text: '#1f2937',
      muted: '#6b7280'
    }
  },
  modern: {
    name: 'Modern',
    description: 'Bold and contemporary - great for creative fields',
    colors: {
      primary: '#0f172a',
      secondary: '#ffc425',
      accent: '#ffd85d',
      text: '#1f2937',
      muted: '#64748b'
    }
  },
  simple: {
    name: 'Simple',
    description: 'Minimalist and ATS-friendly - works everywhere',
    colors: {
      primary: '#000000',
      secondary: '#374151',
      accent: '#4b5563',
      text: '#111827',
      muted: '#6b7280'
    }
  }
}

export const emptyResume: Omit<Resume, 'id' | 'userId' | 'createdAt' | 'lastUpdated'> = {
  name: 'My Resume',
  template: 'modern',
  contact: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: []
}
