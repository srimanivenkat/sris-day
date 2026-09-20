'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, Menu } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import ThemeToggle from './theme-toggle';
import { useUIStore } from '@/stores/ui-store';

export default function Header() {
  const pathname = usePathname();
  const setIsSearchOpen = useUIStore((state) => state.setIsSearchOpen);
  
  // Find current route label
  const currentItem = NAV_ITEMS.find(item => item.href === pathname);
  const title = currentItem ? currentItem.label : 'Sri\'s Day';

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
