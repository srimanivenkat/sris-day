// ============================================
// Task & TaskList type definitions
// ============================================
import { BaseEntity, ID, Priority, TaskStatus, RecurringFrequency, DateString, DateTimeString } from './common';

/** A task list / project that contains tasks */
export interface TaskList extends BaseEntity {
  name: string;
  color: string;
  icon: string;        // Lucide icon name
  order: number;       // For drag & drop reordering
  isDefault: boolean;  // "Inbox" is the default list
}

/** Recurring task configuration */
export interface RecurringConfig {
  frequency: RecurringFrequency;
  interval: number;        // Every N days/weeks/months
  daysOfWeek?: number[];   // 0=Sun, 1=Mon, etc. (for weekly)
  dayOfMonth?: number;     // (for monthly)
  endDate?: DateString;    // Optional end date
}

/** A single task item */
export interface Task extends BaseEntity {
  listId: ID;              // Which task list this belongs to
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: DateString | null;
  dueTime: string | null;   // HH:mm format
  tags: string[];            // Tag IDs
  parentId: ID | null;       // For subtasks (null = top-level)
  order: number;             // Position in list for drag & drop
  recurring: RecurringConfig | null;
  completedAt: DateTimeString | null;
  goalId: ID | null;         // Linked goal (optional)
  scheduledStart: DateTimeString | null;  // For scheduler time slots
  scheduledEnd: DateTimeString | null;
}

/** Task filter options */
export interface TaskFilter {
  listId?: ID;
  status?: TaskStatus;
  priority?: Priority;
  tagIds?: string[];
  dueBefore?: DateString;
  dueAfter?: DateString;
  search?: string;
}

/** Task sort options */
export interface TaskSort {
  field: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'order';
  direction: 'asc' | 'desc';
}
