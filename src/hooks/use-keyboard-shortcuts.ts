'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';

export function useKeyboardShortcuts() {
  const { setIsSearchOpen } = useUIStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Cmd+K or Ctrl+K for search
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setIsSearchOpen]);
}
