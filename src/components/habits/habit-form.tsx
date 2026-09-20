'use client';

import { useState, useEffect } from 'react';
import { useHabitStore } from '@/stores/habit-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#d946ef', '#ec4899', '#f43f5e'
];

const ICONS = [
  'Activity', 'Book', 'Coffee', 'Dumbbell', 'Heart', 'Moon', 
  'Music', 'Star', 'Sun', 'Target', 'Zap', 'Flame', 'Droplets', 'Brain'
];

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: any;
}

export function HabitForm({ open, onOpenChange, habit }: HabitFormProps) {
  const { addHabit, updateHabit } = useHabitStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setDescription(habit.description || '');
      setFrequency(habit.frequency || 'daily');
      setColor(habit.color || COLOR_PALETTE[0]);
      setIcon(habit.icon || ICONS[0]);
    } else {
      setName('');
      setDescription('');
      setFrequency('daily');
      setColor(COLOR_PALETTE[0]);
      setIcon(ICONS[0]);
    }
  }, [habit, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    
    const habitData = { name, description, frequency: frequency as any, color, icon };
    
    if (habit) {
      await updateHabit(habit.id, habitData);
    } else {
      await addHabit(habitData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Read 10 pages" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description (Optional)</Label>
            <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Why do you want to do this?" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="freq">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="freq">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="weekly">Every week</SelectItem>
                <SelectItem value="weekdays">Weekdays</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  className={cn("w-6 h-6 rounded-full cursor-pointer ring-offset-2 transition-all", color === c ? "ring-2 ring-ring scale-110" : "")}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Icon</Label>
            <ScrollArea className="h-[120px] w-full rounded-md border p-2">
              <div className="grid grid-cols-7 gap-2">
                {ICONS.map(i => {
                  const Icon = (LucideIcons as any)[i];
                  return (
                    <Button
                      key={i}
                      type="button"
                      variant={icon === i ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIcon(i)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
