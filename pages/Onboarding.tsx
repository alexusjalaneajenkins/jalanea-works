import React, { useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgramSkills } from '../data/centralFloridaPrograms';
import { Card } from '../components/Card';
import { Stage1_Identity } from '../components/onboarding/Stage1_Identity';
import { Stage2_Education } from '../components/onboarding/Stage2_Education';
import { Stage3_Logistics } from '../components/onboarding/Stage3_Logistics';
import { Stage4_Salary } from '../components/onboarding/Stage4_Salary';
import { Stage5_Reality } from '../components/onboarding/Stage5_Reality';
import { BudgetData } from '../components/SalaryBudgetBreakdown';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import {
    Car, Bus, Bike, ChevronRight, ChevronLeft, Check, Sparkles
} from 'lucide-react';
import type { UserProfile, Education, DegreeType } from '../types';

// =====================================================
// JALANEA WORKS: 5-STAGE ONBOARDING WIZARD (3 GROUPS)
// Philosophy: "Build Bridges, Not Walls"
//
// GROUP 1: About You (Stages 1-2)
// GROUP 2: Your Goals (Stages 3-4)
// GROUP 3: Your Path (Stage 5)
// =====================================================

type Stage = 1 | 2 | 3 | 4 | 5;
type TransportMode = 'car' | 'bus' | 'bike' | 'rideshare' | 'walk';

// Education Entry
interface EducationEntry {
    id: string;
    school: string;
    degreeType: string;
    program: string;
    gradYear: string;
    status?: string; // Alumni or Student
}

// Availability type
type AvailabilityType = 'open' | 'weekdays' | 'weekends' | 'flexible' | 'limited';

// Complete State Shape
interface OnboardingState {
    stage: Stage;
    // Stage 1: Identity
    name: string;
    commuteStart: string;
    commuteCoords: string; // lat,lon for distance calculations
    linkedIn: string;
    portfolio: string;
    // Stage 2: Education
    education: EducationEntry[];
    // Stage 3: Logistics (all start unselected - user must choose)
    transport: TransportMode[];
    commuteTolerance: 'local' | 'standard' | 'extended' | null;
    availability: AvailabilityType | null;
    selectedDays: string[];
    shiftPreference: string[];
    // Stage 4: Salary (starts unselected - user must choose a tier)
    salaryMin: number | null;
    salaryMax: number | null;
    budgetData: BudgetData | null;
    // Stage 5: Reality/Challenges
    realityContext: string;
    selectedPrompts: string[];
    // Meta
    isSubmitting: boolean;
}

// Action Types
type OnboardingAction =
    | { type: 'SET_STAGE'; payload: Stage }
    | { type: 'UPDATE_FIELD'; field: keyof OnboardingState; value: any }
    | { type: 'ADD_EDUCATION' }
    | { type: 'UPDATE_EDUCATION'; id: string; field: keyof EducationEntry; value: string }
    | { type: 'REMOVE_EDUCATION'; id: string }
    | { type: 'TOGGLE_PROMPT'; prompt: string }
    | { type: 'RESET' };

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Group configuration for progress indicator
const STAGE_GROUPS = [
    { name: 'About You', stages: [1, 2] as const },
    { name: 'Your Goals', stages: [3, 4] as const },
    { name: 'Your Path', stages: [5] as const },
] as const;

const getGroupInfo = (stage: Stage) => {
    for (let i = 0; i < STAGE_GROUPS.length; i++) {
        const group = STAGE_GROUPS[i];
        if ((group.stages as readonly number[]).includes(stage)) {
            const stageIndex = (group.stages as readonly number[]).indexOf(stage);
            return {
                groupIndex: i,
                groupName: group.name,
                stageInGroup: stageIndex + 1,
                totalInGroup: group.stages.length,
            };
        }
    }
    return { groupIndex: 0, groupName: '', stageInGroup: 1, totalInGroup: 1 };
};

// Initial State - all selections start empty, user must actively choose
const initialState: OnboardingState = {
    stage: 1,
    // Stage 1: Identity
    name: '',
    commuteStart: '',
    commuteCoords: '',
    linkedIn: '',
    portfolio: '',
    // Stage 2: Education
    education: [],
    // Stage 3: Logistics - NO defaults, user must select
    transport: [],
    commuteTolerance: null,
    availability: null,
    selectedDays: [],
    shiftPreference: [],
    // Stage 4: Salary - NO defaults, user must select a tier
    salaryMin: null,
    salaryMax: null,
    budgetData: null,
    // Stage 5: Reality/Challenges
    realityContext: '',
    selectedPrompts: [],
    // Meta
    isSubmitting: false,
};

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
    switch (action.type) {
        case 'SET_STAGE':
            return { ...state, stage: action.payload };
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'ADD_EDUCATION':
            return {
                ...state,
                education: [...state.education, { id: generateId(), school: '', degreeType: '', program: '', gradYear: '' }]
            };
        case 'UPDATE_EDUCATION':
            return {
                ...state,
                education: state.education.map(edu =>
                    edu.id === action.id
                        ? { ...edu, [action.field]: action.value, ...(action.field === 'school' ? { degreeType: '', program: '' } : {}), ...(action.field === 'degreeType' ? { program: '' } : {}) }
                        : edu
                )
            };
        case 'REMOVE_EDUCATION':
            return { ...state, education: state.education.filter(edu => edu.id !== action.id) };
        case 'TOGGLE_PROMPT':
            return {
                ...state,
                selectedPrompts: state.selectedPrompts.includes(action.prompt)
                    ? state.selectedPrompts.filter(p => p !== action.prompt)
                    : [...state.selectedPrompts, action.prompt]
            };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

// Transport Options
const TRANSPORT_OPTIONS: { value: TransportMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'car', label: 'Reliable Car', icon: <Car className="w-6 h-6" />, desc: 'Own vehicle' },
    { value: 'bus', label: 'Bus (LYNX)', icon: <Bus className="w-6 h-6" />, desc: 'Public transit' },
    { value: 'bike', label: 'Bike / Walk', icon: <Bike className="w-6 h-6" />, desc: 'Active commute' },
    { value: 'rideshare', label: 'Ride-Share', icon: <Car className="w-6 h-6" />, desc: 'Uber/Lyft/Friend' },
];

// Categorize skills into technical, design, and soft
const categorizeSkills = (skills: string[]): { technical: string[]; design: string[]; soft: string[] } => {
    const designKeywords = ['adobe', 'figma', 'photoshop', 'illustrator', 'design', 'ui/ux', 'typography', 'branding', 'layout', 'color', 'camera', 'photo', 'video', 'animation', 'creative suite', 'lightroom', 'premiere', 'after effects', 'maya', 'blender', 'storyboard'];
    const softKeywords = ['communication', 'teamwork', 'leadership', 'problem solving', 'time management', 'critical thinking', 'adaptability', 'customer service', 'client', 'team', 'management', 'planning', 'organization'];

    const technical: string[] = [];
    const design: string[] = [];
    const soft: string[] = [];

    skills.forEach(skill => {
        const lowerSkill = skill.toLowerCase();
        if (designKeywords.some(k => lowerSkill.includes(k))) {
            design.push(skill);
        } else if (softKeywords.some(k => lowerSkill.includes(k))) {
            soft.push(skill);
        } else {
            technical.push(skill);
        }
    });

    return { technical, design, soft };
};

// Derive all skills from education programs
const deriveSkillsFromEducation = (education: EducationEntry[]): { technical: string[]; design: string[]; soft: string[] } => {
    const allSkills = new Set<string>();

    education.forEach(edu => {
        if (edu.program) {
            const programSkills = getProgramSkills(edu.program);
            programSkills.forEach(skill => allSkills.add(skill));
        }
    });

    return categorizeSkills(Array.from(allSkills));
};

export const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser: user, saveUserProfile: updateUserProfile } = useAuth();
    const [state, dispatch] = useReducer(onboardingReducer, initialState);

    // Scroll to top whenever stage changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [state.stage]);

    // Get current group info
    const groupInfo = getGroupInfo(state.stage);

    // Save progress to Firebase (called on each stage completion)
    const saveProgress = async () => {
        if (!auth.currentUser) {
            console.warn('No authenticated user, skipping progress save');
            return;
        }

        try {
            // Build progress data with flat field names
            const progressData: Record<string, any> = {
                onboardingStage: state.stage,
                updatedAt: new Date().toISOString(),
            };

            // Stage 1: Identity
            if (state.name) {
                progressData.name = state.name;
                progressData.fullName = state.name;
            }
            if (state.commuteStart) progressData.location = state.commuteStart;
            if (state.commuteCoords) progressData.commuteCoords = state.commuteCoords;
            if (state.linkedIn) progressData.linkedinUrl = state.linkedIn;
            if (state.portfolio) progressData.portfolioUrl = state.portfolio;

            // Stage 2: Credentials
            if (state.education.length > 0) {
                const credentials = state.education
                    .filter(edu => edu.school && edu.program)
                    .map(edu => ({
                        school: edu.school,
                        program: edu.program,
                        graduationYear: edu.gradYear,
                        degreeType: edu.degreeType || 'Certificate',
                        status: edu.status || 'Alumni',
                    }));
                if (credentials.length > 0) {
                    progressData.credentials = credentials;
                    progressData.skills = deriveSkillsFromEducation(state.education);
                }
            }

            // Stage 3: Logistics (flat fields)
            if (state.transport.length > 0) progressData.commuteMethod = state.transport;
            if (state.commuteTolerance) progressData.commuteWillingness = state.commuteTolerance;
            if (state.availability) progressData.availability = state.availability;
            if (state.selectedDays.length > 0) progressData.selectedDays = state.selectedDays;
            if (state.shiftPreference.length > 0) progressData.shiftPreference = state.shiftPreference;

            // Stage 4: Salary (flat fields)
            if (state.salaryMin && state.salaryMax) {
                progressData.salaryMin = state.salaryMin;
                progressData.salaryMax = state.salaryMax;
                // Determine tier name
                const min = state.salaryMin;
                if (min === 30000) progressData.salaryTier = 'entry';
                else if (min === 40000) progressData.salaryTier = 'growing';
                else if (min === 52000) progressData.salaryTier = 'comfortable';
                else if (min === 62000) progressData.salaryTier = 'established';
                else if (min === 75000) progressData.salaryTier = 'thriving';
                else if (min === 90000) progressData.salaryTier = 'advanced';
            }
            if (state.budgetData) progressData.budgetData = state.budgetData;

            // Stage 5: Reality
            if (state.selectedPrompts.length > 0) progressData.realityChallenges = state.selectedPrompts;
            if (state.realityContext) progressData.realityContext = state.realityContext;

            // Save to Firestore
            console.log('Saving progress to Firebase:', progressData);
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userDocRef, progressData, { merge: true });
            console.log('Progress saved successfully');
        } catch (error) {
            console.error('Error saving progress:', error);
            // Don't block navigation on save failure
        }
    };

    // Navigation with progressive saving
    const nextStage = async () => {
        // Save current stage data before advancing
        await saveProgress();
        dispatch({ type: 'SET_STAGE', payload: Math.min(5, state.stage + 1) as Stage });
    };
    const prevStage = () => dispatch({ type: 'SET_STAGE', payload: Math.max(1, state.stage - 1) as Stage });

    // Validation - all required fields must be actively selected
    const isStage1Valid = state.name.trim() && state.commuteStart.trim();
    const isStage2Valid = state.education.some(edu => edu.school && edu.program);
    // Stage 3: Transport, commute tolerance, and availability are all required
    const isStage3Valid =
        state.transport.length > 0 &&
        state.commuteTolerance !== null &&
        state.availability !== null &&
        // If "limited" availability, require at least one day selected
        (state.availability !== 'limited' || state.selectedDays.length > 0);
    // Stage 4: User must select a salary tier
    const isStage4Valid = state.salaryMin !== null && state.salaryMax !== null;
    const isStage5Valid = true; // Reality - optional stage

    const canProceed = () => {
        switch (state.stage) {
            case 1: return isStage1Valid;
            case 2: return isStage2Valid;
            case 3: return isStage3Valid;
            case 4: return isStage4Valid;
            case 5: return isStage5Valid;
            default: return false;
        }
    };

    // Submit - Save all onboarding data to Firebase
    const submitProfile = async () => {
        console.log('=== ONBOARDING SUBMIT START ===');
        console.log('User from context:', user?.uid);
        console.log('Auth currentUser:', auth.currentUser?.uid);

        if (!user || !auth.currentUser) {
            alert('Authentication lost. Please refresh the page and try again.');
            console.error('No authenticated user found');
            return;
        }

        dispatch({ type: 'UPDATE_FIELD', field: 'isSubmitting', value: true });

        try {
            // Build credentials array from education
            const credentials = state.education
                .filter(edu => edu.school && edu.program)
                .map(edu => ({
                    school: edu.school,
                    program: edu.program,
                    graduationYear: edu.gradYear,
                    degreeType: edu.degreeType || 'Certificate',
                    status: edu.status || 'Alumni',
                }));

            // Derive skills from education programs
            const derivedSkills = deriveSkillsFromEducation(state.education);

            // Determine salary tier from min/max values
            const getSalaryTierName = (min: number, max: number): string => {
                if (min === 30000) return 'entry';
                if (min === 40000) return 'growing';
                if (min === 52000) return 'comfortable';
                if (min === 62000) return 'established';
                if (min === 75000) return 'thriving';
                if (min === 90000) return 'advanced';
                return 'custom';
            };

            // Build flat onboarding data object
            const onboardingData = {
                // Stage 1: Identity
                name: state.name || null,
                fullName: state.name || null,
                location: state.commuteStart || null,
                commuteCoords: state.commuteCoords || null,
                linkedinUrl: state.linkedIn || null,
                portfolioUrl: state.portfolio || null,

                // Stage 2: Education/Credentials
                credentials: credentials,
                skills: derivedSkills,

                // Stage 3: Logistics (flat fields)
                commuteMethod: state.transport, // array like ['car', 'bus']
                commuteWillingness: state.commuteTolerance, // 'local', 'standard', 'extended'
                availability: state.availability, // 'open', 'weekdays', etc.
                selectedDays: state.selectedDays.length > 0 ? state.selectedDays : null,
                shiftPreference: state.shiftPreference.length > 0 ? state.shiftPreference : null,

                // Stage 4: Salary (flat fields)
                salaryTier: state.salaryMin && state.salaryMax
                    ? getSalaryTierName(state.salaryMin, state.salaryMax)
                    : null,
                salaryMin: state.salaryMin,
                salaryMax: state.salaryMax,
                budgetData: state.budgetData || null,

                // Stage 5: Reality/Challenges
                realityChallenges: state.selectedPrompts.length > 0 ? state.selectedPrompts : null,
                realityContext: state.realityContext || null,

                // Meta fields
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            console.log('Onboarding data to save:', JSON.stringify(onboardingData, null, 2));
            console.log('Saving to user document:', auth.currentUser.uid);

            // Save to Firestore with merge to preserve subscription data
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userDocRef, onboardingData, { merge: true });

            console.log('=== FIREBASE SAVE SUCCESSFUL ===');

            // Also update context (this triggers profile reload)
            await updateUserProfile(onboardingData as any);

            console.log('=== ONBOARDING COMPLETE - REDIRECTING ===');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('=== FIREBASE SAVE FAILED ===');
            console.error('Error details:', error);
            console.error('Error code:', error?.code);
            console.error('Error message:', error?.message);
            alert(`Failed to save your profile: ${error?.message || 'Unknown error'}. Please try again.`);
        } finally {
            dispatch({ type: 'UPDATE_FIELD', field: 'isSubmitting', value: false });
        }
    };

    // Group Progress Indicator
    const GroupProgressIndicator = () => (
        <div className="mb-8">
            {/* 3 Group Circles */}
            <div className="flex items-center justify-center gap-4 mb-4">
                {STAGE_GROUPS.map((group, idx) => {
                    const isCurrentGroup = idx === groupInfo.groupIndex;
                    const isCompletedGroup = idx < groupInfo.groupIndex;
                    return (
                        <div key={group.name} className="flex items-center gap-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                    isCurrentGroup
                                        ? 'bg-amber-500 text-white scale-110 ring-4 ring-amber-500/30'
                                        : isCompletedGroup
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                }`}
                            >
                                {isCompletedGroup ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            {idx < STAGE_GROUPS.length - 1 && (
                                <div className={`w-8 h-1 rounded-full transition-all ${
                                    isCompletedGroup ? 'bg-amber-500' : 'bg-slate-700'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Current Group Name */}
            <div className="text-center">
                <div className="text-amber-500 font-bold text-lg">
                    {groupInfo.groupName}
                </div>
                {groupInfo.totalInGroup > 1 && (
                    <div className="text-slate-400 text-sm">
                        Step {groupInfo.stageInGroup} of {groupInfo.totalInGroup}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-amber-500">Jalanea Works Onboarding</span>
                    </div>
                </div>

                <GroupProgressIndicator />

                {/* Stage Content */}
                <Card variant="solid-white" className="max-w-2xl mx-auto">
                    {/* ===== STAGE 1: IDENTITY ===== */}
                    {state.stage === 1 && (
                        <Stage1_Identity
                            data={{
                                name: state.name,
                                commuteStart: state.commuteStart,
                                linkedinUrl: state.linkedIn,
                                portfolioUrl: state.portfolio
                            }}
                            onUpdate={(field, value) => dispatch({ type: 'UPDATE_FIELD', field: field as any, value })}
                            onNext={nextStage}
                        />
                    )}

                    {/* ===== STAGE 2: EDUCATION ===== */}
                    {state.stage === 2 && (
                        <Stage2_Education
                            formData={{
                                educationHistory: state.education
                            }}
                            updateFormData={(field: string, value: any) => {
                                if (field === 'educationHistory') {
                                    // Replace the entire education array
                                    dispatch({ type: 'UPDATE_FIELD', field: 'education', value });
                                }
                            }}
                        />
                    )}



                    {/* ===== STAGE 3: LOGISTICS ===== */}
                    {state.stage === 3 && (
                        <Stage3_Logistics
                            data={{
                                transport: state.transport,
                                commuteTolerance: state.commuteTolerance,
                                availability: state.availability,
                                selectedDays: state.selectedDays,
                                shiftPreference: state.shiftPreference,
                            }}
                            onUpdate={(field, value) => dispatch({ type: 'UPDATE_FIELD', field: field as any, value })}
                            onNext={nextStage}
                            onBack={prevStage}
                        />
                    )}



                    {/* ===== STAGE 4: SALARY ===== */}
                    {state.stage === 4 && (
                        <Stage4_Salary
                            data={{
                                salaryMin: state.salaryMin,
                                salaryMax: state.salaryMax,
                                budgetData: state.budgetData
                            }}
                            onUpdate={(field, value) => dispatch({ type: 'UPDATE_FIELD', field: field as any, value })}
                        />
                    )}

                    {/* ===== STAGE 5: REALITY/CHALLENGES ===== */}
                    {state.stage === 5 && (
                        <Stage5_Reality
                            data={{
                                realityContext: state.realityContext,
                                selectedPrompts: state.selectedPrompts
                            }}
                            onUpdate={(field, value) => dispatch({ type: 'UPDATE_FIELD', field: field as any, value })}
                            onNext={nextStage}
                            onBack={prevStage}
                        />
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                        {state.stage > 1 ? (
                            <button
                                type="button"
                                onClick={prevStage}
                                className="px-5 py-3 min-h-[44px] text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {state.stage < 5 ? (
                            <button
                                type="button"
                                onClick={nextStage}
                                disabled={!canProceed()}
                                className="px-6 py-3.5 min-h-[44px] bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={submitProfile}
                                disabled={state.isSubmitting}
                                className="px-6 py-3.5 min-h-[44px] bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white"
                            >
                                {state.isSubmitting ? 'Launching...' : 'Launch My Career'}
                                <Sparkles className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </Card>
            </div >
        </div >
    );
};

export default Onboarding;
