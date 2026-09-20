'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { TimerState } from '@/app/timer/page';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({ state, onStart, onPause, onResume, onReset, onSkip }: TimerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-12 w-12 rounded-full" 
        onClick={onReset}
        disabled={state === 'idle'}
      >
        <RotateCcw className="h-5 w-5" />
      </Button>

      {state === 'running' ? (
        <Button 
          size="icon" 
          className="h-16 w-16 rounded-full" 
          onClick={onPause}
        >
          <Pause className="h-8 w-8 fill-current" />
        </Button>
      ) : (
        <Button 
          size="icon" 
          className="h-16 w-16 rounded-full" 
          onClick={state === 'paused' ? onResume : onStart}
        >
          <Play className="h-8 w-8 fill-current ml-1" />
        </Button>
      )}

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-12 w-12 rounded-full" 
        onClick={onSkip}
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}
