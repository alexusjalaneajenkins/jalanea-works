// Central Florida Schools Data
// Per BUILD_PLAN_v1.0.md and USER_EXPERIENCE_v1.0.md

export type SchoolId = 'valencia' | 'ucf' | 'seminole' | 'orange' | 'fullsail' | 'other'

export interface School {
  id: SchoolId
  name: string
  shortName: string
  logo: string | null
  programs: string[]
}

// Central Florida schools with programs
export const CENTRAL_FL_SCHOOLS: School[] = [
  {
    id: 'valencia',
    name: 'Valencia College',
    shortName: 'Valencia',
    logo: 'https://valenciacollege.edu/android-chrome-192x192.png',
    programs: [
      // BAS Programs
      'Computing Technology & Software Development (BAS)',
      'Organizational Management (BAS)',
      'Business & Organizational Leadership (BAS)',
      // AS Programs
      'Interactive Design (AS)',
      'Computer Programming & Analysis (AS)',
      'Accounting Technology (AS)',
      'Business Administration (AS)',
      'Paralegal Studies (AS)',
      'Nursing (AS)',
      // Certificates
      'IT Support Specialist',
      'Accounting Applications',
      'Web Development Specialist',
      'Network Support Technician',
      'Medical Coding',
      'Pharmacy Technician',
      'HVAC Technician',
      'Welding Technology',
      'Automotive Service Technology',
    ],
  },
  {
    id: 'ucf',
    name: 'University of Central Florida',
    shortName: 'UCF',
    logo: 'https://www.ucf.edu/wp-content/uploads/2022/08/apple-touch-icon.png',
    programs: [
      // Business
      'Accounting (BSBA)',
      'Business Economics (BSBA)',
      'Economics (BS)',
      'Finance (BSBA)',
      'Integrated Business (BSBA)',
      'Management (BSBA)',
      'Marketing (BSBA)',
      'Real Estate (BSBA)',
      // Engineering & Computer Science
      'Aerospace Engineering (BSAE)',
      'Civil Engineering (BSCE)',
      'Computer Engineering (BSCpE)',
      'Computer Science (BS)',
      'Construction Engineering (BSConE)',
      'Electrical Engineering (BSEE)',
      'Industrial Engineering (BSIE)',
      'Information Technology (BS)',
      'Mechanical Engineering (BSME)',
      // Health & Medicine
      'Biomedical Sciences (BS)',
      'Health Sciences (BS)',
      'Kinesiology (BS)',
      'Nursing (BSN)',
      'Psychology (BS)',
      'Social Work (BSW)',
      // Sciences
      'Biology (BS)',
      'Chemistry (BS)',
      'Data Science (BS)',
      'Mathematics (BS)',
      'Physics (BS)',
      'Statistics (BS)',
      // Arts & Humanities
      'Communication (BA)',
      'Digital Media (BA)',
      'English (BA)',
      'Film (BFA)',
      'History (BA)',
      'Journalism (BA)',
      'Music (BA)',
      'Political Science (BA)',
      'Sociology (BA)',
      // Hospitality (Rosen College)
      'Hospitality Management (BS)',
      'Event Management (BS)',
      'Entertainment Management (BS)',
      'Theme Park and Attraction Management (BS)',
      // Education
      'Elementary Education (BS)',
      'Secondary Education (BS)',
      'Criminal Justice (BS)',
      'Legal Studies (BS)',
    ],
  },
  {
    id: 'seminole',
    name: 'Seminole State College',
    shortName: 'Seminole State',
    logo: 'https://www.seminolestate.edu/ssap/assets/source/website/branding/apple-touch-icon.png',
    programs: [
      'Computer Information Technology (AS)',
      'Computer Programming & Analysis (AS)',
      'Engineering Technology (AS)',
      'Business Administration (AS)',
      'Nursing (AS)',
      'Paralegal Studies (AS)',
      'Interior Design (AS)',
      'Network Systems Technology',
      'Web Development',
      'Cybersecurity',
    ],
  },
  {
    id: 'orange',
    name: 'Orange Technical College',
    shortName: 'Orange Tech',
    logo: null, // Use text fallback "OTC"
    programs: [
      'Welding Technology',
      'Automotive Service Technology',
      'HVAC/R Technician',
      'Electrical Trades',
      'Plumbing Technology',
      'Cosmetology',
      'Culinary Arts',
      'Medical Administrative Specialist',
      'Practical Nursing',
      'Dental Assisting',
    ],
  },
  {
    id: 'fullsail',
    name: 'Full Sail University',
    shortName: 'Full Sail',
    logo: 'https://www.fullsail.edu/apple-touch-icon-precomposed.png',
    programs: [
      'Game Design (BS)',
      'Computer Animation (BS)',
      'Film Production (BS)',
      'Music Production (BS)',
      'Digital Marketing (BS)',
      'Web Development (BS)',
      'Graphic Design (BS)',
      'Sports Marketing & Media (BS)',
      'Entertainment Business (BS)',
      'Media Communications (BS)',
    ],
  },
  {
    id: 'other',
    name: 'Other / Self-Taught',
    shortName: 'Other',
    logo: null, // Use GraduationCap icon
    programs: [], // Free text input
  },
]

// Helper to get school by ID
export function getSchoolById(id: SchoolId): School | undefined {
  return CENTRAL_FL_SCHOOLS.find((s) => s.id === id)
}

// Helper to search programs across all schools
export function searchSchoolPrograms(schoolId: SchoolId, query: string): string[] {
  const school = getSchoolById(schoolId)
  if (!school || school.programs.length === 0) return []

  const normalizedQuery = query.toLowerCase().trim()
  if (!normalizedQuery) return school.programs.slice(0, 10) // Return first 10 if no query

  return school.programs.filter((program) =>
    program.toLowerCase().includes(normalizedQuery)
  )
}

// Degree types
export const DEGREE_TYPES = [
  { value: 'certificate', label: 'Certificate', labelEs: 'Certificado' },
  { value: 'associate', label: 'Associate (AS/AA)', labelEs: 'Asociado (AS/AA)' },
  { value: 'bachelor', label: "Bachelor's (BS/BA/BAS)", labelEs: 'Licenciatura (BS/BA/BAS)' },
  { value: 'other', label: 'Other', labelEs: 'Otro' },
] as const

// Salary tiers for Orlando rent calculator
// Per BUILD_PLAN_v1.0.md Task 2.3 and orlando_rent_data table
export const SALARY_TIERS = [
  {
    id: 'entry',
    label: 'Entry Level',
    labelEs: 'Nivel de entrada',
    range: '$30K - $40K',
    min: 30000,
    max: 40000,
    housingAffordable: ['Studio', '1BR'],
    description: 'Can afford a studio or 1-bedroom apartment',
    descriptionEs: 'Puede pagar un estudio o apartamento de 1 habitación',
  },
  {
    id: 'bridge',
    label: 'Bridge Role',
    labelEs: 'Puesto intermedio',
    range: '$40K - $52K',
    min: 40000,
    max: 52000,
    housingAffordable: ['1BR', '2BR'],
    description: 'Can afford a 1-2 bedroom apartment',
    descriptionEs: 'Puede pagar un apartamento de 1-2 habitaciones',
  },
  {
    id: 'professional',
    label: 'Professional',
    labelEs: 'Profesional',
    range: '$52K - $75K',
    min: 52000,
    max: 75000,
    housingAffordable: ['2BR', '3BR'],
    description: 'Can afford a 2-3 bedroom apartment',
    descriptionEs: 'Puede pagar un apartamento de 2-3 habitaciones',
  },
  {
    id: 'executive',
    label: 'Executive',
    labelEs: 'Ejecutivo',
    range: '$75K+',
    min: 75000,
    max: 150000,
    housingAffordable: ['2BR', '3BR', 'House'],
    description: 'Full range of housing options',
    descriptionEs: 'Todas las opciones de vivienda',
  },
] as const

// Orlando rent data (from BUILD_PLAN orlando_rent_data table)
export const ORLANDO_RENT_DATA = {
  studio: { min: 850, max: 1100, label: 'Studio', labelEs: 'Estudio' },
  '1br': { min: 1000, max: 1300, label: '1 Bedroom', labelEs: '1 Habitación' },
  '2br': { min: 1300, max: 1700, label: '2 Bedroom', labelEs: '2 Habitaciones' },
  '3br': { min: 1650, max: 2200, label: '3 Bedroom', labelEs: '3 Habitaciones' },
} as const

// Calculate affordable housing based on salary (30% rule)
export function calculateAffordableHousing(annualSalary: number): {
  monthlyBudget: number
  affordable: string[]
} {
  const monthlyGross = annualSalary / 12
  const monthlyBudget = Math.round(monthlyGross * 0.3) // 30% of gross income

  const affordable: string[] = []

  if (monthlyBudget >= ORLANDO_RENT_DATA.studio.min) affordable.push('Studio')
  if (monthlyBudget >= ORLANDO_RENT_DATA['1br'].min) affordable.push('1BR')
  if (monthlyBudget >= ORLANDO_RENT_DATA['2br'].min) affordable.push('2BR')
  if (monthlyBudget >= ORLANDO_RENT_DATA['3br'].min) affordable.push('3BR')

  return { monthlyBudget, affordable }
}

// Commute tolerance options (replaces slider per plan)
export const COMMUTE_OPTIONS = [
  { value: 15, label: '15 min', labelEs: '15 min' },
  { value: 30, label: '30 min', labelEs: '30 min' },
  { value: 45, label: '45 min', labelEs: '45 min' },
  { value: 60, label: '60 min', labelEs: '60 min' },
] as const

// Transport methods
export const TRANSPORT_METHODS = [
  { value: 'car', label: 'Personal Car', labelEs: 'Auto propio', icon: 'Car' },
  { value: 'lynx', label: 'LYNX Bus', labelEs: 'Autobús LYNX', icon: 'Bus' },
  { value: 'rideshare', label: 'Rideshare (Uber/Lyft)', labelEs: 'Rideshare (Uber/Lyft)', icon: 'Car' },
  { value: 'walk', label: 'Walk/Bike', labelEs: 'Caminar/Bicicleta', icon: 'PersonStanding' },
] as const

// Challenge options (per BUILD_PLAN Task 2.3)
export const CHALLENGE_OPTIONS = [
  { value: 'single_parent', label: 'Single parent', labelEs: 'Padre/madre soltero/a' },
  { value: 'no_car', label: 'No reliable car', labelEs: 'Sin auto confiable' },
  { value: 'health', label: 'Health challenges', labelEs: 'Desafíos de salud' },
  { value: 'english_2nd', label: 'English is my 2nd language', labelEs: 'El inglés es mi segundo idioma' },
  { value: 'immediate_income', label: 'Need immediate income', labelEs: 'Necesito ingresos inmediatos' },
  { value: 'criminal_record', label: 'Criminal record', labelEs: 'Antecedentes penales' },
] as const
