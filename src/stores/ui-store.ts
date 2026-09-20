import { create } from 'zustand';
import { Theme } from '@/types';

interface UIStore {
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  searchOpen: boolean;
  newTaskOpen: boolean;
  newNoteOpen: boolean;
  
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setNewTaskOpen: (open: boolean) => void;
  setNewNoteOpen: (open: boolean) => void;
  initTheme: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  theme: 'system',
  sidebarCollapsed: false,
  sidebarOpen: false,
  searchOpen: false,
  newTaskOpen: false,
  newNoteOpen: false,
  
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sris_day_theme', theme);
    }
    set({ theme });
    
    if (typeof document !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }
  },
  
  toggleSidebar: () => {
    set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
  
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
  
  setSearchOpen: (open) => {
    set({ searchOpen: open });
  },
  
  setNewTaskOpen: (open) => {
    set({ newTaskOpen: open });
  },
  
  setNewNoteOpen: (open) => {
    set({ newNoteOpen: open });
  },
  
  initTheme: () => {
    if (typeof window === 'undefined') return;
    
    const storedTheme = (localStorage.getItem('sris_day_theme') as Theme) || 'system';
    get().setTheme(storedTheme);
  },

  // Alias for compatibility
  setIsSearchOpen: (open: boolean) => {
    set({ searchOpen: open });
  },
}));

// Alias export for components that use camelCase naming
export const useUiStore = useUIStore;
