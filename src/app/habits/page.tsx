'use client';

import { useState, useEffect, useMemo } from 'react';
import { useHabitStore } from '@/stores/habit-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { HabitCard } from '@/components/habits/habit-card';
import { HabitForm } from '@/components/habits/habit-form';
import { Heatmap } from '@/components/habits/heatmap';
import { HabitStats } from '@/components/habits/habit-stats';
import { today } from '@/lib/db';
import { Progress } from '@/components/ui/progress';

export default function HabitsPage() {
  const { habits, habitLogs: logs, loadHabits, loadLogs } = useHabitStore();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadHabits();
    loadLogs();
  }, [loadHabits, loadLogs]);

  const todayStr = today();
  
  const todayLogs = useMemo(() => logs.filter(log => log.date === todayStr && log.completed), [logs, todayStr]);
  const completedTodayCount = todayLogs.length;
  
  // Actually, we need to know how many habits are supposed to be done today. For simplicity, we count all habits.
  // In a more advanced version, we'd check habit frequency.
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? (completedTodayCount / totalHabits) * 100 : 0;

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Habits</h1>
          <p className="text-muted-foreground">Track your daily routines</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Habit
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Today's Progress</p>
              <p className="text-2xl font-bold">
                {completedTodayCount} <span className="text-lg font-normal text-muted-foreground">of {totalHabits} completed</span>
              </p>
            </div>
            <p className="text-sm font-medium">{Math.round(progressPercent)}%</p>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => {
          const isCompletedToday = logs.some(l => l.habitId === habit.id && l.date === todayStr && l.completed);
          // Calculate streak simply for now (just checking how many consecutive days from today)
          let streak = 0;
          let currentDate = new Date(todayStr);
          while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (logs.some(l => l.habitId === habit.id && l.date === dateStr && l.completed)) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else {
              break;
            }
          }
          return (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              isCompletedToday={isCompletedToday} 
              streak={streak} 
            />
          );
        })}
        {habits.length === 0 && (
          <div className="col-span-full py-12 text-center border rounded-lg border-dashed text-muted-foreground">
            No habits yet. Click "Add Habit" to get started!
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-semibold">Activity</h2>
        <Heatmap logs={logs} />
        
        <h2 className="text-2xl font-semibold mt-8">Weekly Stats</h2>
        <HabitStats logs={logs} habits={habits} />
      </div>

      <HabitForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
