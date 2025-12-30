import React, { useReducer, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CENTRAL_FL_SCHOOLS, getDegreeTypes, getPrograms } from '../data/centralFloridaPrograms';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Combobox } from '../components/Combobox';
import { Stage1_Identity } from '../components/onboarding/Stage1_Identity';
import { Stage2_Education } from '../components/onboarding/Stage2_Education';
import { Stage3_Logistics } from '../components/onboarding/Stage3_Logistics';
import { Stage4_Reality } from '../components/onboarding/Stage4_Reality';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import {
    User, MapPin, GraduationCap, Briefcase, Clock, Car, Bus, Bike,
    ChevronRight, ChevronLeft, Check, Sparkles, Plus, X, Trash2,
    Mic, Unlock, Zap, Heart, Home, Calendar, Target, AlertCircle,
    Building, TrendingUp, Lightbulb, ExternalLink, Lock
} from 'lucide-react';
import type { UserProfile, Education, DegreeType, WorkStyle } from '../types';

// =====================================================
// JALANEA WORKS: 6-STAGE ONBOARDING WIZARD
// Philosophy: "Build Bridges, Not Walls"
// =====================================================

type Stage = 1 | 2 | 3 | 4 | 5 | 6;
type TransportMode = 'car' | 'bus' | 'bike' | 'rideshare';
type UrgencyLevel = 'emergency' | 'bridge' | 'career';

// Education Entry
interface EducationEntry {
    id: string;
    school: string;
    degreeType: string;
    program: string;
    gradYear: string;
}

// Structured Bridge for Stage 5
interface Bridge {
    type: 'resource' | 'program' | 'strategy' | 'tip' | 'grant' | 'filter';
    title: string;
    description?: string;
    metadata?: {
        weeks?: number; // For timeline
        savings?: string;
        actionUrl?: string;
    };
}

interface SolutionCard {
    challenge: string;
    bridges: Bridge[];
}

// Complete State Shape
interface OnboardingState {
    stage: Stage;
    // Stage 1: Identity
    name: string;
    commuteStart: string;
    linkedIn: string;
    portfolio: string;
    // Stage 2: Education
    education: EducationEntry[];
    // Stage 3: Logistics
    transport: TransportMode;
    hardStopStart: string;
    hardStopEnd: string;
    weekendsAvailable: boolean;
    // Stage 4: Open Mic
    realityContext: string;
    selectedPrompts: string[];
    // Stage 5: Strategy Reveal
    solutions: SolutionCard[];
    solutionsAccepted: boolean;
    // Stage 6: Mission
    urgency: UrgencyLevel;
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
    | { type: 'SET_SOLUTIONS'; solutions: SolutionCard[] }
    | { type: 'RESET' };

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const getBridgeIcon = (type: Bridge['type']) => {
    switch (type) {
        case 'grant': return <Unlock className="w-4 h-4" />;
        case 'resource': return <Building className="w-4 h-4" />;
        case 'program': return <Briefcase className="w-4 h-4" />;
        case 'strategy': return <TrendingUp className="w-4 h-4" />;
        case 'tip': return <Lightbulb className="w-4 h-4" />;
        case 'filter': return <Target className="w-4 h-4" />;
        default: return <Check className="w-4 h-4" />;
    }
};

// Initial State
const initialState: OnboardingState = {
    stage: 1,
    // Stage 1
    name: '',
    commuteStart: '',
    linkedIn: '',
    portfolio: '',
    // Stage 2
    education: [{ id: generateId(), school: '', degreeType: '', program: '', gradYear: '' }],
    // Stage 3
    transport: 'car',
    hardStopStart: '',
    hardStopEnd: '',
    weekendsAvailable: true,
    // Stage 4
    realityContext: '',
    selectedPrompts: [],
    // Stage 5
    solutions: [],
    solutionsAccepted: false, // Default to false to trigger animation on toggle
    // Stage 6
    urgency: 'career',
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
        case 'SET_SOLUTIONS':
            return { ...state, solutions: action.solutions };
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

// Reality Prompts for Stage 4
const REALITY_PROMPTS = [
    { label: 'I have a mobility challenge', icon: '♿' },
    { label: 'I care for a family member', icon: '👨‍👩‍👧' },
    { label: 'I need housing support', icon: '🏠' },
    { label: 'I work multiple jobs', icon: '💼' },
    { label: 'I have limited transportation', icon: '🚌' },
    { label: 'I am a single parent', icon: '👶' },
];

// Urgency Options for Stage 6
const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
    { value: 'emergency', label: 'Emergency / ASAP', icon: <Zap className="w-6 h-6" />, desc: 'Next-day pay priority', color: 'red' },
    { value: 'bridge', label: 'Bridge Job', icon: <Target className="w-6 h-6" />, desc: 'Cashflow while building', color: 'yellow' },
    { value: 'career', label: 'Career Launch', icon: <Sparkles className="w-6 h-6" />, desc: 'Long-term growth focus', color: 'green' },
];

// Example solutions generator (would be AI-powered in production)
const generateSolutions = (context: string, prompts: string[]): SolutionCard[] => {
    const solutions: SolutionCard[] = [];

    if (prompts.includes('I have a mobility challenge') || context.toLowerCase().includes('mobility') || context.toLowerCase().includes('standing')) {
        solutions.push({
            challenge: 'Mobility / Standing',
            bridges: [
                {
                    type: 'grant',
                    title: 'Voc Rehab Equipment Grant',
                    description: 'Funding for adaptive chairs & tools',
                    metadata: { actionUrl: 'https://www.rehabworks.org/' }
                },
                {
                    type: 'tip',
                    title: 'Workplace Modification',
                    description: 'Request anti-fatigue mats (ADA Right)'
                },
                {
                    type: 'filter',
                    title: 'Smart Job Match',
                    description: 'Prioritizing desk-based & flexible roles'
                },
            ],
        });
    }

    if (prompts.includes('I need housing support') || context.toLowerCase().includes('housing') || context.toLowerCase().includes('homeless')) {
        solutions.push({
            challenge: 'Housing Stability',
            bridges: [
                {
                    type: 'resource',
                    title: 'Coalition for the Homeless',
                    description: 'Central Florida Housing Support',
                    metadata: { actionUrl: 'https://www.centralfloridahomeless.org/' }
                },
                {
                    type: 'program',
                    title: 'Rapid Re-Housing',
                    description: 'Orange County Assistance Program'
                },
                {
                    type: 'tip',
                    title: 'Pay Cycle Optimization',
                    description: 'Targeting jobs with Daily/Weekly pay'
                },
            ],
        });
    }

    if (prompts.includes('I have limited transportation') || context.toLowerCase().includes('bus') || context.toLowerCase().includes('no car')) {
        solutions.push({
            challenge: 'Transportation Gap',
            bridges: [
                {
                    type: 'strategy',
                    title: 'The 14-Week Bus Grind',
                    description: 'Ride LYNX → Save $2.5k → Buy Car',
                    metadata: { weeks: 14, savings: '$2,500' }
                },
                {
                    type: 'resource',
                    title: 'LYNX Reduced Fare',
                    description: 'Discounted passes for eligible riders',
                    metadata: { actionUrl: 'https://www.golynx.com/' }
                },
                {
                    type: 'tip',
                    title: 'I-4 Corridor Priority',
                    description: 'Focusing on high-access transit routes'
                },
            ],
        });
    }

    if (prompts.includes('I care for a family member') || context.toLowerCase().includes('caregiver')) {
        solutions.push({
            challenge: 'Caregiver Schedule',
            bridges: [
                {
                    type: 'filter',
                    title: 'Schedule Defender',
                    description: 'Matching shifts around your care hours'
                },
                {
                    type: 'tip',
                    title: 'Remote Options',
                    description: 'Work from home roles allow breaks'
                },
                {
                    type: 'resource',
                    title: 'Respite Care Orange County',
                    description: 'Support for caregiver relief',
                    metadata: { actionUrl: 'https://www.seniorsfirstinc.org/' }
                },
            ],
        });
    }

    if (solutions.length === 0 && (context.trim() || prompts.length > 0)) {
        solutions.push({
            challenge: 'Your Context',
            bridges: [
                {
                    type: 'strategy',
                    title: 'Personalized Matching',
                    description: 'We analyze your needs to find the best fit'
                },
                {
                    type: 'filter',
                    title: 'Bridge Builder AI',
                    description: 'Removing barriers, highlighting support'
                },
            ],
        });
    }

    return solutions;
};

export const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser: user, saveUserProfile: updateUserProfile } = useAuth();
    const [state, dispatch] = useReducer(onboardingReducer, initialState);

    // Navigation
    const nextStage = () => {
        if (state.stage === 4) {
            // Generate solutions before moving to Stage 5
            const solutions = generateSolutions(state.realityContext, state.selectedPrompts);
            dispatch({ type: 'SET_SOLUTIONS', solutions });
        }
        dispatch({ type: 'SET_STAGE', payload: Math.min(6, state.stage + 1) as Stage });
    };
    const prevStage = () => dispatch({ type: 'SET_STAGE', payload: Math.max(1, state.stage - 1) as Stage });

    // Validation
    const isStage1Valid = state.name.trim() && state.commuteStart.trim();
    const isStage2Valid = state.education.some(edu => edu.school && edu.degreeType && edu.program);
    const isStage3Valid = state.transport !== null;
    const isStage4Valid = true; // Optional stage
    const isStage5Valid = true; // Just review
    const isStage6Valid = state.urgency !== null;

    const canProceed = () => {
        switch (state.stage) {
            case 1: return isStage1Valid;
            case 2: return isStage2Valid;
            case 3: return isStage3Valid;
            case 4: return isStage4Valid;
            case 5: return isStage5Valid;
            case 6: return isStage6Valid;
            default: return false;
        }
    };

    // Submit
    const submitProfile = async () => {
        if (!user || !auth.currentUser) {
            alert('Authentication lost. Please refresh.');
            return;
        }

        dispatch({ type: 'UPDATE_FIELD', field: 'isSubmitting', value: true });

        try {
            const education: Education[] = state.education
                .filter(edu => edu.school && edu.program)
                .map(edu => ({
                    degreeType: edu.degreeType as DegreeType,
                    degree: edu.program,
                    school: edu.school,
                    year: edu.gradYear,
                    program: edu.program,
                }));

            const profile: Partial<UserProfile> = {
                name: state.name,
                fullName: state.name,
                location: state.commuteStart,
                education,
                preferences: {
                    targetRoles: [],
                    workStyles: state.transport === 'car' ? ['On-site', 'Hybrid'] : ['Remote', 'Hybrid'],
                    learningStyle: 'Mixed',
                    salary: 50000,
                    transportMode: state.transport === 'car' ? 'Car' : state.transport === 'bus' ? 'Bus' : 'Car',
                },
                logistics: {
                    isParent: state.selectedPrompts.includes('I am a single parent'),
                    employmentStatus: state.urgency === 'emergency' ? 'Unemployed' : 'Full-time',
                    transportMode: state.transport,
                    hardStopStart: state.hardStopStart,
                    hardStopEnd: state.hardStopEnd,
                    weekendsAvailable: state.weekendsAvailable,
                    realityContext: state.realityContext,
                    selectedPrompts: state.selectedPrompts,
                    urgencyLevel: state.urgency,
                },
                linkedinUrl: state.linkedIn,
                portfolioUrl: state.portfolio,
                onboardingCompleted: true,
                updatedAt: new Date().toISOString(),
            };

            const userDoc = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userDoc, profile, { merge: true });
            await updateUserProfile(profile);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save. Please try again.');
        } finally {
            dispatch({ type: 'UPDATE_FIELD', field: 'isSubmitting', value: false });
        }
    };

    // Stage Indicator
    const StageIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                    key={s}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${s === state.stage
                        ? 'bg-yellow-500 scale-125 ring-4 ring-yellow-200'
                        : s < state.stage
                            ? 'bg-green-500'
                            : 'bg-slate-200'
                        }`}
                />
            ))}
        </div>
    );

    // Stage Labels
    const STAGE_LABELS = ['', 'The Start Line', 'The Foundation', 'The Strategy', 'Your Reality', 'The Unlock', 'The Mission'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">Jalanea Works Onboarding</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {STAGE_LABELS[state.stage]}
                    </h1>
                    <p className="text-slate-500 mt-2">Stage {state.stage} of 6</p>
                </div>

                <StageIndicator />

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
                            data={{
                                school: state.education[0]?.school || '',
                                degreeType: state.education[0]?.degreeType || '',
                                program: state.education[0]?.program || '',
                                gradYear: state.education[0]?.gradYear || ''
                            }}
                            onUpdate={(field, value) => {
                                // CRITICAL FIX: Get the ID of the first education entry.
                                // If no entry exists, dispatch ADD_EDUCATION first, then update.
                                const firstEduId = state.education[0]?.id;

                                if (!firstEduId) {
                                    // No entry exists yet. Add one, then immediately update.
                                    // Note: This should rarely happen if initialState is correct.
                                    dispatch({ type: 'ADD_EDUCATION' });
                                    // Since ADD_EDUCATION creates a new entry with a random ID,
                                    // we can't reliably get that ID here synchronously.
                                    // The safest approach is to store directly in a top-level field.
                                    // For now, we will log the error.
                                    console.error('Education entry missing during update. Adding new entry.');
                                    return; // Skip this update, user will re-interact
                                }

                                console.log(`[Stage2] Updating ${field} to ${value} for ID ${firstEduId}`);
                                dispatch({
                                    type: 'UPDATE_EDUCATION',
                                    id: firstEduId,
                                    field: field as keyof EducationEntry,
                                    value
                                });
                            }}
                            onNext={nextStage}
                            onBack={prevStage}
                        />
                    )}



                    {/* ===== STAGE 3: LOGISTICS ===== */}
                    {state.stage === 3 && (
                        <Stage3_Logistics
                            data={{
                                transport: state.transport,
                                hardStopStart: state.hardStopStart,
                                hardStopEnd: state.hardStopEnd,
                                weekendsAvailable: state.weekendsAvailable,
                                // Cast explicitly if type isn't updated in OnboardingState yet, 
                                // or assume we will store them in existing state if flexible.
                                // For now, we'll cast to any or add them to OnboardingState in a separate step if strict.
                                // Let's use flexible assignment for new fields until we update the interface.
                                commuteTolerance: (state as any).commuteTolerance,
                                constraintReason: (state as any).constraintReason
                            }}
                            onUpdate={(field, value) => dispatch({ type: 'UPDATE_FIELD', field: field as any, value })}
                            onNext={nextStage}
                            onBack={prevStage}
                        />
                    )}



                    {/* ===== STAGE 4: OPEN MIC ===== */}
                    {state.stage === 4 && (
                        <Stage4_Reality
                            data={{
                                realityContext: state.realityContext,
                                selectedPrompts: state.selectedPrompts
                            }}
                            onUpdate={(field, value) => dispatch({ type: 'UPDATE_FIELD', field: field as any, value })}
                            onNext={nextStage}
                            onBack={prevStage}
                        />
                    )}

                    {/* ===== STAGE 5: STRATEGY REVEAL ===== */}
                    {state.stage === 5 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <Unlock className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">The Jalanea Bridges</h2>
                                    <p className="text-sm text-slate-500">Every challenge has a solution</p>
                                </div>
                            </div>

                            {state.solutions.length > 0 ? (
                                <div className="space-y-6">
                                    {state.solutions.map((solution, idx) => (
                                        <Card key={idx} variant="solid-white" className="p-0 overflow-hidden border-slate-100 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-[25%_75%]">
                                                {/* Left: Challenge */}
                                                <div className="p-5 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                        The Challenge
                                                    </div>
                                                    <div className="font-semibold text-slate-800 leading-tight">
                                                        {solution.challenge}
                                                    </div>
                                                </div>

                                                {/* Right: Bridges */}
                                                <div className="p-5 bg-green-50/30">
                                                    <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-3">
                                                        The Jalanea Bridge
                                                    </div>
                                                    <div className="space-y-3">
                                                        {solution.bridges.map((bridge, i) => (
                                                            <div key={i} className="flex gap-3 items-start group">
                                                                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${bridge.type === 'grant' ? 'bg-purple-100 text-purple-600' :
                                                                    bridge.type === 'resource' ? 'bg-blue-100 text-blue-600' :
                                                                        bridge.type === 'strategy' ? 'bg-amber-100 text-amber-600' :
                                                                            'bg-green-100 text-green-600'
                                                                    }`}>
                                                                    {getBridgeIcon(bridge.type)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-slate-900 text-sm">
                                                                        {bridge.title}
                                                                        {bridge.metadata?.actionUrl && (
                                                                            <a href={bridge.metadata.actionUrl} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-700 hover:underline">
                                                                                Open <ExternalLink className="w-3 h-3 ml-0.5" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 leading-relaxed">
                                                                        {bridge.description}
                                                                    </div>
                                                                    {bridge.metadata?.weeks && (
                                                                        <div className="mt-2 w-full max-w-xs p-2 bg-white rounded-lg border border-slate-100">
                                                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                                                                <span>START</span>
                                                                                <span>{bridge.metadata.weeks} WEEKS</span>
                                                                            </div>
                                                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-amber-400 w-2/3 rounded-full animate-pulse" />
                                                                            </div>
                                                                            <div className="mt-1 text-[10px] text-amber-600 font-medium">
                                                                                Goal: {bridge.metadata.savings} Saved
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    {/* Payoff Section (Animation) */}
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        {/* Toggle */}
                                        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ease-out ${state.solutionsAccepted ? 'bg-green-50 border-green-200 shadow-inner' : 'bg-white border-slate-200'}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-slate-900">With these solutions, I'm ready to work!</div>
                                                    <div className="text-sm text-slate-500">We'll match you with all compatible opportunities</div>
                                                </div>
                                                <button
                                                    onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'solutionsAccepted', value: !state.solutionsAccepted })}
                                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${state.solutionsAccepted ? 'bg-green-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ${state.solutionsAccepted ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Animation Card */}
                                        <div className={`transform transition-all duration-700 ease-out origin-top ${state.solutionsAccepted ? 'max-h-60 opacity-100 translate-y-0 mt-4' : 'max-h-0 opacity-0 -translate-y-4 mt-0'}`}>
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-12 bg-green-200/20 rounded-full blur-3xl -mr-10 -mt-10" />
                                                <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                                                    <div className="p-4 bg-white rounded-full shadow-md mb-1 animate-bounce">
                                                        <Unlock className="w-8 h-8 text-green-600" />
                                                    </div>
                                                    <div className="text-4xl font-extrabold text-green-700 tracking-tight">
                                                        500+ Jobs Unlocked
                                                    </div>
                                                    <div className="text-sm font-medium text-green-600">
                                                        Your personalized bridge is built.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">You're All Clear!</h3>
                                    <p className="text-slate-500">No barriers detected. All job opportunities are available to you.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== STAGE 6: MISSION ===== */}
                    {state.stage === 6 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-yellow-100 rounded-xl">
                                    <Target className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Your Mission</h2>
                                    <p className="text-sm text-slate-500">What's your financial priority right now?</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {URGENCY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'urgency', value: opt.value })}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${state.urgency === opt.value
                                            ? opt.color === 'red' ? 'border-red-500 bg-red-50'
                                                : opt.color === 'yellow' ? 'border-yellow-500 bg-yellow-50'
                                                    : 'border-green-500 bg-green-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${state.urgency === opt.value
                                            ? opt.color === 'red' ? 'bg-red-100 text-red-600'
                                                : opt.color === 'yellow' ? 'bg-yellow-100 text-yellow-600'
                                                    : 'bg-green-100 text-green-600'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {opt.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900">{opt.label}</div>
                                            <div className="text-sm text-slate-500">{opt.desc}</div>
                                        </div>
                                        {state.urgency === opt.value && (
                                            <Check className={`w-6 h-6 ${opt.color === 'red' ? 'text-red-500'
                                                : opt.color === 'yellow' ? 'text-yellow-500'
                                                    : 'text-green-500'
                                                }`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                        {state.stage > 1 ? (
                            <Button variant="ghost" onClick={prevStage}>
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        {state.stage < 6 ? (
                            <Button
                                variant="primary"
                                onClick={nextStage}
                                disabled={!canProceed()}
                            >
                                Continue
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={submitProfile}
                                disabled={state.isSubmitting}
                            >
                                {state.isSubmitting ? 'Launching...' : 'Launch My Career'}
                                <Sparkles className="w-4 h-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </Card>
            </div >
        </div >
    );
};

export default Onboarding;
