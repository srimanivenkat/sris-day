// ============================================
// Common types shared across the application
// ============================================

/** Unique identifier type (UUID string) */
export type ID = string;

/** ISO date string (YYYY-MM-DD) */
export type DateString = string;

/** ISO datetime string */
export type DateTimeString = string;

/** Priority levels for tasks */
export type Priority = 'high' | 'medium' | 'low' | 'none';

/** Task completion status */
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

/** Recurring frequency options */
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

/** Habit frequency types */
export type HabitFrequency = 'daily' | 'weekly' | 'x_per_week';

/** Note types */
export type NoteType = 'note' | 'journal' | 'scratch';

/** Timer session types */
export type TimerSessionType = 'work' | 'short_break' | 'long_break';

/** Timer states */
export type TimerState = 'idle' | 'running' | 'paused';

/** Theme options */
export type Theme = 'dark' | 'light' | 'system';

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Base entity with timestamps */
export interface BaseEntity {
  id: ID;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

/** Tag/label for categorizing items */
export interface Tag extends BaseEntity {
  name: string;
  color: string;
}

/** App settings stored in IndexedDB */
export interface AppSettings {
  id: string;
  theme: Theme;
  sidebarCollapsed: boolean;
  pomodoroWorkDuration: number;      // minutes
  pomodoroShortBreak: number;        // minutes
  pomodoroLongBreak: number;         // minutes
  pomodoroSessionsBeforeLong: number;
  notificationsEnabled: boolean;
  dailySummaryTime: string;          // HH:mm format
  soundEnabled: boolean;
  googleConnected: boolean;
  lastSyncAt: DateTimeString | null;
}

/** Google user profile */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

/** Data export format */
export interface ExportData {
  version: string;
  exportedAt: DateTimeString;
  tasks: import('./task').Task[];
  taskLists: import('./task').TaskList[];
  habits: import('./habit').Habit[];
  habitLogs: import('./habit').HabitLog[];
  notes: import('./note').Note[];
  goals: import('./goal').Goal[];
  milestones: import('./goal').Milestone[];
  tags: Tag[];
  settings: AppSettings;
}
