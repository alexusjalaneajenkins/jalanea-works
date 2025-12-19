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
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// User profile type matching what we save during onboarding
interface UserProfileData {
    fullName?: string;
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
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfileData | null;
    loading: boolean;
    profileLoading: boolean;
    signup: (email: string, password: string, name: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<UserCredential>;
    logout: () => Promise<void>;
    saveUserProfile: (data: Partial<UserProfileData>) => Promise<void>;
    refreshProfile: () => Promise<void>;
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
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

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
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
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

    const value = {
        currentUser,
        userProfile,
        loading,
        profileLoading,
        signup,
        login,
        loginWithGoogle,
        logout,
        saveUserProfile,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
