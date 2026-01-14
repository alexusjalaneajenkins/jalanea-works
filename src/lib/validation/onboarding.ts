import { z } from 'zod'

// School options matching existing data
const schoolOptions = ['valencia', 'ucf', 'seminole', 'orange', 'fullsail', 'other'] as const
const degreeOptions = ['certificate', 'associate', 'bachelor', 'other'] as const
const statusOptions = ['current', 'alumni'] as const
const availabilityOptions = ['open', 'weekdays', 'weekends', 'specific'] as const
const languageOptions = ['en', 'es'] as const

// Credential schema (education entries)
export const credentialSchema = z.object({
  id: z.string(),
  school: z.enum(schoolOptions),
  program: z.string().min(1, 'Program is required'),
  degreeType: z.enum(degreeOptions),
  graduationYear: z.string().min(4, 'Graduation year required'),
  status: z.enum(statusOptions),
})

export type Credential = z.infer<typeof credentialSchema>

// Step 1: Foundation schema
export const foundationSchema = z.object({
  preferredLanguage: z.enum(languageOptions),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(3, 'Address is required'),
  addressCoords: z.object({
    lat: z.number(),
    lng: z.number(),
  }).nullable().optional(),
  linkedInUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  credentials: z.array(credentialSchema).min(1, 'At least one credential required'),
})

export type FoundationData = z.infer<typeof foundationSchema>

// Step 2: Transportation schema
export const transportationSchema = z.object({
  transportMethods: z.array(z.string()).min(1, 'Select at least one transport method'),
  maxCommute: z.number().min(15, 'Minimum 15 minutes').max(60, 'Maximum 60 minutes'),
})

export type TransportationData = z.infer<typeof transportationSchema>

// Step 3: Availability schema
export const availabilitySchema = z.object({
  availability: z.enum(availabilityOptions, {
    message: 'Select your availability',
  }),
  specificDays: z.array(z.string()).optional(),
  preferredShifts: z.array(z.string()).min(1, 'Select at least one shift'),
}).refine(
  (data) => data.availability !== 'specific' || (data.specificDays && data.specificDays.length > 0),
  { message: 'Select at least one day', path: ['specificDays'] }
)

export type AvailabilityData = z.infer<typeof availabilitySchema>

// Step 4: Salary schema
export const salarySchema = z.object({
  salaryMin: z.number().min(1, 'Minimum salary required'),
  salaryMax: z.number().min(1, 'Maximum salary required'),
}).refine(
  (data) => data.salaryMax > data.salaryMin,
  { message: 'Maximum must be greater than minimum', path: ['salaryMax'] }
)

export type SalaryData = z.infer<typeof salarySchema>

// Step 5: Challenges schema (all optional)
export const challengesSchema = z.object({
  challenges: z.array(z.string()).optional(),
  realityContext: z.string().max(500, 'Maximum 500 characters').optional(),
})

export type ChallengesData = z.infer<typeof challengesSchema>

// Combined onboarding schema (for final submission validation)
export const onboardingSchema = z.object({
  // Language
  preferredLanguage: z.enum(languageOptions),

  // Foundation
  fullName: z.string().min(2),
  address: z.string().min(3),
  addressCoords: z.object({
    lat: z.number(),
    lng: z.number(),
  }).nullable().optional(),
  linkedInUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  credentials: z.array(credentialSchema).min(1),

  // Legacy fields (kept for API compatibility)
  education: z.string().optional(),
  valenciaProgram: z.string().optional(),
  otherInstitution: z.string().optional(),

  // Transportation
  transportMethods: z.array(z.string()).min(1),
  maxCommute: z.number().min(15).max(60),

  // Availability
  availability: z.enum(availabilityOptions),
  specificDays: z.array(z.string()).optional(),
  preferredShifts: z.array(z.string()).min(1),

  // Salary
  salaryMin: z.number().min(1),
  salaryMax: z.number().min(1),

  // Challenges
  challenges: z.array(z.string()).optional(),
  realityContext: z.string().optional(),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

// Validation result type
export type ValidationResult<T> =
  | { success: true; data: T; error: undefined }
  | { success: false; data: undefined; error: { errors: Array<{ path: string[]; message: string }> } }

// Helper to transform Zod result to our format
function transformResult<T>(result: { success: true; data: T } | { success: false; error: z.core.$ZodError }): ValidationResult<T> {
  if (result.success) {
    return { success: true, data: result.data, error: undefined }
  }
  return {
    success: false,
    data: undefined,
    error: {
      errors: result.error.issues.map(issue => ({
        path: issue.path.map(String),
        message: issue.message,
      }))
    }
  }
}

// Validation helper functions
export function validateFoundation(data: unknown): ValidationResult<FoundationData> {
  return transformResult(foundationSchema.safeParse(data))
}

export function validateTransportation(data: unknown): ValidationResult<TransportationData> {
  return transformResult(transportationSchema.safeParse(data))
}

export function validateAvailability(data: unknown): ValidationResult<AvailabilityData> {
  return transformResult(availabilitySchema.safeParse(data))
}

export function validateSalary(data: unknown): ValidationResult<SalaryData> {
  return transformResult(salarySchema.safeParse(data))
}

export function validateChallenges(data: unknown): ValidationResult<ChallengesData> {
  return transformResult(challengesSchema.safeParse(data))
}

export function validateOnboarding(data: unknown): ValidationResult<OnboardingData> {
  return transformResult(onboardingSchema.safeParse(data))
}
