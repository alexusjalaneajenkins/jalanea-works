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

export default CENTRAL_FL_DATA;
