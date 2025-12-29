// UCF Degree Database - Categorized list of majors

export interface DegreeCategory {
    name: string;
    degrees: string[];
}

// Categorized degrees for display purposes
export const UCF_DEGREE_CATEGORIES: DegreeCategory[] = [
    {
        name: 'College of Engineering & Computer Science',
        degrees: [
            'Aerospace Engineering (B.S.A.E.)',
            'Civil Engineering (B.S.C.E.)',
            'Computer Engineering (B.S.Cp.E.)',
            'Computer Science (B.S.)',
            'Construction Engineering (B.S.Con.E.)',
            'Data Science (B.S.)',
            'Electrical Engineering (B.S.E.E.)',
            'Environmental Engineering (B.S.Env.E.)',
            'Industrial Engineering (B.S.I.E.)',
            'Information Technology (B.S.)',
            'Materials Science & Engineering (B.S.M.S.E.)',
            'Mechanical Engineering (B.S.M.E.)',
        ],
    },
    {
        name: 'College of Business',
        degrees: [
            'Accounting (B.S.B.A.)',
            'Business Economics (B.S.B.A.)',
            'Economics (B.S.)',
            'Entertainment Management (B.S.)',
            'Finance (B.S.B.A.)',
            'Integrated Business (B.S.B.A.)',
            'Management (B.S.B.A.)',
            'Marketing (B.S.B.A.)',
            'Real Estate (B.S.B.A.)',
        ],
    },
    {
        name: 'College of Sciences',
        degrees: [
            'Anthropology (B.A.)',
            'Biology (B.S.)',
            'Chemistry (B.S.)',
            'Forensic Science (B.S.)',
            'Mathematics (B.S.)',
            'Physics (B.S.)',
            'Political Science (B.A.)',
            'Psychology (B.S.)',
            'Sociology (B.A.)',
            'Statistics (B.S.)',
        ],
    },
    {
        name: 'College of Arts & Humanities',
        degrees: [
            'Architecture (B.Des.)',
            'Art (B.A.)',
            'Digital Media (B.A.)',
            'English (B.A.)',
            'Film (B.F.A.)',
            'History (B.A.)',
            'Music (B.A.)',
            'Philosophy (B.A.)',
            'Theatre (B.A.)',
        ],
    },
    {
        name: 'Health & Public Affairs / Medicine',
        degrees: [
            'Biomedical Sciences (B.S.)',
            'Criminal Justice (B.A./B.S.)',
            'Health Informatics & Information Management (B.S.)',
            'Health Sciences (B.S.)',
            'Hospitality Management (B.S.)',
            'Legal Studies (B.A./B.S.)',
            'Nursing (B.S.N.)',
            'Social Work (B.S.W.)',
        ],
    },
    {
        name: 'Graduate / Other',
        degrees: [
            'Business Administration (MBA)',
            'Computer Science (M.S.)',
            'Digital Forensics (M.S.)',
            'Educational Leadership (M.A.)',
            'Hospitality & Tourism Management (M.S.)',
        ],
    },
];

// Flat list of all degrees for combobox/autocomplete
export const UCF_DEGREES: string[] = [
    // Add "Other" option first for easy access
    'Other / Manual Entry',
    // Flatten all categories
    ...UCF_DEGREE_CATEGORIES.flatMap(category => category.degrees),
];

// Helper function to get degree without the abbreviation for display
export const getShortDegreeName = (degree: string): string => {
    // Remove the (B.S.), (B.A.), etc. suffix
    return degree.replace(/\s*\([^)]+\)$/, '').trim();
};

// Export default for convenience
export default UCF_DEGREES;
