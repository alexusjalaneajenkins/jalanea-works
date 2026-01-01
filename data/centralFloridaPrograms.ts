// Central Florida Community College Programs Database

export type SchoolName = "Valencia College" | "Seminole State College" | "Orange Technical College" | "Other";

export type DegreeTypeMap = {
    [school in SchoolName]?: string[];
};

export type ProgramData = {
    [school: string]: {
        [degreeType: string]: string[];
    };
};

export const CENTRAL_FL_DATA: ProgramData = {
    "Valencia College": {
        "Bachelor (B.S. / B.A.S.)": [
            "Business & Organizational Leadership (B.A.S.)",
            "Cardiopulmonary Sciences (B.S.)",
            "Computing Technology & Software Dev (B.A.S.)",
            "Electrical & Computer Eng. Tech (B.S.E.C.E.T.)",
            "Nursing (B.S.N.)",
            "Public Safety Administration (B.A.S.)",
            "Radiologic & Imaging Sciences (B.S.)"
        ],
        "Associate in Science (A.S.)": [
            "Accounting Technology",
            "Architectural Design & Construction Tech",
            "Baking & Pastry Management",
            "Biotechnology Laboratory Sciences",
            "Business Administration",
            "Cardiovascular Technology",
            "Computer Information Technology",
            "Criminal Justice Technology",
            "Culinary Management",
            "Cybersecurity & Network Engineering",
            "Dental Hygiene",
            "Diagnostic Medical Sonography",
            "Digital Media Technology",
            "Emergency Medical Services (EMS)",
            "Engineering Technology",
            "Film Production Technology",
            "Graphic & Interactive Design",
            "Health Information Technology",
            "Hospitality & Tourism Management",
            "Live Entertainment Design & Production",
            "Medical Administration",
            "Nursing (R.N.)",
            "Paralegal Studies",
            "Plant Science & Agricultural Tech",
            "Radiography",
            "Respiratory Care",
            "Sound & Music Technology",
            "Video Game Design"
        ],
        "Associate in Arts (A.A.)": [
            "General Studies (Transfer Track)",
            "Architecture Pathway",
            "Business Pathway",
            "Engineering Pathway",
            "Health Sciences Pathway",
            "Psychology Pathway"
        ],
        "Technical Certificate": [
            "Accounting Applications",
            "Audio Electronics Specialist",
            "Business Management",
            "Chef's Apprentice",
            "Computer Aided Design (CAD)",
            "Computer Programming Specialist",
            "Digital Video Editing",
            "Emergency Medical Technician (EMT)",
            "Graphic Design Production",
            "Lean Manufacturing",
            "Medical Office Specialist",
            "Network Support Technician",
            "Paramedic Technology",
            "Real Estate Specialist",
            "Robotics Applications",
            "Web Development Specialist"
        ]
    },
    "Seminole State College": {
        "Bachelor (B.S. / B.A.S.)": [
            "Construction (B.S.)",
            "Elementary Education K-6 (B.S.)",
            "Engineering Technology (B.S.)",
            "Health Sciences (B.S.)",
            "Information Systems Technology (B.S.)",
            "Interior Design (B.A.S.)",
            "Management & Org. Leadership (B.A.S.)",
            "Nursing (RN-to-BSN)",
            "Public Safety Administration (B.S.)"
        ],
        "Associate in Science (A.S.)": [
            "Automotive Management",
            "Business Administration",
            "Construction Management",
            "Early Childhood Education",
            "Emergency Medical Services",
            "Engineering Technology",
            "Fire Science Technology",
            "Health Information Technology",
            "Interior Design Technology",
            "Legal Studies",
            "Network Systems Technology",
            "Nursing (RN)",
            "Physical Therapist Assistant",
            "Programming & Analysis",
            "Respiratory Care",
            "Supply Chain Management"
        ],
        "Certificates": [
            "AutoCAD Foundations",
            "Fire Fighter I/II",
            "Information Technology Analysis",
            "Mechatronics",
            "Paramedic",
            "Project Management",
            "Sustainable Design"
        ]
    },
    "Orange Technical College": {
        "Career Certificate (Clock Hours)": [
            "3-D Animation Technology",
            "Accounting Operations",
            "Administrative Office Specialist",
            "Automotive Collision Technology",
            "Automotive Service Technology",
            "Barbering",
            "Building Construction Technologies",
            "CNC Production Specialist",
            "Commercial Vehicle Driving (CDL)",
            "Computer-Aided Drawing & Modeling",
            "Cosmetology",
            "Cybersecurity",
            "Dental Assisting",
            "Diesel Systems Technician",
            "Digital Audio Production",
            "Digital Cinema Production",
            "Digital Media / Multimedia Design",
            "Digital Photography",
            "Electricity / Electrician",
            "Enterprise Desktop Support",
            "Enterprise Network Support",
            "Fundamental Foodservice Skills",
            "HVAC / Refrigeration",
            "Machining Technologies",
            "Massage Therapy",
            "Medical Assisting",
            "Medical Coder/Biller",
            "Modeling Simulation Design",
            "Patient Care Assistant (PCA)",
            "Pharmacy Technician",
            "Phlebotomy",
            "Practical Nursing (LPN)",
            "Surgical Technology",
            "Web Development",
            "Welding Technology"
        ]
    },
    "Full Sail University": {
        "Bachelor's (B.S. / B.F.A.)": [
            "Artificial Intelligence",
            "Audio Production",
            "Computer Animation",
            "Computer Science",
            "Creative Writing (B.F.A.)",
            "Cybersecurity",
            "Digital Arts & Design",
            "Digital Cinematography",
            "Digital Marketing",
            "Entertainment Business",
            "Film",
            "Game Art",
            "Game Business & Esports",
            "Game Design",
            "Game Development",
            "Graphic Design",
            "Information Technology",
            "Live Event Production",
            "Media Communications",
            "Music Business",
            "Recording Arts",
            "Simulation Engineering",
            "Sports Marketing & Media",
            "Sportscasting",
            "Web Development"
        ],
        "Master's (M.S. / M.F.A.)": [
            "Business Intelligence (M.S.)",
            "Computer Science (M.S.)",
            "Creative Writing (M.F.A.)",
            "Digital Marketing (M.S.)",
            "Entertainment Business (M.S.)",
            "Film Production (M.F.A.)",
            "Game Design (M.S.)",
            "Media Design (M.F.A.)",
            "Sports Management (M.S.)"
        ],
        "Certificates": [
            "3-D Arts Certificate",
            "Application Development Fundamentals Certificate",
            "Artificial Intelligence Certificate",
            "Audio Arts Certificate",
            "Business Certificate",
            "Computer Science Certificate",
            "Creative Writing Certificate",
            "Data Science Certificate",
            "Digital Marketing Certificate",
            "Film & Video Certificate",
            "Game Business & Esports Certificate",
            "Human-Computer Interaction Certificate",
            "Instructional Design & Technology Certificate",
            "Intensive English Certificate",
            "Marketing Certificate",
            "Media Strategy Certificate",
            "Sportscasting Certificate"
        ]
    }
};

// Get list of schools
export const CENTRAL_FL_SCHOOLS: SchoolName[] = [
    "Valencia College",
    "Seminole State College",
    "Orange Technical College",
    "Other"
];

// Get degree types for a specific school
export const getDegreeTypes = (school: string): string[] => {
    if (school === "Other" || !CENTRAL_FL_DATA[school]) {
        return ["Other / Not Listed"];
    }
    return [...Object.keys(CENTRAL_FL_DATA[school]), "Other / Not Listed"];
};

// Get programs for a specific school and degree type
export const getPrograms = (school: string, degreeType: string): string[] => {
    if (school === "Other" || degreeType === "Other / Not Listed" || !CENTRAL_FL_DATA[school]) {
        return ["Other / Not Listed"];
    }
    const programs = CENTRAL_FL_DATA[school]?.[degreeType] || [];
    return [...programs, "Other / Not Listed"];
};

// Flatten all programs for global search
export const getAllPrograms = (): string[] => {
    const allPrograms = new Set<string>();
    Object.values(CENTRAL_FL_DATA).forEach(school => {
        Object.values(school).forEach(programs => {
            programs.forEach(program => allPrograms.add(program));
        });
    });
    return Array.from(allPrograms).sort();
};

// Map school IDs to CENTRAL_FL_DATA keys
const schoolIdToDataKey: Record<string, string> = {
    valencia: "Valencia College",
    seminole: "Seminole State College",
    orange: "Orange Technical College",
    fullsail: "Full Sail University",
    other: ""
};

// Short labels for degree types (for display)
const degreeTypeShortLabels: Record<string, string> = {
    "Bachelor (B.S. / B.A.S.)": "Bachelor's",
    "Bachelor's (B.S. / B.F.A.)": "Bachelor's",
    "Master's (M.S. / M.F.A.)": "Master's",
    "Associate in Science (A.S.)": "A.S.",
    "Associate in Arts (A.A.)": "A.A.",
    "Technical Certificate": "Certificate",
    "Certificates": "Certificate",
    "Career Certificate (Clock Hours)": "Certificate"
};

// Get all programs for a specific school with degree type included
export const getSchoolPrograms = (schoolId: string): string[] => {
    const dataKey = schoolIdToDataKey[schoolId];
    if (!dataKey || !CENTRAL_FL_DATA[dataKey]) {
        return [];
    }
    const programs: string[] = [];
    const schoolData = CENTRAL_FL_DATA[dataKey];

    Object.entries(schoolData).forEach(([degreeType, degreePrograms]) => {
        const shortLabel = degreeTypeShortLabels[degreeType] || degreeType;
        degreePrograms.forEach(program => {
            // Don't double-add degree info if already in program name
            if (program.includes('(') && (program.includes('B.S.') || program.includes('B.A.S.') || program.includes('R.N.') || program.includes('B.S.N.'))) {
                programs.push(`${program} - ${shortLabel}`);
            } else {
                programs.push(`${program} (${shortLabel})`);
            }
        });
    });
    return programs.sort();
};

// Search programs for a specific school (case-insensitive)
export const searchSchoolPrograms = (schoolId: string, query: string): string[] => {
    const programs = getSchoolPrograms(schoolId);
    if (!query.trim()) {
        return programs;
    }
    const lowerQuery = query.toLowerCase();
    return programs.filter(program =>
        program.toLowerCase().includes(lowerQuery)
    );
};

// Skills mapping by program keywords
const programSkillsMap: Record<string, string[]> = {
    // Healthcare
    "nursing": ["Patient Care", "Medical Terminology", "Vital Signs Monitoring", "HIPAA Compliance", "IV Administration", "Electronic Health Records (EHR)", "CPR/BLS Certified"],
    "dental": ["Dental Radiography", "Patient Care", "Dental Charting", "Infection Control", "Dental Software"],
    "medical": ["Medical Terminology", "Patient Care", "HIPAA Compliance", "Electronic Health Records (EHR)", "Vital Signs"],
    "pharmacy": ["Pharmaceutical Calculations", "Medication Dispensing", "Inventory Management", "HIPAA Compliance"],
    "phlebotomy": ["Venipuncture", "Blood Collection", "Specimen Handling", "Patient Care", "Infection Control"],
    "respiratory": ["Ventilator Management", "Airway Management", "Patient Assessment", "ABG Analysis", "CPR/BLS"],
    "surgical": ["Sterile Technique", "Surgical Instrumentation", "Patient Positioning", "Wound Care"],
    "sonography": ["Ultrasound Technology", "Patient Care", "Medical Imaging", "Anatomy Knowledge"],
    "radiolog": ["X-Ray Technology", "Radiation Safety", "Patient Positioning", "Medical Imaging", "PACS Systems"],
    "cardio": ["EKG/ECG Interpretation", "Cardiac Monitoring", "Patient Assessment", "Stress Testing"],
    "massage": ["Swedish Massage", "Deep Tissue Massage", "Anatomy & Physiology", "Client Assessment"],
    "physical therapist": ["Patient Mobility", "Therapeutic Exercise", "Manual Therapy", "Documentation"],

    // Technology
    "computer": ["Microsoft Office", "Troubleshooting", "Technical Support", "Hardware/Software Installation"],
    "programming": ["JavaScript", "Python", "Problem Solving", "Git/Version Control", "Debugging", "SQL"],
    "software": ["JavaScript", "React", "Node.js", "Git", "Agile/Scrum", "API Development"],
    "web development": ["HTML", "CSS", "JavaScript", "Responsive Design", "Git", "React"],
    "cybersecurity": ["Network Security", "Firewalls", "Vulnerability Assessment", "Security Protocols", "Linux"],
    "network": ["TCP/IP", "Network Configuration", "Troubleshooting", "Cisco", "Firewalls", "VPN"],
    "information technology": ["Help Desk Support", "Troubleshooting", "Active Directory", "Windows/Mac OS"],
    "data": ["SQL", "Data Analysis", "Excel", "Python", "Data Visualization", "Statistical Analysis"],
    "video game": ["Unity", "Unreal Engine", "C#", "Game Design", "3D Modeling"],
    "artificial intelligence": ["Python", "Machine Learning", "TensorFlow/PyTorch", "Data Analysis", "Neural Networks", "NLP"],
    "computer science": ["Python", "Java", "Data Structures", "Algorithms", "Git", "Problem Solving"],
    "game development": ["Unity", "Unreal Engine", "C++", "C#", "Game Design", "3D Modeling", "Git"],
    "game design": ["Unity", "Game Mechanics", "Level Design", "User Experience", "Prototyping", "Storytelling"],
    "game art": ["3D Modeling", "Maya/Blender", "Texturing", "Character Design", "Environment Design", "ZBrush"],
    "simulation": ["Unity", "Unreal Engine", "3D Modeling", "Physics Simulation", "C++", "VR/AR"],
    "esports": ["Event Management", "Streaming Platforms", "Social Media", "Marketing", "Community Management"],

    // Business
    "accounting": ["QuickBooks", "Excel", "Financial Reporting", "Bookkeeping", "Payroll", "Tax Preparation"],
    "business administration": ["Microsoft Office", "Project Management", "Communication", "Data Analysis", "Leadership"],
    "business management": ["Team Leadership", "Project Management", "Budgeting", "Strategic Planning"],
    "paralegal": ["Legal Research", "Document Preparation", "Case Management", "Legal Writing", "WestLaw"],
    "real estate": ["Property Valuation", "Contract Negotiation", "MLS Systems", "Customer Service"],
    "project management": ["Agile/Scrum", "Microsoft Project", "Budgeting", "Risk Management", "Stakeholder Communication"],
    "supply chain": ["Inventory Management", "Logistics", "SAP/ERP Systems", "Forecasting", "Vendor Management"],

    // Skilled Trades
    "welding": ["MIG Welding", "TIG Welding", "Stick Welding", "Blueprint Reading", "Metal Fabrication", "Safety Protocols"],
    "electrician": ["Electrical Wiring", "NEC Code", "Blueprint Reading", "Troubleshooting", "Safety Protocols"],
    "electricity": ["Electrical Wiring", "NEC Code", "Blueprint Reading", "Troubleshooting", "Safety Protocols"],
    "hvac": ["HVAC Systems", "Refrigeration", "Troubleshooting", "EPA 608 Certified", "Electrical Systems"],
    "refrigeration": ["Refrigeration Systems", "HVAC", "Troubleshooting", "EPA 608 Certified"],
    "automotive": ["Diagnostics", "Brake Systems", "Engine Repair", "ASE Certification", "Customer Service"],
    "diesel": ["Diesel Engine Repair", "Preventive Maintenance", "Diagnostics", "Hydraulic Systems"],
    "machining": ["CNC Operation", "Blueprint Reading", "Precision Measurement", "G-Code", "CAD/CAM"],
    "cnc": ["CNC Programming", "G-Code", "Blueprint Reading", "Precision Measurement", "CAD/CAM"],
    "construction": ["Blueprint Reading", "Power Tools", "Safety Protocols", "Project Management", "OSHA"],
    "building": ["Blueprint Reading", "Power Tools", "Construction Methods", "Safety Protocols"],
    "cad": ["AutoCAD", "Blueprint Reading", "Technical Drawing", "3D Modeling", "SolidWorks"],
    "plumbing": ["Pipe Fitting", "Blueprint Reading", "Code Compliance", "Troubleshooting"],

    // Culinary & Hospitality
    "culinary": ["Food Preparation", "Kitchen Management", "Food Safety (ServSafe)", "Menu Planning", "Inventory Control"],
    "baking": ["Baking Techniques", "Pastry Arts", "Food Safety (ServSafe)", "Recipe Development", "Inventory Management"],
    "chef": ["Food Preparation", "Kitchen Management", "Food Safety (ServSafe)", "Team Leadership"],
    "foodservice": ["Food Preparation", "Customer Service", "Food Safety (ServSafe)", "Cash Handling"],
    "hospitality": ["Customer Service", "Reservation Systems", "Event Planning", "Communication", "Problem Solving"],
    "tourism": ["Customer Service", "Travel Systems", "Event Planning", "Communication", "Cultural Awareness"],

    // Creative & Design
    "graphic": ["Adobe Creative Suite", "Typography", "Layout Design", "Branding", "UI/UX Basics"],
    "digital media": ["Adobe Creative Suite", "Video Editing", "Content Creation", "Social Media"],
    "film": ["Video Production", "Camera Operation", "Editing (Premiere/Final Cut)", "Lighting", "Audio Recording"],
    "cinematography": ["Camera Operation", "Lighting", "Color Grading", "Composition", "Directing"],
    "video": ["Video Editing", "Camera Operation", "Adobe Premiere", "After Effects", "Storytelling"],
    "animation": ["3D Animation", "Maya/Blender", "Storyboarding", "Character Design", "Motion Graphics"],
    "photography": ["Camera Settings", "Lighting", "Photo Editing (Lightroom/Photoshop)", "Composition"],
    "audio": ["Pro Tools", "Sound Design", "Mixing", "Recording", "Audio Engineering"],
    "audio production": ["Pro Tools", "Logic Pro", "Mixing", "Mastering", "Sound Design", "Recording"],
    "recording arts": ["Pro Tools", "Audio Engineering", "Mixing", "Mastering", "Studio Recording", "Sound Design"],
    "sound": ["Pro Tools", "Audio Mixing", "Sound Design", "Recording Techniques"],
    "music": ["Music Production", "Pro Tools/Logic", "Audio Engineering", "Music Theory"],
    "music business": ["Music Industry", "Artist Management", "Marketing", "Copyright Law", "Contract Negotiation"],
    "entertainment business": ["Entertainment Law", "Artist Management", "Marketing", "Event Production", "Negotiation"],
    "live event": ["Event Production", "Stage Management", "Lighting Design", "Audio Systems", "Event Coordination"],
    "sportscasting": ["Broadcasting", "Sports Journalism", "Video Production", "Public Speaking", "Live Commentary"],
    "sports marketing": ["Marketing Strategy", "Social Media", "Brand Management", "Sponsorship", "Analytics"],
    "media communications": ["Public Relations", "Social Media", "Content Strategy", "Journalism", "Brand Management"],
    "digital marketing": ["SEO/SEM", "Google Analytics", "Social Media Marketing", "Content Marketing", "Email Marketing"],
    "creative writing": ["Storytelling", "Screenwriting", "Editing", "Character Development", "Narrative Structure"],
    "interior design": ["Space Planning", "AutoCAD", "Color Theory", "Material Selection", "Client Relations"],

    // Public Safety & Services
    "criminal justice": ["Report Writing", "Legal Procedures", "Communication", "Critical Thinking", "Ethics"],
    "fire": ["Firefighting Techniques", "EMT/First Aid", "Fire Prevention", "Hazmat Awareness", "CPR"],
    "ems": ["Emergency Response", "Patient Assessment", "CPR/AED", "Trauma Care", "Medical Protocols"],
    "emt": ["Emergency Response", "Patient Assessment", "CPR/AED", "Vital Signs", "Medical Protocols"],
    "paramedic": ["Advanced Life Support", "IV Therapy", "Cardiac Care", "Trauma Management", "Pharmacology"],
    "public safety": ["Emergency Response", "Communication", "Report Writing", "Leadership", "Crisis Management"],

    // Education & Childcare
    "education": ["Lesson Planning", "Classroom Management", "Student Assessment", "Communication", "Curriculum Development"],
    "early childhood": ["Child Development", "Lesson Planning", "Classroom Management", "Communication", "First Aid/CPR"],

    // Transportation
    "cdl": ["Commercial Driving", "DOT Regulations", "Vehicle Inspection", "Defensive Driving", "Logbook Management"],
    "commercial vehicle": ["Commercial Driving", "DOT Regulations", "Vehicle Inspection", "Defensive Driving"],

    // Personal Services
    "cosmetology": ["Hair Styling", "Hair Coloring", "Customer Service", "Sanitation Protocols", "Product Knowledge"],
    "barbering": ["Hair Cutting", "Beard Trimming", "Customer Service", "Sanitation Protocols", "Styling"],

    // Engineering & Science
    "engineering": ["Mathematics", "Problem Solving", "CAD Software", "Technical Writing", "Project Management"],
    "biotechnology": ["Lab Techniques", "Data Analysis", "Quality Control", "Scientific Method", "Documentation"],
    "plant science": ["Horticulture", "Soil Science", "Pest Management", "Irrigation Systems"],
    "robotics": ["Programming", "Mechanical Systems", "Troubleshooting", "PLC", "Automation"],
    "mechatronics": ["PLC Programming", "Robotics", "Electrical Systems", "Mechanical Systems", "Troubleshooting"],
    "lean manufacturing": ["Process Improvement", "5S", "Kaizen", "Waste Reduction", "Quality Control"],

    // General/Transfer
    "general studies": ["Critical Thinking", "Written Communication", "Research Skills", "Time Management"],
    "pathway": ["Critical Thinking", "Written Communication", "Research Skills", "Academic Writing"]
};

// Get skills for a program based on keyword matching
export const getProgramSkills = (programName: string): string[] => {
    const lowerProgram = programName.toLowerCase();
    const matchedSkills = new Set<string>();

    // Check each keyword
    Object.entries(programSkillsMap).forEach(([keyword, skills]) => {
        if (lowerProgram.includes(keyword)) {
            skills.forEach(skill => matchedSkills.add(skill));
        }
    });

    // Return unique skills array, or default skills if no match
    if (matchedSkills.size === 0) {
        return ["Communication", "Problem Solving", "Time Management", "Teamwork"];
    }

    return Array.from(matchedSkills);
};

// Extract just the program name without degree type (for cleaner storage)
export const extractProgramName = (fullProgramString: string): string => {
    // Remove " - Certificate", " - Bachelor's", " - A.S.", etc.
    let name = fullProgramString.replace(/ - (Certificate|Bachelor's|A\.S\.|A\.A\.)$/, '');
    // Remove trailing (Certificate), (A.S.), (A.A.), (Bachelor's) if not part of original name
    name = name.replace(/ \((Certificate|A\.S\.|A\.A\.|Bachelor's)\)$/, '');
    return name;
};

// Extract degree type from the full program string
export const extractDegreeType = (fullProgramString: string): string => {
    if (fullProgramString.includes("Bachelor's")) return "Bachelor's";
    if (fullProgramString.includes("A.S.")) return "Associate in Science";
    if (fullProgramString.includes("A.A.")) return "Associate in Arts";
    if (fullProgramString.includes("Certificate")) return "Certificate";
    return "Other";
};

export default CENTRAL_FL_DATA;
