'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

interface TimerStatsProps {
  sessionsCompleted: number;
  totalFocusTime: number; // in minutes
}

export function TimerStats({ sessionsCompleted, totalFocusTime }: TimerStatsProps) {
  const hours = Math.floor(totalFocusTime / 60);
  const minutes = totalFocusTime % 60;
  
  const formattedTime = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Sessions Today</p>
            <p className="text-2xl font-bold">{sessionsCompleted}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Focus Time</p>
            <p className="text-2xl font-bold">{formattedTime}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
