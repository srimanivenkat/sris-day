'use client';

import { useState } from 'react';
import { useHabitStore } from '@/stores/habit-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HabitForm } from './habit-form';
import { motion } from 'framer-motion';
import { today } from '@/lib/db';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  targetCount?: number;
  color?: string;
  icon?: string;
}

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  streak: number;
}

export function HabitCard({ habit, isCompletedToday, streak }: HabitCardProps) {
  const { toggleHabit, deleteHabit } = useHabitStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleToggle = async () => {
    await toggleHabit(habit.id, today());
  };

  const IconComponent = habit.icon && (LucideIcons as any)[habit.icon] ? (LucideIcons as any)[habit.icon] : LucideIcons.Activity;

  return (
    <>
      <Card className="relative overflow-hidden group">
        <div 
          className="absolute top-0 left-0 w-full h-1" 
          style={{ backgroundColor: habit.color || 'var(--primary)' }} 
        />
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg truncate">{habit.name}</h3>
            </div>
            {habit.description && (
              <p className="text-sm text-muted-foreground truncate mb-2">{habit.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-sm font-medium">
                🔥 {streak} day streak
              </div>
              <div className="text-xs text-muted-foreground">
                {habit.frequency}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => deleteHabit(habit.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggle}
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                isCompletedToday 
                  ? "border-transparent text-white shadow-md" 
                  : "border-muted hover:border-primary/50 text-transparent"
              )}
              style={isCompletedToday ? { backgroundColor: habit.color || 'var(--primary)' } : {}}
            >
              <motion.div
                initial={false}
                animate={{ scale: isCompletedToday ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="h-7 w-7" />
              </motion.div>
            </motion.button>
          </div>
        </CardContent>
      </Card>
      
      <HabitForm open={isEditOpen} onOpenChange={setIsEditOpen} habit={habit as any} />
    </>
  );
}
