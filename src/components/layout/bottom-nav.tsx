'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, CheckSquare, CalendarClock, Flame, 
  NotebookPen, Target, Timer, Calendar, Search, Settings 
} from 'lucide-react';
import { MOBILE_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  'layout-dashboard': LayoutDashboard,
  'check-square': CheckSquare,
  'calendar-clock': CalendarClock,
  'flame': Flame,
  'notebook-pen': NotebookPen,
  'target': Target,
  'timer': Timer,
  'calendar': Calendar,
  'search': Search,
  'settings': Settings
};

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-40 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} className="flex-1 h-full">
              <div className="flex flex-col items-center justify-center h-full space-y-1">
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
