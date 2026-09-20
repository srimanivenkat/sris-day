'use client';

// ============================================
// Calendar Page
// ============================================
// Monthly calendar view showing tasks and events

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '@/stores/task-store';
import { cn, toDateString, formatDate } from '@/lib/utils';
import { MONTHS, DAYS_SHORT } from '@/lib/constants';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    toDateString(new Date())
  );
  const { tasks, loadTasks } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding (fill to 42 = 6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  // Tasks grouped by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    tasks.forEach((task) => {
      if (task.dueDate) {
        const existing = map.get(task.dueDate) || [];
        existing.push(task);
        map.set(task.dueDate, existing);
      }
    });
    return map;
  }, [tasks]);

  // Selected date tasks
  const selectedTasks = selectedDate ? tasksByDate.get(selectedDate) || [] : [];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(toDateString(new Date()));
  };

  const todayStr = toDateString(new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            View your tasks and events at a glance
          </p>
        </div>
        <Button onClick={goToToday} variant="outline" size="sm">
          Today
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg">
                {MONTHS[month]} {year}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_SHORT.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, isCurrentMonth }, i) => {
                const dateStr = toDateString(date);
                const dayTasks = tasksByDate.get(dateStr) || [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      'relative p-2 h-16 md:h-20 rounded-lg text-sm transition-all text-left',
                      isCurrentMonth
                        ? 'hover:bg-accent'
                        : 'text-muted-foreground/40',
                      isToday && 'bg-primary/10 font-bold',
                      isSelected && 'ring-2 ring-primary bg-primary/5'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs',
                        isToday && 'text-primary font-bold'
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className="text-[10px] truncate px-1 py-0.5 rounded bg-primary/20 text-primary"
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate ? formatDate(selectedDate) : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks for this date</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'p-3 rounded-lg border bg-card',
                      task.status === 'completed' && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            task.priority === 'high'
                              ? '#ef4444'
                              : task.priority === 'medium'
                              ? '#eab308'
                              : task.priority === 'low'
                              ? '#22c55e'
                              : '#6b7280',
                        }}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          task.status === 'completed' && 'line-through'
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.dueTime && (
                      <span className="text-xs text-muted-foreground ml-4">
                        {task.dueTime}
                      </span>
                    )}
                    <div className="flex gap-1 mt-1 ml-4">
                      <Badge variant="outline" className="text-[10px]">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full mt-4" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
