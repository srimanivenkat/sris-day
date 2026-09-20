'use client';

import { LayoutDashboard, CheckSquare, CalendarClock, Flame, NotebookPen, Target, Timer, Calendar, Search, Settings, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  'settings': Settings,
  'inbox': Inbox
};

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({ 
  icon = 'inbox', 
  title, 
  description, 
  actionLabel, 
  onAction,
  className
}: EmptyStateProps) {
  const Icon = iconMap[icon] || Inbox;

  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 min-h-[300px]", className)}>
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
