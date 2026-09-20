// ============================================
// Habit & HabitLog type definitions
// ============================================
import { BaseEntity, ID, HabitFrequency, DateString, DateTimeString } from './common';

/** A habit to track */
export interface Habit extends BaseEntity {
  name: string;
  description: string;
  frequency: HabitFrequency;
  targetCount: number;        // How many times per period (e.g., 3x per week)
  color: string;              // Display color
  icon: string;               // Lucide icon name
  reminderTime: string | null; // HH:mm format
  isArchived: boolean;
  goalId: ID | null;          // Linked goal (optional)
  order: number;              // Display order
}

/** A single habit completion log entry */
export interface HabitLog {
  id: ID;
  habitId: ID;
  date: DateString;           // YYYY-MM-DD
  completed: boolean;
  count: number;              // For habits with targetCount > 1
  completedAt: DateTimeString;
}

/** Computed habit statistics */
export interface HabitStats {
  habitId: ID;
  currentStreak: number;      // Current consecutive days
  longestStreak: number;      // All-time longest streak
  totalCompletions: number;   // Total times completed
  weeklyRate: number;         // % completion this week
  monthlyRate: number;        // % completion this month
  bestDayOfWeek: number;      // 0-6, day with highest completion rate
}

/** Heatmap data point for the contribution calendar */
export interface HeatmapDay {
  date: DateString;
  count: number;              // Number of habits completed
  level: 0 | 1 | 2 | 3 | 4;  // Intensity level (0=none, 4=max)
}
