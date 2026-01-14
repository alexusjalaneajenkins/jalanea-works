/**
 * Constants for the JalaneaWorks Onboarding Flow v2
 */

import {
  User,
  GraduationCap,
  Briefcase,
  Target,
  Rocket,
  TrendingUp,
  Award
} from 'lucide-react'
import { Phase, School, DegreeType, DayOfWeek, CareerPhase } from './types'

/**
 * Onboarding phase definitions (4 phases)
 */
export const phases: Phase[] = [
  { id: 1, name: 'About You', icon: <User size={16} /> },
  { id: 2, name: 'Education', icon: <GraduationCap size={16} /> },
  { id: 3, name: 'Work Preferences', icon: <Briefcase size={16} /> },
  { id: 4, name: 'Goals', icon: <Target size={16} /> }
]

/**
 * Central Florida schools for education selection
 */
export const schools: School[] = [
  { value: 'seminole', name: 'Seminole State College', abbr: 'SSC', color: '#003366' },
  { value: 'valencia', name: 'Valencia College', abbr: 'VC', color: '#1e3a5f' },
  { value: 'ucf', name: 'University of Central Florida', abbr: 'UCF', color: '#ffc904' },
  { value: 'fullsail', name: 'Full Sail University', abbr: 'FS', color: '#ff4444' },
  { value: 'orlando-tech', name: 'Orange Technical College', abbr: 'OTC', color: '#ff6b35' },
  { value: 'other', name: 'Other', abbr: '✎', color: '#ffc425' }
]

/**
 * Available degree types
 */
export const degreeTypes: DegreeType[] = [
  { value: 'certificate', label: 'Certificate' },
  { value: 'associates', label: 'Associates (AA/AS)' },
  { value: 'bachelors', label: 'Bachelors (BA/BS)' },
  { value: 'masters', label: 'Masters (MA/MS/MBA)' },
  { value: 'doctorate', label: 'Doctorate (PhD/EdD)' }
]

/**
 * Days of the week for schedule selection
 */
export const daysOfWeek: DayOfWeek[] = [
  { value: 'mon', label: 'Mon', full: 'Monday' },
  { value: 'tue', label: 'Tue', full: 'Tuesday' },
  { value: 'wed', label: 'Wed', full: 'Wednesday' },
  { value: 'thu', label: 'Thu', full: 'Thursday' },
  { value: 'fri', label: 'Fri', full: 'Friday' },
  { value: 'sat', label: 'Sat', full: 'Saturday' },
  { value: 'sun', label: 'Sun', full: 'Sunday' }
]

/**
 * Career phases with salary and affordability data
 */
export const careerPhases: CareerPhase[] = [
  {
    value: 'survival',
    name: 'Survival Jobs',
    icon: <Rocket size={24} />,
    salary: '$20K - $30K/yr',
    color: '#f97316',
    requirements: 'No experience needed',
    description: 'Immediate income, entry-level positions',
    monthly: { gross: 2083, rent: 650, car: 200, remaining: 733 }
  },
  {
    value: 'bridge',
    name: 'Bridge Jobs',
    icon: <TrendingUp size={24} />,
    salary: '$45K - $60K/yr',
    color: '#ffc425',
    requirements: 'Certificate + 2-5 yrs experience',
    description: 'Building towards your career',
    monthly: { gross: 4375, rent: 1200, car: 350, remaining: 1825 }
  },
  {
    value: 'career',
    name: 'Career Jobs',
    icon: <Award size={24} />,
    salary: '$60K+/yr',
    color: '#22c55e',
    requirements: 'Degree + professional experience',
    description: 'Long-term career positions',
    monthly: { gross: 5833, rent: 1600, car: 450, remaining: 2583 }
  }
]
