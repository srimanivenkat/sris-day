'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TimerConfig } from '@/app/timer/page';

interface TimerSettingsProps {
  config: TimerConfig;
  onChange: (config: Partial<TimerConfig>) => void;
}

export function TimerSettings({ config, onChange }: TimerSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Focus Duration</Label>
            <span className="text-sm text-muted-foreground">{config.workDuration} min</span>
          </div>
          <Slider 
            value={[config.workDuration]} 
            min={15} max={60} step={1}
            onValueChange={([val]) => onChange({ workDuration: val })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Short Break</Label>
            <span className="text-sm text-muted-foreground">{config.shortBreakDuration} min</span>
          </div>
          <Slider 
            value={[config.shortBreakDuration]} 
            min={3} max={15} step={1}
            onValueChange={([val]) => onChange({ shortBreakDuration: val })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Long Break</Label>
            <span className="text-sm text-muted-foreground">{config.longBreakDuration} min</span>
          </div>
          <Slider 
            value={[config.longBreakDuration]} 
            min={10} max={30} step={1}
            onValueChange={([val]) => onChange({ longBreakDuration: val })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Sessions before Long Break</Label>
            <span className="text-sm text-muted-foreground">{config.sessionsBeforeLongBreak}</span>
          </div>
          <Slider 
            value={[config.sessionsBeforeLongBreak]} 
            min={2} max={6} step={1}
            onValueChange={([val]) => onChange({ sessionsBeforeLongBreak: val })}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Label htmlFor="sound">Enable Sound</Label>
          <Switch 
            id="sound" 
            checked={config.soundEnabled} 
            onCheckedChange={(val) => onChange({ soundEnabled: val })} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
