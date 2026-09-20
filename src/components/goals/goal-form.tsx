'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

export function GoalForm({ open, onOpenChange, goal, milestones = [] }: { open: boolean, onOpenChange: (open: boolean) => void, goal?: any, milestones?: any[] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [tempMilestones, setTempMilestones] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setTargetDate(goal.targetDate || '');
      setColor(goal.color || '#3b82f6');
      setTempMilestones(milestones.map(m => ({ id: m.id, title: m.title })));
    } else {
      setTitle('');
      setDescription('');
      setTargetDate('');
      setColor('#3b82f6');
      setTempMilestones([]);
    }
  }, [goal, milestones, open]);

  const handleAddMilestone = () => {
    setTempMilestones([...tempMilestones, { id: Date.now().toString(), title: '' }]);
  };

  const handleMilestoneChange = (id: string, newTitle: string) => {
    setTempMilestones(tempMilestones.map(m => m.id === id ? { ...m, title: newTitle } : m));
  };

  const handleRemoveMilestone = (id: string) => {
    setTempMilestones(tempMilestones.filter(m => m.id !== id));
  };

  const handleSave = () => {
    // Save logic here
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Learn React" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of your goal..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color Accent</Label>
              <div className="flex gap-2">
                <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 p-1" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label>Milestones</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {tempMilestones.map((m, index) => (
              <div key={m.id} className="flex items-center gap-2">
                <div className="flex flex-col justify-center text-xs text-muted-foreground w-4 text-center">
                  {index + 1}
                </div>
                <Input 
                  value={m.title} 
                  onChange={(e) => handleMilestoneChange(m.id, e.target.value)} 
                  placeholder="Milestone title..."
                  className="flex-1 h-9"
                />
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => handleRemoveMilestone(m.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {tempMilestones.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No milestones added yet.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
