// ============================================
// Timer / Pomodoro type definitions
// ============================================
import { BaseEntity, ID, TimerSessionType, DateTimeString } from './common';

/** A completed Pomodoro session */
export interface TimerSession extends BaseEntity {
  taskId: ID | null;          // Task being worked on (optional)
  type: TimerSessionType;     // 'work' | 'short_break' | 'long_break'
  duration: number;           // Planned duration in seconds
  actualDuration: number;     // Actual duration in seconds
  completedAt: DateTimeString;
  startTime: string;          // ISO timestamp of session start
  endTime: string;            // ISO timestamp of session end
}

/** Current timer state (not persisted, in Zustand only) */
export interface TimerConfig {
  workDuration: number;        // seconds (not minutes) for internal use
  shortBreakDuration: number;  // seconds
  longBreakDuration: number;   // seconds
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
}
