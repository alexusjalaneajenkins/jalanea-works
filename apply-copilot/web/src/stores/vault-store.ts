'use client';

import { create } from 'zustand';
import type {
  ApplicationVault,
  WorkHistoryItem,
  EducationItem,
} from '@apply-copilot/shared';
import { createEmptyVault } from '@apply-copilot/shared';
import { db, DEFAULT_VAULT_ID, generateId } from '@/lib/db';

interface VaultState {
  vault: ApplicationVault | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadVault: () => Promise<void>;
  updateVault: (updates: Partial<ApplicationVault>) => Promise<void>;
  resetVault: () => Promise<void>;

  // Work History
  addWorkHistory: (item: Omit<WorkHistoryItem, 'id'>) => Promise<void>;
  updateWorkHistory: (id: string, updates: Partial<WorkHistoryItem>) => Promise<void>;
  removeWorkHistory: (id: string) => Promise<void>;

  // Education
  addEducation: (item: Omit<EducationItem, 'id'>) => Promise<void>;
  updateEducation: (id: string, updates: Partial<EducationItem>) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vault: null,
  isLoading: true,
  error: null,

  loadVault: async () => {
    set({ isLoading: true, error: null });
    try {
      let vault = await db.vault.get(DEFAULT_VAULT_ID);
      if (!vault) {
        // Create default vault
        vault = { ...createEmptyVault(), id: DEFAULT_VAULT_ID };
        await db.vault.add(vault);
      }
      set({ vault, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load vault',
        isLoading: false,
      });
    }
  },

  updateVault: async (updates) => {
    const { vault } = get();
    if (!vault) return;

    const updatedVault: ApplicationVault = {
      ...vault,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.vault.put(updatedVault);
      set({ vault: updatedVault });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update vault',
      });
    }
  },

  resetVault: async () => {
    try {
      const newVault = { ...createEmptyVault(), id: DEFAULT_VAULT_ID };
      await db.vault.put(newVault);
      set({ vault: newVault });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reset vault',
      });
    }
  },

  // Work History
  addWorkHistory: async (item) => {
    const { vault, updateVault } = get();
    if (!vault) return;

    const newItem: WorkHistoryItem = { ...item, id: generateId() };
    await updateVault({
      workHistory: [...vault.workHistory, newItem],
    });
  },

  updateWorkHistory: async (id, updates) => {
    const { vault, updateVault } = get();
    if (!vault) return;

    await updateVault({
      workHistory: vault.workHistory.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  },

  removeWorkHistory: async (id) => {
    const { vault, updateVault } = get();
    if (!vault) return;

    await updateVault({
      workHistory: vault.workHistory.filter((item) => item.id !== id),
    });
  },

  // Education
  addEducation: async (item) => {
    const { vault, updateVault } = get();
    if (!vault) return;

    const newItem: EducationItem = { ...item, id: generateId() };
    await updateVault({
      education: [...vault.education, newItem],
    });
  },

  updateEducation: async (id, updates) => {
    const { vault, updateVault } = get();
    if (!vault) return;

    await updateVault({
      education: vault.education.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  },

  removeEducation: async (id) => {
    const { vault, updateVault } = get();
    if (!vault) return;

    await updateVault({
      education: vault.education.filter((item) => item.id !== id),
    });
  },
}));
