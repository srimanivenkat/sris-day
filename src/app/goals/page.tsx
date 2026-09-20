'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalForm } from '@/components/goals/goal-form';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | undefined>(undefined);
  
  // Mock load
  useEffect(() => {
    // In a real app, load from store/db
    setGoals([
      { id: '1', title: 'Learn React', description: 'Master React and Next.js', targetDate: '2026-12-31', color: '#3b82f6', status: 'active' },
      { id: '2', title: 'Run a marathon', description: 'Complete a full marathon', targetDate: '2027-04-15', color: '#10b981', status: 'active' }
    ]);
    setMilestones([
      { id: 'm1', goalId: '1', title: 'Learn hooks', completed: true, order: 1 },
      { id: 'm2', goalId: '1', title: 'Build a project', completed: false, order: 2 },
    ]);
  }, []);

  const handleAddGoal = () => {
    setEditingGoal(undefined);
    setIsFormOpen(true);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Goals</h1>
        <Button onClick={handleAddGoal}>
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Goals</h2>
        {activeGoals.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
            No active goals. Add one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                milestones={milestones.filter(m => m.goalId === goal.id)} 
              />
            ))}
          </div>
        )}
      </div>

      {completedGoals.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-xl font-semibold">Completed Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                milestones={milestones.filter(m => m.goalId === goal.id)} 
              />
            ))}
          </div>
        </div>
      )}

      <GoalForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        goal={editingGoal}
        milestones={editingGoal ? milestones.filter(m => m.goalId === editingGoal.id) : []}
      />
    </div>
  );
}
