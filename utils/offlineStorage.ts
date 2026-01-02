/**
 * Offline Storage Utility
 * Uses IndexedDB for persistent offline storage with background sync support
 */

const DB_NAME = 'jalanea-works-offline';
const DB_VERSION = 1;

// Store names
const STORES = {
  PENDING_APPLICATIONS: 'pending-applications',
  SAVED_JOBS: 'saved-jobs',
  USER_DATA: 'user-data',
  CACHE_META: 'cache-meta',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

// Open database connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains(STORES.PENDING_APPLICATIONS)) {
        const store = db.createObjectStore(STORES.PENDING_APPLICATIONS, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SAVED_JOBS)) {
        const store = db.createObjectStore(STORES.SAVED_JOBS, { keyPath: 'id' });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.CACHE_META)) {
        db.createObjectStore(STORES.CACHE_META, { keyPath: 'key' });
      }
    };
  });
}

// Generic CRUD operations
async function add<T extends { id: string }>(storeName: StoreName, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function put<T extends { id: string }>(storeName: StoreName, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function get<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function remove(storeName: StoreName, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function clear(storeName: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Pending Applications (for background sync)
export interface PendingApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export const pendingApplications = {
  add: async (application: Omit<PendingApplication, 'timestamp' | 'retryCount' | 'status'>) => {
    const item: PendingApplication = {
      ...application,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
    };
    await add(STORES.PENDING_APPLICATIONS, item);

    // Register for background sync if available
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      try {
        await (registration as any).sync.register('sync-job-applications');
        console.log('[Offline] Background sync registered for applications');
      } catch (error) {
        console.warn('[Offline] Background sync not available:', error);
      }
    }

    return item;
  },

  getAll: () => getAll<PendingApplication>(STORES.PENDING_APPLICATIONS),

  getPending: async () => {
    const all = await getAll<PendingApplication>(STORES.PENDING_APPLICATIONS);
    return all.filter((app) => app.status === 'pending' || app.status === 'failed');
  },

  updateStatus: async (id: string, status: PendingApplication['status']) => {
    const item = await get<PendingApplication>(STORES.PENDING_APPLICATIONS, id);
    if (item) {
      item.status = status;
      if (status === 'failed') {
        item.retryCount += 1;
      }
      await put(STORES.PENDING_APPLICATIONS, item);
    }
  },

  remove: (id: string) => remove(STORES.PENDING_APPLICATIONS, id),

  clear: () => clear(STORES.PENDING_APPLICATIONS),
};

// Saved Jobs (offline cache)
export interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description?: string;
  matchScore?: number;
  savedAt: string;
  tags: string[];
}

export const savedJobs = {
  add: async (job: Omit<SavedJob, 'savedAt'>) => {
    const item: SavedJob = {
      ...job,
      savedAt: new Date().toISOString(),
    };
    await put(STORES.SAVED_JOBS, item);
    return item;
  },

  getAll: () => getAll<SavedJob>(STORES.SAVED_JOBS),

  get: (id: string) => get<SavedJob>(STORES.SAVED_JOBS, id),

  remove: (id: string) => remove(STORES.SAVED_JOBS, id),

  clear: () => clear(STORES.SAVED_JOBS),
};

// User Data (offline cache for profile)
export const userData = {
  set: async (key: string, value: unknown) => {
    await put(STORES.USER_DATA, { id: key, key, value, updatedAt: Date.now() });
  },

  get: async <T>(key: string): Promise<T | undefined> => {
    const result = await get<{ value: T }>(STORES.USER_DATA, key);
    return result?.value;
  },

  remove: (key: string) => remove(STORES.USER_DATA, key),

  clear: () => clear(STORES.USER_DATA),
};

// Cache metadata
export const cacheMeta = {
  setLastSync: async (key: string) => {
    await put(STORES.CACHE_META, { id: key, key, lastSync: Date.now() });
  },

  getLastSync: async (key: string): Promise<number | undefined> => {
    const result = await get<{ lastSync: number }>(STORES.CACHE_META, key);
    return result?.lastSync;
  },

  isStale: async (key: string, maxAge: number): Promise<boolean> => {
    const lastSync = await cacheMeta.getLastSync(key);
    if (!lastSync) return true;
    return Date.now() - lastSync > maxAge;
  },
};

// Check if IndexedDB is available
export function isOfflineStorageAvailable(): boolean {
  try {
    return 'indexedDB' in window && indexedDB !== null;
  } catch {
    return false;
  }
}

// Export store names for direct access if needed
export { STORES };
