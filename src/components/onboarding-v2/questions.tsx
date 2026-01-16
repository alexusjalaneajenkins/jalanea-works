/**
 * Question configurations for JalaneaWorks Onboarding v2
 */

import {
  Globe,
  User,
  MapPin,
  GraduationCap,
  Car,
  Bus,
  Bike,
  Clock,
  Calendar,
  Sun,
  Sunrise,
  Moon,
  Target,
  Heart,
  BookOpen
} from 'lucide-react'
import { QuestionConfig } from './types'

/**
 * All onboarding questions with conditional logic
 */
export const questions: QuestionConfig[] = [
  // Phase 1: About You
  {
    id: 'language',
    phase: 1,
    icon: <Globe size={20} />,
    title: 'Choose your language',
    type: 'single',
    options: [
      { value: 'english', label: 'English' },
      { value: 'spanish', label: 'Espa\u00f1ol' }
    ]
  },
  {
    id: 'name',
    phase: 1,
    icon: <User size={20} />,
    title: "What's your name?",
    type: 'input',
    placeholder: 'Enter your full name'
  },
  {
    id: 'location',
    phase: 1,
    icon: <MapPin size={20} />,
    title: 'Where are you located?',
    subtitle: 'Used to find jobs in your area',
    type: 'input',
    placeholder: 'City, State'
  },

  // Phase 2: Education
  {
    id: 'education-level',
    phase: 2,
    icon: <GraduationCap size={20} />,
    title: 'Highest education level?',
    type: 'single',
    options: [
      { value: 'high-school', label: 'High School / GED' },
      { value: 'some-college', label: 'Some College' },
      { value: 'completed', label: 'Completed Degree', sublabel: "We'll ask for details" }
    ]
  },
  {
    id: 'school',
    phase: 2,
    icon: <BookOpen size={20} />,
    title: 'Which school did you attend?',
    subtitle: 'Select your institution',
    type: 'school',
    showWhen: (answers) => answers['education-level'] === 'completed'
  },
  {
    id: 'education-details',
    phase: 2,
    icon: <GraduationCap size={20} />,
    title: 'Tell us about your degree',
    subtitle: 'This info helps craft your resume',
    type: 'education-details',
    showWhen: (answers) => answers['education-level'] === 'completed' && answers['school'] !== undefined
  },
  {
    id: 'career-paths',
    phase: 2,
    icon: <Target size={20} />,
    title: 'What career paths interest you?',
    subtitle: 'Select all that match your goals',
    type: 'career-paths',
    showWhen: (answers) => {
      const details = answers['education-details'] as { school?: string; degreeName?: string } | undefined
      return details?.school !== undefined && details?.degreeName !== undefined
    }
  },

  // Phase 3: Work Preferences
  {
    id: 'transport',
    phase: 3,
    icon: <Car size={20} />,
    title: 'How do you get around?',
    type: 'multi',
    options: [
      { value: 'car', label: 'Car', icon: <Car size={16} /> },
      { value: 'bus', label: 'Bus', icon: <Bus size={16} /> },
      { value: 'rideshare', label: 'Rideshare', icon: <Car size={16} /> },
      { value: 'bike', label: 'Bike/Walk', icon: <Bike size={16} /> }
    ]
  },
  {
    id: 'commute',
    phase: 3,
    icon: <Clock size={20} />,
    title: 'Max commute time?',
    type: 'chips',
    options: [
      { value: '15', label: '15 min' },
      { value: '30', label: '30 min' },
      { value: '45', label: '45 min' },
      { value: '60', label: '60+ min' }
    ]
  },
  {
    id: 'schedule',
    phase: 3,
    icon: <Calendar size={20} />,
    title: 'When can you work?',
    type: 'single',
    options: [
      { value: 'flexible', label: 'Flexible / Any Day' },
      { value: 'specific', label: 'Specific Days Only', sublabel: "I'll pick the days" }
    ]
  },
  {
    id: 'schedule-days',
    phase: 3,
    icon: <Calendar size={20} />,
    title: 'Which days can you work?',
    subtitle: "Select all days you're available",
    type: 'schedule-days',
    showWhen: (answers) => answers['schedule'] === 'specific'
  },
  {
    id: 'shifts',
    phase: 3,
    icon: <Sun size={20} />,
    title: 'Preferred shifts?',
    type: 'multi',
    options: [
      { value: 'morning', label: 'Morning', icon: <Sunrise size={16} /> },
      { value: 'afternoon', label: 'Afternoon', icon: <Sun size={16} /> },
      { value: 'evening', label: 'Evening', icon: <Moon size={16} /> },
      { value: 'overnight', label: 'Overnight', icon: <Moon size={16} /> }
    ]
  },

  // Phase 4: Goals
  {
    id: 'career-phase',
    phase: 4,
    icon: <Target size={20} />,
    title: 'Where are you in your journey?',
    subtitle: 'This helps us find the right opportunities',
    type: 'career-phase'
  },
  {
    id: 'salary-breakdown',
    phase: 4,
    icon: <Target size={20} />,
    title: "Here's what you can afford",
    subtitle: 'Based on your career phase selection',
    type: 'salary-breakdown',
    showWhen: (answers) => answers['career-phase'] !== undefined
  },
  {
    id: 'challenges',
    phase: 4,
    icon: <Heart size={20} />,
    title: 'Any challenges we can help with?',
    subtitle: 'Optional - helps us find support resources',
    type: 'multi',
    options: [
      { value: 'none', label: 'None' },
      { value: 'transport', label: 'Transportation' },
      { value: 'childcare', label: 'Childcare' },
      { value: 'language', label: 'Language barrier' },
      { value: 'health', label: 'Health' },
      { value: 'record', label: 'Background' }
    ]
  }
]
