import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VALENCIA_PROGRAMS_DB } from '../data/valenciaPrograms';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Combobox } from '../components/Combobox';
import { SalaryRealityCheck } from '../components/SalaryRealityCheck';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import {
    User, MapPin, GraduationCap, Briefcase, DollarSign,
    ChevronRight, ChevronLeft, Check, Sparkles, Plus, X, Trash2
} from 'lucide-react';
import type { UserProfile, Education, DegreeType, WorkStyle } from '../types';
import { DEGREE_TYPE_OPTIONS } from '../types';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

// ============================================
// NEW STREAMLINED ONBOARDING: 4-Step Wizard
// ============================================

type Step = 1 | 2 | 3 | 4 | 5;

// Individual entry types for arrays
interface EducationEntry {
    id: string;
    degreeType: DegreeType | '';
    major: string;
    school: string;
    gradYear: string;
}

interface ExperienceEntry {
    id: string;
    role: string;
    company: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    isCurrent: boolean;
}

interface FormData {
    // Step 1: Basics
    name: string;
    location: string;

    // Step 2: Foundation (NOW ARRAYS)
    educations: EducationEntry[];
    experiences: ExperienceEntry[];
    yearsOfExperience: 'student' | 'entry-level' | 'associate';
    skills: string[];

    // Step 3: Money Talk
    salaryMin: number;
    salaryMax: number;
    monthlyNet: number;
    maxRent: number;
    maxCarPayment: number;

    // Step 4: Career Goals
    targetRoles: string[];
    workStyles: WorkStyle[];
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_FORM: FormData = {
    name: '',
    location: '',
    educations: [{ id: generateId(), degreeType: '', major: '', school: '', gradYear: '' }],
    experiences: [],  // Start empty, optional
    yearsOfExperience: 'student',
    skills: [],
    salaryMin: 45000,
    salaryMax: 65000,
    monthlyNet: 0,
    maxRent: 0,
    maxCarPayment: 0,
    targetRoles: [],
    workStyles: []
};

const WORK_STYLE_OPTIONS: { value: WorkStyle; label: string; icon: string }[] = [
    { value: 'Remote', label: 'Remote', icon: '🏠' },
    { value: 'Hybrid', label: 'Hybrid', icon: '🔄' },
    { value: 'On-site', label: 'On-site', icon: '🏢' },
    { value: 'Flexible', label: 'Flexible', icon: '✨' },
];

export const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser: user, saveUserProfile: updateUserProfile } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [skillInput, setSkillInput] = useState('');
    const [roleInput, setRoleInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step navigation
    const nextStep = () => setStep((s) => Math.min(5, s + 1) as Step);
    const prevStep = () => setStep((s) => Math.max(1, s - 1) as Step);

    // Form updates
    const updateForm = (updates: Partial<FormData>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    };

    // Skill management
    const addSkill = () => {
        if (skillInput.trim() && form.skills.length < 5) {
            updateForm({ skills: [...form.skills, skillInput.trim()] });
            setSkillInput('');
        }
    };

    const removeSkill = (index: number) => {
        updateForm({ skills: form.skills.filter((_, i) => i !== index) });
    };

    // Education management
    const addEducation = () => {
        const newEntry: EducationEntry = { id: generateId(), degreeType: '', major: '', school: '', gradYear: '' };
        updateForm({ educations: [...form.educations, newEntry] });
    };

    const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
        updateForm({
            educations: form.educations.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        });
    };

    const removeEducation = (id: string) => {
        if (form.educations.length > 1) {
            updateForm({ educations: form.educations.filter(edu => edu.id !== id) });
        }
    };

    // Experience management
    const addExperience = () => {
        const newExp: ExperienceEntry = {
            id: generateId(),
            role: '',
            company: '',
            startMonth: '',
            startYear: '',
            endMonth: '',
            endYear: '',
            isCurrent: false
        };
        updateForm({ experiences: [...form.experiences, newExp] });
    };

    const updateExperience = (id: string, field: keyof ExperienceEntry, value: string | boolean) => {
        updateForm({
            experiences: form.experiences.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        });
    };

    const removeExperience = (id: string) => {
        updateForm({ experiences: form.experiences.filter(exp => exp.id !== id) });
    };

    // Salary callback from SalaryRealityCheck
    const handleSalaryChange = useCallback((min: number, max: number, monthlyNet: number, maxRent: number, maxCarPayment: number) => {
        updateForm({ salaryMin: min, salaryMax: max, monthlyNet, maxRent, maxCarPayment });
    }, []);

    // Toggle work style
    const toggleWorkStyle = (style: WorkStyle) => {
        const current = form.workStyles;
        if (current.includes(style)) {
            updateForm({ workStyles: current.filter(s => s !== style) });
        } else {
            updateForm({ workStyles: [...current, style] });
        }
    };

    // Target Role management
    const addRole = () => {
        if (roleInput.trim() && form.targetRoles.length < 5 && !form.targetRoles.includes(roleInput.trim())) {
            updateForm({ targetRoles: [...form.targetRoles, roleInput.trim()] });
            setRoleInput('');
        }
    };

    const removeRole = (role: string) => {
        updateForm({ targetRoles: form.targetRoles.filter(r => r !== role) });
    };

    const addSuggestedRole = (role: string) => {
        if (form.targetRoles.length < 5 && !form.targetRoles.includes(role)) {
            updateForm({ targetRoles: [...form.targetRoles, role] });
        }
    };

    // Get suggested roles based on major
    const getSuggestedRoles = (): string[] => {
        const major = form.educations[0]?.major?.toLowerCase() || '';
        if (major.includes('graphic') || major.includes('design')) {
            return ['Graphic Designer', 'Junior Designer', 'Visual Designer', 'Brand Designer', 'Marketing Coordinator'];
        }
        if (major.includes('web') || major.includes('software') || major.includes('computer')) {
            return ['Web Developer', 'Junior Developer', 'Frontend Developer', 'Software Engineer', 'IT Support'];
        }
        if (major.includes('business') || major.includes('management')) {
            return ['Business Analyst', 'Project Coordinator', 'Operations Assistant', 'Account Manager', 'Sales Representative'];
        }
        if (major.includes('nursing') || major.includes('health')) {
            return ['Registered Nurse', 'CNA', 'Medical Assistant', 'Patient Care Tech', 'Home Health Aide'];
        }
        if (major.includes('accounting') || major.includes('finance')) {
            return ['Staff Accountant', 'Bookkeeper', 'Financial Analyst', 'Accounts Payable Clerk', 'Tax Preparer'];
        }
        return ['Entry Level', 'Associate', 'Coordinator', 'Assistant', 'Specialist'];
    };

    // Validation - at least one education with degree and school
    const isStep1Valid = form.name.trim() && form.location.trim();
    const isStep2Valid = form.educations.some(edu => edu.degreeType && edu.major.trim() && edu.school.trim());
    const isStep3Valid = form.salaryMin > 0 && form.salaryMax > form.salaryMin;
    const isStep4Valid = form.targetRoles.length > 0;

    // Submit profile
    const submitProfile = async () => {
        if (!user || !auth.currentUser) {
            console.error('No authenticated user found during submission');
            alert('Authentication lost. Please try refreshing or logging in again.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Map educations array to Education[] format
            const education: Education[] = form.educations
                .filter(edu => edu.degreeType && edu.major.trim())
                .map(edu => ({
                    degreeType: edu.degreeType as DegreeType,
                    degree: edu.major,
                    school: edu.school,
                    year: edu.gradYear,
                    program: edu.major
                }));

            // Map experiences array to Experience[] format
            const experience = form.experiences
                .filter(exp => exp.role.trim())
                .map(exp => {
                    const start = `${exp.startMonth} ${exp.startYear}`.trim();
                    const end = exp.isCurrent ? 'Present' : `${exp.endMonth} ${exp.endYear}`.trim();
                    const duration = start && end ? `${start} - ${end}` : start || end || '';

                    return {
                        role: exp.role,
                        company: exp.company || 'Company',
                        duration: duration || 'Present', // Fallback if duration is empty
                        description: []
                    };
                });

            const profile: Partial<UserProfile> = {
                name: form.name,
                fullName: form.name,
                location: form.location,
                education,
                skills: {
                    technical: form.skills,
                    design: [],
                    soft: []
                },
                certifications: [],
                experience,
                preferences: {
                    targetRoles: form.targetRoles,
                    workStyles: form.workStyles,
                    learningStyle: 'Mixed',
                    salary: form.salaryMax,
                    transportMode: 'Car'
                },
                logistics: {
                    isParent: false,
                    employmentStatus: form.yearsOfExperience === '0-1' ? 'Student' : 'Full-time'
                },
                targetSalaryRange: {
                    min: form.salaryMin,
                    max: form.salaryMax
                },
                monthlyBudgetEstimate: {
                    monthlyNet: form.monthlyNet,
                    maxRent: form.maxRent,
                    maxCarPayment: form.maxCarPayment
                },
                yearsOfExperience: form.yearsOfExperience,
                onboardingCompleted: true,
                updatedAt: new Date().toISOString()
            };

            // Save to Firestore
            const userDoc = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userDoc, profile, { merge: true });

            // Update context
            await updateUserProfile(profile);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step indicator
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
                <div
                    key={s}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${s === step
                        ? 'bg-jalanea-500 scale-110'
                        : s < step
                            ? 'bg-green-500'
                            : 'bg-jalanea-200'
                        }`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-jalanea-50 via-white to-jalanea-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-jalanea-100 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-jalanea-600" />
                        <span className="text-sm font-medium text-jalanea-700">Career Strategy Setup</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-jalanea-900">
                        Let's Build Your Profile
                    </h1>
                    <p className="text-jalanea-600 mt-2">Step {step} of 5</p>
                </div>

                <StepIndicator />

                {/* Step Content */}
                <Card variant="solid-white" className="max-w-2xl mx-auto">
                    {/* Step 1: The Basics */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-jalanea-100 rounded-xl">
                                    <User className="w-6 h-6 text-jalanea-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-jalanea-900">
                                        The Basics
                                    </h2>
                                    <p className="text-sm text-jalanea-500">Let's start with who you are</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => updateForm({ name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-jalanea-200 focus:border-jalanea-400 focus:ring-2 focus:ring-jalanea-100 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Current Location
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => updateForm({ location: e.target.value })}
                                        placeholder="Orlando, FL"
                                        className="w-full px-4 py-3 rounded-xl border border-jalanea-200 focus:border-jalanea-400 focus:ring-2 focus:ring-jalanea-100 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: The Foundation */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <GraduationCap className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-jalanea-900">
                                        The Foundation
                                    </h2>
                                    <p className="text-sm text-jalanea-500">Your education & experience</p>
                                </div>
                            </div>

                            {/* Education Entries */}
                            <div className="space-y-4">
                                {form.educations.map((edu, index) => (
                                    <div key={edu.id} className={`${index > 0 ? 'pt-4 border-t border-jalanea-100' : ''}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-jalanea-500 uppercase tracking-wide">
                                                Degree {index + 1}
                                            </span>
                                            {form.educations.length > 1 && (
                                                <button
                                                    onClick={() => removeEducation(edu.id)}
                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                                    Degree Type
                                                </label>
                                                <select
                                                    value={edu.degreeType}
                                                    onChange={(e) => updateEducation(edu.id, 'degreeType', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-jalanea-200 focus:border-jalanea-400 outline-none"
                                                >
                                                    <option value="">Select...</option>
                                                    {DEGREE_TYPE_OPTIONS.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                                    Graduation Year
                                                </label>
                                                <input
                                                    type="text"
                                                    value={edu.gradYear}
                                                    onChange={(e) => updateEducation(edu.id, 'gradYear', e.target.value)}
                                                    placeholder="2024"
                                                    className="w-full px-4 py-3 rounded-xl border border-jalanea-200 focus:border-jalanea-400 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                                    Major / Field of Study
                                                </label>
                                                <Combobox
                                                    value={edu.major}
                                                    onChange={(val) => updateEducation(edu.id, 'major', val)}
                                                    options={(() => {
                                                        if (edu.degreeType?.includes("Bachelor's")) return VALENCIA_PROGRAMS_DB.Bachelor_Degrees;
                                                        if (edu.degreeType?.includes("Associate's")) return VALENCIA_PROGRAMS_DB.AS_Degrees;
                                                        if (edu.degreeType?.includes("Certificate")) return [
                                                            ...VALENCIA_PROGRAMS_DB.Technical_Certificates,
                                                            ...VALENCIA_PROGRAMS_DB.Advanced_Technical_Certificates
                                                        ];
                                                        return [];
                                                    })()}
                                                    placeholder="e.g. Graphic Design"
                                                />
                                                <p className="text-xs text-jalanea-400 mt-1.5">
                                                    Select your Valencia program or type manually for others.
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                                    School
                                                </label>
                                                <select
                                                    value={edu.school}
                                                    onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-jalanea-200 focus:border-jalanea-400 outline-none bg-white"
                                                >
                                                    <option value="">Select School...</option>
                                                    <option value="Valencia College">Valencia College</option>
                                                    <option value="University of Central Florida (UCF)">University of Central Florida (UCF)</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Another Degree Button */}
                                <button
                                    onClick={addEducation}
                                    className="flex items-center gap-2 text-sm font-medium text-jalanea-600 hover:text-jalanea-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Another Degree
                                </button>
                            </div>

                            {/* Experience Section */}
                            <div className="pt-6 border-t border-jalanea-100 space-y-8">
                                {/* BLOCK A: Career Stage (Global Filter) */}
                                <div className="p-5 bg-jalanea-50/50 rounded-2xl border border-jalanea-100">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-white rounded-lg border border-jalanea-100 shadow-sm">
                                            <Briefcase className="w-4 h-4 text-jalanea-600" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-jalanea-900 mb-1">
                                                Overall Career Level
                                            </label>
                                            <p className="text-xs text-jalanea-500 mb-4">
                                                This helps us filter entry-level vs. senior jobs for you.
                                            </p>
                                            <select
                                                value={form.yearsOfExperience}
                                                onChange={(e) => updateForm({ yearsOfExperience: e.target.value as FormData['yearsOfExperience'] })}
                                                className="w-full px-4 py-3 rounded-xl border border-jalanea-200 focus:border-jalanea-400 outline-none bg-white shadow-sm transition-all text-sm font-medium"
                                            >
                                                <option value="student">Student / Looking for Internship</option>
                                                <option value="entry-level">New Grad / Entry Level (0-2 years)</option>
                                                <option value="associate">Junior / Associate (1-3 years)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* BLOCK B: Work History (Detailed Roles) */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <h3 className="text-sm font-bold text-jalanea-900 flex items-center gap-2">
                                            Work History / Internships
                                            <span className="text-xs font-normal text-jalanea-400 bg-jalanea-50 px-2 py-0.5 rounded-full border border-jalanea-100">
                                                {form.experiences.length} added
                                            </span>
                                        </h3>
                                    </div>

                                    {/* Empty State */}
                                    {form.experiences.length === 0 && (
                                        <div className="bg-white border border-dashed border-jalanea-300 rounded-xl p-6 text-center mb-4 transition-all hover:bg-jalanea-50/50">
                                            <p className="text-sm font-medium text-jalanea-600 mb-1">
                                                No roles added yet
                                            </p>
                                            <p className="text-xs text-jalanea-400">
                                                Including internships or part-time work helps your resume score.
                                            </p>
                                        </div>
                                    )}

                                    {/* Experience Entries */}
                                    <div className="space-y-4 mb-4">
                                        {form.experiences.map((exp, index) => (
                                            <div key={exp.id} className="bg-white border border-jalanea-200 shadow-sm rounded-xl p-5 relative group transition-all hover:shadow-md hover:border-jalanea-300">
                                                <div className="flex items-center justify-between mb-4 border-b border-jalanea-50 pb-3">
                                                    <span className="text-xs font-bold text-jalanea-400 uppercase tracking-wide flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-jalanea-400"></div>
                                                        Position {index + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => removeExperience(exp.id)}
                                                        className="p-1.5 text-jalanea-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                        title="Remove role"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <label className="block text-xs font-bold text-jalanea-700 mb-1.5">
                                                            Role Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={exp.role}
                                                            onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                                            placeholder="e.g. Graphic Design Intern"
                                                            className="w-full px-3 py-2.5 rounded-lg border border-jalanea-200 focus:border-jalanea-500 focus:ring-2 focus:ring-jalanea-50 outline-none text-sm transition-all"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <label className="block text-xs font-bold text-jalanea-700 mb-1.5">
                                                            Company
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={exp.company}
                                                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                            placeholder="e.g. Studio X"
                                                            className="w-full px-3 py-2.5 rounded-lg border border-jalanea-200 focus:border-jalanea-500 focus:ring-2 focus:ring-jalanea-50 outline-none text-sm transition-all"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-jalanea-700 mb-1.5">
                                                                    Start Date
                                                                </label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <select
                                                                        value={exp.startMonth}
                                                                        onChange={(e) => updateExperience(exp.id, 'startMonth', e.target.value)}
                                                                        className="w-full px-3 py-2.5 rounded-lg border border-jalanea-200 text-sm bg-white focus:border-jalanea-500 outline-none"
                                                                    >
                                                                        <option value="">Month</option>
                                                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                                    </select>
                                                                    <select
                                                                        value={exp.startYear}
                                                                        onChange={(e) => updateExperience(exp.id, 'startYear', e.target.value)}
                                                                        className="w-full px-3 py-2.5 rounded-lg border border-jalanea-200 text-sm bg-white focus:border-jalanea-500 outline-none"
                                                                    >
                                                                        <option value="">Year</option>
                                                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="flex justify-between items-center mb-1.5">
                                                                    <label className="block text-xs font-bold text-jalanea-700">
                                                                        End Date
                                                                    </label>
                                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={exp.isCurrent}
                                                                            onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked as any)}
                                                                            className="rounded border-jalanea-300 text-jalanea-600 focus:ring-jalanea-500 w-3.5 h-3.5"
                                                                        />
                                                                        <span className="text-xs text-jalanea-600">Current</span>
                                                                    </label>
                                                                </div>
                                                                {exp.isCurrent ? (
                                                                    <div className="w-full px-3 py-2.5 bg-jalanea-50 text-jalanea-500 text-center text-sm font-medium rounded-lg border border-jalanea-100">
                                                                        Present
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <select
                                                                            value={exp.endMonth}
                                                                            onChange={(e) => updateExperience(exp.id, 'endMonth', e.target.value)}
                                                                            className="w-full px-3 py-2.5 rounded-lg border border-jalanea-200 text-sm bg-white focus:border-jalanea-500 outline-none"
                                                                        >
                                                                            <option value="">Month</option>
                                                                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                                        </select>
                                                                        <select
                                                                            value={exp.endYear}
                                                                            onChange={(e) => updateExperience(exp.id, 'endYear', e.target.value)}
                                                                            className="w-full px-3 py-2.5 rounded-lg border border-jalanea-200 text-sm bg-white focus:border-jalanea-500 outline-none"
                                                                        >
                                                                            <option value="">Year</option>
                                                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Position Button */}
                                    <button
                                        onClick={addExperience}
                                        className="w-full py-3.5 border-2 border-dashed border-jalanea-200 rounded-xl text-sm font-bold text-jalanea-500 hover:border-jalanea-400 hover:text-jalanea-700 hover:bg-jalanea-50 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <div className="p-0.5 bg-jalanea-100 rounded-md group-hover:bg-jalanea-200 transition-colors">
                                            <Plus className="w-3.5 h-3.5" />
                                        </div>
                                        + Add Position
                                    </button>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="pt-4 border-t border-jalanea-100">
                                <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                    Top Skills (up to 5)
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="e.g., Excel, Social Media, Photoshop"
                                        className="flex-1 px-4 py-2 rounded-xl border border-jalanea-200 focus:border-jalanea-400 outline-none"
                                    />
                                    <button
                                        onClick={addSkill}
                                        disabled={form.skills.length >= 5}
                                        className="px-4 py-2 bg-jalanea-100 text-jalanea-700 rounded-xl hover:bg-jalanea-200 disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-jalanea-100 text-jalanea-700 rounded-full text-sm"
                                        >
                                            {skill}
                                            <button onClick={() => removeSkill(index)} className="hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Money Talk */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-jalanea-900">
                                        The Money Talk
                                    </h2>
                                    <p className="text-sm text-jalanea-500">Let's set realistic expectations</p>
                                </div>
                            </div>

                            <SalaryRealityCheck
                                location={form.location}
                                initialMin={form.salaryMin}
                                initialMax={form.salaryMax}
                                onChange={handleSalaryChange}
                            />
                        </div>
                    )}

                    {/* Step 4: Career Goals */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-yellow-100 rounded-xl">
                                    <Briefcase className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-jalanea-900">
                                        Career Goals
                                    </h2>
                                    <p className="text-sm text-jalanea-500">What roles are you targeting?</p>
                                </div>
                            </div>

                            {/* Suggested Roles */}
                            <div>
                                <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                    Suggested Roles for Your Major
                                </label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {getSuggestedRoles().map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => addSuggestedRole(role)}
                                            disabled={form.targetRoles.includes(role)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.targetRoles.includes(role)
                                                    ? 'bg-jalanea-100 text-jalanea-400 border-jalanea-200 cursor-default'
                                                    : 'bg-white text-jalanea-700 border-jalanea-200 hover:border-jalanea-400 hover:bg-jalanea-50'
                                                }`}
                                        >
                                            + {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Roles */}
                            <div>
                                <label className="block text-sm font-medium text-jalanea-700 mb-2">
                                    Your Target Roles ({form.targetRoles.length}/5)
                                </label>
                                {form.targetRoles.length === 0 ? (
                                    <p className="text-sm text-jalanea-400 italic">Click above to add roles or type your own below.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {form.targetRoles.map((role) => (
                                            <span
                                                key={role}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-jalanea-100 text-jalanea-700 rounded-full text-sm font-medium"
                                            >
                                                {role}
                                                <button onClick={() => removeRole(role)} className="hover:text-red-500">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Custom Role Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={roleInput}
                                    onChange={(e) => setRoleInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                                    placeholder="Type a custom role..."
                                    className="flex-1 px-4 py-3 rounded-xl border border-jalanea-200 focus:border-jalanea-400 focus:ring-2 focus:ring-jalanea-100 outline-none transition-all"
                                />
                                <button
                                    onClick={addRole}
                                    disabled={form.targetRoles.length >= 5 || !roleInput.trim()}
                                    className="px-4 py-3 bg-jalanea-100 text-jalanea-700 rounded-xl hover:bg-jalanea-200 disabled:opacity-50 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Work Style Preferences */}
                            <div className="pt-6 border-t border-jalanea-100">
                                <label className="block text-sm font-medium text-jalanea-700 mb-3">
                                    Preferred Work Style
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {WORK_STYLE_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => toggleWorkStyle(option.value)}
                                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.workStyles.includes(option.value)
                                                ? 'border-jalanea-500 bg-jalanea-50'
                                                : 'border-jalanea-200 hover:border-jalanea-300'
                                                }`}
                                        >
                                            <span className="text-xl">{option.icon}</span>
                                            <span className="font-medium text-jalanea-700">{option.label}</span>
                                            {form.workStyles.includes(option.value) && (
                                                <Check className="w-4 h-4 text-jalanea-500 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Complete */}
                    {step === 5 && (
                        <div className="text-center py-8 space-y-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-display font-bold text-jalanea-900 mb-2">
                                    You're All Set, {form.name.split(' ')[0]}!
                                </h2>
                                <p className="text-jalanea-600">
                                    Your career strategy profile is ready. Let's find your perfect opportunities.
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="bg-jalanea-50 rounded-xl p-4 text-left max-w-sm mx-auto space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-jalanea-500">Location</span>
                                    <span className="font-medium text-jalanea-700">{form.location}</span>
                                </div>
                                <div className="flex justify-between items-start text-sm gap-4">
                                    <span className="text-jalanea-500 shrink-0">Degree</span>
                                    <span className="font-medium text-jalanea-700 text-right break-words flex-1">
                                        {(() => {
                                            const validEdu = form.educations.find(e => e.degreeType && e.major);
                                            return validEdu
                                                ? `${validEdu.degreeType.split(' ')[0]} in ${validEdu.major}`
                                                : form.educations[0]?.degreeType || 'Not specified';
                                        })()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-jalanea-500">Target Salary</span>
                                    <span className="font-medium text-jalanea-700">
                                        ${Math.round(form.salaryMin / 1000)}k – ${Math.round(form.salaryMax / 1000)}k
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-jalanea-500">Skills</span>
                                    <span className="font-medium text-jalanea-700">{form.skills.length} added</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-jalanea-100">
                        {step > 1 ? (
                            <Button variant="ghost" onClick={prevStep}>
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        {step < 5 ? (
                            <Button
                                variant="primary"
                                onClick={nextStep}
                                disabled={
                                    (step === 1 && !isStep1Valid) ||
                                    (step === 2 && !isStep2Valid) ||
                                    (step === 3 && !isStep3Valid) ||
                                    (step === 4 && !isStep4Valid)
                                }
                            >
                                Continue
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={submitProfile}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Go to Dashboard'}
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
