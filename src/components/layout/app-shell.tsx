'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { initializeDatabase } from '@/lib/db';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import Sidebar from './sidebar';
import Header from './header';
import BottomNav from './bottom-nav';
import { FullPageLoader } from '@/components/shared/loading';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [dbReady, setDbReady] = useState(false);
  const { theme } = useUIStore();
  useKeyboardShortcuts();

  useEffect(() => {
    // Initialize Database
    const initDb = async () => {
      try {
        await initializeDatabase();
        await useAuthStore.getState().initAuth();
        setDbReady(true);
      } catch (error) {
        console.error("Failed to initialize database or auth:", error);
        setDbReady(true);
      }
    };
    initDb();
  }, []);

  useEffect(() => {
    // Sync theme with document class
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  if (!dbReady) {
    return <FullPageLoader />;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 w-full">
          <Header />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative w-full">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </TooltipProvider>
  );
}
