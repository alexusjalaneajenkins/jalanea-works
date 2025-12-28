import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CommuteCostCalculator } from '../components/CommuteCostCalculator';
import { CareerPathExplorer } from '../components/CareerPathExplorer';
import { CareerPath } from '../components/CareerPathCard';
import { NavRoute, Job, TransportMode } from '../types';
import { DegreeProgram, generateCareerPathsFromDegrees, getMoreCareerSuggestions, CareerPathSuggestion } from '../data/degreeDatabase';
import {
    Zap, ArrowRight, User, Linkedin, GraduationCap,
    Briefcase, Plus, X, Sparkles, CheckCircle2, ChevronRight,
    ChevronLeft, MapPin, Globe, Wand2, Star, Search, Heart, Calendar, Clock,
    Home, Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { searchJobs, searchJobsAggregate } from '../services/jobService';
import { searchCareersEnriched, getRelatedCareers, mapToCareerPath, getCareerOutlook } from '../services/onetService';
import { searchJobsWithGrounding } from '../services/geminiService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../services/firebase';

interface OnboardingProps {
    setRoute: (route: NavRoute) => void;
}

const STEPS = {
    LOGIN: 0,
    INTRO: 1,
    PROFILE_BASICS: 2,
    PROFILE_EDUCATION: 3,
    PROFILE_EXPERIENCE: 4,
    PROFILE_CAREER_PATHS: 5,
    PROFILE_PREFS: 6,
    FAVORITE_JOBS: 7,
    SETUP_SCHEDULE: 8
};

export const Onboarding: React.FC<OnboardingProps> = ({ setRoute }) => {
    const [currentStep, setCurrentStep] = useState(STEPS.LOGIN);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const { currentUser, userProfile, saveJob, isJobSaved, saveUserProfile } = useAuth();

    // Jobs for favoriting step
    const [jobsToFavorite, setJobsToFavorite] = useState<Job[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    // Local state for immediate visual feedback (Firebase can be slow)
    const [localSavedJobIds, setLocalSavedJobIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (currentUser && currentStep === STEPS.LOGIN) {
            setCurrentStep(STEPS.INTRO);
        }
    }, [currentUser, currentStep]);

    // Form State Handlers (Mock)
    const [experienceList, setExperienceList] = useState<any[]>([]);
    const [isAddingExperience, setIsAddingExperience] = useState(false);
    // Experience form state
    const [expType, setExpType] = useState<'Work' | 'Internship'>('Work');
    const [expRole, setExpRole] = useState('');
    const [expCompany, setExpCompany] = useState('');
    const [expDates, setExpDates] = useState('');
    const [expDescription, setExpDescription] = useState('');

    // Tag Inputs
    const [roleInput, setRoleInput] = useState('');
    const [roleTags, setRoleTags] = useState<string[]>(['Entry Level Designer']);

    // Preferences state
    const [targetSalary, setTargetSalary] = useState(50000);
    const [transportMode, setTransportMode] = useState<TransportMode | undefined>(undefined);
    const [workStyle, setWorkStyle] = useState<string>('Hybrid');

    // Career path explorer state
    const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
    const [selectedCareerIds, setSelectedCareerIds] = useState<string[]>([]);
    const [bookmarkedCareerIds, setBookmarkedCareerIds] = useState<string[]>([]);
    const [allSeenCareerIds, setAllSeenCareerIds] = useState<Set<string>>(new Set());

    // Profile basics state (pre-populated from Google login)
    const [fullName, setFullName] = useState('');
    const [location, setLocation] = useState('');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [isUploadingPic, setIsUploadingPic] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Education state - supporting multiple degrees with flexible text input
    interface SelectedEducation {
        degreeType: string;          // e.g. "Associate's", "Bachelor's", "Master's", "Certificate"
        degreeName: string;          // Free text, e.g. "Computer Science", "Nursing"
        institution: string;         // Free text, e.g. "University of Central Florida"
        graduationYear: string;
    }
    const DEGREE_TYPES = [
        { value: 'certificate', label: 'Certificate' },
        { value: 'associates', label: "Associate's Degree" },
        { value: 'bachelors', label: "Bachelor's Degree" },
        { value: 'masters', label: "Master's Degree" },
        { value: 'doctorate', label: 'Doctorate / PhD' },
        { value: 'other', label: 'Other' },
    ];
    const [selectedDegrees, setSelectedDegrees] = useState<SelectedEducation[]>([]);
    const [currentDegreeType, setCurrentDegreeType] = useState('');
    const [currentDegreeName, setCurrentDegreeName] = useState('');
    const [currentInstitution, setCurrentInstitution] = useState('');
    const [currentGradYear, setCurrentGradYear] = useState('');
    const [isAddingDegree, setIsAddingDegree] = useState(true); // Start with form open

    // Pre-populate form from userProfile (e.g., Google sign-in data)
    useEffect(() => {
        if (userProfile) {
            if (userProfile.fullName && !fullName) setFullName(userProfile.fullName);
            if (userProfile.photoURL && !profilePic) setProfilePic(userProfile.photoURL);
            if (userProfile.location && !location) setLocation(userProfile.location);
            if (userProfile.linkedinUrl) setLinkedinUrl(userProfile.linkedinUrl);
            if (userProfile.portfolioUrl) setPortfolioUrl(userProfile.portfolioUrl);
        }
    }, [userProfile]);

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && roleInput.trim()) {
            setRoleTags([...roleTags, roleInput.trim()]);
            setRoleInput('');
        }
    };

    const removeTag = (tag: string) => {
        setRoleTags(roleTags.filter(t => t !== tag));
    };

    // Generate career paths when education changes - use O*NET API
    const [isLoadingCareers, setIsLoadingCareers] = useState(false);

    useEffect(() => {
        const fetchCareersFromONet = async () => {
            if (selectedDegrees.length === 0) return;

            setIsLoadingCareers(true);

            try {
                // Search O*NET with each degree title
                const allCareers: CareerPath[] = [];
                const seenIds = new Set<string>();

                for (const { degreeName } of selectedDegrees) {
                    // Use degree name as search keyword (user's free-text input)
                    const onetResults = await searchCareersEnriched(degreeName, 6);

                    for (const career of onetResults) {
                        if (!seenIds.has(career.id)) {
                            seenIds.add(career.id);
                            allCareers.push({
                                id: career.id,
                                title: career.title,
                                field: career.field,
                                salaryRange: career.salaryRange,
                                matchScore: career.matchScore,
                                growth: career.growth,
                                skills: career.skills,
                                description: career.description,
                            });
                        }
                    }
                }

                if (allCareers.length > 0) {
                    console.log(`✅ Loaded ${allCareers.length} careers from O*NET`);
                    setCareerPaths(allCareers.slice(0, 8));
                    setAllSeenCareerIds(new Set(allCareers.map(c => c.id)));
                } else {
                    // Fallback to static database
                    console.log('⚠️ O*NET returned no results, using static database');
                    const suggestions = generateCareerPathsFromDegrees(selectedDegrees, new Set());
                    const paths: CareerPath[] = suggestions.slice(0, 8).map(s => ({
                        id: s.id,
                        title: s.title,
                        field: s.field,
                        salaryRange: s.salaryRange,
                        matchScore: s.matchScore,
                        growth: s.growth,
                        skills: s.skills,
                        description: s.description
                    }));
                    setCareerPaths(paths);
                    const newSeen = new Set<string>();
                    paths.forEach(p => newSeen.add(p.id));
                    setAllSeenCareerIds(newSeen);
                }
            } catch (error) {
                console.error('Error fetching O*NET careers:', error);
                // Fallback to static database
                const suggestions = generateCareerPathsFromDegrees(selectedDegrees, new Set());
                const paths: CareerPath[] = suggestions.slice(0, 8).map(s => ({
                    id: s.id,
                    title: s.title,
                    field: s.field,
                    salaryRange: s.salaryRange,
                    matchScore: s.matchScore,
                    growth: s.growth,
                    skills: s.skills,
                    description: s.description
                }));
                setCareerPaths(paths);
            } finally {
                setIsLoadingCareers(false);
            }
        };

        fetchCareersFromONet();
    }, [selectedDegrees.length]); // React to degree count changes

    const handleRefreshCareers = async () => {
        setIsLoadingCareers(true);

        try {
            // Try to get related careers from O*NET based on selected careers
            const selectedOnetCodes = careerPaths
                .filter(p => selectedCareerIds.includes(p.id) && p.id.startsWith('onet-'))
                .map(p => p.id.replace('onet-', ''));

            if (selectedOnetCodes.length > 0) {
                // Get related careers from the first selected career
                const relatedData = await getRelatedCareers(selectedOnetCodes[0]);

                if (relatedData?.career?.length) {
                    const newCareers: CareerPath[] = [];

                    for (const career of relatedData.career.slice(0, 6)) {
                        if (!allSeenCareerIds.has(`onet-${career.code}`)) {
                            const outlook = await getCareerOutlook(career.code);
                            const mapped = mapToCareerPath(career, outlook, null);
                            newCareers.push({
                                id: mapped.id,
                                title: mapped.title,
                                field: mapped.field,
                                salaryRange: mapped.salaryRange,
                                matchScore: mapped.matchScore,
                                growth: mapped.growth,
                                skills: mapped.skills,
                                description: mapped.description,
                            });
                        }
                    }

                    if (newCareers.length > 0) {
                        const newSeen = new Set(allSeenCareerIds);
                        newCareers.forEach(p => newSeen.add(p.id));
                        setAllSeenCareerIds(newSeen);
                        setCareerPaths(prev => [...prev, ...newCareers]);
                        setIsLoadingCareers(false);
                        return;
                    }
                }
            }

            // Fallback to static database
            let moreSuggestions = generateCareerPathsFromDegrees(selectedDegrees, allSeenCareerIds);
            if (moreSuggestions.length === 0) {
                moreSuggestions = getMoreCareerSuggestions(allSeenCareerIds, 6) as any;
            }

            const newPaths: CareerPath[] = moreSuggestions.slice(0, 6).map(s => ({
                id: s.id,
                title: s.title,
                field: s.field,
                salaryRange: s.salaryRange,
                matchScore: s.matchScore,
                growth: s.growth,
                skills: s.skills,
                description: s.description
            }));

            if (newPaths.length > 0) {
                const newSeen = new Set(allSeenCareerIds);
                newPaths.forEach(p => newSeen.add(p.id));
                setAllSeenCareerIds(newSeen);
                setCareerPaths(prev => [...prev, ...newPaths]);
            }
        } catch (error) {
            console.error('Error refreshing careers:', error);
        } finally {
            setIsLoadingCareers(false);
        }
    };

    const addExperience = () => {
        if (expRole.trim() && expCompany.trim()) {
            setExperienceList([...experienceList, {
                type: expType,
                role: expRole.trim(),
                company: expCompany.trim(),
                dates: expDates.trim() || 'Present',
                description: expDescription.trim()
            }]);
            // Reset form
            setExpRole('');
            setExpCompany('');
            setExpDates('');
            setExpDescription('');
            setExpType('Work');
            setIsAddingExperience(false);
        }
    };

    const renderProgressBar = () => {
        if (currentStep < STEPS.PROFILE_BASICS) return null;
        // 5 profile steps now (BASICS through SETUP_SCHEDULE = steps 2-7, so 6 steps total)
        const totalSteps = 7;
        const progress = ((currentStep - 2) / (totalSteps - 1)) * 100;

        return (
            <div className="w-full h-1.5 bg-jalanea-100 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-gold transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        );
    };

    // --- STEP RENDERERS ---

    const renderLogin = () => (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full max-w-md">
            <Card variant="glass-light" className="p-8 shadow-2xl backdrop-blur-xl border-white/40">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-jalanea-900 text-gold mb-4 shadow-lg shadow-gold/20">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-jalanea-900">Welcome to Jalanea Works</h2>
                    <p className="text-jalanea-600 mt-2 font-medium">Your career launchpad starts here.</p>
                </div>

                <div className="space-y-4">
                    <Button fullWidth variant="glass-dark" icon={<Globe size={16} />} className="bg-white text-jalanea-900 border-jalanea-200 hover:bg-jalanea-50 shadow-sm relative overflow-hidden">
                        <span className="relative z-10">Continue with Google</span>
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-jalanea-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/50 backdrop-blur px-2 text-jalanea-400 font-bold">Or with email</span></div>
                    </div>

                    <div className="space-y-3">
                        <Input placeholder="Email Address" type="email" />
                        <Input placeholder="Password" type="password" />
                    </div>

                    <Button fullWidth variant="primary" onClick={() => setCurrentStep(STEPS.INTRO)} className="mt-2 shadow-xl shadow-gold/20">
                        Create Account
                    </Button>

                    <p className="text-center text-xs text-jalanea-500 font-medium mt-4">
                        By clicking continue, you agree to our Terms of Service.
                    </p>
                </div>
            </Card>
        </div>
    );

    const renderIntro = () => {
        const slides = [
            {
                icon: <Heart size={48} fill="currentColor" />,
                title: "Built for Students Like You",
                desc: "Jalanea Works is designed for low-income housing students, Valencia College graduates, and anyone fighting to break the cycle of poverty through education."
            },
            {
                icon: <Home size={48} />,
                title: "From Homelessness to Housing",
                desc: "Our mission: help students use their Valencia degrees to find entry-level jobs that lead to stable income and permanent housing."
            },
            {
                icon: <Target size={48} />,
                title: "Your First 12-24 Months",
                desc: "We connect you to positions that match your degree—so you can work, save, and build the foundation for your future while in transitional housing."
            },
            {
                icon: <Sparkles size={48} />,
                title: "Seamless & Frictionless",
                desc: "No complicated applications. AI finds jobs that want YOUR specific degree and skills, then helps you apply in minutes."
            }
        ];

        return (
            <div className="animate-in fade-in zoom-in-95 duration-500 w-full max-w-lg">
                <Card variant="solid-white" className="p-10 shadow-2xl text-center min-h-[480px] flex flex-col justify-between relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-jalanea-900 via-gold to-jalanea-900"></div>

                    {/* Mission badge on first slide */}
                    {carouselIndex === 0 && (
                        <div className="absolute top-6 right-6">
                            <span className="text-xs font-bold bg-gold/20 text-gold px-2 py-1 rounded-full">Our Mission</span>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner mb-4 ${carouselIndex === 0 ? 'bg-red/10 text-red-600' :
                            carouselIndex === 1 ? 'bg-gold/20 text-gold' :
                                'bg-jalanea-50 text-gold'
                            }`}>
                            {slides[carouselIndex].icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-bold text-jalanea-900 mb-3">{slides[carouselIndex].title}</h3>
                            <p className="text-jalanea-600 font-medium text-lg leading-relaxed">{slides[carouselIndex].desc}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 mt-8">
                        {/* Dots */}
                        <div className="flex justify-center gap-2">
                            {slides.map((_, i) => (
                                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-8 bg-jalanea-900' : 'w-2 bg-jalanea-200'}`}></div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center">
                            <button onClick={() => setCurrentStep(STEPS.PROFILE_BASICS)} className="text-sm font-bold text-jalanea-400 hover:text-jalanea-900">Skip Intro</button>
                            <Button
                                onClick={() => {
                                    if (carouselIndex < slides.length - 1) setCarouselIndex(p => p + 1);
                                    else setCurrentStep(STEPS.PROFILE_BASICS);
                                }}
                                variant="primary"
                                icon={<ArrowRight size={16} />}
                            >
                                {carouselIndex === slides.length - 1 ? "Start My Journey" : "Next"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    // Profile picture upload handler
    const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const MAX_FILE_SIZE_MB = 5;

    const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!auth.currentUser) {
            alert('Please sign in to upload a profile picture.');
            return;
        }

        // Validate file type
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            alert(`Invalid file type: ${file.type || 'unknown'}\n\nAccepted formats: JPG, PNG, GIF, WebP`);
            return;
        }

        // Validate file size (max 5MB)
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            alert(`File too large: ${fileSizeMB}MB\n\nMaximum size: ${MAX_FILE_SIZE_MB}MB\n\nPlease choose a smaller image.`);
            return;
        }

        setIsUploadingPic(true);
        try {
            // Create a reference to the storage location
            const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}/${Date.now()}_${file.name}`);

            // Upload the file
            await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef);

            // Update the local state (will be saved when onboarding completes)
            setProfilePic(downloadURL);

            console.log('Profile picture uploaded successfully!');
        } catch (error: any) {
            console.error('Error uploading profile picture:', error);
            const errorMessage = error?.message || 'Unknown error';
            alert(`Failed to upload image.\n\nError: ${errorMessage}\n\nPlease try again or choose a different file.`);
        } finally {
            setIsUploadingPic(false);
        }
    };

    const renderBasics = () => (
        <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-jalanea-900">Let's get to know you.</h2>
                <p className="text-jalanea-600">Start building your digital presence.</p>
            </div>

            <div className="space-y-6">

                <div className="flex items-center gap-4">
                    {/* Profile Picture - clickable to upload */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfilePicUpload}
                        accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                    />
                    {profilePic ? (
                        <div className="relative group">
                            <img
                                src={profilePic}
                                alt={fullName || 'Profile'}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gold shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => fileInputRef.current?.click()}
                                title="Click to change photo (JPG, PNG, GIF, WebP - Max 5MB)"
                            />
                            {isUploadingPic && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => !isUploadingPic && fileInputRef.current?.click()}
                            className={`w-20 h-20 rounded-full bg-jalanea-100 flex flex-col items-center justify-center border-2 border-dashed border-jalanea-300 text-jalanea-400 cursor-pointer hover:border-gold hover:text-gold transition-colors ${isUploadingPic ? 'opacity-50' : ''}`}
                            title="Upload photo (JPG, PNG, GIF, WebP - Max 5MB)"
                        >
                            {isUploadingPic ? (
                                <div className="w-6 h-6 border-2 border-jalanea-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Plus size={24} />
                            )}
                        </div>
                    )}
                    <div className="flex-1 space-y-3">
                        <Input
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <Input
                            placeholder="Location (e.g. Orlando, FL)"
                            icon={<MapPin size={16} />}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Input
                        placeholder="LinkedIn URL"
                        icon={<Linkedin size={16} />}
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                    <Input
                        placeholder="Portfolio / GitHub URL (Optional)"
                        icon={<Globe size={16} />}
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );

    // Helper to add a degree to the list
    const addDegreeToList = () => {
        if (currentDegreeType && currentDegreeName.trim() && currentInstitution.trim()) {
            const degreeTypeLabel = DEGREE_TYPES.find(d => d.value === currentDegreeType)?.label || currentDegreeType;
            setSelectedDegrees(prev => [...prev, {
                degreeType: degreeTypeLabel,
                degreeName: currentDegreeName.trim(),
                institution: currentInstitution.trim(),
                graduationYear: currentGradYear
            }]);
            // Update role tags based on degree name for career matching
            const degreeKeywords = currentDegreeName.toLowerCase();
            let suggestedRoles: string[] = [];
            if (degreeKeywords.includes('computer') || degreeKeywords.includes('software') || degreeKeywords.includes('programming')) {
                suggestedRoles = ['Software Developer', 'Web Developer', 'IT Support'];
            } else if (degreeKeywords.includes('business') || degreeKeywords.includes('management')) {
                suggestedRoles = ['Business Analyst', 'Operations Coordinator', 'Management Trainee'];
            } else if (degreeKeywords.includes('nursing') || degreeKeywords.includes('health')) {
                suggestedRoles = ['Registered Nurse', 'Health Technician', 'Medical Assistant'];
            } else if (degreeKeywords.includes('design') || degreeKeywords.includes('graphic')) {
                suggestedRoles = ['Graphic Designer', 'UI Designer', 'Content Creator'];
            } else {
                suggestedRoles = ['Entry Level Professional'];
            }
            setRoleTags(prev => [...new Set([...prev, ...suggestedRoles])].slice(0, 5));
            // Reset form
            setCurrentDegreeType('');
            setCurrentDegreeName('');
            setCurrentInstitution('');
            setCurrentGradYear('');
            setIsAddingDegree(false);
        }
    };

    // Helper to remove a degree
    const removeDegree = (index: number) => {
        setSelectedDegrees(prev => prev.filter((_, i) => i !== index));
    };

    const renderEducation = () => (
        <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-jalanea-900">What did you study?</h2>
                <p className="text-jalanea-600">Add your degrees and certificates from any school to see matching careers.</p>
            </div>

            <div className="space-y-4">
                {/* Already Added Degrees */}
                {selectedDegrees.map((edu, index) => (
                    <div key={index} className="bg-white border-2 border-gold rounded-xl p-4 relative animate-in fade-in duration-200">
                        <button
                            onClick={() => removeDegree(index)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-red-100 text-jalanea-400 hover:text-red-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-gold shrink-0">
                                <GraduationCap size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">{edu.degreeType}</span>
                                    <span className="text-xs text-jalanea-500">{edu.institution} • {edu.graduationYear}</span>
                                </div>
                                <h4 className="font-bold text-jalanea-900 mt-1">{edu.degreeName}</h4>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Degree Form */}
                {isAddingDegree ? (
                    <div className="bg-jalanea-50 border-2 border-dashed border-jalanea-200 rounded-xl p-4 space-y-4">
                        {/* Degree Type Selector - Dropdown */}
                        <div>
                            <label className="text-sm font-bold text-jalanea-900 mb-2 block">
                                What type of credential?
                            </label>
                            <select
                                value={currentDegreeType}
                                onChange={(e) => setCurrentDegreeType(e.target.value)}
                                className="w-full rounded-xl border-2 border-jalanea-200 py-3 px-4 text-jalanea-900 font-medium focus:ring-2 focus:ring-gold/20 focus:border-gold bg-white appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    backgroundSize: '20px',
                                    paddingRight: '40px'
                                }}
                            >
                                <option value="">Select degree type...</option>
                                {DEGREE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Field of Study */}
                        <div>
                            <label className="text-sm font-bold text-jalanea-900 mb-2 block">
                                Field of Study
                            </label>
                            <input
                                type="text"
                                value={currentDegreeName}
                                onChange={(e) => setCurrentDegreeName(e.target.value)}
                                placeholder="e.g., Computer Science, Nursing, Business Administration..."
                                className="w-full rounded-xl border-2 border-jalanea-200 py-3 px-4 text-jalanea-900 font-medium focus:ring-2 focus:ring-gold/20 focus:border-gold bg-white placeholder:text-jalanea-400"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-jalanea-900 mb-2 block">
                                School / Institution
                            </label>
                            <input
                                type="text"
                                value={currentInstitution}
                                onChange={(e) => setCurrentInstitution(e.target.value)}
                                placeholder="e.g., Valencia College, UCF, Florida State, Online..."
                                className="w-full rounded-xl border-2 border-jalanea-200 py-3 px-4 text-jalanea-900 font-medium focus:ring-2 focus:ring-gold/20 focus:border-gold bg-white placeholder:text-jalanea-400"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-jalanea-900">Graduation Year</label>
                                <input
                                    type="text"
                                    value={currentGradYear}
                                    onChange={(e) => setCurrentGradYear(e.target.value)}
                                    placeholder="e.g., 2024, 2025 (Expected)..."
                                    className="w-full rounded-xl border-2 border-jalanea-200 py-3 px-4 text-jalanea-900 font-medium focus:ring-2 focus:ring-gold/20 focus:border-gold bg-white placeholder:text-jalanea-400"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={addDegreeToList}
                                    disabled={!currentDegreeType || !currentDegreeName.trim() || !currentInstitution.trim()}
                                    className="w-full bg-gold text-jalanea-900 font-bold py-3 px-4 rounded-xl hover:bg-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} />
                                    Add This Degree
                                </button>
                            </div>
                        </div>

                        {selectedDegrees.length > 0 && (
                            <button
                                onClick={() => setIsAddingDegree(false)}
                                className="text-sm text-jalanea-500 hover:text-jalanea-700 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingDegree(true)}
                        className="w-full border-2 border-dashed border-jalanea-200 rounded-xl p-4 flex items-center justify-center gap-2 text-jalanea-600 hover:border-gold hover:text-gold transition-colors"
                    >
                        <Plus size={18} />
                        <span className="font-bold">Add Another Degree or Certificate</span>
                    </button>
                )}

                {/* Career Search Info */}
                {selectedDegrees.length > 0 && (
                    <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={16} className="text-gold" />
                            <span className="text-sm font-bold text-jalanea-900">
                                AI-Powered Career Search
                            </span>
                        </div>
                        <p className="text-sm text-jalanea-700">
                            We'll use your degree in <strong>{selectedDegrees[0].degreeName}</strong> from <strong>{selectedDegrees[0].institution}</strong> to find entry-level jobs that match your qualifications.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderExperience = () => (
        <div className="animate-in slide-in-from-right-8 fade-in duration-300 relative">
            <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-jalanea-900">Experience & Projects.</h2>
                <p className="text-jalanea-600">Include internships, part-time work, or major class projects.</p>
            </div>

            {experienceList.length === 0 && !isAddingExperience ? (
                <div
                    onClick={() => setIsAddingExperience(true)}
                    className="border-2 border-dashed border-jalanea-200 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-jalanea-100 group-hover:bg-gold group-hover:text-jalanea-950 flex items-center justify-center text-jalanea-400 mb-3 transition-colors">
                        <Plus size={24} />
                    </div>
                    <p className="font-bold text-jalanea-600">Add First Position</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {experienceList.map((exp, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-jalanea-200 shadow-sm flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-jalanea-900">{exp.role}</h4>
                                <p className="text-sm text-jalanea-500">{exp.company}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-jalanea-400"><Star size={16} /></Button>
                        </div>
                    ))}
                    {!isAddingExperience && (
                        <Button variant="outline" fullWidth onClick={() => setIsAddingExperience(true)} icon={<Plus size={16} />}>
                            Add Another
                        </Button>
                    )}
                </div>
            )}

            {/* Add Experience Modal/Form */}
            {isAddingExperience && (
                <div className="mt-4 bg-white p-6 rounded-2xl shadow-lg border border-jalanea-100 animate-in zoom-in-95 duration-200">
                    <div className="space-y-4">
                        <div className="flex gap-4 mb-2">
                            {(['Work', 'Internship'] as const).map(type => (
                                <label key={type} className="flex items-center gap-2 text-sm font-bold text-jalanea-700 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="expType"
                                        className="text-gold focus:ring-gold"
                                        checked={expType === type}
                                        onChange={() => setExpType(type)}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                        <Input
                            placeholder="Role Title"
                            value={expRole}
                            onChange={(e) => setExpRole(e.target.value)}
                        />
                        <Input
                            placeholder="Company / Organization"
                            value={expCompany}
                            onChange={(e) => setExpCompany(e.target.value)}
                        />
                        <Input
                            placeholder="Dates (e.g. Summer 2024)"
                            value={expDates}
                            onChange={(e) => setExpDates(e.target.value)}
                        />
                        <textarea
                            className="w-full rounded-xl border border-jalanea-200 py-3 px-4 text-jalanea-900 text-sm focus:ring-1 focus:ring-jalanea-900 min-h-[100px]"
                            placeholder="Describe what you did... (Bullet points recommended)"
                            value={expDescription}
                            onChange={(e) => setExpDescription(e.target.value)}
                        ></textarea>
                        <div className="flex gap-3 pt-2">
                            <Button fullWidth variant="secondary" onClick={() => setIsAddingExperience(false)}>Cancel</Button>
                            <Button fullWidth variant="primary" onClick={addExperience} disabled={!expRole.trim() || !expCompany.trim()}>Save Position</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Career Path Explorer - its own immersive step
    const renderCareerPaths = () => (
        <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <CareerPathExplorer
                suggestedCareers={careerPaths}
                onSelectionChange={setSelectedCareerIds}
                onBookmarksChange={setBookmarkedCareerIds}
                onRefresh={handleRefreshCareers}
                minSelections={1}
                isLoading={isLoadingCareers}
                degreeInfo={selectedDegrees.length > 0 ? {
                    name: selectedDegrees[0].degreeName,
                    field: 'General'  // Field inferred from degree name for universal support
                } : undefined}
            />
        </div>
    );

    // Preferences step - salary, work style, commute
    const renderPrefs = () => (
        <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-jalanea-900">Job Preferences</h2>
                <p className="text-jalanea-600">Help us find opportunities that fit your lifestyle.</p>
            </div>

            <div className="space-y-8">
                {/* Work Style */}
                <div>
                    <label className="text-sm font-bold text-jalanea-900 mb-3 block">Work Style</label>
                    <div className="flex gap-3">
                        {['Remote', 'Hybrid', 'On-site'].map(style => (
                            <button
                                key={style}
                                onClick={() => setWorkStyle(style)}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all
                                    ${workStyle === style
                                        ? 'bg-jalanea-900 text-white border-jalanea-900'
                                        : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-gold'
                                    }
                                `}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Salary Expectation */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-jalanea-900">Salary Expectation</label>
                        <span className="text-sm font-bold text-gold">${(targetSalary / 1000).toFixed(0)}k+</span>
                    </div>
                    <input
                        type="range"
                        min="30000"
                        max="150000"
                        step="5000"
                        value={targetSalary}
                        onChange={(e) => setTargetSalary(Number(e.target.value))}
                        className="w-full accent-gold h-2 bg-jalanea-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-jalanea-400 mt-1">
                        <span>$30k</span>
                        <span>$150k+</span>
                    </div>
                </div>

                {/* Commute Cost Awareness - Transport Mode Selection */}
                <div>
                    <label className="text-sm font-bold text-jalanea-900 mb-3 block">How will you commute?</label>
                    <CommuteCostCalculator
                        salary={targetSalary}
                        selectedMode={transportMode}
                        onSelect={setTransportMode}
                    />
                </div>
            </div>
        </div>
    );

    // Fetch jobs when reaching the favorite step - use user's location and work style
    const [jobWorkStyleFilter, setJobWorkStyleFilter] = useState<'all' | 'Remote' | 'Hybrid' | 'On-site'>('all');
    const [localOnlyFilter, setLocalOnlyFilter] = useState<boolean>(true); // Default: only show local jobs
    const [careerFilter, setCareerFilter] = useState<string | null>(null); // null = all careers

    // Store all jobs with their source career tag for client-side filtering
    const [allJobsWithCareers, setAllJobsWithCareers] = useState<Array<{ job: typeof jobsToFavorite[0], careerId: string, careerTitle: string }>>([]);

    const fetchJobsForFavorites = async () => {
        setIsLoadingJobs(true);
        try {
            // Build search query from selected career paths
            const selectedCareers = careerPaths.filter(c => selectedCareerIds.includes(c.id));
            console.log('📋 Selected careers:', selectedCareers.map(c => c.title));
            console.log('📋 Selected career IDs:', selectedCareerIds);

            if (selectedCareers.length === 0) {
                console.log('⚠️ No careers selected');
                setJobsToFavorite([]);
                setAllJobsWithCareers([]);
                return;
            }

            // Build query - prefer career titles, add entry-level qualifier
            const entryLevelModifier = 'entry level';

            // For remote, add to query. For on-site/hybrid, we rely on location filtering
            const workStyleQuery = jobWorkStyleFilter === 'Remote' ? ' remote' : '';

            // Use user's location or default
            // For Grounding: Use city-level location (more accurate)
            // For Aggregate API: Use state-level location (broader results)
            let groundingLocation = 'United States';  // City-level for grounding
            let aggregateLocation = 'United States'; // State-level for aggregate

            if (jobWorkStyleFilter === 'On-site' || jobWorkStyleFilter === 'Hybrid') {
                if (location?.trim()) {
                    // Parse "City, State" format
                    const parts = location.trim().split(',');
                    const city = parts[0]?.trim() || '';
                    const stateAbbr = parts[1]?.trim() || '';

                    // Convert state abbreviation to full name
                    const stateFullNames: Record<string, string> = {
                        'FL': 'Florida', 'CA': 'California', 'TX': 'Texas', 'NY': 'New York',
                        'PA': 'Pennsylvania', 'VA': 'Virginia', 'MA': 'Massachusetts', 'GA': 'Georgia',
                        'NC': 'North Carolina', 'OH': 'Ohio', 'IL': 'Illinois', 'WA': 'Washington',
                        'AZ': 'Arizona', 'CO': 'Colorado', 'NV': 'Nevada', 'OR': 'Oregon',
                        'WI': 'Wisconsin', 'MD': 'Maryland', 'NJ': 'New Jersey', 'SC': 'South Carolina',
                        'TN': 'Tennessee', 'MI': 'Michigan', 'IN': 'Indiana', 'MO': 'Missouri',
                    };

                    const stateFull = stateFullNames[stateAbbr.toUpperCase()] || stateAbbr;

                    // Grounding: Use city + state for precise results
                    groundingLocation = city && stateFull ? `${city}, ${stateFull}` : location.trim();

                    // Aggregate: Use state for broader results
                    aggregateLocation = stateFull || 'United States';

                    console.log(`📍 Location for grounding: "${groundingLocation}", for aggregate: "${aggregateLocation}"`);
                }
            }

            // Fetch jobs for EACH selected career separately and tag them
            const allTaggedJobs: Array<{ job: typeof jobsToFavorite[0], careerId: string, careerTitle: string, fromGrounding: boolean }> = [];

            for (const career of selectedCareers) {
                const fullQuery = `${career.title} ${entryLevelModifier}${workStyleQuery}`.trim();
                console.log(`🔍 Searching for career: "${career.title}" with query: "${fullQuery}"`);

                try {
                    let fetchedJobs: Job[] = [];

                    // For On-site/Hybrid: Try Gemini Search Grounding first (real-time Google Search)
                    let fromGrounding = false;
                    if (jobWorkStyleFilter === 'On-site' || jobWorkStyleFilter === 'Hybrid') {
                        console.log(`🤖 Trying Gemini Search Grounding for "${career.title}" in "${groundingLocation}"...`);
                        const groundedJobs = await searchJobsWithGrounding(
                            `${career.title} entry level`,
                            groundingLocation,  // City-level for precise results
                            jobWorkStyleFilter as 'On-site' | 'Remote' | 'Hybrid',
                            userProfile || undefined
                        );

                        if (groundedJobs && groundedJobs.length > 0) {
                            console.log(`✅ Grounding found ${groundedJobs.length} live jobs! (Location filter will be skipped)`);
                            fetchedJobs = groundedJobs;
                            fromGrounding = true;  // Mark as from grounding - skip location filter
                        } else {
                            console.log(`⚠️ Grounding returned no results, falling back to aggregate API...`);
                        }
                    }

                    // Fallback to aggregate API (or primary for Remote/All)
                    if (fetchedJobs.length === 0) {
                        const response = await searchJobsAggregate(fullQuery, {
                            location: aggregateLocation,  // State-level for broader results
                            remote: jobWorkStyleFilter === 'Remote'
                        });
                        if (response.jobs && response.jobs.length > 0) {
                            fetchedJobs = response.jobs;
                            fromGrounding = false;  // Mark as NOT from grounding - needs location filter
                        }
                    }

                    if (fetchedJobs.length > 0) {
                        console.log(`📦 Found ${fetchedJobs.length} jobs for ${career.title}`);

                        // Filter and tag jobs with this career
                        const entryLevelExcludeTerms = ['senior', 'lead', 'manager', 'director', 'principal', 'staff', 'architect', 'vp', 'head of'];
                        const experienceExcludePatterns = [/(\d+)\+?\s*years?/i];

                        const filteredJobs = fetchedJobs.filter(job => {
                            const titleLower = job.title?.toLowerCase() || '';
                            const descLower = job.description?.toLowerCase() || '';

                            // Exclude senior-level titles
                            if (entryLevelExcludeTerms.some(term => titleLower.includes(term))) {
                                return false;
                            }

                            // Check for high experience requirements (5+ years)
                            for (const pattern of experienceExcludePatterns) {
                                const match = descLower.match(pattern);
                                if (match && parseInt(match[1]) >= 5) {
                                    return false;
                                }
                            }

                            return true;
                        });

                        // Tag each job with this career
                        filteredJobs.slice(0, 5).forEach(job => {
                            // Avoid duplicates by checking if job already exists
                            const exists = allTaggedJobs.some(tj => tj.job.id === job.id);
                            if (!exists) {
                                allTaggedJobs.push({
                                    job: job,
                                    careerId: career.id,
                                    careerTitle: career.title,
                                    fromGrounding: fromGrounding  // Track source for filtering
                                });
                            }
                        });
                    }
                } catch (careerError) {
                    console.error(`⚠️ Error fetching jobs for ${career.title}:`, careerError);
                }
            }

            console.log(`✅ Total jobs collected: ${allTaggedJobs.length} across ${selectedCareers.length} careers`);

            // Separate grounded jobs (location already enforced) from aggregate jobs (need filtering)
            const groundedJobs = allTaggedJobs.filter(t => t.fromGrounding);
            const aggregateJobs = allTaggedJobs.filter(t => !t.fromGrounding);

            console.log(`📊 Source breakdown: ${groundedJobs.length} from grounding (trusted), ${aggregateJobs.length} from aggregate (need filtering)`);

            // For on-site and hybrid, filter ONLY aggregate jobs by location
            // Grounded jobs are trusted since Gemini already enforced location
            let processedJobs = [...groundedJobs]; // Start with all grounded jobs (trusted)

            // Location filtering for aggregate jobs only
            if ((jobWorkStyleFilter === 'On-site' || jobWorkStyleFilter === 'Hybrid') && location && aggregateJobs.length > 0) {
                const locationLower = location.toLowerCase().trim();
                const parts = locationLower.split(',').map(p => p.trim());
                const city = parts[0] || '';
                const state = parts[1]?.trim() || '';

                // Extended state abbreviation mapping (all 50 states)
                const statePatterns: Record<string, string[]> = {
                    'fl': ['florida', 'fl'], 'ca': ['california', 'ca'], 'tx': ['texas', 'tx'],
                    'ny': ['new york', 'ny'], 'pa': ['pennsylvania', 'pa'], 'va': ['virginia', 'va'],
                    'ma': ['massachusetts', 'ma'], 'ga': ['georgia', 'ga'], 'nc': ['north carolina', 'nc'],
                    'oh': ['ohio', 'oh'], 'il': ['illinois', 'il'], 'wa': ['washington', 'wa'],
                    'az': ['arizona', 'az'], 'co': ['colorado', 'co'], 'nv': ['nevada', 'nv'],
                    'or': ['oregon', 'or'], 'md': ['maryland', 'md'], 'nj': ['new jersey', 'nj'],
                    'sc': ['south carolina', 'sc'], 'tn': ['tennessee', 'tn'], 'mi': ['michigan', 'mi'],
                    'in': ['indiana', 'in'], 'mo': ['missouri', 'mo'], 'wi': ['wisconsin', 'wi'],
                    'florida': ['florida', 'fl'], 'california': ['california', 'ca'], 'texas': ['texas', 'tx'],
                };

                const stateMatches = statePatterns[state] || [state];

                console.log(`📍 Filtering aggregate jobs for city: "${city}", state patterns:`, stateMatches);

                // Filter aggregate jobs - only keep those matching location
                const locationFiltered = aggregateJobs.filter(tagged => {
                    const jobLocation = tagged.job.location?.toLowerCase() || '';
                    const jobTitle = tagged.job.title?.toLowerCase() || '';

                    // Exclude remote jobs for on-site/hybrid searches
                    if (jobLocation.includes('remote') || jobTitle.includes('remote') ||
                        jobLocation.includes('anywhere') || jobLocation.includes('worldwide')) {
                        return false;
                    }

                    const matchesCity = city.length >= 3 && jobLocation.includes(city);
                    const matchesState = stateMatches.some(s => jobLocation.includes(s));

                    return matchesCity || matchesState;  // FIX: Return boolean, not object!
                });

                console.log(`📍 Aggregate jobs after location filter: ${locationFiltered.length} (filtered from ${aggregateJobs.length})`);

                // Apply localOnlyFilter logic to filtered aggregate jobs
                if (localOnlyFilter) {
                    // City matches get priority
                    const cityMatches = locationFiltered.filter(t => {
                        const jobLocation = t.job.location?.toLowerCase() || '';
                        return city.length >= 3 && jobLocation.includes(city);
                    });

                    if (cityMatches.length > 0) {
                        processedJobs = [...groundedJobs, ...cityMatches];
                    } else {
                        processedJobs = [...groundedJobs, ...locationFiltered];
                        if (locationFiltered.length > 0) {
                            console.log(`⚠️ No jobs in "${city}", showing ${locationFiltered.length} state-level matches`);
                        }
                    }
                } else {
                    // Not local only - show all location-filtered aggregate jobs
                    processedJobs = [...groundedJobs, ...locationFiltered];
                }
            } else if (aggregateJobs.length > 0) {
                // Remote or All mode - include all aggregate jobs without location filter
                processedJobs = [...groundedJobs, ...aggregateJobs];
            }

            console.log(`📋 Final jobs to display: ${processedJobs.length}`);


            // Store all jobs with career tags for client-side filtering
            setAllJobsWithCareers(processedJobs);

            // Initially show all jobs
            setJobsToFavorite(processedJobs.map(tj => tj.job));

        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    useEffect(() => {
        if (currentStep === STEPS.FAVORITE_JOBS && allJobsWithCareers.length === 0) {
            fetchJobsForFavorites();
        }
    }, [currentStep]);

    // Refetch only when work style filter or local filter changes (career filter is now client-side)
    useEffect(() => {
        if (currentStep === STEPS.FAVORITE_JOBS) {
            fetchJobsForFavorites();
        }
    }, [jobWorkStyleFilter, localOnlyFilter]);

    // Client-side filtering when career filter changes
    useEffect(() => {
        if (careerFilter) {
            // Filter to show only jobs for the selected career
            const filtered = allJobsWithCareers.filter(tj => tj.careerId === careerFilter);
            setJobsToFavorite(filtered.map(tj => tj.job));
            console.log(`🎯 Filtered to ${filtered.length} jobs for career: ${careerFilter}`);
        } else {
            // Show all jobs
            setJobsToFavorite(allJobsWithCareers.map(tj => tj.job));
            console.log(`📋 Showing all ${allJobsWithCareers.length} jobs`);
        }
    }, [careerFilter, allJobsWithCareers]);

    // Just count locally selected jobs
    const savedJobsCount = localSavedJobIds.size;

    const renderFavoriteJobs = () => {
        // Get selected careers for display
        const selectedCareers = careerPaths.filter(c => selectedCareerIds.includes(c.id));

        return (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                <div className="mb-6">
                    <h2 className="text-2xl font-display font-bold text-jalanea-900">Find your first targets.</h2>
                    <p className="text-jalanea-600">Save at least 3 jobs you'd like to pursue. We'll help you apply strategically.</p>
                </div>

                {/* Selected Career Paths - Clickable filter - Mobile friendly */}
                {selectedCareers.length > 0 && (
                    <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent rounded-xl border border-gold/20">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                            <Sparkles size={14} className="text-gold sm:w-4 sm:h-4" />
                            <span className="text-[10px] sm:text-xs font-bold text-jalanea-700 uppercase tracking-wider">
                                Filter by career path
                            </span>
                        </div>
                        {/* Horizontal scroll on mobile, wrap on larger screens */}
                        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                            {/* All Careers option */}
                            <button
                                onClick={() => setCareerFilter(null)}
                                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink
                                ${careerFilter === null
                                        ? 'bg-jalanea-900 text-white border border-jalanea-900 shadow-md'
                                        : 'bg-white text-jalanea-600 border border-jalanea-200 hover:border-gold hover:text-jalanea-800'
                                    }
                            `}
                            >
                                All Careers
                            </button>
                            {/* Individual career filters */}
                            {selectedCareers.map(career => (
                                <button
                                    key={career.id}
                                    onClick={() => setCareerFilter(careerFilter === career.id ? null : career.id)}
                                    className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink
                                    ${careerFilter === career.id
                                            ? 'bg-gold text-jalanea-900 border border-gold shadow-md'
                                            : 'bg-white text-jalanea-800 border border-gold/30 hover:border-gold hover:shadow-sm'
                                        }
                                `}
                                >
                                    <Target size={10} className={`sm:w-3 sm:h-3 ${careerFilter === career.id ? 'text-jalanea-900' : 'text-gold'}`} />
                                    {career.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Work Style Filter */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-jalanea-600 mb-2 block">Filter by Work Style</label>
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'Remote', 'Hybrid', 'On-site'] as const).map(style => (
                            <button
                                key={style}
                                onClick={() => setJobWorkStyleFilter(style)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                ${jobWorkStyleFilter === style
                                        ? 'bg-jalanea-900 text-white'
                                        : 'bg-white text-jalanea-600 border border-jalanea-200 hover:border-gold'
                                    }
                            `}
                            >
                                {style === 'all' ? 'All' : style}
                            </button>
                        ))}
                    </div>
                    {location && (
                        <p className="text-xs text-jalanea-400 mt-2 flex items-center gap-1">
                            <MapPin size={12} /> Showing jobs near {location}
                        </p>
                    )}

                    {/* Local Only Toggle - visible for On-site and Hybrid */}
                    {(jobWorkStyleFilter === 'On-site' || jobWorkStyleFilter === 'Hybrid') && location && (
                        <div className="mt-3 p-3 bg-jalanea-50 rounded-xl border border-jalanea-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-gold" />
                                    <span className="text-xs font-bold text-jalanea-700">
                                        {localOnlyFilter ? '📍 Local Only' : '🌎 Open to Relocate'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setLocalOnlyFilter(!localOnlyFilter)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${localOnlyFilter ? 'bg-gold' : 'bg-jalanea-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${localOnlyFilter ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <p className="text-[10px] text-jalanea-500 mt-1.5">
                                {localOnlyFilter
                                    ? `Only showing jobs in ${location.split(',')[0]}`
                                    : `Showing jobs across ${location.split(',')[1]?.trim() || 'your state'}`
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress indicator */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-jalanea-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gold transition-all duration-300"
                            style={{ width: `${Math.min((savedJobsCount / 3) * 100, 100)}%` }}
                        />
                    </div>
                    <span className={`text-sm font-bold ${savedJobsCount >= 3 ? 'text-green-600' : 'text-jalanea-600'}`}>
                        {savedJobsCount} / 3 saved
                    </span>
                    {savedJobsCount >= 3 && <CheckCircle2 size={18} className="text-green-600" />}
                </div>

                {/* Jobs grid */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {isLoadingJobs ? (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-sm text-jalanea-500">Loading job opportunities...</p>
                        </div>
                    ) : jobsToFavorite.length === 0 ? (
                        <div className="text-center py-8 bg-jalanea-50 rounded-xl">
                            <MapPin size={32} className="mx-auto text-jalanea-300 mb-2" />
                            <p className="text-sm font-bold text-jalanea-600">
                                {jobWorkStyleFilter === 'Remote' || jobWorkStyleFilter === 'all'
                                    ? 'No jobs found'
                                    : 'No local jobs found'}
                            </p>
                            <p className="text-xs text-jalanea-400 mt-1">
                                {jobWorkStyleFilter === 'Remote'
                                    ? 'No remote positions found for your selected careers'
                                    : jobWorkStyleFilter === 'all'
                                        ? 'No entry-level positions found for your selected careers'
                                        : `No ${jobWorkStyleFilter.toLowerCase()} positions found near ${location || 'your location'}`}
                            </p>
                            {jobWorkStyleFilter !== 'Remote' && (
                                <button
                                    onClick={() => setJobWorkStyleFilter('Remote')}
                                    className="mt-3 text-xs text-gold font-bold hover:underline"
                                >
                                    Try Remote jobs →
                                </button>
                            )}
                        </div>
                    ) : (
                        // Jobs are now tagged with their source career for filtering
                        jobsToFavorite.map(job => {
                            // Just check local state - simple selection
                            const isSelected = localSavedJobIds.has(job.id);
                            // Find the career tag for this job
                            const jobCareer = allJobsWithCareers.find(tj => tj.job.id === job.id);
                            return (
                                <button
                                    key={job.id}
                                    type="button"
                                    className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${isSelected
                                        ? 'bg-gold/10 border-gold shadow-md'
                                        : 'bg-white border-jalanea-200 hover:border-gold/50 active:border-gold'
                                        }`}
                                    onClick={() => {
                                        // Simple toggle - just update local state
                                        setLocalSavedJobIds(prev => {
                                            const next = new Set(prev);
                                            if (next.has(job.id)) {
                                                next.delete(job.id); // Unselect
                                            } else {
                                                next.add(job.id); // Select
                                            }
                                            return next;
                                        });
                                    }}
                                >
                                    {/* Career Tag Badge */}
                                    {jobCareer && !careerFilter && (
                                        <div className="mb-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gold/20 text-gold-dark border border-gold/30">
                                                <Target size={10} className="text-gold" />
                                                {jobCareer.careerTitle}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-jalanea-900 text-sm sm:text-base truncate">{job.title}</h4>
                                            <p className="text-xs sm:text-sm text-jalanea-600">{job.company}</p>
                                            <p className="text-[10px] sm:text-xs text-jalanea-400 mt-1">{job.location}</p>
                                        </div>
                                        <div className={`p-1.5 sm:p-2 rounded-full shrink-0 ${isSelected ? 'bg-gold text-jalanea-900' : 'bg-jalanea-100 text-jalanea-400'}`}>
                                            <Heart size={16} className="sm:w-[18px] sm:h-[18px]" fill={isSelected ? 'currentColor' : 'none'} />
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-gold font-bold">
                                            <CheckCircle2 size={12} /> Selected
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    const [weeklyHours, setWeeklyHours] = useState<number>(10);
    const [preferredTimes, setPreferredTimes] = useState<string[]>(['morning']);

    const renderScheduleSetup = () => (
        <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-jalanea-900">Set your job search rhythm.</h2>
                <p className="text-jalanea-600">Tell us when you're available and we'll build a smart schedule for you.</p>
            </div>

            <div className="space-y-8">
                {/* Weekly hours commitment */}
                <div>
                    <label className="text-sm font-bold text-jalanea-900 mb-3 block">
                        How many hours per week can you dedicate to job searching?
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="5"
                            max="40"
                            value={weeklyHours}
                            onChange={(e) => setWeeklyHours(Number(e.target.value))}
                            className="flex-1 accent-gold h-2 bg-jalanea-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-lg font-bold text-gold min-w-[60px] text-right">{weeklyHours} hrs</span>
                    </div>
                </div>

                {/* Preferred times */}
                <div>
                    <label className="text-sm font-bold text-jalanea-900 mb-3 block">
                        When do you prefer to focus on job searching?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'morning', label: '☀️ Morning', time: '6am - 12pm' },
                            { id: 'afternoon', label: '🌤️ Afternoon', time: '12pm - 5pm' },
                            { id: 'evening', label: '🌙 Evening', time: '5pm - 9pm' },
                            { id: 'weekend', label: '📅 Weekends', time: 'Sat & Sun' }
                        ].map(time => (
                            <button
                                key={time.id}
                                onClick={() => {
                                    setPreferredTimes(prev =>
                                        prev.includes(time.id)
                                            ? prev.filter(t => t !== time.id)
                                            : [...prev, time.id]
                                    );
                                }}
                                className={`p-4 rounded-xl border text-left transition-all ${preferredTimes.includes(time.id)
                                    ? 'bg-jalanea-900 text-white border-jalanea-900'
                                    : 'bg-white text-jalanea-700 border-jalanea-200 hover:border-gold'
                                    }`}
                            >
                                <span className="text-lg font-bold block">{time.label}</span>
                                <span className={`text-xs ${preferredTimes.includes(time.id) ? 'text-jalanea-300' : 'text-jalanea-400'}`}>{time.time}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-gold" />
                        <span className="text-sm font-bold text-jalanea-900">Your Job Search Plan</span>
                    </div>
                    <p className="text-sm text-jalanea-700">
                        We'll schedule {weeklyHours} hours of focused job search time during your preferred {preferredTimes.length > 1 ? 'time slots' : 'time slot'}.
                    </p>
                </div>
            </div>
        </div>
    );

    const handleCompleteOnboarding = async () => {
        console.log('🚀 Starting onboarding completion...');
        try {
            // First, save all the locally selected jobs to Firebase
            const jobsToSave = jobsToFavorite.filter(job => localSavedJobIds.has(job.id));
            console.log(`💾 Saving ${jobsToSave.length} selected jobs...`);

            for (const job of jobsToSave) {
                try {
                    // Clean the job object - remove undefined values
                    // Use correct property names from Job interface
                    const cleanJob = {
                        id: job.id || '',
                        title: job.title || '',
                        company: job.company || '',
                        location: job.location || '',
                        salaryRange: job.salaryRange || 'Not specified',
                        type: job.type || 'Full-time',
                        applyUrl: job.applyUrl || '',
                        description: job.description || '',
                        postedAt: job.postedAt || 'Recently',
                        source: (job as any).source || 'onboarding'
                    };
                    await saveJob(cleanJob);
                    console.log('✅ Saved job:', cleanJob.title);
                } catch (jobError) {
                    console.error('⚠️ Failed to save job, continuing...', jobError);
                }
            }

            // Save all profile data and preferences, mark onboarding complete
            console.log('📝 Saving profile data...');

            // Build education array - remove undefined values, Firestore rejects them
            const educationData = selectedDegrees.map(edu => ({
                // Core fields for Profile.tsx display and geminiService.ts resume generation
                degreeType: edu.degreeType,           // e.g. "Bachelor's Degree", "Certificate"
                program: edu.degreeName,              // Field of study, e.g. "Computer Science"
                degree: `${edu.degreeType} in ${edu.degreeName}`, // Full degree string for AI/resume
                school: edu.institution,
                gradYear: edu.graduationYear || 'In Progress',
                year: edu.graduationYear || 'In Progress' // Keep for backward compatibility
            }));

            // Build experience array
            const experienceData = experienceList.map((exp: any) => ({
                role: exp.role,
                company: exp.company,
                duration: exp.dates || 'Present', // Map 'dates' to 'duration'
                description: exp.description
                    ? exp.description.split(/[\n•\-]/).map((line: string) => line.trim()).filter((line: string) => line.length > 0)
                    : [] // Convert string to array of bullet points
            }));

            // Build profile object - only include defined values
            const profileData: Record<string, any> = {
                // Profile basics
                fullName: fullName || '',
                location: location || '',
                linkedinUrl: linkedinUrl || '',
                portfolioUrl: portfolioUrl || '',
                // Education & Experience (use empty arrays instead of undefined)
                education: educationData,
                experience: experienceData,
                // Status
                onboardingCompleted: true,
                hasSetupSchedule: true,
                // Preferences
                preferences: {
                    ...(userProfile?.preferences || {}),
                    // Job search preferences (auto-populated from degree careers)
                    targetRoles: roleTags || [],
                    workStyles: [workStyle || 'Hybrid'],
                    salary: targetSalary || 50000,
                    transportMode: transportMode || null, // null is OK, undefined is not
                    // Schedule preferences
                    weeklyJobSearchHours: weeklyHours || 5,
                    preferredSearchTimes: preferredTimes || []
                }
            };

            // Only add photoURL if it exists (Firestore rejects undefined)
            if (profilePic) {
                profileData.photoURL = profilePic;
            }

            await saveUserProfile(profileData);
            console.log('✅ Profile saved! Navigating to dashboard...');
            setRoute(NavRoute.DASHBOARD);
        } catch (error) {
            console.error('❌ Failed to complete onboarding:', error);
            alert('Failed to complete profile. Please try again.');
        }
    };


    // Main Render Structure
    return (
        <div className="min-h-screen bg-jalanea-50 bg-subtle-mesh flex flex-col relative overflow-hidden">

            {/* Top Navigation / Progress */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2 font-display font-bold text-xl text-jalanea-900">
                    <div className="w-8 h-8 rounded-lg bg-jalanea-900 flex items-center justify-center text-gold shadow-sm">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <span className="hidden sm:inline">Jalanea<span className="text-gold">Works</span></span>
                </div>

                {currentStep > STEPS.LOGIN && (
                    <button onClick={() => setRoute(NavRoute.HOME)} className="text-sm font-bold text-jalanea-400 hover:text-red-500 transition-colors">
                        Exit
                    </button>
                )}
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20">

                {currentStep === STEPS.LOGIN && renderLogin()}
                {currentStep === STEPS.INTRO && renderIntro()}

                {/* Wizard Steps */}
                {currentStep >= STEPS.PROFILE_BASICS && (
                    <div className="w-full max-w-4xl flex flex-col px-2 sm:px-0">

                        {/* Wizard Content Card - Responsive width and height */}
                        <Card variant="glass-light" className="p-4 sm:p-6 md:p-10 shadow-xl border-white/60 relative flex flex-col min-h-[450px] sm:min-h-[500px] md:min-h-[600px] overflow-hidden">
                            {renderProgressBar()}

                            <div className="flex-1 overflow-y-auto custom-scrollbar md:pr-2">
                                {currentStep === STEPS.PROFILE_BASICS && renderBasics()}
                                {currentStep === STEPS.PROFILE_EDUCATION && renderEducation()}
                                {currentStep === STEPS.PROFILE_EXPERIENCE && renderExperience()}
                                {currentStep === STEPS.PROFILE_CAREER_PATHS && renderCareerPaths()}
                                {currentStep === STEPS.PROFILE_PREFS && renderPrefs()}
                                {currentStep === STEPS.FAVORITE_JOBS && renderFavoriteJobs()}
                                {currentStep === STEPS.SETUP_SCHEDULE && renderScheduleSetup()}
                            </div>

                            {/* Wizard Footer / Navigation - Stack on mobile */}
                            <div className="pt-6 sm:pt-8 mt-4 border-t border-jalanea-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-0 shrink-0">
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    icon={<ChevronLeft size={18} />}
                                    className="text-jalanea-500 hover:text-jalanea-900 w-full sm:w-auto"
                                >
                                    Back
                                </Button>

                                {currentStep === STEPS.SETUP_SCHEDULE ? (
                                    <Button
                                        variant="primary"
                                        onClick={handleCompleteOnboarding}
                                        className="shadow-xl shadow-gold/20 animate-pulse w-full sm:w-auto"
                                        icon={<CheckCircle2 size={18} />}
                                    >
                                        Complete Profile
                                    </Button>
                                ) : currentStep === STEPS.FAVORITE_JOBS ? (
                                    <Button
                                        variant="primary"
                                        onClick={nextStep}
                                        icon={<ChevronRight size={18} />}
                                        disabled={savedJobsCount < 3}
                                        className={`w-full sm:w-auto ${savedJobsCount < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {savedJobsCount < 3 ? `Save ${3 - savedJobsCount} more` : 'Continue'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={nextStep}
                                        icon={<ChevronRight size={18} />}
                                        className="w-full sm:w-auto"
                                    >
                                        Next Step
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Background Visuals for Wizard */}
            {currentStep > STEPS.LOGIN && (
                <>
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-jalanea-900/5 rounded-full blur-[120px] pointer-events-none"></div>
                </>
            )}
        </div>
    );
};
