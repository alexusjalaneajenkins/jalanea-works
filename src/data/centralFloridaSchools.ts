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
      // Bachelor's Programs (BS/BAS) - 7 total
      'Business and Organizational Leadership (BAS)',
      'Computing Technology and Software Development (BAS)',
      'Public Safety Administration (BAS)',
      'Cardiopulmonary Sciences (BS)',
      'Electrical and Computer Engineering Technology (BS)',
      'Nursing (BS)',
      'Radiologic and Imaging Sciences (BS)',
      // Associate in Science (AS) Programs - 43 total
      'Accounting Technology (AS)',
      'Administrative Office Management (AS)',
      'Advanced Manufacturing & Automation Technology (AS)',
      'Baking and Pastry Management (AS)',
      'Biotechnology Laboratory Sciences (AS)',
      'Business Administration (AS)',
      'Cardiovascular Technology (AS)',
      'Computer-Aided Drafting and Design Technology (AS)',
      'Computer Information Technology (AS)',
      'Computer Programming and Analysis (AS)',
      'Construction and Civil Engineering Technology (AS)',
      'Criminal Justice (AS)',
      'Criminal Justice Law Enforcement Academy Track (AS)',
      'Culinary Management (AS)',
      'Cybersecurity & Network Engineering Technology (AS)',
      'Dental Hygiene (AS)',
      'Diagnostic Medical Sonography (AS)',
      'Digital Media Technology (AS)',
      'Electrical and Computer Engineering Technology (AS)',
      'Emergency Medical Services Technology (AS)',
      'Energy Management and Controls Technology (AS)',
      'Film Production Technology (AS)',
      'Fire Science Academy Track (AS)',
      'Fire Science Technology (AS)',
      'Graphic and Interactive Design (AS)',
      'Health Information Technology (AS)',
      'Health Navigator (AS)',
      'Hospitality and Tourism Management (AS)',
      'Live Entertainment Design and Production (AS)',
      'Medical Administration (AS)',
      'New Media Communication (AS)',
      'Nursing (AS)',
      'Paralegal Studies (AS)',
      'Plant Science and Agricultural Technology (AS)',
      'Property Management (AS)',
      'Radiography (AS)',
      'Respiratory Care (AS)',
      'Science, Technology, Engineering and Math - STEM (AS)',
      'Semiconductor Engineering Technology (AS)',
      'Sound Production Technology (AS)',
      'Supervision and Management for Industry (AS)',
      // Certificates (popular selections)
      'Cloud Computing Specialist',
      'Web Development Specialist',
      'Network Support Technician',
      'Cybersecurity Specialist',
      'Medical Coder/Biller',
      'EMT',
      'Paramedic',
      'Accounting Applications',
      'Digital Photography',
      'Graphic Design Production',
    ],
  },
  {
    id: 'ucf',
    name: 'University of Central Florida',
    shortName: 'UCF',
    logo: 'https://www.ucf.edu/wp-content/uploads/2022/08/apple-touch-icon.png',
    programs: [
      // Arts and Humanities
      'Art (BA)',
      'Architecture (BDes)',
      'Emerging Media (BFA)',
      'English (BA)',
      'French and Francophone Studies (BA)',
      'History (BA)',
      'Humanities and Cultural Studies (BA)',
      'Latin American Caribbean and Latinx Studies (BA)',
      'Music (BA)',
      'Music Education (BME)',
      'Music Performance (BM)',
      'Philosophy (BA)',
      'Religion and Cultural Studies (BA)',
      'Spanish (BA)',
      'Studio Art (BFA)',
      'Theatre (BA)',
      'Theatre (BFA)',
      'Writing and Rhetoric (BA)',
      // Business
      'Accounting (BSBA)',
      'Business Economics (BSBA)',
      'Economics (BS)',
      'Finance (BSBA)',
      'Integrated Business (BSBA)',
      'Management (BSBA)',
      'Marketing (BSBA)',
      'Real Estate (BSBA)',
      // Engineering and Computer Science
      'Aerospace Engineering (BSAE)',
      'Civil Engineering (BSCE)',
      'Computer Engineering (BSCpE)',
      'Computer Science (BS)',
      'Construction Engineering (BSConE)',
      'Electrical Engineering (BSEE)',
      'Environmental Engineering (BSVE)',
      'Industrial Engineering (BSIE)',
      'Information Technology (BS)',
      'Materials Science and Engineering (BS)',
      'Mechanical Engineering (BSME)',
      // Health Professions and Sciences
      'Communication Sciences and Disorders (BS)',
      'Health Sciences (BS)',
      'Interdisciplinary Healthcare Studies (BS)',
      'Kinesiology (BS)',
      'Social Work (BSW)',
      // Hospitality Management (Rosen College)
      'Entertainment Management (BS)',
      'Event Management (BS)',
      'Hospitality Management (BS)',
      'Lifestyle Community Management (BS)',
      'Lodging and Restaurant Management (BS)',
      'Theme Park and Attraction Management (BS)',
      // Medicine
      'Biomedical Sciences (BS)',
      'Biotechnology (BS)',
      'Medical Laboratory Sciences (BS)',
      'Molecular and Cellular Biology (BS)',
      'Molecular Microbiology (BS)',
      // Nursing
      'Nursing (BSN)',
      'Nursing RN to BSN (BSN)',
      // Optics and Photonics
      'Photonic Science and Engineering (BSPSE)',
      // Sciences
      'Actuarial Science (BS)',
      'Advertising/Public Relations (BA)',
      'Anthropology (BA)',
      'Biology (BS)',
      'Chemistry (BS)',
      'Communication (BA)',
      'Communication and Conflict (BA)',
      'Data Science (BS)',
      'Digital Media (BA)',
      'Film (BA)',
      'Film (BFA)',
      'Forensic Science (BS)',
      'International and Global Studies (BA)',
      'Journalism (BA)',
      'Mathematics (BS)',
      'Media Production and Management (BA)',
      'Physics (BS)',
      'Political Science (BA)',
      'Psychology (BS)',
      'Social Sciences (BS)',
      'Sociology (BS)',
      'Statistics (BS)',
      // Education and Community Programs
      'Career and Technical Education (BS)',
      'Criminal Justice (BS)',
      'Early Childhood Development and Education (BS)',
      'Elementary Education (BS)',
      'Emergency Management (BS)',
      'Environmental Science (BS)',
      'Environmental Studies (BS)',
      'Exceptional Student Education (BS)',
      'Health Informatics (BS)',
      'Health Information Management (BS)',
      'Health Services Administration (BS)',
      'Integrative General Studies (BGS)',
      'Interdisciplinary Studies (BS)',
      'Leadership (BS)',
      'Legal Studies (BS)',
      'Nonprofit Management (BS)',
      'Public Administration (BS)',
      'Secondary Education (BS)',
      'Sustainability (BS)',
    ],
  },
  {
    id: 'seminole',
    name: 'Seminole State College',
    shortName: 'Seminole State',
    logo: 'https://www.seminolestate.edu/ssap/assets/source/website/branding/apple-touch-icon.png',
    programs: [
      // Bachelor's Programs (BS/BAS) - 11 total
      'Business and Information Management (BS)',
      'Management and Organizational Leadership (BAS)',
      'Construction (BS)',
      'Interior Design (BAS)',
      'Elementary Education K-6 (BS)',
      'Exceptional Student Education K-12 (BS)',
      'Health Sciences (BS)',
      'Public Safety Administration (BS)',
      'RN-to-BSN (BS)',
      'Engineering Technology (BS)',
      'Information Systems Technology (BS)',
      // Associate Programs (AS)
      'Accounting (AS)',
      'Administrative Office Management (AS)',
      'Automotive Engineering Technology (AS)',
      'Business Administration (AS)',
      'Computer Information Technology (AS)',
      'Computer Programming & Analysis (AS)',
      'Criminal Justice Technology (AS)',
      'Early Childhood Education (AS)',
      'Engineering Technology (AS)',
      'Fire Science Technology (AS)',
      'Health Information Technology (AS)',
      'Information Systems Technology (AS)',
      'Interior Design (AS)',
      'Legal Assistant/Paralegal (AS)',
      'Network Systems Technology (AS)',
      'Nursing (AS)',
      'Physical Therapist Assistant (AS)',
      'Respiratory Therapy (AS)',
      'Supply Chain Management (AS)',
      // Certificates
      'Cybersecurity',
      'Computer Programming',
      'Web Development',
      'Network Systems Technology',
      'Emergency Medical Technician',
      'Entrepreneurship',
      'Human Resources Administration',
      'Mechatronics',
    ],
  },
  {
    id: 'orange',
    name: 'Orange Technical College',
    shortName: 'Orange Tech',
    logo: null, // Use text fallback "OTC"
    programs: [
      // All programs are certificates (no degrees)
      'Welding Technology',
      'Welding Technology - Advanced',
      'Master Automotive Service Technology 1',
      'Master Automotive Service Technology 2',
      'HVAC/R 1',
      'HVAC/R 2',
      'Electricity',
      'Plumbing',
      'Cosmetology',
      'Professional Culinary Arts & Hospitality',
      'Medical Administrative Specialist',
      'Medical Assisting',
      'Practical Nursing',
      'Dental Assisting Technology and Management',
      'Pharmacy Technician',
      'Surgical Technology',
      'Computer-Aided Drawing and Modeling',
      'Digital Media/Multimedia Design',
      'Enterprise Network and Server Support Technology',
      'Cybersecurity (Enterprise Desktop and Mobile Support)',
      'Commercial Vehicle Driving',
      'Diesel Systems Technician',
      'Massage Therapy',
      '3-D Animation Technology',
    ],
  },
  {
    id: 'fullsail',
    name: 'Full Sail University',
    shortName: 'Full Sail',
    logo: 'https://www.fullsail.edu/apple-touch-icon-precomposed.png',
    programs: [
      // Bachelor's Programs (BS/BFA)
      'Computer Animation (BS)',
      'Computer Science (BS)',
      'Creative Writing (BFA)',
      'Cybersecurity (BS)',
      'Digital Arts and Design (BS)',
      'Digital Cinematography (BS)',
      'Digital Marketing (BS)',
      'Entertainment Business (BS)',
      'Film (BS)',
      'Game Art (BS)',
      'Game Business and Esports (BS)',
      'Game Development (BS)',
      'Graphic Design (BS)',
      'Information Technology (BS)',
      'Media Communications (BS)',
      'Music Business (BS)',
      'Music Production (BS)',
      'Recording Arts (BS)',
      'Sports Marketing and Media (BS)',
      'User Experience (BS)',
      'Web Development (BS)',
      // Associate Programs (AS)
      'Recording Arts (AS)',
      'Graphic Design (AS)',
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
