// Navigation Routes
export enum NavRoute {
  HOME = 'home',
  ABOUT = 'about',
  DASHBOARD = 'dashboard',
  JOBS = 'jobs',
  RESUME = 'resume',
  SCHEDULE = 'schedule',
  AI_ASSISTANT = 'ai-assistant',
  JOB_AGENT = 'job-agent',
  ACCOUNT = 'account',
  ONBOARDING = 'onboarding',
}

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

  // Commute Data (from Google Maps)
  commute?: CommuteInfo;

  // Source URL (from SerpApi)
  applyUrl?: string;

  // Scam Detection (from Gemini analysis)
  scamLikelihood?: 'LOW' | 'MEDIUM' | 'HIGH';
  isScam?: boolean;
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

  // Outreach Templates
  outreachTemplates?: {
    connectionRequest: string;
    coldEmail: string;
  };

  // Action Plan
  actionPlan?: {
    research: string;
    synthesis: string;
    outreach: string;
    tailoring: string;
    community: string;
  };

  // Interactive Prompts (New)
  researchPrompt?: string;
  synthesisPrompt?: string;

  // Recommended Courses
  recommendedCourses?: Array<{
    title: string;
    provider: string;
    reason: string;
  }>;

  // Content Strategy
  contentStrategy?: {
    topic: string;
    whyItMatters: string;
    outline: string[];
  };

  // Resume Strategy
  resumeRecommendation?: {
    type: 'Chronological' | 'Functional' | 'Combination';
    reason: string;
  };

  // Community
  communitySuggestions?: Array<{
    name: string;
    type: string; // "LinkedIn Group", "Association", etc.
  }>;
}

// Education & Experience
export type DegreeType =
  | "Bachelor's (BS/BA)"
  | "Associate's (AS/AA)"
  | "Certificate"
  | "Master's (MS/MA/MBA)"
  | "Doctorate (PhD/EdD)"
  | "GED / High School"
  | "Professional (JD/MD)"
  | "Other";

export const DEGREE_TYPE_OPTIONS: DegreeType[] = [
  "Bachelor's (BS/BA)",
  "Associate's (AS/AA)",
  "Certificate",
  "Master's (MS/MA/MBA)",
  "Doctorate (PhD/EdD)",
  "GED / High School",
  "Professional (JD/MD)",
  "Other"
];

export interface Education {
  id?: string;
  degreeType?: DegreeType; // Dropdown selection for degree level
  degree: string;
  program?: string;        // Field of study / major
  school: string;
  year: string;            // Renamed from graduationYear to match Onboarding/Profile
  gradYear?: string;       // Alternative field name for compatibility
  details?: string;        // Added for major/program details
  gpa?: string;
}

export interface Experience {
  id?: string;
  role: string; // Renamed from title
  company: string;
  duration: string; // Replaces startDate/endDate
  description: string[]; // Changed from string to string[] for bullet points
}

// User Profile
export type WorkStyle = 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
export type LearningStyle = 'Video' | 'Reading' | 'Mixed';
export type TransportMode = 'Car' | 'Bus' | 'Bike' | 'Scooter' | 'Walk' | 'Uber';
export type EmploymentStatus = 'Unemployed' | 'Part-time' | 'Full-time' | 'Student';

export interface UserProfile {
  name?: string; // Added to match Onboarding usage
  email?: string; // Added to match Onboarding usage
  fullName: string;
  location: string;
  commuteCoords?: string; // lat,lon for distance calculations
  linkedinUrl?: string; // Keep for backward compatibility or map to 'linkedin'
  portfolioUrl?: string; // Keep for backward compatibility or map to 'portfolio'
  photoURL?: string;

  education: Education[];
  experience: Experience[];

  // Added Skills to match geminiService and Onboarding
  skills: {
    technical: string[];
    design: string[];
    soft: string[];
  };

  // Added Certifications to match geminiService
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;

  preferences: {
    targetRoles: string[];
    workStyles: WorkStyle[]; // Note: AuthContext uses string[] but here we try to be specific
    learningStyle: LearningStyle | string[]; // Allow array for Onboarding compatibility
    salary: number;
    transportMode: TransportMode | string[]; // Allow array for Onboarding compatibility
  };
  logistics: {
    isParent: boolean;
    childCount?: number;
    employmentStatus: EmploymentStatus;
    // Transport & Commute
    transportMode?: string | string[];
    commuteTolerance?: 'local' | 'standard' | 'extended';
    // Availability & Schedule
    availability?: 'open' | 'weekdays' | 'weekends' | 'flexible' | 'limited';
    selectedDays?: string[];
    shiftPreference?: string[];
    // Reality/Context
    realityContext?: string;
    selectedPrompts?: string[];
    urgencyLevel?: 'emergency' | 'bridge' | 'career';
  };
  onboardingCompleted: boolean;
  hasSetupSchedule?: boolean;
  savedJobs?: SavedJob[];
  updatedAt: string;

  // NEW: Financial planning fields from Money Talk step
  targetSalaryRange?: {
    min: number;
    max: number;
  };
  monthlyBudgetEstimate?: {
    monthlyNet: number;
    maxRent: number;
    maxCarPayment: number;
  };
  // Detailed budget breakdown from onboarding
  budgetData?: {
    grossAnnual: number;
    netAnnual: number;
    monthlyGross: number;
    monthlyNet: number;
    housing: number;
    utilities: number;
    carPayment: number;
    carInsurance: number;
    food: number;
    wants: number;
    savings: number;
    housingPercent: number;
    utilitiesPercent: number;
    transportPercent: number;
    foodPercent: number;
    wantsPercent: number;
    savingsPercent: number;
    maxQualifyingRent: number;
  };
  yearsOfExperience?: 'student' | 'entry-level' | 'associate';
  currentRole?: string;
  // Track onboarding progress
  onboardingStage?: number;
}

// Saved Job for tracking applications
export interface SavedJob {
  id: string;
  job: Job;
  savedAt: string;
  status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer';
  notes?: string;
  nextAction?: string;
  nextActionDate?: string;
}

// Market Demand data for degrees
export interface MarketDemand {
  demandLevel: 'High' | 'Moderate' | 'Low';
  percentChange: number;
  totalOpenings: number;
  topLocations: string[];
  averageSalary: string;
  lastUpdated: string;
}

// AI-generated industry resources
export interface IndustryPulseItem {
  id: string;
  title: string;
  source: string;
  url?: string;
  type: 'news' | 'course' | 'trend';
  reason?: string;
}

// Resume Types
export enum ResumeType {
  CHRONOLOGICAL = 'Chronological',
  FUNCTIONAL = 'Functional',
  COMBINATION = 'Combination',
  TARGETED = 'Targeted',
  INFOGRAPHIC = 'Infographic',
  MINI = 'Mini',
  FEDERAL = 'Federal',
}

export type ResumeFormat = 'chronological' | 'functional' | 'targeted';
export type FontFamily = 'serif' | 'sans' | 'mono';

export interface ResumeData {
  format: ResumeFormat;
  fontFamily: FontFamily;
  fontSize: number;
  profile: UserProfile;
  targetJob?: Job;
  customSections?: {
    summary?: string;
    skills?: string[];
    projects?: Array<{
      title: string;
      description: string;
      technologies: string[];
    }>;
  };
}

// Task & Schedule Types
export interface TaskCategory {
  id: string;
  label: string;
  color: string;
  icon?: string; // Made optional for Schedule.tsx compatibility
}

export interface ScheduleBlock {
  id: string;
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  title: string;
  categoryId: string; // Links to TaskCategory
  description?: string;
  isAiSuggested?: boolean;
  linkedTaskId?: string;
  isPowerHour?: boolean; // Power Hour block for job applications
  isNetworkingHour?: boolean; // Networking Hour block for connections
}

// TimeBlock is ScheduleBlock with date (used by Schedule.tsx)
export interface TimeBlock extends ScheduleBlock {
  date: string; // "2024-12-19"
}

export interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  subtasks?: ToDoItem[];
}

// ===== NEW: SerpApi & Google Maps Types =====

// SerpApi Job Search Response
export interface SerpApiJobResult {
  title: string;
  company_name: string;
  location: string;
  via: string;
  description: string;
  job_highlights?: Array<{
    title: string;
    items: string[];
  }>;
  related_links?: Array<{
    link: string;
    text: string;
  }>;
  extensions?: string[]; // e.g., ["Full-time", "Health insurance"]
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
    salary?: string;
  };
  apply_options?: Array<{
    title: string;
    link: string;
  }>;
}

export interface SerpApiResponse {
  search_metadata: {
    id: string;
    status: string;
    created_at: string;
    processed_at: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    location?: string;
  };
  jobs_results?: SerpApiJobResult[];
  error?: string;
}

// Google Maps Distance Matrix Response
export interface CommuteInfo {
  distance: {
    text: string;      // \"8.2 miles\"
    value: number;     // 13200 (meters)
  };
  duration: {
    text: string;      // \"15 mins\"
    value: number;     // 900 (seconds)
  };
  mode: 'driving' | 'walking' | 'bicycling' | 'transit';
  estimatedCost?: number; // For Uber/transit
}

export interface GoogleMapsDistanceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: Array<{
    elements: Array<{
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      status: string;
    }>;
  }>;
  status: string;
}

// API Request/Response Types for our Vercel Functions
export interface JobSearchRequest {
  query: string;
  location?: string;
  userLocation?: string; // For commute calculation
  transportMode?: TransportMode;

  // Advanced SerpApi parameters
  country?: string;      // gl: Country code (e.g., 'us', 'uk')
  language?: string;     // hl: Language code (e.g., 'en', 'es')
  radius?: number;       // lrad: Search radius in kilometers
  filters?: string;      // uds: Filter string (remote, no degree, etc.)
  nextPageToken?: string; // For pagination
}

export interface JobFilter {
  name: string;          // e.g., "Remote", "No degree"
  uds: string | null;    // Filter parameter to pass to API
  query: string | null;  // Modified query string
}

export interface JobSearchResponse {
  jobs: SerpApiJobResult[]; // Raw results from SerpApi
  totalResults: number;
  searchId: string;
  searchParameters: {
    query: string;
    location: string | null;
    country: string | null;
    language: string | null;
    radius: string | null;
    filters: string | null;
  };
  pagination: {
    hasNextPage: boolean;
    nextPageToken: string | null;
  };
  availableFilters: JobFilter[];
  error?: string;
}

// Transformed response from jobService (after converting SerpApiJobResult to Job)
export interface TransformedJobSearchResponse {
  jobs: Job[]; // Transformed Job objects
  totalResults: number;
  searchId: string;
  searchParameters: {
    query: string;
    location: string | null;
    country: string | null;
    language: string | null;
    radius: string | null;
    filters: string | null;
  };
  pagination: {
    hasNextPage: boolean;
    nextPageToken: string | null;
  };
  availableFilters: JobFilter[];
}

export interface CommuteRequest {
  origin: string;      // User's location
  destination: string; // Job location
  mode: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export interface CommuteResponse {
  commute: CommuteInfo;
  error?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'model'; // 'model' is used in AIChat.tsx
  role?: 'user' | 'model'; // Added to match AIChat.tsx usage
  timestamp: Date;
  isTyping?: boolean;
}

// ===== Web Speech API Types =====
// TypeScript declarations for the Web Speech API (browser native)

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

export type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;

  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;
}

export interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

export interface SpeechGrammar {
  src: string;
  weight: number;
}

export interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

// Extend Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
