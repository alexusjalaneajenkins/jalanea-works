import React, { useReducer, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CENTRAL_FL_SCHOOLS, getDegreeTypes, getPrograms } from '../data/centralFloridaPrograms';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Combobox } from '../components/Combobox';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import {
    User, MapPin, GraduationCap, Briefcase, Clock, Car, Bus, Bike,
    ChevronRight, ChevronLeft, Check, Sparkles, Plus, X, Trash2,
    Mic, Unlock, Zap, Heart, Home, Calendar, Target, AlertCircle
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

// Solution Card for Stage 5
interface SolutionCard {
    challenge: string;
    bridges: string[];
    resourceLinks?: { label: string; url: string }[];
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
    solutionsAccepted: true,
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
            challenge: 'Mobility or standing requirements',
            bridges: [
                '🔓 Grant: Florida Vocational Rehabilitation for adaptive equipment',
                '💡 Tip: Request anti-fatigue mats from employer',
                '🎯 Filter: Desk-based or flexible-movement roles available',
            ],
        });
    }

    if (prompts.includes('I need housing support') || context.toLowerCase().includes('housing') || context.toLowerCase().includes('homeless')) {
        solutions.push({
            challenge: 'Housing stability',
            bridges: [
                '🏠 Resource: Coalition for the Homeless of Central Florida',
                '💰 Program: Rapid Re-Housing Assistance (Orange County)',
                '📍 Tip: Filter jobs with direct deposit for faster access to funds',
            ],
        });
    }

    if (prompts.includes('I have limited transportation') || context.toLowerCase().includes('bus') || context.toLowerCase().includes('no car')) {
        solutions.push({
            challenge: 'Transportation gap',
            bridges: [
                '🚌 Strategy: 14-week bus grind → Save for car → 80% more jobs unlock',
                '💳 Resource: LYNX Reduced Fare Program',
                '🚗 Tip: Jobs along I-4 corridor have best bus routes',
            ],
        });
    }

    if (prompts.includes('I care for a family member') || context.toLowerCase().includes('caregiver')) {
        solutions.push({
            challenge: 'Caregiving responsibilities',
            bridges: [
                '⏰ Filter: Flexible schedule or shift-based roles',
                '🏠 Tip: Remote work options allow care during breaks',
                '💡 Resource: Respite care programs in Orange County',
            ],
        });
    }

    if (solutions.length === 0 && (context.trim() || prompts.length > 0)) {
        solutions.push({
            challenge: 'Your unique situation',
            bridges: [
                '🔓 We analyze your context to find the best-fit opportunities',
                '💡 No barriers—only bridges to your success',
                '🎯 AI-powered matching based on YOUR reality',
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
                    employmentStatus: state.urgency === 'emergency' ? 'Seeking' : 'Full-time',
                    transportMode: state.transport,
                    hardStopStart: state.hardStopStart,
                    hardStopEnd: state.hardStopEnd,
                    weekendsAvailable: state.weekendsAvailable,
                    realityContext: state.realityContext,
                    selectedPrompts: state.selectedPrompts,
                    urgencyLevel: state.urgency,
                },
                linkedIn: state.linkedIn,
                portfolio: state.portfolio,
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
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-yellow-100 rounded-xl">
                                    <MapPin className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Identity & Location</h2>
                                    <p className="text-sm text-slate-500">Your starting point for the journey</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={state.name}
                                        onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'name', value: e.target.value })}
                                        placeholder="Your name"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Where does your commute start?
                                    </label>
                                    <input
                                        type="text"
                                        value={state.commuteStart}
                                        onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'commuteStart', value: e.target.value })}
                                        placeholder="Address or Zip Code (e.g., 32801)"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Used to calculate commute times for job matches</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn (Optional)</label>
                                        <input
                                            type="url"
                                            value={state.linkedIn}
                                            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'linkedIn', value: e.target.value })}
                                            placeholder="linkedin.com/in/..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Portfolio (Optional)</label>
                                        <input
                                            type="url"
                                            value={state.portfolio}
                                            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'portfolio', value: e.target.value })}
                                            placeholder="yourportfolio.com"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== STAGE 2: EDUCATION ===== */}
                    {state.stage === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <GraduationCap className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Education</h2>
                                    <p className="text-sm text-slate-500">Your credentials from the Central FL ecosystem</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {state.education.map((edu, index) => (
                                    <div key={edu.id} className={`${index > 0 ? 'pt-4 border-t border-slate-100' : ''}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                                Credential {index + 1}
                                            </span>
                                            {state.education.length > 1 && (
                                                <button
                                                    onClick={() => dispatch({ type: 'REMOVE_EDUCATION', id: edu.id })}
                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">School</label>
                                                <select
                                                    value={edu.school}
                                                    onChange={(e) => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'school', value: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 outline-none bg-white"
                                                >
                                                    <option value="">Select School...</option>
                                                    {CENTRAL_FL_SCHOOLS.map((school) => (
                                                        <option key={school} value={school}>{school}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Graduation Year</label>
                                                <input
                                                    type="text"
                                                    value={edu.gradYear}
                                                    onChange={(e) => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'gradYear', value: e.target.value })}
                                                    placeholder="2024"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Credential Type</label>
                                                <select
                                                    value={edu.degreeType}
                                                    onChange={(e) => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'degreeType', value: e.target.value })}
                                                    disabled={!edu.school}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 outline-none bg-white disabled:bg-slate-50"
                                                >
                                                    <option value="">{edu.school ? 'Select Type...' : 'Select school first'}</option>
                                                    {edu.school && getDegreeTypes(edu.school).map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Program</label>
                                                {edu.school && edu.degreeType && edu.degreeType !== 'Other / Not Listed' ? (
                                                    <Combobox
                                                        value={edu.program}
                                                        onChange={(val) => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'program', value: val })}
                                                        options={getPrograms(edu.school, edu.degreeType)}
                                                        placeholder="Search program..."
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={edu.program}
                                                        onChange={(e) => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'program', value: e.target.value })}
                                                        placeholder={edu.degreeType ? 'Enter program...' : 'Select type first'}
                                                        disabled={!edu.degreeType}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 outline-none disabled:bg-slate-50"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => dispatch({ type: 'ADD_EDUCATION' })}
                                    className="flex items-center gap-2 text-sm font-medium text-yellow-600 hover:text-yellow-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Another Credential
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== STAGE 3: LOGISTICS ===== */}
                    {state.stage === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Car className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Logistics</h2>
                                    <p className="text-sm text-slate-500">Your transport & schedule strategy</p>
                                </div>
                            </div>

                            {/* Transport Mode */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">How do you get around?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {TRANSPORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'transport', value: opt.value })}
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${state.transport === opt.value
                                                    ? 'border-yellow-500 bg-yellow-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${state.transport === opt.value ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {opt.icon}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium text-slate-900">{opt.label}</div>
                                                <div className="text-xs text-slate-500">{opt.desc}</div>
                                            </div>
                                            {state.transport === opt.value && (
                                                <Check className="w-5 h-5 text-yellow-500 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Constraints */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Hard Stop Times (When you CANNOT work)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Must be free by:</label>
                                        <input
                                            type="time"
                                            value={state.hardStopStart}
                                            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'hardStopStart', value: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Cannot start before:</label>
                                        <input
                                            type="time"
                                            value={state.hardStopEnd}
                                            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'hardStopEnd', value: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Weekends */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <div className="font-medium text-slate-900">Weekends Available?</div>
                                    <div className="text-sm text-slate-500">Can you work Saturdays/Sundays?</div>
                                </div>
                                <button
                                    onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'weekendsAvailable', value: !state.weekendsAvailable })}
                                    className={`w-14 h-8 rounded-full transition-all ${state.weekendsAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${state.weekendsAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== STAGE 4: OPEN MIC ===== */}
                    {state.stage === 4 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Heart className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">What is your reality?</h2>
                                    <p className="text-sm text-slate-500">We use this to find tools that help you succeed</p>
                                </div>
                            </div>

                            {/* Prompt Chips */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {REALITY_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt.label}
                                        onClick={() => dispatch({ type: 'TOGGLE_PROMPT', prompt: prompt.label })}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${state.selectedPrompts.includes(prompt.label)
                                                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                                : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                            }`}
                                    >
                                        <span>{prompt.icon}</span>
                                        {prompt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Text Area */}
                            <div className="relative">
                                <textarea
                                    value={state.realityContext}
                                    onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'realityContext', value: e.target.value })}
                                    placeholder="Tell us about any health, family, or housing situations. This helps us find resources and match you with the right opportunities..."
                                    rows={5}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none resize-none"
                                />
                                <button className="absolute right-3 top-3 p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-400 text-center">
                                💡 This information helps us BUILD BRIDGES, not barriers. We never disqualify—we find solutions.
                            </p>
                        </div>
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
                                <div className="space-y-4">
                                    {state.solutions.map((solution, idx) => (
                                        <div key={idx} className="bg-gradient-to-r from-slate-50 to-green-50 rounded-xl p-4 border border-green-100">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">The Challenge</div>
                                                    <div className="font-medium text-slate-700">{solution.challenge}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2">The Jalanea Bridge</div>
                                                    <ul className="space-y-1">
                                                        {solution.bridges.map((bridge, i) => (
                                                            <li key={i} className="text-sm text-slate-600">{bridge}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Acceptance Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                                        <div>
                                            <div className="font-medium text-slate-900">With these solutions, I'm ready to work!</div>
                                            <div className="text-sm text-slate-500">We'll match you with all compatible opportunities</div>
                                        </div>
                                        <button
                                            onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'solutionsAccepted', value: !state.solutionsAccepted })}
                                            className={`w-14 h-8 rounded-full transition-all ${state.solutionsAccepted ? 'bg-green-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${state.solutionsAccepted ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {state.solutionsAccepted && (
                                        <div className="text-center p-4 bg-green-100 rounded-xl">
                                            <div className="inline-flex items-center gap-2 text-green-700 font-bold text-lg">
                                                <Unlock className="w-6 h-6" />
                                                500+ Jobs Unlocked
                                            </div>
                                        </div>
                                    )}
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
            </div>
        </div>
    );
};

export default Onboarding;
