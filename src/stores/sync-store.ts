import { create } from 'zustand';
import { 
  syncToGoogleDrive as uploadToDrive, 
  syncFromGoogleDrive as downloadFromDrive 
} from '@/lib/google-drive';

interface SyncStore {
  isSyncing: boolean;
  lastSyncAt: string | null;
  syncError: string | null;
  syncSuccess: string | null;
  
  syncToGoogleDrive: () => Promise<void>;
  syncFromGoogleDrive: () => Promise<void>;
  setLastSync: (timestamp: string) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  isSyncing: false,
  lastSyncAt: typeof window !== 'undefined' ? localStorage.getItem('sris_day_last_sync') : null,
  syncError: null,
  syncSuccess: null,
  
  syncToGoogleDrive: async () => {
    set({ isSyncing: true, syncError: null, syncSuccess: null });
    
    try {
      await uploadToDrive();
      
      const now = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('sris_day_last_sync', now);
      }
      
      set({ 
        isSyncing: false, 
        lastSyncAt: now,
        syncSuccess: 'Successfully backed up to Google Drive!' 
      });
    } catch (error: any) {
      console.error('Drive upload error:', error);
      set({ 
        isSyncing: false, 
        syncError: error?.message || 'Failed to sync to Google Drive. Please make sure you are signed in.' 
      });
    }
  },
  
  syncFromGoogleDrive: async () => {
    set({ isSyncing: true, syncError: null, syncSuccess: null });
    
    try {
      const restored = await downloadFromDrive();
      
      if (!restored) {
        set({ 
          isSyncing: false, 
          syncError: 'No previous backup found on Google Drive.' 
        });
        return;
      }
      
      const now = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('sris_day_last_sync', now);
      }
      
      set({ 
        isSyncing: false, 
        lastSyncAt: now,
        syncSuccess: 'Data successfully restored from Google Drive! Reloading...' 
      });
      
      // Reload page to refresh all stores from restored IndexedDB
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (error: any) {
      console.error('Drive download error:', error);
      set({ 
        isSyncing: false, 
        syncError: error?.message || 'Failed to restore from Google Drive. Please make sure you are signed in.' 
      });
    }
  },
  
  setLastSync: (timestamp: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sris_day_last_sync', timestamp);
    }
    set({ lastSyncAt: timestamp });
  }
}));
