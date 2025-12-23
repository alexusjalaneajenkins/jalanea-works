import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { ResumeType } from '../types';

export interface SavedResume {
    id?: string;
    userId: string;
    title: string; // e.g., "Software Engineer @ Disney"
    type: ResumeType;
    content: string; // Markdown content
    jobDescription?: string;
    targetRole?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RESUMES_COLLECTION = 'resumes';

/**
 * Save a new resume or update an existing one
 */
export const saveResume = async (userId: string, resumeData: Partial<SavedResume>, resumeId?: string): Promise<string> => {
    try {
        const userResumesRef = collection(db, 'users', userId, RESUMES_COLLECTION);

        const dataToSave = {
            ...resumeData,
            userId,
            updatedAt: serverTimestamp(),
        };

        if (resumeId) {
            // Update existing
            const docRef = doc(userResumesRef, resumeId);
            await updateDoc(docRef, dataToSave);
            return resumeId;
        } else {
            // Create new
            const newDoc = await addDoc(userResumesRef, {
                ...dataToSave,
                createdAt: serverTimestamp(),
            });
            return newDoc.id;
        }
    } catch (error) {
        console.error("Error saving resume:", error);
        throw error;
    }
};

/**
 * Get all resumes for a user
 */
export const getUserResumes = async (userId: string): Promise<SavedResume[]> => {
    try {
        const q = query(
            collection(db, 'users', userId, RESUMES_COLLECTION),
            orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
            updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
        })) as SavedResume[];
    } catch (error) {
        console.error("Error fetching resumes:", error);
        throw error;
    }
};

/**
 * Get a single resume by ID
 */
export const getResume = async (userId: string, resumeId: string): Promise<SavedResume | null> => {
    try {
        const docRef = doc(db, 'users', userId, RESUMES_COLLECTION, resumeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: (docSnap.data().createdAt as Timestamp)?.toDate(),
                updatedAt: (docSnap.data().updatedAt as Timestamp)?.toDate(),
            } as SavedResume;
        }
        return null;
    } catch (error) {
        console.error("Error fetching resume:", error);
        throw error;
    }
};

/**
 * Delete a resume
 */
export const deleteResume = async (userId: string, resumeId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'users', userId, RESUMES_COLLECTION, resumeId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting resume:", error);
        throw error;
    }
};
