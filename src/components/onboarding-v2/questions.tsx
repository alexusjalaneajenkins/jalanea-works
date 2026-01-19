/**
 * Question configurations for JalaneaWorks Onboarding v2
 * Supports both English and Spanish translations
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
import { t, Locale } from '@/i18n/config'

/**
 * Get translated onboarding questions based on locale
 */
export function getQuestions(locale: Locale = 'en'): QuestionConfig[] {
  return [
    // Phase 1: About You
    {
      id: 'language',
      phase: 1,
      icon: <Globe size={20} />,
      title: t(locale, 'language.title'),
      type: 'single',
      options: [
        { value: 'english', label: 'English' },
        { value: 'spanish', label: 'Español' }
      ]
    },
    {
      id: 'name',
      phase: 1,
      icon: <User size={20} />,
      title: t(locale, 'onboarding.questions.name.title'),
      type: 'input',
      placeholder: t(locale, 'onboarding.questions.name.placeholder')
    },
    {
      id: 'location',
      phase: 1,
      icon: <MapPin size={20} />,
      title: t(locale, 'onboarding.questions.location.title'),
      subtitle: t(locale, 'onboarding.questions.location.subtitle'),
      type: 'input',
      placeholder: t(locale, 'onboarding.questions.location.placeholder')
    },

    // Phase 2: Education
    {
      id: 'education-level',
      phase: 2,
      icon: <GraduationCap size={20} />,
      title: t(locale, 'onboarding.questions.educationLevel.title'),
      type: 'single',
      options: [
        { value: 'high-school', label: t(locale, 'onboarding.questions.educationLevel.highSchool') },
        { value: 'some-college', label: t(locale, 'onboarding.questions.educationLevel.someCollege') },
        { value: 'completed', label: t(locale, 'onboarding.questions.educationLevel.completed'), sublabel: t(locale, 'onboarding.questions.educationLevel.completedSub') }
      ]
    },
    {
      id: 'school',
      phase: 2,
      icon: <BookOpen size={20} />,
      title: t(locale, 'onboarding.questions.school.title'),
      subtitle: t(locale, 'onboarding.questions.school.subtitle'),
      type: 'school',
      showWhen: (answers) => answers['education-level'] === 'completed'
    },
    {
      id: 'education-details',
      phase: 2,
      icon: <GraduationCap size={20} />,
      title: t(locale, 'onboarding.questions.educationDetails.title'),
      subtitle: t(locale, 'onboarding.questions.educationDetails.subtitle'),
      type: 'education-details',
      showWhen: (answers) => answers['education-level'] === 'completed' && answers['school'] !== undefined
    },
    {
      id: 'career-paths',
      phase: 2,
      icon: <Target size={20} />,
      title: t(locale, 'onboarding.questions.careerPaths.title'),
      subtitle: t(locale, 'onboarding.questions.careerPaths.subtitle'),
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
      title: t(locale, 'onboarding.questions.transport.title'),
      type: 'multi',
      options: [
        { value: 'car', label: t(locale, 'onboarding.questions.transport.car'), icon: <Car size={16} /> },
        { value: 'bus', label: t(locale, 'onboarding.questions.transport.bus'), icon: <Bus size={16} /> },
        { value: 'rideshare', label: t(locale, 'onboarding.questions.transport.rideshare'), icon: <Car size={16} /> },
        { value: 'bike', label: t(locale, 'onboarding.questions.transport.bikeWalk'), icon: <Bike size={16} /> }
      ]
    },
    {
      id: 'commute',
      phase: 3,
      icon: <Clock size={20} />,
      title: t(locale, 'onboarding.questions.commute.title'),
      type: 'chips',
      options: [
        { value: '15', label: t(locale, 'onboarding.questions.commute.min15') },
        { value: '30', label: t(locale, 'onboarding.questions.commute.min30') },
        { value: '45', label: t(locale, 'onboarding.questions.commute.min45') },
        { value: '60', label: t(locale, 'onboarding.questions.commute.min60') }
      ]
    },
    {
      id: 'schedule',
      phase: 3,
      icon: <Calendar size={20} />,
      title: t(locale, 'onboarding.questions.schedule.title'),
      type: 'single',
      options: [
        { value: 'flexible', label: t(locale, 'onboarding.questions.schedule.flexible') },
        { value: 'specific', label: t(locale, 'onboarding.questions.schedule.specific'), sublabel: t(locale, 'onboarding.questions.schedule.specificSub') }
      ]
    },
    {
      id: 'schedule-days',
      phase: 3,
      icon: <Calendar size={20} />,
      title: t(locale, 'onboarding.questions.scheduleDays.title'),
      subtitle: t(locale, 'onboarding.questions.scheduleDays.subtitle'),
      type: 'schedule-days',
      showWhen: (answers) => answers['schedule'] === 'specific'
    },
    {
      id: 'shifts',
      phase: 3,
      icon: <Sun size={20} />,
      title: t(locale, 'onboarding.questions.shifts.title'),
      type: 'multi',
      options: [
        { value: 'morning', label: t(locale, 'onboarding.questions.shifts.morning'), icon: <Sunrise size={16} /> },
        { value: 'afternoon', label: t(locale, 'onboarding.questions.shifts.afternoon'), icon: <Sun size={16} /> },
        { value: 'evening', label: t(locale, 'onboarding.questions.shifts.evening'), icon: <Moon size={16} /> },
        { value: 'overnight', label: t(locale, 'onboarding.questions.shifts.overnight'), icon: <Moon size={16} /> }
      ]
    },

    // Phase 4: Goals
    {
      id: 'career-phase',
      phase: 4,
      icon: <Target size={20} />,
      title: t(locale, 'onboarding.questions.careerPhase.title'),
      subtitle: t(locale, 'onboarding.questions.careerPhase.subtitle'),
      type: 'career-phase'
    },
    {
      id: 'salary-breakdown',
      phase: 4,
      icon: <Target size={20} />,
      title: t(locale, 'onboarding.questions.salaryBreakdown.title'),
      subtitle: t(locale, 'onboarding.questions.salaryBreakdown.subtitle'),
      type: 'salary-breakdown',
      showWhen: (answers) => answers['career-phase'] !== undefined
    },
    {
      id: 'challenges',
      phase: 4,
      icon: <Heart size={20} />,
      title: t(locale, 'onboarding.questions.challenges.title'),
      subtitle: t(locale, 'onboarding.questions.challenges.subtitle'),
      type: 'multi',
      options: [
        { value: 'none', label: t(locale, 'onboarding.questions.challenges.none') },
        { value: 'transport', label: t(locale, 'onboarding.questions.challenges.transport') },
        { value: 'childcare', label: t(locale, 'onboarding.questions.challenges.childcare') },
        { value: 'language', label: t(locale, 'onboarding.questions.challenges.language') },
        { value: 'health', label: t(locale, 'onboarding.questions.challenges.health') },
        { value: 'record', label: t(locale, 'onboarding.questions.challenges.record') }
      ]
    }
  ]
}

// Export default questions for backward compatibility (English)
export const questions: QuestionConfig[] = getQuestions('en')
