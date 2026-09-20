'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, CheckSquare, CalendarClock, Flame, 
  NotebookPen, Target, Timer, Calendar, Search, Settings, 
  Sun, ChevronLeft, ChevronRight, User
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen fixed left-0 top-0 border-r bg-card z-40"
    >
      <div className="flex items-center h-14 px-4 border-b">
        <Sun className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="ml-2 font-bold text-lg whitespace-nowrap"
          >
            Sri's Day
          </motion.span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer group",
                  isActive ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center px-0 border-l-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
                {!collapsed && (
                  <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium leading-none truncate">Guest User</span>
              <span className="text-xs text-muted-foreground mt-1 truncate">Free Plan</span>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("w-full shrink-0", collapsed ? "px-0" : "")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
