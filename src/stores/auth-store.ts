import { create } from 'zustand';
import { UserProfile } from '@/types';
import { 
  signInWithGoogle as googleSignIn, 
  signOutGoogle, 
  getSavedProfile, 
  initGoogleAuth,
  isAuthenticated
} from '@/lib/google-auth';

interface AuthStore {
  user: UserProfile | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  setGuestMode: () => void;
  setUser: (user: UserProfile) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const savedProfile = typeof window !== 'undefined' ? getSavedProfile() : null;
  const isAuth = typeof window !== 'undefined' ? isAuthenticated() : false;
  const guestFlag = typeof window !== 'undefined' ? localStorage.getItem('sris_day_guest') === 'true' : false;

  return {
    user: savedProfile || (isAuth ? null : null),
    isGuest: !savedProfile && guestFlag,
    isLoading: false,
    error: null,
    
    initAuth: async () => {
      try {
        await initGoogleAuth();
        const profile = getSavedProfile();
        if (profile) {
          set({ user: profile, isGuest: false });
        }
      } catch (e: any) {
        console.error('Failed to initialize Google Auth:', e);
      }
    },
    
    signInWithGoogle: async () => {
      set({ isLoading: true, error: null });
      try {
        await initGoogleAuth();
        const profile = await googleSignIn();
        set({ user: profile, isGuest: false, isLoading: false });
        localStorage.removeItem('sris_day_guest');
      } catch (error: any) {
        console.error('Google sign in error:', error);
        set({ 
          isLoading: false, 
          error: error?.message || 'Google sign-in failed. Please check your Google Client ID.' 
        });
        throw error;
      }
    },
    
    signOut: () => {
      signOutGoogle();
      localStorage.removeItem('sris_day_guest');
      set({ user: null, isGuest: true });
    },
    
    setGuestMode: () => {
      localStorage.setItem('sris_day_guest', 'true');
      set({ isGuest: true, user: null });
    },
    
    setUser: (user) => {
      localStorage.setItem('user_profile', JSON.stringify(user));
      set({ user, isGuest: false });
    }
  };
});
