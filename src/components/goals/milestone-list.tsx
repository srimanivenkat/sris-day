'use client';

import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MilestoneList({ goalId, milestones: initialMilestones }: { goalId: string, milestones: any[] }) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [newTitle, setNewTitle] = useState('');

  const toggleMilestone = (id: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    ));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setMilestones([
      ...milestones, 
      { id: Date.now().toString(), goalId, title: newTitle.trim(), completed: false, order: milestones.length + 1 }
    ]);
    setNewTitle('');
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-1">No milestones yet.</p>
        ) : (
          milestones.map(milestone => (
            <div key={milestone.id} className="flex items-start gap-2 group">
              <Checkbox 
                id={`m-${milestone.id}`} 
                checked={milestone.completed} 
                onCheckedChange={() => toggleMilestone(milestone.id)}
                className="mt-1"
              />
              <label 
                htmlFor={`m-${milestone.id}`}
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pt-1 cursor-pointer select-none",
                  milestone.completed && "line-through text-muted-foreground"
                )}
              >
                {milestone.title}
              </label>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleAdd} className="flex gap-2 items-center mt-2">
        <Input 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder="Add a milestone..." 
          className="h-8 text-sm"
        />
        <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
