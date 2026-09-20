// ============================================
// Goal & Milestone type definitions
// ============================================
import { BaseEntity, ID, DateString } from './common';

/** A goal with milestones and progress tracking */
export interface Goal extends BaseEntity {
  title: string;
  description: string;
  targetDate: DateString;
  progress: number;            // 0-100 percentage
  linkedTaskIds: ID[];         // Tasks contributing to this goal
  linkedHabitIds: ID[];        // Habits contributing to this goal
  isCompleted: boolean;
  completedAt: string | null;
  color: string;
  order: number;
}

/** A milestone within a goal */
export interface Milestone extends BaseEntity {
  goalId: ID;
  title: string;
  isCompleted: boolean;
  completedAt: string | null;
  order: number;
}
