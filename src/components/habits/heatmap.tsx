'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapProps {
  logs: any[];
}

export function Heatmap({ logs }: HeatmapProps) {
  // Generate last 365 days
  const days = useMemo(() => {
    const today = new Date();
    const pastYear = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    const result = [];
    for (let d = new Date(pastYear); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const completions = logs.filter(l => l.date === dateStr && l.completed).length;
      let level = 0;
      if (completions === 1) level = 1;
      else if (completions === 2) level = 2;
      else if (completions >= 3) level = 3;
      
      result.push({
        date: dateStr,
        level,
        count: completions
      });
    }
    return result;
  }, [logs]);

  // Group into weeks
  const weeks = useMemo(() => {
    const w = [];
    let currentWeek = [];
    for (const day of days) {
      currentWeek.push(day);
      if (new Date(day.date).getDay() === 0 || currentWeek.length === 7) {
        w.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) w.push(currentWeek);
    return w;
  }, [days]);

  const getColor = (level: number) => {
    switch(level) {
      case 1: return 'bg-emerald-200 dark:bg-emerald-900';
      case 2: return 'bg-emerald-400 dark:bg-emerald-700';
      case 3: return 'bg-emerald-600 dark:bg-emerald-500';
      case 4: return 'bg-emerald-800 dark:bg-emerald-400';
      default: return 'bg-muted/50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex gap-[2px]">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-[2px]">
                {week.map((day, j) => (
                  <div 
                    key={j}
                    title={`${day.count} habits on ${day.date}`}
                    className={`w-3 h-3 rounded-sm ${getColor(day.level)} hover:ring-1 hover:ring-primary transition-all`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
