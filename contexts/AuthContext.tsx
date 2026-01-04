import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    AuthError,
    UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { Job, SavedJob } from '../types';
import {
    UserCredits,
    getUserCredits,
    initializeUserCredits,
    deductCredits,
    hasEnoughCredits,
    isTrialExpired,
    CreditAction,
    getDefaultCredits,
    isOwnerEmail
} from '../services/creditsService';

// User profile type matching what we save during onboarding
interface UserProfileData {
    // Identity (Stage 1)
    fullName?: string;
    displayName?: string;
    name?: string;
    photoURL?: string;
    location?: string;
    commuteCoords?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;

    // Education & Skills (Stage 2)
    education?: any[];
    credentials?: any[];
    experience?: any[];
    skills?: {
        technical: string[];
        design: string[];
        soft: string[];
    };

    // Logistics (Stage 3)
    transport?: string[];
    commuteMethod?: string[];
    commuteTolerance?: 'local' | 'standard' | 'extended';
    commuteWillingness?: 'local' | 'standard' | 'extended';
    availability?: 'open' | 'weekdays' | 'weekends' | 'flexible' | 'limited';
    selectedDays?: string[];
    shiftPreference?: string[];

    // Salary & Budget (Stage 4)
    salaryMin?: number;
    salaryMax?: number;
    salaryTier?: string;
    budgetData?: {
        grossAnnual: number;
        netAnnual: number;
        monthlyGross: number;
        monthlyNet: number;
        housing: number;
        utilities: number;
        carPayment: number;
        carInsurance: number;
        food: number;
        wants: number;
        savings: number;
        housingPercent: number;
        utilitiesPercent: number;
        transportPercent: number;
        foodPercent: number;
        wantsPercent: number;
        savingsPercent: number;
        maxQualifyingRent: number;
    };

    // Reality & Challenges (Stage 5)
    realityContext?: string;
    realityChallenges?: string;
    selectedPrompts?: string[];

    // Legacy preferences (keep for compatibility)
    preferences?: {
        targetRoles?: string[];
        workStyles?: string[];
        learningStyle?: string;
        salary?: number;
        transportMode?: string;
    };
    logistics?: {
        isParent?: boolean;
        childCount?: number;
        employmentStatus?: string;
        transportMode?: string | string[];
        commuteTolerance?: 'local' | 'standard' | 'extended';
        availability?: 'open' | 'weekdays' | 'weekends' | 'flexible' | 'limited';
        selectedDays?: string[];
        shiftPreference?: string[];
        realityContext?: string;
        selectedPrompts?: string[];
        urgencyLevel?: 'emergency' | 'bridge' | 'career';
    };
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: string;
    updatedAt?: string;
    // Schedule and tasks (for persistence)
    scheduleBlocks?: any[];
    tasks?: any[];
    // Saved jobs for tracking applications
    savedJobs?: SavedJob[];
    // Enhanced onboarding flags
    hasSetupSchedule?: boolean;
    // Credits fields (merged from UserCredits)
    tier?: string;
    credits?: number;
    creditsUsedThisMonth?: number;
    monthlyCreditsLimit?: number;
    trialEndsAt?: Date | null;
    subscriptionStatus?: string | null;
    // New Financial Data
    targetSalaryRange?: {
        min: number;
        max: number;
    };
    monthlyBudgetEstimate?: {
        monthlyNet: number;
        maxRent: number;
        maxCarPayment: number;
    };
    // Power Hour Integration
    powerHour?: {
        scheduledTime: string; // "18:00"
        scheduledDays: string[]; // ["mon", "tue", "wed", "thu", "fri"]
        currentStreak: number;
        longestStreak: number;
        lastCompletedDate: string | null;
        totalPowerHours: number;
        dailyGoal: number;
    };
    // Networking Hour Integration
    networkingHour?: {
        scheduledDay: string; // "wednesday"
        scheduledTime: string; // "12:00"
        weeklyGoal: number; // 5
        currentWeekConnections: number;
        totalConnections: number;
        lastNetworkingDate: string | null;
    };
    // Work Schedule Import
    workSchedule?: {
        jobName?: string;
        shifts: Array<{
            day: string;        // "monday", "tuesday", etc.
            startTime: string;  // "09:00"
            endTime: string;    // "17:00"
        }>;
    };
    // Class Schedule Import
    classSchedule?: Array<{
        className: string;
        days: string[];       // ["monday", "wednesday"]
        startTime: string;
        endTime: string;
    }>;
    // Interview Prep Tracking
    interviewPrep?: {
        sessions: Array<{
            id: string;
            jobId: string;
            company: string;
            role: string;
            date: string;
            overallScore: number;
            questionsAnswered: number;
            strengths: string[];
            improvements: string[];
        }>;
        totalSessions: number;
        averageScore: number;
    };
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfileData | null;
    userCredits: UserCredits | null;
    loading: boolean;
    profileLoading: boolean;
    authWarning: string | null;
    signup: (email: string, password: string, name: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<UserCredential>;
    logout: () => Promise<void>;
    saveUserProfile: (data: Partial<UserProfileData>) => Promise<void>;
    refreshProfile: () => Promise<void>;
    // Job saving functions
    saveJob: (job: Job) => Promise<void>;
    removeJob: (jobId: string) => Promise<void>;
    isJobSaved: (jobId: string) => boolean;
    // Credits functions
    useCredit: (action: CreditAction) => Promise<{ success: boolean; error?: string }>;
    canUseCredits: (action: CreditAction) => boolean;
    isTrialActive: () => boolean;
    refreshCredits: () => Promise<void>;
    // Auth helpers
    dismissAuthWarning: () => void;
    resetSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [authWarning, setAuthWarning] = useState<string | null>(null);

    // Fetch user credits from Firestore
    const fetchUserCredits = async (user: User) => {
        try {
            let credits = await getUserCredits(user.uid);

            // Sync Owner Status Logic
            // If user is an owner but Firestore doesn't say so, update it.
            if (user.email && isOwnerEmail(user.email)) {
                if (credits?.tier !== 'owner') {
                    console.log("👑 Syncing owner status for:", user.email);
                    const ownerUpdate = {
                        tier: 'owner',
                        credits: Infinity,
                        monthlyCreditsLimit: Infinity
                    };
                    await setDoc(doc(db, 'users', user.uid), ownerUpdate, { merge: true });

                    // Merge local credits with update
                    if (credits) {
                        credits = { ...credits, ...ownerUpdate } as UserCredits;
                    } else {
                        // If no credits existed, we'll initialize below but let's just set it now
                        credits = {
                            ...getDefaultCredits(),
                            ...ownerUpdate
                        } as UserCredits;
                        // The next block handles initialization if null, but we just handled it partially.
                        // Actually, let's let the sync happen.
                    }
                }
            }

            if (!credits) {
                // Initialize credits for new user
                console.log('[Credits] Initializing credits for new user:', user.uid.slice(-8));
                credits = await initializeUserCredits(user.uid);
                // Re-check owner status for new users
                if (user.email && isOwnerEmail(user.email)) {
                    const ownerUpdate = {
                        tier: 'owner',
                        credits: Infinity,
                        monthlyCreditsLimit: Infinity
                    };
                    await setDoc(doc(db, 'users', user.uid), ownerUpdate, { merge: true });
                    credits = { ...credits, ...ownerUpdate } as UserCredits;
                }
            } else if (isNaN(credits.credits) || credits.credits === null || credits.credits === undefined) {
                // Auto-repair corrupted credits (NaN bug)
                console.log('[Credits] Repairing corrupted credits for user:', user.uid.slice(-8));
                credits = await initializeUserCredits(user.uid);
            }
            setUserCredits(credits);
        } catch (error) {
            console.error("Error fetching user credits:", error);
        }
    };

    // Refresh credits manually
    const refreshCredits = async () => {
        if (auth.currentUser) {
            await fetchUserCredits(auth.currentUser);
        }
    };
    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid: string) => {
        try {
            setProfileLoading(true);
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfileData);
            } else {
                setUserProfile(null);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
        } finally {
            setProfileLoading(false);
        }
    };

    // Refresh profile manually (useful after saving)
    const refreshProfile = async () => {
        if (auth.currentUser) {
            await fetchUserProfile(auth.currentUser.uid);
        }
    };

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        // Safety timeout: If Firebase doesn't respond in 10 seconds, treat as logged out
        // This prevents infinite loading screen on mobile if Firebase fails
        timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn('[Auth] Firebase auth timeout - treating as logged out');
                setCurrentUser(null);
                setUserProfile(null);
                setUserCredits(null);
                setLoading(false);
                setAuthWarning('Sign-in took too long. Please try again.');
            }
        }, 10000);

        try {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (!mounted) return;

                // Clear timeout since Firebase responded
                clearTimeout(timeoutId);

                // IMPORTANT: Clear previous user's data immediately to prevent cross-contamination
                // This ensures old profile/jobs don't briefly show when switching accounts
                setUserProfile(null);
                setUserCredits(null);
                setCurrentUser(user);
                setAuthWarning(null);

                if (user) {
                    console.log('[Auth] User changed, loading profile for:', user.uid.slice(-8));
                    await fetchUserProfile(user.uid);
                    await fetchUserCredits(user);
                }
                setLoading(false);
            });

            return () => {
                mounted = false;
                clearTimeout(timeoutId);
                unsubscribe();
            };
        } catch (error) {
            console.error('[Auth] Firebase initialization error:', error);
            if (mounted) {
                setCurrentUser(null);
                setLoading(false);
                setAuthWarning('Failed to connect to sign-in service. Please try again.');
            }
            return () => {
                mounted = false;
                clearTimeout(timeoutId);
            };
        }
    }, []);

    // Real-time listener for profile updates
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = onSnapshot(
            doc(db, "users", currentUser.uid),
            (doc) => {
                if (doc.exists()) {
                    setUserProfile(doc.data() as UserProfileData);
                }
            },
            (error) => {
                console.error("Profile listener error:", error);
            }
        );

        return unsubscribe;
    }, [currentUser]);

    const signup = async (email: string, password: string, name: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update the user's display name immediately
            await updateProfile(userCredential.user, {
                displayName: name
            });
        } catch (error) {
            console.error("Signup Error", error);
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    };

    const logout = async () => {
        setUserProfile(null);
        await signOut(auth);
    };

    // Dismiss the auth warning banner
    const dismissAuthWarning = () => {
        setAuthWarning(null);
    };

    // Reset sign-in by clearing ONLY Firebase auth persistence (not all IndexedDB)
    const resetSignIn = async () => {
        try {
            // Sign out first to clear auth state
            await signOut(auth);

            // Clear only Firebase auth IndexedDB databases
            const firebaseAuthDbs = [
                'firebaseLocalStorageDb',
                'firebase-heartbeat-database'
            ];

            await Promise.all(
                firebaseAuthDbs.map(dbName =>
                    new Promise<void>((resolve) => {
                        const req = indexedDB.deleteDatabase(dbName);
                        req.onsuccess = () => {
                            console.log(`[Auth] Cleared ${dbName}`);
                            resolve();
                        };
                        req.onerror = () => {
                            console.warn(`[Auth] Failed to clear ${dbName}`);
                            resolve(); // Continue even if one fails
                        };
                    })
                )
            );

            setAuthWarning(null);
            // Reload to reinitialize Firebase
            window.location.reload();
        } catch (error) {
            console.error('[Auth] Reset sign-in error:', error);
        }
    };

    const saveUserProfile = async (data: Partial<UserProfileData>) => {
        if (!auth.currentUser) {
            throw new Error("You must be signed in to save your profile. Please sign in with Google first.");
        }
        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), data, { merge: true });
            console.log("Profile saved successfully for user:", auth.currentUser.uid);
            // Profile will be updated via the real-time listener
        } catch (error) {
            console.error("Error saving user profile:", error);
            throw error;
        }
    };

    // Helper to remove undefined values from an object (Firebase doesn't accept undefined)
    const cleanObject = <T extends Record<string, any>>(obj: T): T => {
        const cleaned = {} as T;
        for (const key in obj) {
            if (obj[key] !== undefined) {
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    cleaned[key] = cleanObject(obj[key]);
                } else {
                    cleaned[key] = obj[key];
                }
            }
        }
        return cleaned;
    };

    // Save a job to user's saved jobs list
    const saveJob = async (job: Job) => {
        if (!auth.currentUser) {
            throw new Error("You must be signed in to save jobs.");
        }

        // Clean the job object to remove undefined values (Firebase arrayUnion doesn't accept them)
        const cleanedJob = cleanObject(job);

        const savedJob: SavedJob = {
            id: `saved-${job.id}-${Date.now()}`,
            job: cleanedJob,
            savedAt: new Date().toISOString(),
            status: 'saved',
        };

        try {
            const userRef = doc(db, "users", auth.currentUser.uid);

            // Use arrayUnion for atomic update - this prevents race conditions
            // when multiple jobs are saved quickly in succession
            await updateDoc(userRef, {
                savedJobs: arrayUnion(savedJob)
            });

            console.log("Job saved:", job.title);
        } catch (error) {
            console.error("Error saving job:", error);
            throw error;
        }
    };

    // Remove a job from user's saved jobs list
    const removeJob = async (jobId: string) => {
        if (!auth.currentUser || !userProfile?.savedJobs) {
            return;
        }

        const jobToRemove = userProfile.savedJobs.find(sj => sj.job.id === jobId);
        if (!jobToRemove) return;

        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                savedJobs: arrayRemove(jobToRemove)
            });
            console.log("Job removed:", jobId);
        } catch (error) {
            console.error("Error removing job:", error);
            throw error;
        }
    };

    // Check if a job is saved
    const isJobSaved = (jobId: string): boolean => {
        return userProfile?.savedJobs?.some(sj => sj.job.id === jobId) || false;
    };

    // Use credits for an action
    const useCredit = async (action: CreditAction): Promise<{ success: boolean; error?: string }> => {
        if (!auth.currentUser) {
            return { success: false, error: 'Not logged in' };
        }

        // Owner gets free pass
        if (isOwnerEmail(auth.currentUser.email)) {
            return { success: true };
        }

        const result = await deductCredits(auth.currentUser.uid, action);

        if (result.success) {
            // Update local state
            await refreshCredits();
        }

        return { success: result.success, error: result.error };
    };

    // Check if user can use credits for an action
    const canUseCredits = (action: CreditAction): boolean => {
        // Owner always can
        if (isOwnerEmail(auth.currentUser?.email)) return true;
        if (!userCredits) return false;
        return hasEnoughCredits(userCredits, action);
    };

    // Check if trial is still active
    const isTrialActive = (): boolean => {
        // Owner is always active
        if (isOwnerEmail(auth.currentUser?.email)) return true;
        if (!userCredits) return false;
        if (userCredits.subscriptionStatus === 'active') return true;
        return !isTrialExpired(userCredits);
    };

    const value = {
        currentUser,
        userProfile,
        userCredits,
        loading,
        profileLoading,
        authWarning,
        signup,
        login,
        loginWithGoogle,
        logout,
        saveUserProfile,
        refreshProfile,
        saveJob,
        removeJob,
        isJobSaved,
        useCredit,
        canUseCredits,
        isTrialActive,
        refreshCredits,
        dismissAuthWarning,
        resetSignIn
    };

    // Show loading indicator while checking auth state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFC425] to-[#FFD768] flex items-center justify-center shadow-lg animate-pulse mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                </div>
                <div className="w-8 h-8 border-2 border-[#FFC425] border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm mt-4">Loading...</p>
            </div>
        );
    }

    // No longer blocking on auth errors - render children and let them show warning banner
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
