/**
 * useUserProfile - Centralized hook for accessing user profile data
 *
 * This hook provides easy access to all onboarding data and user preferences
 * throughout the application. It normalizes the data structure and provides
 * helper functions for common use cases.
 */

import { useAuth } from '../contexts/AuthContext';

// Credential/Education entry type
export interface Credential {
    school: string;
    program: string;
    graduationYear: string;
    degreeType: string;
    status: string;
}

// Skills structure
export interface UserSkills {
    technical: string[];
    soft: string[];
    design: string[];
}

// Salary range
export interface SalaryRange {
    min: number;
    max: number;
    tier: string;
}

// AI Context for prompts
export interface AIUserContext {
    name: string | null;
    school: string | null;
    program: string | null;
    skills: UserSkills | null;
    targetSalary: string;
    availability: string | null;
    challenges: string[];
    location: string | null;
    commuteMethod: string[];
    commuteWillingness: string | null;
}

export function useUserProfile() {
    const { currentUser, userProfile } = useAuth();
    const profile = userProfile as any; // Allow access to all fields

    // Basic info
    const name = profile?.name || profile?.fullName || currentUser?.displayName || 'User';
    const email = currentUser?.email || null;
    const location = profile?.location || null;
    const photoURL = profile?.photoURL || currentUser?.photoURL || null;

    // Education/Credentials
    const credentials: Credential[] = profile?.credentials || [];
    const hasEducation = credentials.length > 0;
    const primaryCredential = credentials[0] || null;
    const primarySchool = primaryCredential?.school || null;
    const primaryProgram = primaryCredential?.program || null;

    // Skills
    const skills: UserSkills = profile?.skills || { technical: [], soft: [], design: [] };
    const allSkills: string[] = [
        ...(skills.technical || []),
        ...(skills.soft || []),
        ...(skills.design || [])
    ];
    const hasSkills = allSkills.length > 0;

    // Work Preferences
    const commuteMethod: string[] = profile?.commuteMethod || [];
    const commuteWillingness: string | null = profile?.commuteWillingness || null;
    const availability: string | null = profile?.availability || null;
    const shiftPreference: string[] = profile?.shiftPreference || [];
    const selectedDays: string[] = profile?.selectedDays || [];

    // Salary
    const salaryMin = profile?.salaryMin || profile?.targetSalaryRange?.min || 30000;
    const salaryMax = profile?.salaryMax || profile?.targetSalaryRange?.max || 50000;
    const salaryTier = profile?.salaryTier || 'entry';
    const salaryRange: SalaryRange = {
        min: salaryMin,
        max: salaryMax,
        tier: salaryTier
    };

    // Reality/Challenges
    const challenges: string[] = profile?.realityChallenges || [];
    const realityContext: string | null = profile?.realityContext || null;

    // Status flags
    const isOnboarded = profile?.onboardingCompleted === true;
    const onboardingStage = profile?.onboardingStage || null;

    // Helper: Get formatted salary tier name
    const getSalaryTierName = (): string => {
        switch (salaryTier) {
            case 'entry': return 'Entry Level ($30K-$40K)';
            case 'growing': return 'Growing ($40K-$52K)';
            case 'comfortable': return 'Comfortable ($52K-$62K)';
            case 'established': return 'Established ($62K-$75K)';
            case 'thriving': return 'Thriving ($75K-$90K)';
            case 'advanced': return 'Advanced ($90K+)';
            default: return salaryTier;
        }
    };

    // Helper: Get formatted availability
    const getAvailabilityLabel = (): string => {
        switch (availability) {
            case 'open': return 'Open to anything';
            case 'weekdays': return 'Weekdays preferred';
            case 'weekends': return 'Weekends preferred';
            case 'flexible': return 'Flexible hours';
            case 'limited': return 'Specific days only';
            default: return availability || 'Not set';
        }
    };

    // Helper: Get formatted commute willingness
    const getCommuteLabel = (): string => {
        switch (commuteWillingness) {
            case 'local': return 'Local (< 30 min)';
            case 'standard': return 'Standard (< 60 min)';
            case 'extended': return 'Any Distance (60+ min)';
            default: return commuteWillingness || 'Not set';
        }
    };

    // Helper: Get max commute time in minutes for filtering
    const getMaxCommuteMinutes = (): number => {
        switch (commuteWillingness) {
            case 'local': return 30;
            case 'standard': return 60;
            case 'extended': return 120;
            default: return 60; // Default to standard
        }
    };

    // Helper: Get AI context for prompts
    const getAIContext = (): AIUserContext => ({
        name: profile?.name || profile?.fullName || null,
        school: primarySchool,
        program: primaryProgram,
        skills: hasSkills ? skills : null,
        targetSalary: `$${salaryMin.toLocaleString()}-$${salaryMax.toLocaleString()}`,
        availability,
        challenges,
        location,
        commuteMethod,
        commuteWillingness
    });

    // Helper: Build system prompt for AI
    const buildAISystemPrompt = (): string => {
        const ctx = getAIContext();
        const parts: string[] = [
            'You are an AI Career Coach for Jalanea Works, helping Orlando-area community college graduates find careers.',
            '',
            'CURRENT USER CONTEXT:'
        ];

        if (ctx.name) parts.push(`- Name: ${ctx.name}`);
        if (ctx.school) parts.push(`- School: ${ctx.school}`);
        if (ctx.program) parts.push(`- Program: ${ctx.program}`);
        if (ctx.skills?.technical?.length) parts.push(`- Technical Skills: ${ctx.skills.technical.join(', ')}`);
        if (ctx.skills?.soft?.length) parts.push(`- Soft Skills: ${ctx.skills.soft.join(', ')}`);
        parts.push(`- Target Salary: ${ctx.targetSalary}`);
        if (ctx.location) parts.push(`- Location: ${ctx.location}`);
        if (ctx.availability) parts.push(`- Availability: ${getAvailabilityLabel()}`);
        if (ctx.commuteMethod?.length) parts.push(`- Commute Method: ${ctx.commuteMethod.join(', ')}`);
        if (ctx.challenges?.length) parts.push(`- Current Challenges: ${ctx.challenges.join(', ')}`);

        parts.push('');
        parts.push('Use this context to personalize your advice. Reference their specific program, skills, and situation.');
        parts.push("Don't ask for information you already have. Be specific to the Orlando job market.");

        return parts.join('\n');
    };

    // Helper: Get default job filters based on profile
    const getDefaultJobFilters = () => ({
        location: location || 'Orlando, FL',
        salaryMin: salaryMin,
        salaryMax: salaryMax,
        maxCommute: getMaxCommuteMinutes(),
        skills: allSkills,
        availability: availability
    });

    return {
        // Basic info
        name,
        email,
        location,
        photoURL,

        // Education
        credentials,
        hasEducation,
        primaryCredential,
        primarySchool,
        primaryProgram,

        // Skills
        skills,
        allSkills,
        hasSkills,

        // Work Preferences
        commuteMethod,
        commuteWillingness,
        availability,
        shiftPreference,
        selectedDays,

        // Salary
        salaryRange,
        salaryMin,
        salaryMax,
        salaryTier,

        // Challenges
        challenges,
        realityContext,

        // Status
        isOnboarded,
        onboardingStage,

        // Helpers
        getSalaryTierName,
        getAvailabilityLabel,
        getCommuteLabel,
        getMaxCommuteMinutes,
        getAIContext,
        buildAISystemPrompt,
        getDefaultJobFilters,

        // Raw profile access (for edge cases)
        rawProfile: profile
    };
}

export default useUserProfile;
