'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface HabitStatsProps {
  logs: any[];
  habits: any[];
}

export function HabitStats({ logs, habits }: HabitStatsProps) {
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = logs.filter(l => l.date === dateStr && l.completed).length;
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: count
      });
    }
    return data;
  }, [logs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Last 7 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.6 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.6 }}
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}
              />
              <Bar 
                dataKey="completed" 
                fill="var(--primary)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
