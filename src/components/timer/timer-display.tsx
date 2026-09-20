'use client';

import React from 'react';
import { TimerState, TimerSessionType } from '@/app/timer/page';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TimerDisplayProps {
  timeRemaining: number;
  totalTime: number;
  state: TimerState;
  sessionType: TimerSessionType;
}

export function TimerDisplay({ timeRemaining, totalTime, state, sessionType }: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClass = 
    sessionType === 'work' ? 'text-primary stroke-primary' : 
    sessionType === 'shortBreak' ? 'text-green-500 stroke-green-500' : 
    'text-blue-500 stroke-blue-500';

  const label = 
    sessionType === 'work' ? 'Focus' : 
    sessionType === 'shortBreak' ? 'Short Break' : 
    'Long Break';

  return (
    <div className="relative flex items-center justify-center w-[300px] h-[300px]">
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 300 300">
        {/* Background circle */}
        <circle
          cx="150"
          cy="150"
          r={radius}
          className="stroke-muted"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="150"
          cy="150"
          r={radius}
          className={cn("transition-all duration-1000 ease-linear", colorClass)}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
        />
      </svg>
      
      <div className={cn("absolute flex flex-col items-center justify-center text-center", state === 'running' && "animate-pulse-slow")}>
        <div className="text-6xl font-bold tracking-tighter tabular-nums">
          {formatTime(timeRemaining)}
        </div>
        <div className={cn("mt-2 text-lg font-medium uppercase tracking-widest", colorClass.split(' ')[0])}>
          {label}
        </div>
      </div>
    </div>
  );
}
