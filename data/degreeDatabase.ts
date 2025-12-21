/**
 * Degree-Career Database
 * Valencia College & UCF Programs with Entry-Level Career Paths
 * For graduates with 0-2 years experience
 */

// ============================================================================
// TYPES
// ============================================================================

export type DegreeLevel =
    | 'Technical Certificate'
    | 'Advanced Technical Certificate'
    | 'Associate of Arts (A.A.)'
    | 'Associate of Science (A.S.)'
    | 'Bachelor of Applied Science (B.A.S.)'
    | 'Bachelor of Science (B.S.)';

export type Institution = 'Valencia College' | 'UCF' | 'Both';

export type CareerField =
    | 'Technology'
    | 'Healthcare'
    | 'Business'
    | 'Creative/Design'
    | 'Criminal Justice'
    | 'Hospitality'
    | 'Manufacturing'
    | 'Education'
    | 'Public Safety'
    | 'Engineering';

export interface EntryLevelCareer {
    title: string;
    averageSalary: string; // Range like "$35,000 - $45,000"
    description: string;
}

export interface DegreeProgram {
    id: string;
    name: string;
    level: DegreeLevel;
    institution: Institution;
    field: CareerField;
    description: string;
    keywords: string[]; // For search matching
    entryLevelCareers: EntryLevelCareer[];
}

// ============================================================================
// VALENCIA COLLEGE: ASSOCIATE OF SCIENCE (A.S.) DEGREES
// ============================================================================

export const VALENCIA_AS_DEGREES: DegreeProgram[] = [
    {
        id: 'vc-as-accounting',
        name: 'Accounting Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Business',
        description: 'Prepares students for careers in bookkeeping, payroll, and accounting support roles.',
        keywords: ['accounting', 'bookkeeping', 'payroll', 'finance', 'taxes', 'quickbooks'],
        entryLevelCareers: [
            { title: 'Accounting Clerk', averageSalary: '$35,000 - $42,000', description: 'Process invoices, payments, and maintain financial records' },
            { title: 'Bookkeeper', averageSalary: '$38,000 - $48,000', description: 'Maintain complete financial records for businesses' },
            { title: 'Payroll Specialist', averageSalary: '$40,000 - $50,000', description: 'Process employee payroll and tax filings' },
            { title: 'Accounts Payable/Receivable Clerk', averageSalary: '$34,000 - $42,000', description: 'Manage incoming and outgoing payments' }
        ]
    },
    {
        id: 'vc-as-admin-office',
        name: 'Administrative Office Management',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Business',
        description: 'Prepares students for administrative and office management positions.',
        keywords: ['administrative', 'office', 'management', 'secretary', 'executive assistant', 'admin'],
        entryLevelCareers: [
            { title: 'Administrative Assistant', averageSalary: '$35,000 - $45,000', description: 'Provide administrative support to executives or departments' },
            { title: 'Office Manager', averageSalary: '$40,000 - $52,000', description: 'Oversee daily office operations and staff' },
            { title: 'Executive Assistant', averageSalary: '$45,000 - $55,000', description: 'Provide high-level support to executives' },
            { title: 'Receptionist Coordinator', averageSalary: '$30,000 - $38,000', description: 'Manage front desk and visitor coordination' }
        ]
    },
    {
        id: 'vc-as-manufacturing',
        name: 'Advanced Manufacturing & Automation Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Manufacturing',
        description: 'Prepares students for careers in modern manufacturing and automation systems.',
        keywords: ['manufacturing', 'automation', 'robotics', 'CNC', 'machining', 'production'],
        entryLevelCareers: [
            { title: 'Manufacturing Technician', averageSalary: '$38,000 - $50,000', description: 'Operate and maintain manufacturing equipment' },
            { title: 'CNC Machine Operator', averageSalary: '$40,000 - $55,000', description: 'Program and operate computer-controlled machines' },
            { title: 'Automation Technician', averageSalary: '$45,000 - $58,000', description: 'Install and maintain automated systems' },
            { title: 'Quality Control Inspector', averageSalary: '$35,000 - $45,000', description: 'Inspect products for quality standards' }
        ]
    },
    {
        id: 'vc-as-baking',
        name: 'Baking and Pastry Management',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Hospitality',
        description: 'Prepares students for careers in professional baking and pastry arts.',
        keywords: ['baking', 'pastry', 'culinary', 'chef', 'bakery', 'desserts', 'cakes'],
        entryLevelCareers: [
            { title: 'Pastry Cook', averageSalary: '$28,000 - $38,000', description: 'Prepare pastries and desserts in restaurants or bakeries' },
            { title: 'Baker', averageSalary: '$30,000 - $40,000', description: 'Produce baked goods for retail or wholesale' },
            { title: 'Pastry Assistant', averageSalary: '$26,000 - $34,000', description: 'Support head pastry chef in kitchen operations' },
            { title: 'Bakery Manager Trainee', averageSalary: '$32,000 - $42,000', description: 'Learn to manage bakery operations' }
        ]
    },
    {
        id: 'vc-as-biotech',
        name: 'Biotechnology Laboratory Sciences',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Prepares students for careers in biotechnology and laboratory sciences.',
        keywords: ['biotechnology', 'laboratory', 'lab tech', 'research', 'science', 'biology'],
        entryLevelCareers: [
            { title: 'Laboratory Technician', averageSalary: '$35,000 - $45,000', description: 'Conduct laboratory tests and experiments' },
            { title: 'Research Assistant', averageSalary: '$32,000 - $42,000', description: 'Support scientific research projects' },
            { title: 'Quality Control Analyst', averageSalary: '$40,000 - $52,000', description: 'Test products for quality in biotech companies' },
            { title: 'Lab Assistant', averageSalary: '$30,000 - $38,000', description: 'Prepare samples and maintain lab equipment' }
        ]
    },
    {
        id: 'vc-as-business-admin',
        name: 'Business Administration',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Business',
        description: 'Provides foundational business knowledge for various business careers.',
        keywords: ['business', 'administration', 'management', 'operations', 'business admin'],
        entryLevelCareers: [
            { title: 'Business Analyst (Junior)', averageSalary: '$45,000 - $55,000', description: 'Analyze business processes and recommend improvements' },
            { title: 'Operations Coordinator', averageSalary: '$38,000 - $48,000', description: 'Coordinate daily business operations' },
            { title: 'Management Trainee', averageSalary: '$35,000 - $45,000', description: 'Learn business operations for future management role' },
            { title: 'Customer Service Manager Trainee', averageSalary: '$32,000 - $42,000', description: 'Lead customer service teams' }
        ]
    },
    {
        id: 'vc-as-cardiovascular',
        name: 'Cardiovascular Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Prepares students for careers in cardiac diagnostic testing.',
        keywords: ['cardiovascular', 'cardiac', 'heart', 'ecg', 'ekg', 'sonography', 'healthcare'],
        entryLevelCareers: [
            { title: 'Cardiovascular Technologist', averageSalary: '$50,000 - $65,000', description: 'Perform cardiac diagnostic tests' },
            { title: 'EKG Technician', averageSalary: '$35,000 - $45,000', description: 'Perform electrocardiogram readings' },
            { title: 'Cardiac Monitor Technician', averageSalary: '$38,000 - $48,000', description: 'Monitor patient heart rhythms' },
            { title: 'Echocardiography Technician', averageSalary: '$55,000 - $70,000', description: 'Perform heart ultrasound imaging' }
        ]
    },
    {
        id: 'vc-as-cad',
        name: 'Computer-Aided Drafting and Design Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Engineering',
        description: 'Prepares students for careers in technical drafting and CAD design.',
        keywords: ['CAD', 'drafting', 'AutoCAD', 'design', 'blueprints', 'technical drawing', 'architecture'],
        entryLevelCareers: [
            { title: 'CAD Technician', averageSalary: '$40,000 - $52,000', description: 'Create technical drawings using CAD software' },
            { title: 'Drafter', averageSalary: '$38,000 - $50,000', description: 'Prepare technical drawings and plans' },
            { title: 'Design Technician', averageSalary: '$42,000 - $55,000', description: 'Assist engineers with design projects' },
            { title: 'Junior Architect Technician', averageSalary: '$38,000 - $48,000', description: 'Support architectural design teams' }
        ]
    },
    {
        id: 'vc-as-cit',
        name: 'Computer Information Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Technology',
        description: 'Prepares students for careers in IT support and systems administration.',
        keywords: ['IT', 'information technology', 'computers', 'technical support', 'systems', 'network'],
        entryLevelCareers: [
            { title: 'IT Support Specialist', averageSalary: '$40,000 - $52,000', description: 'Provide technical support to users' },
            { title: 'Help Desk Technician', averageSalary: '$35,000 - $45,000', description: 'Resolve technical issues via phone or chat' },
            { title: 'Junior Systems Administrator', averageSalary: '$45,000 - $58,000', description: 'Maintain computer systems and networks' },
            { title: 'Desktop Support Technician', averageSalary: '$38,000 - $48,000', description: 'Set up and troubleshoot workstations' }
        ]
    },
    {
        id: 'vc-as-programming',
        name: 'Computer Programming and Analysis',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Technology',
        description: 'Prepares students for careers in software development and programming.',
        keywords: ['programming', 'software', 'coding', 'developer', 'java', 'python', 'web development'],
        entryLevelCareers: [
            { title: 'Junior Software Developer', averageSalary: '$50,000 - $65,000', description: 'Write and test code for applications' },
            { title: 'Web Developer', averageSalary: '$45,000 - $60,000', description: 'Build and maintain websites' },
            { title: 'QA Tester', averageSalary: '$40,000 - $52,000', description: 'Test software for bugs and issues' },
            { title: 'Associate Programmer', averageSalary: '$45,000 - $58,000', description: 'Write and debug code under supervision' }
        ]
    },
    {
        id: 'vc-as-criminal-justice',
        name: 'Criminal Justice',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Criminal Justice',
        description: 'Prepares students for careers in law enforcement and corrections.',
        keywords: ['criminal justice', 'police', 'law enforcement', 'corrections', 'security', 'crime'],
        entryLevelCareers: [
            { title: 'Correctional Officer', averageSalary: '$38,000 - $50,000', description: 'Supervise inmates in correctional facilities' },
            { title: 'Police Officer', averageSalary: '$45,000 - $58,000', description: 'Patrol communities and enforce laws' },
            { title: 'Security Officer', averageSalary: '$32,000 - $42,000', description: 'Protect property and people' },
            { title: 'Probation Officer Assistant', averageSalary: '$35,000 - $45,000', description: 'Support probation officers with caseloads' }
        ]
    },
    {
        id: 'vc-as-culinary',
        name: 'Culinary Management',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Hospitality',
        description: 'Prepares students for careers in culinary arts and kitchen management.',
        keywords: ['culinary', 'chef', 'cooking', 'kitchen', 'restaurant', 'food service'],
        entryLevelCareers: [
            { title: 'Line Cook', averageSalary: '$28,000 - $38,000', description: 'Prepare food in restaurant kitchens' },
            { title: 'Sous Chef Assistant', averageSalary: '$32,000 - $42,000', description: 'Assist head chef with kitchen operations' },
            { title: 'Kitchen Manager Trainee', averageSalary: '$35,000 - $45,000', description: 'Learn to manage kitchen operations' },
            { title: 'Catering Coordinator', averageSalary: '$32,000 - $40,000', description: 'Coordinate catering events and food prep' }
        ]
    },
    {
        id: 'vc-as-cybersecurity',
        name: 'Cybersecurity and Network Engineering Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Technology',
        description: 'Prepares students for careers in cybersecurity and network administration.',
        keywords: ['cybersecurity', 'security', 'network', 'hacking', 'firewall', 'SOC', 'analyst'],
        entryLevelCareers: [
            { title: 'Security Analyst (Junior)', averageSalary: '$55,000 - $70,000', description: 'Monitor systems for security threats' },
            { title: 'Network Technician', averageSalary: '$45,000 - $58,000', description: 'Install and maintain network systems' },
            { title: 'SOC Analyst', averageSalary: '$50,000 - $65,000', description: 'Monitor security operations center' },
            { title: 'IT Security Specialist', averageSalary: '$52,000 - $68,000', description: 'Implement security measures' }
        ]
    },
    {
        id: 'vc-as-dental-hygiene',
        name: 'Dental Hygiene',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Prepares students for careers as licensed dental hygienists.',
        keywords: ['dental', 'hygienist', 'teeth', 'dentist', 'oral health', 'dental hygiene'],
        entryLevelCareers: [
            { title: 'Dental Hygienist', averageSalary: '$60,000 - $78,000', description: 'Clean teeth and provide preventive dental care' },
            { title: 'Dental Assistant', averageSalary: '$35,000 - $45,000', description: 'Assist dentists during procedures' }
        ]
    },
    {
        id: 'vc-as-sonography',
        name: 'Diagnostic Medical Sonography',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Prepares students for careers in medical ultrasound imaging.',
        keywords: ['sonography', 'ultrasound', 'imaging', 'diagnostic', 'medical imaging', 'sonographer'],
        entryLevelCareers: [
            { title: 'Sonographer', averageSalary: '$55,000 - $72,000', description: 'Perform ultrasound examinations' },
            { title: 'Ultrasound Technician', averageSalary: '$52,000 - $68,000', description: 'Operate ultrasound equipment' },
            { title: 'Diagnostic Imaging Technician', averageSalary: '$48,000 - $62,000', description: 'Perform various diagnostic imaging procedures' }
        ]
    },
    {
        id: 'vc-as-electrical',
        name: 'Electrical and Computer Engineering Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Engineering',
        description: 'Prepares students for careers in electrical and electronics technology.',
        keywords: ['electrical', 'electronics', 'engineering', 'circuits', 'technician', 'electrical engineering'],
        entryLevelCareers: [
            { title: 'Electrical Technician', averageSalary: '$42,000 - $55,000', description: 'Install and maintain electrical systems' },
            { title: 'Electronics Technician', averageSalary: '$40,000 - $52,000', description: 'Repair and test electronic equipment' },
            { title: 'Engineering Technician', averageSalary: '$45,000 - $58,000', description: 'Support electrical engineers with projects' },
            { title: 'Controls Technician', averageSalary: '$48,000 - $62,000', description: 'Install and maintain control systems' }
        ]
    },
    {
        id: 'vc-as-fire-science',
        name: 'Fire Science Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Public Safety',
        description: 'Prepares students for careers in fire service and emergency response.',
        keywords: ['fire', 'firefighter', 'emergency', 'fire science', 'EMT', 'fire rescue'],
        entryLevelCareers: [
            { title: 'Firefighter', averageSalary: '$42,000 - $55,000', description: 'Respond to fires and emergencies' },
            { title: 'Fire Inspector', averageSalary: '$45,000 - $58,000', description: 'Inspect buildings for fire code compliance' },
            { title: 'Emergency Medical Technician (EMT)', averageSalary: '$32,000 - $42,000', description: 'Provide emergency medical care' },
            { title: 'Fire Prevention Specialist', averageSalary: '$40,000 - $52,000', description: 'Educate public on fire safety' }
        ]
    },
    {
        id: 'vc-as-graphic-design',
        name: 'Graphic and Interactive Design',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Creative/Design',
        description: 'Prepares students for careers in graphic design and digital media.',
        keywords: ['graphic design', 'design', 'photoshop', 'illustrator', 'creative', 'visual', 'UI', 'UX'],
        entryLevelCareers: [
            { title: 'Junior Graphic Designer', averageSalary: '$38,000 - $48,000', description: 'Create visual content for marketing materials' },
            { title: 'Production Artist', averageSalary: '$35,000 - $45,000', description: 'Prepare designs for print and digital production' },
            { title: 'Digital Content Creator', averageSalary: '$36,000 - $46,000', description: 'Create content for social media and websites' },
            { title: 'UI/UX Designer (Junior)', averageSalary: '$45,000 - $58,000', description: 'Design user interfaces for apps and websites' }
        ]
    },
    {
        id: 'vc-as-health-info',
        name: 'Health Information Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Prepares students for careers in health information management.',
        keywords: ['health information', 'medical records', 'HIT', 'EHR', 'coding', 'medical coding'],
        entryLevelCareers: [
            { title: 'Health Information Technician', averageSalary: '$40,000 - $52,000', description: 'Manage patient health records' },
            { title: 'Medical Coder', averageSalary: '$42,000 - $55,000', description: 'Assign codes for medical diagnoses and procedures' },
            { title: 'Medical Records Specialist', averageSalary: '$35,000 - $45,000', description: 'Organize and maintain medical records' },
            { title: 'Health Data Analyst', averageSalary: '$45,000 - $58,000', description: 'Analyze healthcare data for insights' }
        ]
    },
    {
        id: 'vc-as-hospitality',
        name: 'Hospitality and Tourism Management',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Hospitality',
        description: 'Prepares students for careers in hotels, resorts, and tourism.',
        keywords: ['hospitality', 'hotel', 'tourism', 'resort', 'travel', 'guest services', 'front desk'],
        entryLevelCareers: [
            { title: 'Front Desk Agent', averageSalary: '$28,000 - $36,000', description: 'Check guests in/out at hotels' },
            { title: 'Guest Services Coordinator', averageSalary: '$32,000 - $42,000', description: 'Ensure guest satisfaction' },
            { title: 'Event Coordinator Assistant', averageSalary: '$30,000 - $40,000', description: 'Help plan and execute events' },
            { title: 'Hotel Operations Trainee', averageSalary: '$30,000 - $38,000', description: 'Learn hotel management operations' }
        ]
    },
    {
        id: 'vc-as-new-media',
        name: 'New Media Communication',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Creative/Design',
        description: 'Prepares students for careers in digital media and video production.',
        keywords: ['media', 'video', 'film', 'production', 'broadcasting', 'digital media', 'content'],
        entryLevelCareers: [
            { title: 'Video Production Assistant', averageSalary: '$32,000 - $42,000', description: 'Assist with video shoots and editing' },
            { title: 'Social Media Coordinator', averageSalary: '$35,000 - $45,000', description: 'Manage social media accounts' },
            { title: 'Content Producer (Junior)', averageSalary: '$38,000 - $48,000', description: 'Create digital content for various platforms' },
            { title: 'Digital Marketing Assistant', averageSalary: '$35,000 - $45,000', description: 'Support digital marketing campaigns' }
        ]
    },
    {
        id: 'vc-as-nursing',
        name: 'Nursing (RN)',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Prepares students to become Registered Nurses.',
        keywords: ['nursing', 'RN', 'registered nurse', 'healthcare', 'patient care', 'nurse'],
        entryLevelCareers: [
            { title: 'Registered Nurse (RN)', averageSalary: '$55,000 - $72,000', description: 'Provide patient care in healthcare settings' },
            { title: 'Staff Nurse', averageSalary: '$52,000 - $68,000', description: 'Work as part of nursing team in hospitals' },
            { title: 'Home Health Nurse', averageSalary: '$50,000 - $65,000', description: 'Provide nursing care in patient homes' },
            { title: 'Clinic Nurse', averageSalary: '$48,000 - $62,000', description: 'Work in outpatient clinic settings' }
        ]
    },
    {
        id: 'vc-as-radiography',
        name: 'Radiography',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Prepares students for careers as radiologic technologists.',
        keywords: ['radiography', 'x-ray', 'radiology', 'imaging', 'radiologic', 'technologist'],
        entryLevelCareers: [
            { title: 'Radiologic Technologist', averageSalary: '$50,000 - $65,000', description: 'Perform X-ray examinations' },
            { title: 'X-Ray Technician', averageSalary: '$45,000 - $58,000', description: 'Operate X-ray equipment' },
            { title: 'Imaging Technician', averageSalary: '$48,000 - $62,000', description: 'Work with various imaging equipment' }
        ]
    },
    {
        id: 'vc-as-respiratory',
        name: 'Respiratory Care',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Prepares students for careers as respiratory therapists.',
        keywords: ['respiratory', 'breathing', 'lungs', 'pulmonary', 'therapy', 'respiratory therapy'],
        entryLevelCareers: [
            { title: 'Respiratory Therapist', averageSalary: '$52,000 - $68,000', description: 'Treat patients with breathing disorders' },
            { title: 'Respiratory Care Practitioner', averageSalary: '$50,000 - $65,000', description: 'Administer respiratory treatments' }
        ]
    },
    {
        id: 'vc-as-semiconductor',
        name: 'Semiconductor Engineering Technology',
        level: 'Associate of Science (A.S.)',
        institution: 'Valencia College',
        field: 'Engineering',
        description: 'Prepares students for careers in semiconductor manufacturing.',
        keywords: ['semiconductor', 'chips', 'microchip', 'electronics', 'manufacturing', 'cleanroom'],
        entryLevelCareers: [
            { title: 'Semiconductor Technician', averageSalary: '$45,000 - $60,000', description: 'Operate semiconductor manufacturing equipment' },
            { title: 'Process Technician', averageSalary: '$42,000 - $55,000', description: 'Monitor and control manufacturing processes' },
            { title: 'Cleanroom Technician', averageSalary: '$38,000 - $48,000', description: 'Work in cleanroom manufacturing environments' },
            { title: 'Equipment Technician', averageSalary: '$45,000 - $58,000', description: 'Maintain semiconductor equipment' }
        ]
    }
];

// ============================================================================
// VALENCIA COLLEGE: TECHNICAL CERTIFICATES
// ============================================================================

export const VALENCIA_TECHNICAL_CERTS: DegreeProgram[] = [
    {
        id: 'vc-tc-accounting-apps',
        name: 'Accounting Applications',
        level: 'Technical Certificate',
        institution: 'Valencia College',
        field: 'Business',
        description: 'Foundational accounting skills for entry-level positions.',
        keywords: ['accounting', 'quickbooks', 'bookkeeping'],
        entryLevelCareers: [
            { title: 'Accounting Clerk', averageSalary: '$32,000 - $40,000', description: 'Process basic accounting transactions' },
            { title: 'Billing Clerk', averageSalary: '$30,000 - $38,000', description: 'Generate and process invoices' }
        ]
    },
    {
        id: 'vc-tc-ai-foundations',
        name: 'Artificial Intelligence Foundations',
        level: 'Technical Certificate',
        institution: 'Valencia College',
        field: 'Technology',
        description: 'Introduction to AI concepts and applications.',
        keywords: ['AI', 'artificial intelligence', 'machine learning', 'data'],
        entryLevelCareers: [
            { title: 'AI Support Specialist', averageSalary: '$45,000 - $58,000', description: 'Support AI implementation projects' },
            { title: 'Data Entry Specialist', averageSalary: '$32,000 - $40,000', description: 'Prepare data for AI training' }
        ]
    },
    {
        id: 'vc-tc-cybersecurity',
        name: 'Cyber Security',
        level: 'Technical Certificate',
        institution: 'Valencia College',
        field: 'Technology',
        description: 'Foundational cybersecurity skills.',
        keywords: ['cybersecurity', 'security', 'hacking', 'network security'],
        entryLevelCareers: [
            { title: 'Security Operations Technician', averageSalary: '$42,000 - $55,000', description: 'Monitor security systems' },
            { title: 'IT Security Technician', averageSalary: '$40,000 - $52,000', description: 'Implement basic security measures' }
        ]
    },
    {
        id: 'vc-tc-digital-video',
        name: 'Digital Video Production',
        level: 'Technical Certificate',
        institution: 'Valencia College',
        field: 'Creative/Design',
        description: 'Skills in video production and editing.',
        keywords: ['video', 'production', 'editing', 'film', 'premiere', 'after effects'],
        entryLevelCareers: [
            { title: 'Video Editor', averageSalary: '$35,000 - $45,000', description: 'Edit video content' },
            { title: 'Production Assistant', averageSalary: '$28,000 - $36,000', description: 'Support video production crews' }
        ]
    },
    {
        id: 'vc-tc-emt',
        name: 'Emergency Medical Technology (EMT)',
        level: 'Technical Certificate',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Training to become an Emergency Medical Technician.',
        keywords: ['EMT', 'emergency', 'medical', 'ambulance', 'paramedic'],
        entryLevelCareers: [
            { title: 'Emergency Medical Technician', averageSalary: '$32,000 - $42,000', description: 'Provide emergency medical care' },
            { title: 'Ambulance Driver', averageSalary: '$28,000 - $35,000', description: 'Transport patients in emergencies' }
        ]
    },
    {
        id: 'vc-tc-robotics',
        name: 'Robotics Applications Technician',
        level: 'Technical Certificate',
        institution: 'Valencia College',
        field: 'Manufacturing',
        description: 'Skills in robotics and automation systems.',
        keywords: ['robotics', 'automation', 'manufacturing', 'robots'],
        entryLevelCareers: [
            { title: 'Robotics Technician', averageSalary: '$42,000 - $55,000', description: 'Maintain and program robots' },
            { title: 'Automation Operator', averageSalary: '$38,000 - $48,000', description: 'Operate automated systems' }
        ]
    },
    {
        id: 'vc-tc-3d-printing',
        name: 'Rapid Prototyping Specialist - 3-D Printing',
        level: 'Technical Certificate',
        institution: 'Valencia College',
        field: 'Manufacturing',
        description: 'Skills in 3D printing and rapid prototyping.',
        keywords: ['3D printing', 'prototyping', 'additive manufacturing', 'CAD'],
        entryLevelCareers: [
            { title: '3D Printing Technician', averageSalary: '$38,000 - $50,000', description: 'Operate 3D printers and create prototypes' },
            { title: 'Prototyping Specialist', averageSalary: '$40,000 - $52,000', description: 'Create product prototypes' }
        ]
    },
    {
        id: 'vc-tc-social-media',
        name: 'Social Media Communication Support',
        level: 'Technical Certificate',
        institution: 'Valencia College',
        field: 'Creative/Design',
        description: 'Skills in social media marketing and content creation.',
        keywords: ['social media', 'marketing', 'content', 'instagram', 'tiktok', 'facebook'],
        entryLevelCareers: [
            { title: 'Social Media Coordinator', averageSalary: '$32,000 - $42,000', description: 'Manage social media accounts' },
            { title: 'Content Creator', averageSalary: '$30,000 - $40,000', description: 'Create social media content' }
        ]
    }
];

// ============================================================================
// VALENCIA COLLEGE: ADVANCED TECHNICAL CERTIFICATES (ATC)
// ============================================================================

export const VALENCIA_ADVANCED_TECH_CERTS: DegreeProgram[] = [
    // ===== HEALTHCARE IMAGING ATCs =====
    {
        id: 'vc-atc-ct',
        name: 'Computed Tomography (CT)',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Advanced certification for CT scan technologists.',
        keywords: ['CT', 'computed tomography', 'CAT scan', 'imaging', 'radiology'],
        entryLevelCareers: [
            { title: 'CT Technologist', averageSalary: '$58,000 - $72,000', description: 'Operate CT scanning equipment' },
            { title: 'Diagnostic Imaging Specialist', averageSalary: '$55,000 - $68,000', description: 'Perform specialized diagnostic imaging' }
        ]
    },
    {
        id: 'vc-atc-mri',
        name: 'Magnetic Resonance Imaging (MRI)',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Advanced certification for MRI technologists.',
        keywords: ['MRI', 'magnetic resonance', 'imaging', 'radiology', 'magnet'],
        entryLevelCareers: [
            { title: 'MRI Technologist', averageSalary: '$62,000 - $78,000', description: 'Operate MRI scanning equipment' },
            { title: 'MRI Specialist', averageSalary: '$60,000 - $75,000', description: 'Perform specialized MRI procedures' }
        ]
    },
    {
        id: 'vc-atc-echo',
        name: 'Echocardiography',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Advanced certification for cardiac ultrasound technologists.',
        keywords: ['echocardiography', 'echo', 'cardiac', 'ultrasound', 'heart', 'sonography'],
        entryLevelCareers: [
            { title: 'Cardiac Sonographer', averageSalary: '$65,000 - $80,000', description: 'Perform heart ultrasound examinations' },
            { title: 'Echocardiographer', averageSalary: '$62,000 - $78,000', description: 'Specialize in cardiac imaging' }
        ]
    },
    {
        id: 'vc-atc-mammo',
        name: 'Mammography',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Advanced certification for mammography technologists.',
        keywords: ['mammography', 'breast imaging', 'radiology', 'screening'],
        entryLevelCareers: [
            { title: 'Mammography Technologist', averageSalary: '$55,000 - $68,000', description: 'Perform mammogram screenings' },
            { title: 'Breast Imaging Specialist', averageSalary: '$58,000 - $72,000', description: 'Specialize in breast imaging' }
        ]
    },
    {
        id: 'vc-atc-vascular',
        name: 'Vascular Sonography',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Healthcare',
        description: 'Advanced certification for vascular ultrasound technologists.',
        keywords: ['vascular', 'sonography', 'ultrasound', 'veins', 'arteries', 'vascular tech'],
        entryLevelCareers: [
            { title: 'Vascular Sonographer', averageSalary: '$62,000 - $78,000', description: 'Perform vascular ultrasound exams' },
            { title: 'Vascular Technologist', averageSalary: '$60,000 - $75,000', description: 'Specialize in vascular imaging' }
        ]
    },
    // ===== CULINARY ARTS ATCs =====
    {
        id: 'vc-atc-bread',
        name: 'Bread Baking',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Hospitality',
        description: 'Advanced certification in artisan bread baking techniques.',
        keywords: ['bread', 'baking', 'artisan', 'bakery', 'yeast', 'sourdough'],
        entryLevelCareers: [
            { title: 'Artisan Baker', averageSalary: '$35,000 - $48,000', description: 'Create specialty breads' },
            { title: 'Head Baker', averageSalary: '$40,000 - $52,000', description: 'Lead bakery bread production' }
        ]
    },
    {
        id: 'vc-atc-cake',
        name: 'Cake Artistry',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Hospitality',
        description: 'Advanced certification in cake decorating and design.',
        keywords: ['cake', 'decorating', 'wedding cake', 'pastry', 'fondant', 'artistry'],
        entryLevelCareers: [
            { title: 'Cake Decorator', averageSalary: '$32,000 - $45,000', description: 'Design and decorate specialty cakes' },
            { title: 'Cake Artist', averageSalary: '$38,000 - $52,000', description: 'Create custom cake designs' }
        ]
    },
    {
        id: 'vc-atc-chocolate',
        name: 'Chocolate and Confectionery Arts',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Hospitality',
        description: 'Advanced certification in chocolate and candy making.',
        keywords: ['chocolate', 'confection', 'candy', 'sweets', 'truffles', 'chocolatier'],
        entryLevelCareers: [
            { title: 'Chocolatier', averageSalary: '$35,000 - $50,000', description: 'Create artisan chocolates' },
            { title: 'Confectionery Specialist', averageSalary: '$32,000 - $45,000', description: 'Make specialty candies and sweets' }
        ]
    },
    // ===== BUSINESS ATC =====
    {
        id: 'vc-atc-hr',
        name: 'Human Resource Management',
        level: 'Advanced Technical Certificate',
        institution: 'Valencia College',
        field: 'Business',
        description: 'Advanced certification in human resources management.',
        keywords: ['HR', 'human resources', 'personnel', 'recruiting', 'benefits', 'employee relations'],
        entryLevelCareers: [
            { title: 'HR Coordinator', averageSalary: '$42,000 - $55,000', description: 'Coordinate HR functions' },
            { title: 'HR Specialist', averageSalary: '$45,000 - $58,000', description: 'Handle specialized HR tasks' },
            { title: 'Recruiter', averageSalary: '$40,000 - $55,000', description: 'Source and recruit candidates' }
        ]
    }
];

// ============================================================================
// VALENCIA COLLEGE: BACHELOR OF APPLIED SCIENCE (B.A.S.)
// ============================================================================

export const VALENCIA_BAS_DEGREES: DegreeProgram[] = [
    {
        id: 'vc-bas-business',
        name: 'Business and Organizational Leadership',
        level: 'Bachelor of Applied Science (B.A.S.)',
        institution: 'Valencia College',
        field: 'Business',
        description: 'Prepares students for supervisory and management roles.',
        keywords: ['business', 'leadership', 'management', 'organizational', 'supervisor'],
        entryLevelCareers: [
            { title: 'Team Lead', averageSalary: '$45,000 - $58,000', description: 'Lead teams in various business settings' },
            { title: 'Operations Supervisor', averageSalary: '$48,000 - $62,000', description: 'Oversee operational processes' },
            { title: 'Business Development Associate', averageSalary: '$42,000 - $55,000', description: 'Identify growth opportunities' },
            { title: 'Project Coordinator', averageSalary: '$45,000 - $58,000', description: 'Coordinate project activities' }
        ]
    },
    {
        id: 'vc-bas-public-safety',
        name: 'Public Safety Administration',
        level: 'Bachelor of Applied Science (B.A.S.)',
        institution: 'Valencia College',
        field: 'Public Safety',
        description: 'Prepares students for management roles in public safety.',
        keywords: ['public safety', 'police', 'fire', 'emergency management', 'administration'],
        entryLevelCareers: [
            { title: 'Public Safety Supervisor', averageSalary: '$52,000 - $68,000', description: 'Supervise public safety personnel' },
            { title: 'Emergency Management Coordinator', averageSalary: '$48,000 - $62,000', description: 'Coordinate emergency response' },
            { title: 'Police Sergeant (Promotional)', averageSalary: '$55,000 - $72,000', description: 'Supervise police officers' }
        ]
    },
    {
        id: 'vc-bas-computing',
        name: 'Computing Technology and Software Development',
        level: 'Bachelor of Applied Science (B.A.S.)',
        institution: 'Valencia College',
        field: 'Technology',
        description: 'Prepares students for software development and cloud computing careers.',
        keywords: ['software', 'development', 'cloud', 'programming', 'computing', 'developer'],
        entryLevelCareers: [
            { title: 'Software Developer', averageSalary: '$60,000 - $78,000', description: 'Design and build software applications' },
            { title: 'Cloud Developer', averageSalary: '$65,000 - $85,000', description: 'Build cloud-based applications' },
            { title: 'Full Stack Developer', averageSalary: '$62,000 - $80,000', description: 'Build both frontend and backend systems' },
            { title: 'DevOps Engineer (Junior)', averageSalary: '$58,000 - $75,000', description: 'Automate deployment pipelines' }
        ]
    }
];

// ============================================================================
// UCF: BACHELOR OF SCIENCE (B.S.) AND BACHELOR OF ARTS (B.A.) DEGREES
// ============================================================================

export const UCF_BACHELOR_DEGREES: DegreeProgram[] = [
    // ===== TECHNOLOGY / ENGINEERING =====
    {
        id: 'ucf-bs-cs',
        name: 'Computer Science',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Technology',
        description: 'UCF\'s top-ranked program in computing, software development, and AI.',
        keywords: ['computer science', 'programming', 'software', 'coding', 'algorithms', 'CS', 'developer'],
        entryLevelCareers: [
            { title: 'Software Engineer', averageSalary: '$65,000 - $85,000', description: 'Design and develop software applications' },
            { title: 'Full Stack Developer', averageSalary: '$60,000 - $80,000', description: 'Build frontend and backend systems' },
            { title: 'Junior Data Scientist', averageSalary: '$62,000 - $78,000', description: 'Analyze data and build ML models' },
            { title: 'Application Developer', averageSalary: '$58,000 - $75,000', description: 'Create mobile and web applications' }
        ]
    },
    {
        id: 'ucf-bs-it',
        name: 'Information Technology',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Technology',
        description: 'Comprehensive IT program covering systems, networks, and cybersecurity.',
        keywords: ['IT', 'information technology', 'networks', 'systems', 'cybersecurity', 'cloud'],
        entryLevelCareers: [
            { title: 'IT Analyst', averageSalary: '$55,000 - $70,000', description: 'Analyze IT systems and recommend solutions' },
            { title: 'Systems Administrator', averageSalary: '$58,000 - $75,000', description: 'Manage enterprise systems and servers' },
            { title: 'Network Administrator', averageSalary: '$55,000 - $72,000', description: 'Maintain and secure network infrastructure' },
            { title: 'Cloud Support Engineer', averageSalary: '$60,000 - $78,000', description: 'Support cloud-based applications' }
        ]
    },
    {
        id: 'ucf-bs-mech-eng',
        name: 'Mechanical Engineering',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Engineering',
        description: 'Design and build mechanical systems from robotics to aerospace.',
        keywords: ['mechanical engineering', 'engineering', 'design', 'manufacturing', 'CAD', 'robotics'],
        entryLevelCareers: [
            { title: 'Mechanical Engineer', averageSalary: '$62,000 - $78,000', description: 'Design mechanical systems and components' },
            { title: 'Design Engineer', averageSalary: '$58,000 - $75,000', description: 'Create product designs using CAD' },
            { title: 'Manufacturing Engineer', averageSalary: '$60,000 - $76,000', description: 'Optimize manufacturing processes' },
            { title: 'Project Engineer', averageSalary: '$55,000 - $72,000', description: 'Manage engineering projects' }
        ]
    },
    {
        id: 'ucf-bs-electrical-eng',
        name: 'Electrical Engineering',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Engineering',
        description: 'Design electrical systems, circuits, and electronic devices.',
        keywords: ['electrical engineering', 'electronics', 'circuits', 'power', 'signals', 'embedded'],
        entryLevelCareers: [
            { title: 'Electrical Engineer', averageSalary: '$62,000 - $80,000', description: 'Design electrical systems and circuits' },
            { title: 'Hardware Engineer', averageSalary: '$65,000 - $82,000', description: 'Design electronic hardware components' },
            { title: 'Controls Engineer', averageSalary: '$60,000 - $78,000', description: 'Develop control systems for automation' },
            { title: 'Test Engineer', averageSalary: '$55,000 - $72,000', description: 'Test electrical systems and components' }
        ]
    },
    {
        id: 'ucf-bs-aerospace-eng',
        name: 'Aerospace Engineering',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Engineering',
        description: 'Design aircraft, spacecraft, and propulsion systems.',
        keywords: ['aerospace', 'aviation', 'space', 'aircraft', 'rockets', 'NASA', 'SpaceX'],
        entryLevelCareers: [
            { title: 'Aerospace Engineer', averageSalary: '$65,000 - $85,000', description: 'Design aircraft and spacecraft' },
            { title: 'Propulsion Engineer', averageSalary: '$68,000 - $88,000', description: 'Design rocket and jet engines' },
            { title: 'Systems Engineer', averageSalary: '$62,000 - $80,000', description: 'Integrate complex aerospace systems' },
            { title: 'Flight Test Engineer', averageSalary: '$60,000 - $78,000', description: 'Test aircraft performance' }
        ]
    },
    {
        id: 'ucf-bs-civil-eng',
        name: 'Civil Engineering',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Engineering',
        description: 'Design infrastructure including bridges, roads, and buildings.',
        keywords: ['civil engineering', 'construction', 'infrastructure', 'bridges', 'roads', 'structural'],
        entryLevelCareers: [
            { title: 'Civil Engineer', averageSalary: '$58,000 - $75,000', description: 'Design infrastructure projects' },
            { title: 'Structural Engineer', averageSalary: '$60,000 - $78,000', description: 'Analyze and design structures' },
            { title: 'Construction Engineer', averageSalary: '$55,000 - $72,000', description: 'Oversee construction projects' },
            { title: 'Transportation Engineer', averageSalary: '$58,000 - $75,000', description: 'Design roads and transit systems' }
        ]
    },
    {
        id: 'ucf-bs-computer-eng',
        name: 'Computer Engineering',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Engineering',
        description: 'Bridge hardware and software with embedded systems and computer architecture.',
        keywords: ['computer engineering', 'embedded', 'hardware', 'software', 'microprocessors', 'FPGA'],
        entryLevelCareers: [
            { title: 'Embedded Systems Engineer', averageSalary: '$65,000 - $85,000', description: 'Develop embedded software and hardware' },
            { title: 'Hardware Engineer', averageSalary: '$65,000 - $82,000', description: 'Design computer hardware components' },
            { title: 'Firmware Developer', averageSalary: '$62,000 - $80,000', description: 'Write low-level software for devices' },
            { title: 'FPGA Engineer', averageSalary: '$68,000 - $88,000', description: 'Design programmable logic circuits' }
        ]
    },
    // ===== BUSINESS =====
    {
        id: 'ucf-bs-finance',
        name: 'Finance',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Business',
        description: 'Prepare for careers in financial analysis, banking, and investments.',
        keywords: ['finance', 'banking', 'investments', 'financial analyst', 'accounting', 'money'],
        entryLevelCareers: [
            { title: 'Financial Analyst', averageSalary: '$55,000 - $70,000', description: 'Analyze financial data and investments' },
            { title: 'Investment Banking Analyst', averageSalary: '$65,000 - $85,000', description: 'Support M&A and capital markets deals' },
            { title: 'Credit Analyst', averageSalary: '$50,000 - $65,000', description: 'Assess creditworthiness of borrowers' },
            { title: 'Corporate Finance Analyst', averageSalary: '$52,000 - $68,000', description: 'Support corporate financial planning' }
        ]
    },
    {
        id: 'ucf-bs-accounting',
        name: 'Accounting',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Business',
        description: 'Prepare for CPA track and careers in public and corporate accounting.',
        keywords: ['accounting', 'CPA', 'audit', 'tax', 'bookkeeping', 'financial reporting'],
        entryLevelCareers: [
            { title: 'Staff Accountant', averageSalary: '$50,000 - $62,000', description: 'Prepare financial statements and reports' },
            { title: 'Tax Associate', averageSalary: '$52,000 - $65,000', description: 'Prepare tax returns for individuals and businesses' },
            { title: 'Audit Associate', averageSalary: '$55,000 - $68,000', description: 'Conduct financial audits for clients' },
            { title: 'Accounts Payable Specialist', averageSalary: '$42,000 - $52,000', description: 'Manage vendor payments and invoices' }
        ]
    },
    {
        id: 'ucf-bs-marketing',
        name: 'Marketing',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Business',
        description: 'Learn digital marketing, brand strategy, and consumer behavior.',
        keywords: ['marketing', 'digital marketing', 'advertising', 'brand', 'social media', 'SEO'],
        entryLevelCareers: [
            { title: 'Marketing Coordinator', averageSalary: '$42,000 - $55,000', description: 'Support marketing campaigns and events' },
            { title: 'Digital Marketing Specialist', averageSalary: '$45,000 - $60,000', description: 'Run digital advertising campaigns' },
            { title: 'Social Media Manager', averageSalary: '$40,000 - $55,000', description: 'Manage brand social media presence' },
            { title: 'Marketing Analyst', averageSalary: '$48,000 - $62,000', description: 'Analyze marketing data and ROI' }
        ]
    },
    {
        id: 'ucf-bs-management',
        name: 'Management',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Business',
        description: 'Develop leadership skills for managing teams and organizations.',
        keywords: ['management', 'leadership', 'business management', 'operations', 'strategy'],
        entryLevelCareers: [
            { title: 'Management Trainee', averageSalary: '$45,000 - $58,000', description: 'Learn to manage teams and operations' },
            { title: 'Operations Coordinator', averageSalary: '$42,000 - $55,000', description: 'Coordinate daily business operations' },
            { title: 'Project Coordinator', averageSalary: '$45,000 - $58,000', description: 'Support project management activities' },
            { title: 'HR Coordinator', averageSalary: '$40,000 - $52,000', description: 'Support human resources functions' }
        ]
    },
    // ===== HEALTHCARE =====
    {
        id: 'ucf-bsn-nursing',
        name: 'Nursing (BSN)',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Healthcare',
        description: 'UCF\'s highly-ranked nursing program with clinical placements throughout Central Florida.',
        keywords: ['nursing', 'BSN', 'RN', 'registered nurse', 'healthcare', 'hospital', 'patient care'],
        entryLevelCareers: [
            { title: 'Registered Nurse (RN)', averageSalary: '$58,000 - $75,000', description: 'Provide direct patient care in hospitals' },
            { title: 'ICU Nurse', averageSalary: '$62,000 - $80,000', description: 'Care for critically ill patients' },
            { title: 'ER Nurse', averageSalary: '$60,000 - $78,000', description: 'Provide emergency care' },
            { title: 'Pediatric Nurse', averageSalary: '$58,000 - $74,000', description: 'Care for children and infants' }
        ]
    },
    {
        id: 'ucf-bs-health-sciences',
        name: 'Health Sciences (Pre-Clinical)',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Healthcare',
        description: 'Pre-med and pre-health track for graduate healthcare programs.',
        keywords: ['health sciences', 'pre-med', 'pre-dental', 'pre-PA', 'healthcare', 'medical school'],
        entryLevelCareers: [
            { title: 'Clinical Research Coordinator', averageSalary: '$48,000 - $62,000', description: 'Coordinate clinical trials and research' },
            { title: 'Medical Scribe', averageSalary: '$32,000 - $42,000', description: 'Document patient encounters for physicians' },
            { title: 'Patient Care Technician', averageSalary: '$35,000 - $45,000', description: 'Assist nurses with patient care' },
            { title: 'Public Health Educator', averageSalary: '$42,000 - $55,000', description: 'Educate communities on health topics' }
        ]
    },
    // ===== HOSPITALITY =====
    {
        id: 'ucf-bs-hospitality',
        name: 'Hospitality Management',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Hospitality',
        description: 'UCF Rosen College\'s world-renowned hospitality program.',
        keywords: ['hospitality', 'hotel', 'tourism', 'resort', 'Rosen', 'Disney', 'Universal'],
        entryLevelCareers: [
            { title: 'Hotel Operations Manager Trainee', averageSalary: '$42,000 - $55,000', description: 'Learn hotel management operations' },
            { title: 'Event Coordinator', averageSalary: '$40,000 - $52,000', description: 'Plan and execute events' },
            { title: 'Guest Experience Manager', averageSalary: '$45,000 - $58,000', description: 'Ensure guest satisfaction at resorts' },
            { title: 'Revenue Analyst', averageSalary: '$48,000 - $62,000', description: 'Optimize hotel pricing and revenue' }
        ]
    },
    {
        id: 'ucf-bs-entertainment-mgmt',
        name: 'Entertainment Management',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Hospitality',
        description: 'Manage theme parks, attractions, and entertainment venues.',
        keywords: ['entertainment', 'theme parks', 'attractions', 'Disney', 'Universal', 'events'],
        entryLevelCareers: [
            { title: 'Attractions Supervisor', averageSalary: '$42,000 - $55,000', description: 'Manage ride operations at theme parks' },
            { title: 'Entertainment Coordinator', averageSalary: '$38,000 - $50,000', description: 'Coordinate shows and entertainment' },
            { title: 'Guest Relations Specialist', averageSalary: '$36,000 - $48,000', description: 'Handle VIP guests and special requests' },
            { title: 'Operations Analyst', averageSalary: '$45,000 - $58,000', description: 'Analyze attraction performance data' }
        ]
    },
    // ===== PSYCHOLOGY / SOCIAL SCIENCES =====
    {
        id: 'ucf-bs-psychology',
        name: 'Psychology',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Healthcare',
        description: 'Study human behavior with tracks in clinical, I/O, and neuroscience.',
        keywords: ['psychology', 'mental health', 'counseling', 'behavior', 'research', 'therapy'],
        entryLevelCareers: [
            { title: 'Case Manager', averageSalary: '$38,000 - $50,000', description: 'Coordinate care for mental health clients' },
            { title: 'Behavioral Health Technician', averageSalary: '$32,000 - $42,000', description: 'Support mental health treatment programs' },
            { title: 'Research Assistant', averageSalary: '$35,000 - $45,000', description: 'Assist with psychology research studies' },
            { title: 'HR Specialist', averageSalary: '$42,000 - $55,000', description: 'Apply psychology to workplace issues' }
        ]
    },
    // ===== CRIMINAL JUSTICE =====
    {
        id: 'ucf-bs-criminal-justice',
        name: 'Criminal Justice',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Criminal Justice',
        description: 'Top-ranked online criminal justice program with law enforcement certification track.',
        keywords: ['criminal justice', 'law enforcement', 'police', 'FBI', 'forensics', 'corrections'],
        entryLevelCareers: [
            { title: 'Police Officer', averageSalary: '$48,000 - $62,000', description: 'Patrol communities and enforce laws' },
            { title: 'Federal Agent Trainee', averageSalary: '$52,000 - $68,000', description: 'Entry into FBI, DEA, or ICE careers' },
            { title: 'Probation Officer', averageSalary: '$45,000 - $58,000', description: 'Supervise offenders on probation' },
            { title: 'Crime Analyst', averageSalary: '$48,000 - $62,000', description: 'Analyze crime data and patterns' }
        ]
    },
    // ===== COMMUNICATION / MEDIA =====
    {
        id: 'ucf-ba-communication',
        name: 'Communication',
        level: 'Bachelor of Science (B.S.)',
        institution: 'UCF',
        field: 'Creative/Design',
        description: 'Study media, public relations, and strategic communication.',
        keywords: ['communication', 'PR', 'public relations', 'media', 'journalism', 'broadcasting'],
        entryLevelCareers: [
            { title: 'PR Coordinator', averageSalary: '$40,000 - $52,000', description: 'Manage public relations campaigns' },
            { title: 'Communications Specialist', averageSalary: '$42,000 - $55,000', description: 'Create internal and external communications' },
            { title: 'Content Writer', averageSalary: '$38,000 - $50,000', description: 'Write articles and marketing content' },
            { title: 'Social Media Specialist', averageSalary: '$38,000 - $52,000', description: 'Manage brand social media' }
        ]
    }
];

// ============================================================================
// COMBINED DATABASE
// ============================================================================

export const ALL_DEGREE_PROGRAMS: DegreeProgram[] = [
    ...VALENCIA_AS_DEGREES,
    ...VALENCIA_TECHNICAL_CERTS,
    ...VALENCIA_ADVANCED_TECH_CERTS,
    ...VALENCIA_BAS_DEGREES,
    ...UCF_BACHELOR_DEGREES
];

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search for degree programs by keyword
 */
export function searchDegreePrograms(query: string): DegreeProgram[] {
    const normalizedQuery = query.toLowerCase().trim();

    return ALL_DEGREE_PROGRAMS.filter(program => {
        // Check program name
        if (program.name.toLowerCase().includes(normalizedQuery)) return true;

        // Check keywords
        if (program.keywords.some(kw => kw.toLowerCase().includes(normalizedQuery))) return true;

        // Check field
        if (program.field.toLowerCase().includes(normalizedQuery)) return true;

        return false;
    });
}

/**
 * Get programs by degree level
 */
export function getProgramsByLevel(level: DegreeLevel): DegreeProgram[] {
    return ALL_DEGREE_PROGRAMS.filter(program => program.level === level);
}

/**
 * Get programs by field
 */
export function getProgramsByField(field: CareerField): DegreeProgram[] {
    return ALL_DEGREE_PROGRAMS.filter(program => program.field === field);
}

/**
 * Get all entry-level careers for a specific program
 */
export function getCareersForProgram(programId: string): EntryLevelCareer[] {
    const program = ALL_DEGREE_PROGRAMS.find(p => p.id === programId);
    return program?.entryLevelCareers || [];
}

/**
 * Get program suggestions for autocomplete
 */
export function getAutocompleteSuggestions(query: string, limit: number = 10): DegreeProgram[] {
    if (!query || query.length < 2) return [];
    return searchDegreePrograms(query).slice(0, limit);
}

/**
 * Career Path interface for the CareerPathExplorer
 */
export interface CareerPathSuggestion {
    id: string;
    title: string;
    field: string;
    salaryRange: string;
    matchScore: number;
    growth: 'hot' | 'growing' | 'stable' | 'emerging';
    skills: string[];
    description: string;
}

/**
 * Generate career path suggestions from selected degrees
 */
export function generateCareerPathsFromDegrees(
    selectedDegrees: { degree: DegreeProgram; graduationYear: string }[],
    existingCareerIds: Set<string> = new Set()
): CareerPathSuggestion[] {
    const careerPaths: CareerPathSuggestion[] = [];
    const seenCareers = new Set<string>();

    // Growth assignments based on field
    const fieldGrowth: Record<string, 'hot' | 'growing' | 'stable' | 'emerging'> = {
        'Technology': 'hot',
        'Healthcare': 'hot',
        'Business': 'growing',
        'Creative/Design': 'growing',
        'Engineering': 'hot',
        'Manufacturing': 'growing',
        'Hospitality': 'stable',
        'Criminal Justice': 'stable',
        'Education': 'stable',
        'Public Safety': 'stable'
    };

    // Skills by field
    const fieldSkills: Record<string, string[]> = {
        'Technology': ['Problem Solving', 'Coding', 'Teamwork', 'Communication', 'Analytical'],
        'Healthcare': ['Patient Care', 'Attention to Detail', 'Empathy', 'Medical Knowledge', 'Communication'],
        'Business': ['Leadership', 'Communication', 'Excel', 'Analysis', 'Organization'],
        'Creative/Design': ['Creativity', 'Design Tools', 'Communication', 'Attention to Detail', 'Collaboration'],
        'Engineering': ['Math', 'Technical Skills', 'CAD', 'Problem Solving', 'Teamwork'],
        'Manufacturing': ['Technical Skills', 'Safety', 'Quality Control', 'Machinery', 'Teamwork'],
        'Hospitality': ['Customer Service', 'Communication', 'Multitasking', 'Flexibility', 'Teamwork'],
        'Criminal Justice': ['Critical Thinking', 'Communication', 'Ethics', 'Physical Fitness', 'Attention to Detail'],
        'Education': ['Communication', 'Patience', 'Creativity', 'Organization', 'Empathy'],
        'Public Safety': ['Leadership', 'Crisis Management', 'Communication', 'Physical Fitness', 'Decision Making']
    };

    // Collect careers from each degree separately, then interleave
    const careersByDegree: Map<string, CareerPathSuggestion[]> = new Map();

    // Get careers from selected degrees (higher match score)
    for (const { degree } of selectedDegrees) {
        const degreeId = degree.id;
        if (!careersByDegree.has(degreeId)) {
            careersByDegree.set(degreeId, []);
        }

        for (const career of degree.entryLevelCareers) {
            const careerId = `${degree.field}-${career.title}`.toLowerCase().replace(/\s+/g, '-');

            if (seenCareers.has(careerId) || existingCareerIds.has(careerId)) continue;
            seenCareers.add(careerId);

            careersByDegree.get(degreeId)!.push({
                id: careerId,
                title: career.title,
                field: degree.field,
                salaryRange: career.averageSalary,
                matchScore: Math.floor(Math.random() * 15) + 85, // 85-100 for direct matches
                growth: fieldGrowth[degree.field] || 'stable',
                skills: fieldSkills[degree.field] || ['Communication', 'Teamwork'],
                description: career.description
            });
        }
    }

    // Interleave careers from all degrees for balanced representation
    const degreeArrays = Array.from(careersByDegree.values());
    let i = 0;
    while (degreeArrays.some(arr => arr.length > i)) {
        for (const arr of degreeArrays) {
            if (i < arr.length) {
                careerPaths.push(arr[i]);
            }
        }
        i++;
    }

    // Add related careers from same field (medium match score)
    const selectedFields = new Set(selectedDegrees.map(d => d.degree.field));
    for (const field of selectedFields) {
        const relatedPrograms = ALL_DEGREE_PROGRAMS.filter(p =>
            p.field === field &&
            !selectedDegrees.some(d => d.degree.id === p.id)
        ).slice(0, 3);

        for (const program of relatedPrograms) {
            for (const career of program.entryLevelCareers.slice(0, 2)) {
                const careerId = `${program.field}-${career.title}`.toLowerCase().replace(/\s+/g, '-');

                if (seenCareers.has(careerId) || existingCareerIds.has(careerId)) continue;
                seenCareers.add(careerId);

                careerPaths.push({
                    id: careerId,
                    title: career.title,
                    field: program.field,
                    salaryRange: career.averageSalary,
                    matchScore: Math.floor(Math.random() * 20) + 65, // 65-84 for related
                    growth: fieldGrowth[program.field] || 'stable',
                    skills: fieldSkills[program.field] || ['Communication', 'Teamwork'],
                    description: career.description
                });
            }
        }
    }

    // Sort by match score descending
    return careerPaths.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get additional career suggestions (for refresh)
 */
export function getMoreCareerSuggestions(
    excludeIds: Set<string>,
    limit: number = 8
): CareerPathSuggestion[] {
    const fieldGrowth: Record<string, 'hot' | 'growing' | 'stable' | 'emerging'> = {
        'Technology': 'hot',
        'Healthcare': 'hot',
        'Business': 'growing',
        'Creative/Design': 'growing',
        'Engineering': 'hot',
        'Manufacturing': 'growing',
        'Hospitality': 'stable',
        'Criminal Justice': 'stable',
        'Education': 'stable',
        'Public Safety': 'stable'
    };

    const fieldSkills: Record<string, string[]> = {
        'Technology': ['Problem Solving', 'Coding', 'Teamwork', 'Communication', 'Analytical'],
        'Healthcare': ['Patient Care', 'Attention to Detail', 'Empathy', 'Medical Knowledge', 'Communication'],
        'Business': ['Leadership', 'Communication', 'Excel', 'Analysis', 'Organization'],
        'Creative/Design': ['Creativity', 'Design Tools', 'Communication', 'Attention to Detail', 'Collaboration'],
        'Engineering': ['Math', 'Technical Skills', 'CAD', 'Problem Solving', 'Teamwork'],
        'Manufacturing': ['Technical Skills', 'Safety', 'Quality Control', 'Machinery', 'Teamwork'],
        'Hospitality': ['Customer Service', 'Communication', 'Multitasking', 'Flexibility', 'Teamwork'],
        'Criminal Justice': ['Critical Thinking', 'Communication', 'Ethics', 'Physical Fitness', 'Attention to Detail'],
        'Education': ['Communication', 'Patience', 'Creativity', 'Organization', 'Empathy'],
        'Public Safety': ['Leadership', 'Crisis Management', 'Communication', 'Physical Fitness', 'Decision Making']
    };

    const suggestions: CareerPathSuggestion[] = [];
    const seenCareers = new Set<string>();

    // Shuffle programs
    const shuffled = [...ALL_DEGREE_PROGRAMS].sort(() => Math.random() - 0.5);

    for (const program of shuffled) {
        if (suggestions.length >= limit) break;

        for (const career of program.entryLevelCareers) {
            if (suggestions.length >= limit) break;

            const careerId = `${program.field}-${career.title}`.toLowerCase().replace(/\s+/g, '-');

            if (seenCareers.has(careerId) || excludeIds.has(careerId)) continue;
            seenCareers.add(careerId);

            suggestions.push({
                id: careerId,
                title: career.title,
                field: program.field,
                salaryRange: career.averageSalary,
                matchScore: Math.floor(Math.random() * 40) + 50, // 50-89 for additional
                growth: fieldGrowth[program.field] || 'emerging',
                skills: fieldSkills[program.field] || ['Communication', 'Teamwork'],
                description: career.description
            });
        }
    }

    return suggestions.sort((a, b) => b.matchScore - a.matchScore);
}
