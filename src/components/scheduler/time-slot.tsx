'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TimeSlotProps {
  time: string;
  date: string;
  tasks: any[];
  onClick: () => void;
}

export function TimeSlot({ time, date, tasks, onClick }: TimeSlotProps) {
  return (
    <div 
      className="absolute inset-0 hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {tasks.map(task => (
        <div 
          key={task.id}
          className="absolute left-2 right-4 rounded-md p-2 text-xs text-white shadow-sm overflow-hidden z-10"
          style={{ 
            backgroundColor: task.color || '#3b82f6',
            top: '2px',
            bottom: '2px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Open task details
          }}
        >
          <div className="font-medium truncate">{task.title}</div>
          <div className="opacity-90">{task.startTime} - {task.endTime}</div>
        </div>
      ))}
    </div>
  );
}
