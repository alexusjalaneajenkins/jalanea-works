/**
 * Vault Store - Zustand store for managing user's application vault
 *
 * Storage: IndexedDB via Dexie (ApplyCoPilotDB.vault table)
 * Persistence: Offline-first, survives refresh/restart
 */

import { create } from 'zustand';
import type {
  ApplicationVault,
  WorkHistoryItem,
  EducationItem,
} from '../types';
import { createEmptyVault, generateId } from '../types';
import { db, DEFAULT_VAULT_ID } from '../db';

// Dev-only logging (stripped in production builds)
const isDev = import.meta.env.DEV;
const log = (...args: unknown[]) => isDev && console.log('[vault-store]', ...args);
const logError = (...args: unknown[]) => console.error('[vault-store]', ...args);

/**
 * Ensure database is open before operations
 */
async function ensureDbOpen(): Promise<void> {
  if (!db.isOpen()) {
    log('DB not open, opening...');
    await db.open();
    log('DB opened successfully');
  }
}

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
    log('loadVault called');
    set({ isLoading: true, error: null });
    try {
      // Ensure DB is open before querying
      await ensureDbOpen();

      log('Loading vault from IndexedDB...');
      let vault = await db.vault.get(DEFAULT_VAULT_ID);

      if (!vault) {
        log('No vault found, creating default...');
        vault = { ...createEmptyVault(), id: DEFAULT_VAULT_ID };
        await db.vault.add(vault);
        log('Default vault created');
      } else {
        log('Vault loaded:', vault.firstName || '(empty)', vault.lastName || '(empty)');
      }

      set({ vault, isLoading: false });
      log('Vault state updated');
    } catch (error) {
      logError('loadVault FAILED:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load vault',
        isLoading: false,
      });
    }
  },

  updateVault: async (updates) => {
    log('updateVault called with keys:', Object.keys(updates).join(', '));
    const { vault } = get();

    if (!vault) {
      logError('updateVault: No vault in state! Cannot save.');
      return;
    }

    const updatedVault: ApplicationVault = {
      ...vault,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Ensure DB is open before writing
      await ensureDbOpen();

      log('Saving vault to IndexedDB...');
      await db.vault.put(updatedVault);
      log('Vault saved successfully:', updatedVault.firstName, updatedVault.lastName);

      set({ vault: updatedVault, error: null });
    } catch (error) {
      logError('updateVault FAILED:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update vault';
      set({ error: errorMsg });
      // Re-throw so caller can handle (e.g., show toast)
      throw error;
    }
  },

  resetVault: async () => {
    log('resetVault called');
    try {
      await ensureDbOpen();

      const newVault = { ...createEmptyVault(), id: DEFAULT_VAULT_ID };
      await db.vault.put(newVault);
      set({ vault: newVault, error: null });
      log('Vault reset complete');
    } catch (error) {
      logError('resetVault FAILED:', error);
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
