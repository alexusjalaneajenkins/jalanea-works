/**
 * Valencia College Course Database
 *
 * Maps Valencia programs to their core courses with skills alignment
 * Used for resume coursework matching against job descriptions
 */

export interface ValenciaCourse {
    code: string;
    name: string;
    description: string;
    skills: string[];
    isCapstone?: boolean;
    projectBased?: boolean;
}

export interface ValenciaProgram {
    programId: string;
    programName: string;
    degreeType: 'AS' | 'BAS' | 'Certificate';
    courses: ValenciaCourse[];
}

export const VALENCIA_COURSES_DB: ValenciaProgram[] = [
    // ============================================
    // AS Graphic and Interactive Design
    // ============================================
    {
        programId: 'as_graphic_interactive_design',
        programName: 'Graphic and Interactive Design',
        degreeType: 'AS',
        courses: [
            {
                code: 'GRA 1100C',
                name: 'Graphic Design Fundamentals',
                description: 'Introduction to design principles, typography, and visual communication',
                skills: ['Typography', 'Color Theory', 'Visual Communication', 'Layout Design', 'Composition'],
            },
            {
                code: 'DIG 2030C',
                name: 'Digital Imaging',
                description: 'Image editing and manipulation using industry-standard software',
                skills: ['Adobe Photoshop', 'Photo Editing', 'Image Manipulation', 'Digital Retouching', 'Asset Creation'],
            },
            {
                code: 'DIG 2100C',
                name: 'Vector Graphics',
                description: 'Creating scalable graphics and illustrations for print and digital media',
                skills: ['Adobe Illustrator', 'Vector Graphics', 'Logo Design', 'Icon Design', 'Brand Identity'],
            },
            {
                code: 'DIG 2500C',
                name: 'Web Design Fundamentals',
                description: 'Creating responsive websites using HTML, CSS, and design principles',
                skills: ['HTML', 'CSS', 'Responsive Design', 'Web Design', 'UI Design', 'Wireframing'],
                projectBased: true,
            },
            {
                code: 'GRA 2190C',
                name: 'UI/UX Design',
                description: 'User interface and user experience design principles and prototyping',
                skills: ['UI Design', 'UX Design', 'Figma', 'Prototyping', 'User Research', 'Wireframing', 'User Journey Mapping'],
                projectBased: true,
            },
            {
                code: 'GRA 2750C',
                name: 'Motion Graphics',
                description: 'Creating animated graphics and visual effects for digital media',
                skills: ['Adobe After Effects', 'Motion Graphics', 'Animation', 'Video Editing', 'Visual Effects'],
                projectBased: true,
            },
            {
                code: 'GRA 2940',
                name: 'Graphic Design Capstone',
                description: 'Portfolio development and real-world design projects',
                skills: ['Portfolio Development', 'Client Communication', 'Project Management', 'Design Thinking', 'Brand Strategy'],
                isCapstone: true,
                projectBased: true,
            },
            {
                code: 'DIG 2109C',
                name: 'Publication Design',
                description: 'Layout design for print and digital publications using InDesign',
                skills: ['Adobe InDesign', 'Publication Design', 'Layout', 'Print Production', 'Editorial Design'],
            },
        ],
    },

    // ============================================
    // AS Computer Programming and Analysis
    // ============================================
    {
        programId: 'as_computer_programming_analysis',
        programName: 'Computer Programming and Analysis',
        degreeType: 'AS',
        courses: [
            {
                code: 'COP 1000',
                name: 'Introduction to Programming Logic',
                description: 'Fundamentals of programming concepts and problem-solving',
                skills: ['Programming Logic', 'Problem Solving', 'Algorithms', 'Flowcharts', 'Pseudocode'],
            },
            {
                code: 'COP 2800',
                name: 'Java Programming',
                description: 'Object-oriented programming using Java',
                skills: ['Java', 'Object-Oriented Programming', 'OOP', 'Data Structures', 'Software Development'],
                projectBased: true,
            },
            {
                code: 'COP 2830',
                name: 'Web Programming',
                description: 'Client-side and server-side web development',
                skills: ['JavaScript', 'HTML', 'CSS', 'Web Development', 'DOM Manipulation', 'APIs'],
                projectBased: true,
            },
            {
                code: 'COP 2839',
                name: 'JavaScript Frameworks',
                description: 'Modern JavaScript frameworks for building web applications',
                skills: ['React', 'Node.js', 'JavaScript Frameworks', 'Frontend Development', 'Component-Based Architecture'],
                projectBased: true,
            },
            {
                code: 'COP 2360',
                name: 'C# Programming',
                description: 'Application development using C# and .NET framework',
                skills: ['C#', '.NET', 'Windows Development', 'Object-Oriented Programming', 'Visual Studio'],
                projectBased: true,
            },
            {
                code: 'COP 2700',
                name: 'Database Design',
                description: 'Relational database design and SQL programming',
                skills: ['SQL', 'Database Design', 'MySQL', 'Data Modeling', 'Query Optimization', 'CRUD Operations'],
                projectBased: true,
            },
            {
                code: 'COP 2940',
                name: 'Programming Capstone',
                description: 'Real-world software development project with industry mentorship',
                skills: ['Agile', 'Git', 'Team Collaboration', 'Software Development Lifecycle', 'Project Management', 'Code Review'],
                isCapstone: true,
                projectBased: true,
            },
            {
                code: 'CTS 2440',
                name: 'Python Programming',
                description: 'Programming fundamentals and applications using Python',
                skills: ['Python', 'Scripting', 'Data Analysis', 'Automation', 'Libraries'],
                projectBased: true,
            },
        ],
    },

    // ============================================
    // AS Business Administration
    // ============================================
    {
        programId: 'as_business_administration',
        programName: 'Business Administration',
        degreeType: 'AS',
        courses: [
            {
                code: 'ACG 2021',
                name: 'Principles of Financial Accounting',
                description: 'Fundamentals of financial accounting and reporting',
                skills: ['Financial Accounting', 'Financial Statements', 'Bookkeeping', 'GAAP', 'QuickBooks'],
            },
            {
                code: 'ACG 2071',
                name: 'Managerial Accounting',
                description: 'Cost analysis and management decision-making',
                skills: ['Managerial Accounting', 'Cost Analysis', 'Budgeting', 'Financial Planning', 'Decision Making'],
            },
            {
                code: 'MAN 2021',
                name: 'Principles of Management',
                description: 'Management theory and organizational behavior',
                skills: ['Management', 'Leadership', 'Organizational Behavior', 'Team Management', 'Strategic Planning'],
            },
            {
                code: 'MAR 2011',
                name: 'Principles of Marketing',
                description: 'Marketing fundamentals and consumer behavior',
                skills: ['Marketing', 'Market Research', 'Consumer Behavior', 'Marketing Strategy', 'Brand Management'],
            },
            {
                code: 'GEB 2350',
                name: 'Business Communications',
                description: 'Professional writing and presentation skills',
                skills: ['Business Writing', 'Presentations', 'Professional Communication', 'Email Etiquette', 'Public Speaking'],
                projectBased: true,
            },
            {
                code: 'BUL 2241',
                name: 'Business Law',
                description: 'Legal environment of business and contracts',
                skills: ['Business Law', 'Contracts', 'Legal Compliance', 'Ethics', 'Risk Management'],
            },
            {
                code: 'GEB 2940',
                name: 'Business Administration Capstone',
                description: 'Integrated business project applying all concepts',
                skills: ['Business Strategy', 'Project Management', 'Business Plan Development', 'Cross-Functional Collaboration'],
                isCapstone: true,
                projectBased: true,
            },
            {
                code: 'FIN 2001',
                name: 'Principles of Finance',
                description: 'Financial management and investment fundamentals',
                skills: ['Financial Analysis', 'Investment', 'Cash Flow Management', 'Financial Modeling', 'Excel'],
            },
        ],
    },

    // ============================================
    // AS Cybersecurity & Network Engineering
    // ============================================
    {
        programId: 'as_cybersecurity_network',
        programName: 'Cybersecurity & Network Engineering Technology',
        degreeType: 'AS',
        courses: [
            {
                code: 'CTS 1120',
                name: 'Computer & Network Security Fundamentals',
                description: 'Introduction to cybersecurity concepts and best practices',
                skills: ['Cybersecurity', 'Network Security', 'Security Fundamentals', 'Threat Assessment', 'Security Policies'],
            },
            {
                code: 'CTS 2321',
                name: 'Network Administration',
                description: 'Managing and configuring network infrastructure',
                skills: ['Network Administration', 'Active Directory', 'Windows Server', 'Group Policy', 'Network Management'],
                projectBased: true,
            },
            {
                code: 'CTS 2106',
                name: 'Linux System Administration',
                description: 'Linux server administration and command line',
                skills: ['Linux', 'Command Line', 'Bash', 'System Administration', 'Server Management'],
                projectBased: true,
            },
            {
                code: 'CNT 2401',
                name: 'Cisco Networking',
                description: 'Cisco network configuration and routing protocols',
                skills: ['Cisco', 'Routing', 'Switching', 'Network Configuration', 'CCNA', 'TCP/IP'],
                projectBased: true,
            },
            {
                code: 'CTS 2134',
                name: 'Ethical Hacking & Penetration Testing',
                description: 'Security testing and vulnerability assessment',
                skills: ['Penetration Testing', 'Ethical Hacking', 'Vulnerability Assessment', 'Security Auditing', 'Kali Linux'],
                projectBased: true,
            },
            {
                code: 'CTS 2310',
                name: 'Cloud Security',
                description: 'Securing cloud infrastructure and services',
                skills: ['Cloud Security', 'AWS', 'Azure', 'Cloud Computing', 'Identity Management'],
                projectBased: true,
            },
            {
                code: 'CTS 2940',
                name: 'Cybersecurity Capstone',
                description: 'Real-world security assessment and incident response project',
                skills: ['Incident Response', 'Security Operations', 'Risk Assessment', 'Security Documentation', 'Compliance'],
                isCapstone: true,
                projectBased: true,
            },
            {
                code: 'CTS 1305',
                name: 'Security+/Network+ Certification Prep',
                description: 'Preparation for CompTIA Security+ and Network+ certifications',
                skills: ['CompTIA Security+', 'CompTIA Network+', 'Certification Prep', 'IT Security Fundamentals'],
            },
        ],
    },

    // ============================================
    // AS Hospitality and Tourism Management
    // ============================================
    {
        programId: 'as_hospitality_tourism',
        programName: 'Hospitality and Tourism Management',
        degreeType: 'AS',
        courses: [
            {
                code: 'HFT 1000',
                name: 'Introduction to Hospitality & Tourism',
                description: 'Overview of the hospitality and tourism industry',
                skills: ['Hospitality Industry', 'Tourism', 'Customer Service', 'Industry Knowledge', 'Career Planning'],
            },
            {
                code: 'HFT 2100',
                name: 'Food & Beverage Management',
                description: 'Managing food service operations and beverage programs',
                skills: ['Food & Beverage', 'Restaurant Management', 'Inventory Management', 'Cost Control', 'Menu Planning'],
                projectBased: true,
            },
            {
                code: 'HFT 2750',
                name: 'Event Planning & Management',
                description: 'Planning and executing events and conferences',
                skills: ['Event Planning', 'Event Management', 'Vendor Management', 'Budget Management', 'Logistics'],
                projectBased: true,
            },
            {
                code: 'HFT 2500',
                name: 'Lodging Operations',
                description: 'Hotel and resort operations management',
                skills: ['Hotel Management', 'Front Desk Operations', 'Housekeeping Management', 'Guest Services', 'Revenue Management'],
                projectBased: true,
            },
            {
                code: 'HFT 2220',
                name: 'Hospitality Marketing',
                description: 'Marketing strategies for hospitality businesses',
                skills: ['Hospitality Marketing', 'Digital Marketing', 'Social Media Marketing', 'Brand Management', 'Customer Engagement'],
            },
            {
                code: 'HFT 2401',
                name: 'Hospitality Law',
                description: 'Legal issues in hospitality and tourism',
                skills: ['Hospitality Law', 'Liability', 'Contracts', 'Employment Law', 'Risk Management'],
            },
            {
                code: 'HFT 2940',
                name: 'Hospitality Management Capstone',
                description: 'Industry internship and management project',
                skills: ['Leadership', 'Operations Management', 'Problem Solving', 'Industry Experience', 'Professional Development'],
                isCapstone: true,
                projectBased: true,
            },
            {
                code: 'HFT 2930',
                name: 'Theme Park & Attractions Management',
                description: 'Managing theme parks and entertainment venues (Orlando-specific)',
                skills: ['Theme Park Operations', 'Attractions Management', 'Guest Experience', 'Queue Management', 'Safety Protocols'],
                projectBased: true,
            },
        ],
    },

    // ============================================
    // Certificate: Web Development
    // ============================================
    {
        programId: 'cert_web_development',
        programName: 'Web Development Certificate',
        degreeType: 'Certificate',
        courses: [
            {
                code: 'COP 1822',
                name: 'HTML & CSS Fundamentals',
                description: 'Building web pages with HTML5 and CSS3',
                skills: ['HTML5', 'CSS3', 'Web Development', 'Responsive Design', 'Accessibility'],
                projectBased: true,
            },
            {
                code: 'COP 2830',
                name: 'JavaScript Programming',
                description: 'Client-side scripting and interactivity',
                skills: ['JavaScript', 'DOM', 'Event Handling', 'AJAX', 'APIs'],
                projectBased: true,
            },
            {
                code: 'COP 2839',
                name: 'Modern JavaScript Frameworks',
                description: 'Building applications with React or Vue',
                skills: ['React', 'Vue.js', 'Component Architecture', 'State Management', 'Single Page Applications'],
                projectBased: true,
            },
            {
                code: 'COP 2700',
                name: 'Backend Development',
                description: 'Server-side programming with Node.js',
                skills: ['Node.js', 'Express', 'REST APIs', 'Database Integration', 'Authentication'],
                projectBased: true,
            },
            {
                code: 'COP 2805',
                name: 'Full Stack Project',
                description: 'Building a complete web application from scratch',
                skills: ['Full Stack Development', 'Git', 'Deployment', 'Agile', 'Project Planning'],
                isCapstone: true,
                projectBased: true,
            },
            {
                code: 'CTS 2391',
                name: 'WordPress Development',
                description: 'Building and customizing WordPress sites',
                skills: ['WordPress', 'PHP', 'CMS', 'Theme Development', 'Plugin Customization'],
                projectBased: true,
            },
        ],
    },

    // ============================================
    // BAS Computing Technology & Software Development
    // ============================================
    {
        programId: 'bas_computing_software',
        programName: 'Computing Technology and Software Development',
        degreeType: 'BAS',
        courses: [
            {
                code: 'COP 3503',
                name: 'Advanced Programming Concepts',
                description: 'Advanced data structures and algorithms',
                skills: ['Data Structures', 'Algorithms', 'Big O Notation', 'Problem Solving', 'Technical Interviews'],
                projectBased: true,
            },
            {
                code: 'COP 3530',
                name: 'Software Engineering',
                description: 'Software development methodologies and best practices',
                skills: ['Software Engineering', 'Agile', 'Scrum', 'SDLC', 'Requirements Gathering', 'Documentation'],
                projectBased: true,
            },
            {
                code: 'COP 4813',
                name: 'Mobile Application Development',
                description: 'Building native and cross-platform mobile apps',
                skills: ['Mobile Development', 'iOS', 'Android', 'React Native', 'Flutter', 'Mobile UI'],
                projectBased: true,
            },
            {
                code: 'COP 4710',
                name: 'Database Systems',
                description: 'Advanced database design and administration',
                skills: ['Database Administration', 'NoSQL', 'MongoDB', 'PostgreSQL', 'Database Optimization'],
                projectBased: true,
            },
            {
                code: 'COP 4834',
                name: 'Cloud Development',
                description: 'Building and deploying cloud-native applications',
                skills: ['AWS', 'Cloud Architecture', 'Microservices', 'Docker', 'Kubernetes', 'CI/CD'],
                projectBased: true,
            },
            {
                code: 'CEN 4010',
                name: 'Software Development Capstone',
                description: 'Industry-sponsored software development project',
                skills: ['Team Leadership', 'Client Communication', 'Agile Project Management', 'Code Review', 'Technical Documentation'],
                isCapstone: true,
                projectBased: true,
            },
            {
                code: 'CIS 4360',
                name: 'Information Security',
                description: 'Application security and secure coding practices',
                skills: ['Application Security', 'Secure Coding', 'OWASP', 'Security Testing', 'Code Analysis'],
            },
            {
                code: 'CAP 4770',
                name: 'Data Science & Analytics',
                description: 'Data analysis and visualization techniques',
                skills: ['Data Science', 'Python', 'Data Visualization', 'Machine Learning Basics', 'Pandas', 'Jupyter'],
                projectBased: true,
            },
        ],
    },
];

/**
 * Get courses for a specific program by name
 */
export function getCoursesByProgram(programName: string): ValenciaCourse[] | null {
    const normalizedName = programName.toLowerCase().trim();

    const program = VALENCIA_COURSES_DB.find(p =>
        p.programName.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(p.programName.toLowerCase()) ||
        p.programId.toLowerCase().includes(normalizedName.replace(/\s+/g, '_'))
    );

    return program?.courses || null;
}

/**
 * Get program info by name
 */
export function getProgramByName(programName: string): ValenciaProgram | null {
    const normalizedName = programName.toLowerCase().trim();

    return VALENCIA_COURSES_DB.find(p =>
        p.programName.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(p.programName.toLowerCase())
    ) || null;
}

/**
 * Get all skills from a program's courses
 */
export function getAllSkillsFromProgram(programName: string): string[] {
    const courses = getCoursesByProgram(programName);
    if (!courses) return [];

    const skillSet = new Set<string>();
    courses.forEach(course => {
        course.skills.forEach(skill => skillSet.add(skill));
    });

    return Array.from(skillSet);
}

/**
 * Find courses that match specific skills
 */
export function findCoursesBySkills(programName: string, targetSkills: string[]): ValenciaCourse[] {
    const courses = getCoursesByProgram(programName);
    if (!courses) return [];

    const normalizedTargets = targetSkills.map(s => s.toLowerCase());

    return courses.filter(course =>
        course.skills.some(skill =>
            normalizedTargets.some(target =>
                skill.toLowerCase().includes(target) ||
                target.includes(skill.toLowerCase())
            )
        )
    );
}
