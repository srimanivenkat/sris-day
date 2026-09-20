'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Menu, Cloud, LogIn, LogOut, Upload, Download, Settings, User } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import ThemeToggle from './theme-toggle';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSyncStore } from '@/stores/sync-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const setIsSearchOpen = useUIStore((state) => state.setIsSearchOpen);
  const { user, isGuest, signInWithGoogle, signOut } = useAuthStore();
  const { syncToGoogleDrive, syncFromGoogleDrive, isSyncing } = useSyncStore();
  
  // Find current route label
  const currentItem = NAV_ITEMS.find(item => item.href === pathname);
  const title = currentItem ? currentItem.label : 'Sri\'s Day';

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      router.push('/settings');
    }
  };

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push('/settings')}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} title="Search (Ctrl+K)">
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>
        <ThemeToggle />

        {/* User Account / Google Sign-in Dropdown */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-1 p-0 ring-1 ring-primary/20">
                <Avatar className="h-8 w-8">
                  {user.picture ? (
                    <AvatarImage src={user.picture} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={syncToGoogleDrive} disabled={isSyncing} className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4 text-blue-500" />
                <span>{isSyncing ? 'Syncing...' : 'Backup to Google Drive'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={syncFromGoogleDrive} disabled={isSyncing} className="cursor-pointer">
                <Download className="mr-2 h-4 w-4 text-green-500" />
                <span>Restore from Drive</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignIn} 
            className="h-8 gap-1.5 ml-1 text-xs border-primary/30 text-primary hover:bg-primary/10"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}
