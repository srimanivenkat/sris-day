import { create } from 'zustand';

interface SyncStore {
  isSyncing: boolean;
  lastSyncAt: string | null;
  syncError: string | null;
  
  syncToGoogleDrive: () => Promise<void>;
  syncFromGoogleDrive: () => Promise<void>;
  setLastSync: (timestamp: string) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  isSyncing: false,
  lastSyncAt: typeof window !== 'undefined' ? localStorage.getItem('sris_day_last_sync') : null,
  syncError: null,
  
  syncToGoogleDrive: async () => {
    set({ isSyncing: true, syncError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const now = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('sris_day_last_sync', now);
      }
      
      set({ isSyncing: false, lastSyncAt: now });
    } catch (error: any) {
      set({ 
        isSyncing: false, 
        syncError: error.message || 'Failed to sync to Google Drive' 
      });
    }
  },
  
  syncFromGoogleDrive: async () => {
    set({ isSyncing: true, syncError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const now = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('sris_day_last_sync', now);
      }
      
      set({ isSyncing: false, lastSyncAt: now });
    } catch (error: any) {
      set({ 
        isSyncing: false, 
        syncError: error.message || 'Failed to sync from Google Drive' 
      });
    }
  },
  
  setLastSync: (timestamp) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sris_day_last_sync', timestamp);
    }
    set({ lastSyncAt: timestamp });
  }
}));
