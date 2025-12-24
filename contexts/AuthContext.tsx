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
    fullName?: string;
    displayName?: string;
    photoURL?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    education?: any[];
    experience?: any[];
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
    };
    onboardingCompleted?: boolean;
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
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfileData | null;
    userCredits: UserCredits | null;
    loading: boolean;
    profileLoading: boolean;
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // IMPORTANT: Clear previous user's data immediately to prevent cross-contamination
            // This ensures old profile/jobs don't briefly show when switching accounts
            setUserProfile(null);
            setUserCredits(null);
            setCurrentUser(user);

            if (user) {
                console.log('[Auth] User changed, loading profile for:', user.uid.slice(-8));
                await fetchUserProfile(user.uid);
                await fetchUserCredits(user);
            }
            setLoading(false);
        });

        return unsubscribe;
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

    // Save a job to user's saved jobs list
    const saveJob = async (job: Job) => {
        if (!auth.currentUser) {
            throw new Error("You must be signed in to save jobs.");
        }

        const savedJob: SavedJob = {
            id: `saved-${job.id}-${Date.now()}`,
            job: job,
            savedAt: new Date().toISOString(),
            status: 'saved',
        };

        try {
            const userRef = doc(db, "users", auth.currentUser.uid);

            // Get current saved jobs and add new one
            const currentSavedJobs = userProfile?.savedJobs || [];
            await setDoc(userRef, {
                savedJobs: [...currentSavedJobs, savedJob]
            }, { merge: true });

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
        refreshCredits
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
