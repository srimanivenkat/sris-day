"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/stores/task-store";
import { useHabitStore } from "@/stores/habit-store";
import { useTimerStore } from "@/stores/timer-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import StatCard from "@/components/dashboard/stat-card";
import WeeklyChart from "@/components/dashboard/weekly-chart";
import { Plus, Play, CheckCircle2, PenSquare, Calendar, Flame, Timer, CheckSquare, ListTodo } from "lucide-react";
import { format, subDays, isSameDay } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const router = useRouter();
  const { loadTasks, loadTaskLists, getTasksDueToday, toggleTask, tasks } = useTaskStore();
  const { loadHabits, loadLogs, getTodayProgress, habits, habitLogs, getStreak } = useHabitStore();
  const { loadTodaySessions, getTodayFocusTime } = useTimerStore();
  const { setNewTaskOpen } = useUiStore();

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    loadTasks();
    loadTaskLists();
    loadHabits();
    loadLogs();
    loadTodaySessions();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, [loadTasks, loadTaskLists, loadHabits, loadLogs, loadTodaySessions]);

  const tasksDueToday = getTasksDueToday();
  const habitProgress = getTodayProgress();
  const focusTime = getTodayFocusTime();

  // Calculate best streak across all habits
  let bestStreak = 0;
  habits.forEach(h => {
    const streak = getStreak(h.id);
    if (streak > bestStreak) bestStreak = streak;
  });

  // Calculate weekly activity (tasks completed per day for last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
  const weeklyData = last7Days.map(day => {
    const count = tasks.filter(t => t.status === 'completed' && t.completedAt && isSameDay(new Date(t.completedAt), day)).length;
    return {
      day: format(day, 'EEE'),
      count
    };
  });

  // Upcoming deadlines
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const formatFocusTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{greeting}, Sri!</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={() => setNewTaskOpen(true)} className="h-16 flex flex-col items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          <span>Add Task</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/timer')} className="h-16 flex flex-col items-center justify-center gap-2">
          <Play className="h-5 w-5" />
          <span>Start Timer</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/habits')} className="h-16 flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>Log Habit</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/notes')} className="h-16 flex flex-col items-center justify-center gap-2">
          <PenSquare className="h-5 w-5" />
          <span>Quick Note</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Today's Tasks
              </CardTitle>
              <Button variant="link" size="sm" onClick={() => router.push('/tasks')}>View all</Button>
            </CardHeader>
            <CardContent>
              {tasksDueToday.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No tasks due today. Enjoy your day!</p>
              ) : (
                <ul className="space-y-3">
                  {tasksDueToday.slice(0, 5).map(task => (
                    <li key={task.id} className="flex items-center gap-3">
                      <Checkbox 
                        checked={task.status === 'completed'} 
                        onCheckedChange={() => toggleTask(task.id)} 
                      />
                      <span className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      {task.priority === 'high' && <div className="w-2 h-2 rounded-full bg-red-500 ml-auto" />}
                      {task.priority === 'medium' && <div className="w-2 h-2 rounded-full bg-yellow-500 ml-auto" />}
                      {task.priority === 'low' && <div className="w-2 h-2 rounded-full bg-green-500 ml-auto" />}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No upcoming deadlines.</p>
              ) : (
                <ul className="space-y-4">
                  {upcomingTasks.map(task => (
                    <li key={task.id} className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{task.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Flame className="h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Best Streak</p>
                  <p className="text-3xl font-bold">{bestStreak}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Timer className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Focus Time</p>
                  <p className="text-3xl font-bold">{formatFocusTime(focusTime)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Habit Progress
              </CardTitle>
              <CardDescription>Today's completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm font-medium">{habitProgress.completed} / {habitProgress.total}</span>
                  </div>
                  <Progress value={habitProgress.total === 0 ? 0 : (habitProgress.completed / habitProgress.total) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyChart data={weeklyData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
