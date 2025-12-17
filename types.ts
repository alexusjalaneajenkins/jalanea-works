
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote' | 'Internship';
  salaryRange: string;
  postedAt: string;
  matchScore: number;
  skills: string[];
  description?: string; // Added for resume tailoring context
  experienceLevel: 'Entry Level' | 'Internship' | 'Associate' | 'Mid-Senior';
  bulletPoints?: string[]; // Added for scannable descriptions

  // Extended UI Fields
  matchReason?: string;
  timeToApply?: string;
  isPartner?: boolean;
  alumniHired?: number;
  competition?: string;

  // New Specific Fields
  locationType?: 'Remote' | 'On-site' | 'Hybrid';
  experienceYears?: string;
  logo?: string;

  // The AI "Mission Briefing" Data
  analysis?: JobAnalysis;
}

export interface JobAnalysis {
  summary: string;
  idealCandidateProfile: string;
  candidateExpectations: string;
  interviewProcess: string[];

  // Enhanced Hiring Team
  hiringTeamTargets: Array<{
    role: string;
    reason: string;
  }>;

  // Enhanced Portfolio
  portfolioAdvice: Array<{
    title: string;
    description: string;
    action: string;
  }>;

  actionPlan: {
    research: string;
    synthesis: string;
    outreach: string;
    tailoring: string;
    community: string;
  };

  // NEW: Strategic Additions
  recommendedCourses: Array<{ title: string; provider: string; reason: string }>;
  contentStrategy: {
    topic: string;
    whyItMatters: string;
    outline: string[];
  };
  outreachTemplates: {
    connectionRequest: string;
    coldEmail: string;
  };
}

export interface User {
  name: string;
  role: string;
  avatar: string;
}

export interface Education {
  degree: string;
  school: string;
  gpa?: string;
  year?: string;
  details?: string;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string[]; // Bullet points
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  details?: string;
}

export type LearningStyle = 'Video' | 'Reading' | 'Both';
export type TransportMode = 'Car' | 'Bus' | 'Bike' | 'Scooter' | 'Walk' | 'Uber';
export type EmploymentStatus = 'Unemployed' | 'Full-time' | 'Part-time' | 'Multiple Jobs' | 'Student';

export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  location?: string;
  education: Education[];
  experience: Experience[];
  skills: {
    technical: string[];
    design: string[];
    soft: string[];
  };
  certifications: Certification[];

  // Preferences
  learningStyle: LearningStyle[]; // Changed to array
  transportMode: TransportMode[]; // Changed to array

  // Logistics & Lifestyle
  isParent: boolean;
  childCount?: number;
  employmentStatus: EmploymentStatus;
  availableHoursPerDay?: number;
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: Date;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  followUpDate: Date;
  aiTip: string;
}

export enum NavRoute {
  HOME = 'home',
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard',
  SCHEDULE = 'schedule',
  PROFILE = 'profile',
  JOBS = 'jobs',
  RESUME = 'resume',
  ABOUT = 'about'
}

export enum ResumeType {
  CHRONOLOGICAL = 'Chronological',
  FUNCTIONAL = 'Functional',
  COMBINATION = 'Combination',
  TARGETED = 'Targeted',
  INFOGRAPHIC = 'Infographic',
  MINI = 'Mini',
  FEDERAL = 'Federal'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Schedule & Task Types
export interface TaskCategory {
  id: string;
  label: string;
  color: string; // Hex code
  icon?: string;
}

export interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  title: string;
  categoryId: string; // Links to TaskCategory
  description?: string;
  isAiSuggested?: boolean;
  linkedTaskId?: string;
}

export interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  subtasks?: ToDoItem[];
}
