/**
 * Profile Seeding Utility
 * 
 * This module contains the user's detailed career information for testing
 * resume generation. Call seedUserProfile() when authenticated to populate
 * the user's profile with this data.
 */

export interface SeedEducation {
    degree: string;
    school: string;
    year: string;
    gpa?: string;
}

export interface SeedExperience {
    role: string;
    company: string;
    duration: string;
    description: string[];
}

export interface SeedSkills {
    technical: string[];
    design: string[];
    soft: string[];
}

export interface SeedCertification {
    name: string;
    issuer: string;
    date?: string;
}

// User's actual career data for seeding
export const seedProfileData = {
    education: [
        {
            degree: "Bachelor of Applied Science in Computing Technology & Software Development",
            school: "Valencia College",
            year: "2025",
            gpa: "3.93"
        },
        {
            degree: "Associate of Science in Graphic and Interactive Design",
            school: "Valencia College",
            year: "2024",
            gpa: "3.88"
        },
        {
            degree: "Associate of Arts in General Studies",
            school: "Valencia College",
            year: "2022"
            // GPA not specified for this degree
        }
    ] as SeedEducation[],

    experience: [
        {
            role: "Junior UI/UX Design Intern",
            company: "PETE Learning",
            duration: "Jun 2024 - Aug 2024",
            description: [
                "Served as Junior UI/UX Designer to enhance PETE Learning's platforms with a fresh perspective",
                "Identified navigation challenges and proposed a new tooltip system to reduce user confusion",
                "Designed three tooltip variations (text, image, video) and documented their pros, cons, benefits, and use cases",
                "Created animated UI mockups and delivered a full proposal directly to the President of the company",
                "Contributed UI updates and quality of life improvements to PETE Learning's course builder"
            ]
        },
        {
            role: "Kid Coordinator (Imagination Station)",
            company: "Mosaic Church",
            duration: "Jun 2024 - Aug 2024",
            description: [
                "Coordinated 9 rotating activity stations for over 120 children during Mosaic Church's summer program",
                "Developed hands-on learning activities using various materials to engage kids creatively",
                "Adapted lessons in real-time to ensure all children received individual attention and support",
                "Collaborated with a team of volunteers to maintain a safe and fun environment"
            ]
        },
        {
            role: "Educational Content Intern",
            company: "CoLabL",
            duration: "Feb 2024 - May 2024",
            description: [
                "Participated with ColaBB, focusing on mental health and wellness for teens",
                "Collaborated with team members to create a comprehensive guide addressing mental health issues",
                "Developed promotional strategies to effectively disseminate mental health resources to young adults"
            ]
        },
        {
            role: "Customer Associate",
            company: "Wawa, Inc.",
            duration: "Nov 2021 - May 2024",
            description: [
                "Worked at a 24/7 Wawa location for 2 years, specializing in service excellence",
                "Handled everything from high-volume orders to customer escalation with patience and care",
                "Known for staying calm during conflicts, solving customer issues, and helping people feel heard",
                "Represented Wawa's values by creating a welcoming, safe space"
            ]
        },
        {
            role: "Crew Member",
            company: "The Wendy's Company",
            duration: "Mar 2020 - Oct 2021",
            description: [
                "Worked every major station: grill, fries, cashier, drive-thru, and overnight stocking",
                "Averaged 30 hour shifts, 4 days a week with consistent on-time attendance",
                "Trusted by managers and coworkers as reliable, adaptable, and fast-learning"
            ]
        },
        {
            role: "Concept Artist & Graphic Designer",
            company: "River Rose Productions LLC",
            duration: "Jun 2019 - Mar 2020",
            description: [
                "Developed unique visual identities and illustrations for various projects, enhancing brand recognition",
                "Collaborated closely with authors and developers to create engaging content",
                "Contributed illustrations to a children's book that achieved over 2,500 retail sales",
                "Designed educational infographics for a gaming startup, boosting user retention by 20%"
            ]
        }
    ] as SeedExperience[],

    skills: {
        technical: ["Java", "SQL", "Docker", "HTML", "CSS", "JavaScript", "SDLC", "Database Management", "VS Code", "GitHub"],
        design: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Adobe After Effects", "User Journey Mapping", "Wireframing"],
        soft: ["Conflict Resolution", "Adaptability", "Empathy", "Team Leadership", "High-Volume Cash Handling"]
    } as SeedSkills,

    certifications: [
        { name: "Graphics Interactive Design Production", issuer: "Valencia College", date: "2024" },
        { name: "Interactive Design Support", issuer: "Valencia College", date: "2024" },
        { name: "Microsoft Office Specialist - Word", issuer: "Microsoft", date: "2023" },
        { name: "Microsoft Office Specialist - Excel", issuer: "Microsoft", date: "2023" },
        { name: "Microsoft Office Specialist - PowerPoint", issuer: "Microsoft", date: "2023" },
        { name: "Entrepreneurship & Small Business", issuer: "Microsoft", date: "2023" },
        { name: "Strategic Career Alignment", issuer: "University Park, FL", date: "2025" }
    ] as SeedCertification[],

    // Preferences based on user's background
    preferences: {
        targetRoles: [
            "UI/UX Designer",
            "Junior Software Developer",
            "Graphic Designer",
            "Front-End Developer",
            "Product Designer"
        ],
        workStyles: ["Hybrid", "Remote"],
        salary: 55000,
        transportMode: "Car"
    }
};

/**
 * Returns the seed data ready to be merged into a user profile
 */
export const getSeedData = () => ({
    name: "Alexus Jenkins",
    fullName: "Alexus Jenkins",
    location: "Orlando, FL",
    education: seedProfileData.education,
    experience: seedProfileData.experience,
    skills: seedProfileData.skills,
    certifications: seedProfileData.certifications,
    preferences: seedProfileData.preferences,
    onboardingCompleted: true,
    hasSetupSchedule: true
});
