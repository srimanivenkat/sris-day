'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function WeekView({ weekStart }: { weekStart: string }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getDates = () => {
    const dates = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = getDates();
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b">
        <div className="w-16 flex-shrink-0 border-r"></div>
        {dates.map((date, i) => (
          <div 
            key={i} 
            className={`flex-1 text-center py-2 border-r last:border-r-0 ${isToday(date) ? 'bg-primary/10' : ''}`}
          >
            <div className={`text-sm font-medium ${isToday(date) ? 'text-primary' : 'text-muted-foreground'}`}>
              {days[i]}
            </div>
            <div className={`text-xl ${isToday(date) ? 'font-bold text-primary' : ''}`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="flex flex-col min-w-[700px]">
          {hours.map(hour => (
            <div key={hour} className="flex">
              <div className="w-16 flex-shrink-0 text-right pr-2 py-2 text-xs text-muted-foreground border-r border-b">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {dates.map((date, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-16 border-r border-b last:border-r-0 p-1 hover:bg-muted/30 cursor-pointer ${isToday(date) ? 'bg-primary/5' : ''}`}
                >
                  {/* Task blocks would go here */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
