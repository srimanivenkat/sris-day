'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TimeSlot } from '@/components/scheduler/time-slot';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DayView({ date }: { date: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // Mock load tasks for this date
    setTasks([
      { id: '1', title: 'Morning Workout', startTime: '07:00', endTime: '08:00', color: '#10b981' },
      { id: '2', title: 'Deep Work Session', startTime: '09:30', endTime: '11:30', color: '#3b82f6' },
      { id: '3', title: 'Team Sync', startTime: '14:00', endTime: '15:00', color: '#8b5cf6' },
    ]);
  }, [date]);

  useEffect(() => {
    // Scroll to 8 AM on mount
    if (scrollRef.current) {
      const rowHeight = 60; // 60px per half hour
      const offset = (8 - 6) * 2 * rowHeight;
      scrollRef.current.scrollTop = offset;
    }
  }, []);

  const hours = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to Midnight (24)

  const getCurrentTimePos = () => {
    const now = new Date();
    if (now.toISOString().split('T')[0] !== date) return null;
    
    const h = now.getHours();
    const m = now.getMinutes();
    
    if (h < 6) return null;
    
    const rowHeight = 60; // 60px per 30 mins
    const totalMinutes = (h - 6) * 60 + m;
    const pixels = (totalMinutes / 30) * rowHeight;
    
    return pixels;
  };

  const currentTimePos = getCurrentTimePos();

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 relative flex flex-col h-full">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="relative min-w-[500px]">
            {currentTimePos !== null && (
              <div 
                className="absolute left-16 right-0 border-t-2 border-red-500 z-10 flex items-center pointer-events-none"
                style={{ top: `${currentTimePos}px` }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
              </div>
            )}
            
            <div className="flex flex-col">
              {hours.map(hour => (
                <React.Fragment key={hour}>
                  <div className="flex relative group">
                    <div className="w-16 flex-shrink-0 text-right pr-4 py-2 text-sm text-muted-foreground border-r">
                      {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                    <div className="flex-1 h-[60px] border-b relative">
                      <TimeSlot 
                        time={`${hour.toString().padStart(2, '0')}:00`} 
                        date={date}
                        tasks={tasks.filter(t => t.startTime === `${hour.toString().padStart(2, '0')}:00`)}
                        onClick={() => {}}
                      />
                    </div>
                  </div>
                  <div className="flex relative group">
                    <div className="w-16 flex-shrink-0 border-r"></div>
                    <div className="flex-1 h-[60px] border-b border-dashed relative">
                      <TimeSlot 
                        time={`${hour.toString().padStart(2, '0')}:30`} 
                        date={date}
                        tasks={tasks.filter(t => t.startTime === `${hour.toString().padStart(2, '0')}:30`)}
                        onClick={() => {}}
                      />
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
      
      <div className="w-64 border-l bg-muted/10 p-4 overflow-y-auto hidden md:block">
        <h3 className="font-semibold mb-4">To Do Today</h3>
        <div className="space-y-2 text-sm text-muted-foreground text-center py-8">
          Tasks due today will appear here.
        </div>
      </div>
    </div>
  );
}
