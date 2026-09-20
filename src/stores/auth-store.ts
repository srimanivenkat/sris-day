import { create } from 'zustand';
import { UserProfile } from '@/types';

interface AuthStore {
  user: UserProfile | null;
  isGuest: boolean;
  isLoading: boolean;
  
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  setGuestMode: () => void;
  setUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  const initUser = () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('sris_day_user');
    if (stored) {
      try {
        return JSON.parse(stored) as UserProfile;
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  const initGuest = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sris_day_guest') === 'true';
  };

  return {
    user: initUser(),
    isGuest: initGuest(),
    isLoading: false,
    
    signInWithGoogle: async () => {
      set({ isLoading: true });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const placeholderUser: UserProfile = {
        id: 'user_123',
        name: 'Demo User',
        email: 'demo@example.com',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
      };
      
      localStorage.setItem('sris_day_user', JSON.stringify(placeholderUser));
      localStorage.removeItem('sris_day_guest');
      
      set({ user: placeholderUser, isGuest: false, isLoading: false });
    },
    
    signOut: () => {
      localStorage.removeItem('sris_day_user');
      set({ user: null, isGuest: false });
    },
    
    setGuestMode: () => {
      localStorage.setItem('sris_day_guest', 'true');
      set({ isGuest: true });
    },
    
    setUser: (user) => {
      localStorage.setItem('sris_day_user', JSON.stringify(user));
      set({ user, isGuest: false });
    }
  };
});
