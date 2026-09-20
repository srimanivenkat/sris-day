'use client';

import React, { useState, useEffect } from 'react';
import { TimerDisplay } from '@/components/timer/timer-display';
import { TimerControls } from '@/components/timer/timer-controls';
import { TimerSettings } from '@/components/timer/timer-settings';
import { TimerStats } from '@/components/timer/timer-stats';
import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TimerState = 'idle' | 'running' | 'paused';
export type TimerSessionType = 'work' | 'shortBreak' | 'longBreak';

export interface TimerConfig {
  workDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
}

export default function TimerPage() {
  const [config, setConfig] = useState<TimerConfig>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    soundEnabled: true
  });

  const [state, setState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<TimerSessionType>('work');
  const [timeRemaining, setTimeRemaining] = useState(config.workDuration * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const totalTimeForSession = 
    sessionType === 'work' ? config.workDuration * 60 : 
    sessionType === 'shortBreak' ? config.shortBreakDuration * 60 : 
    config.longBreakDuration * 60;

  useEffect(() => {
    if (state === 'idle') {
      setTimeRemaining(totalTimeForSession);
    }
  }, [sessionType, config, state, totalTimeForSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (state === 'running' && timeRemaining === 0) {
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [state, timeRemaining]);

  const handleSessionEnd = () => {
    if (config.soundEnabled) {
      // Play sound
    }
    
    if (sessionType === 'work') {
      const newCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newCompleted);
      
      if (newCompleted % config.sessionsBeforeLongBreak === 0) {
        setSessionType('longBreak');
      } else {
        setSessionType('shortBreak');
      }
    } else {
      setSessionType('work');
    }
    setState('idle');
  };

  const handleStart = () => setState('running');
  const handlePause = () => setState('paused');
  const handleResume = () => setState('running');
  const handleReset = () => {
    setState('idle');
    setTimeRemaining(totalTimeForSession);
  };
  const handleSkip = () => handleSessionEnd();

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Focus Timer</h1>
        <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6 flex flex-col items-center">
          <Card className="w-full p-8 flex flex-col items-center justify-center space-y-8 bg-card/50 backdrop-blur">
            <TimerDisplay 
              timeRemaining={timeRemaining} 
              totalTime={totalTimeForSession} 
              state={state} 
              sessionType={sessionType} 
            />
            
            <div className="text-muted-foreground font-medium">
              Session {sessionsCompleted % config.sessionsBeforeLongBreak + 1} of {config.sessionsBeforeLongBreak}
            </div>

            <TimerControls 
              state={state}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
              onSkip={handleSkip}
            />
          </Card>
          
          <div className="w-full">
            <TimerStats 
              sessionsCompleted={sessionsCompleted} 
              totalFocusTime={sessionsCompleted * config.workDuration} 
            />
          </div>
        </div>

        {showSettings && (
          <div className="md:col-span-1">
            <TimerSettings config={config} onChange={(c) => setConfig({ ...config, ...c })} />
          </div>
        )}
      </div>
    </div>
  );
}
