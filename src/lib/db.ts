// ============================================
// Dexie.js Database Schema
// ============================================
// IndexedDB wrapper for offline-first local storage.
// All data is stored locally and optionally synced to Google Drive.

import Dexie, { type Table } from 'dexie';
import type { Task, TaskList } from '@/types/task';
import type { Habit, HabitLog } from '@/types/habit';
import type { Note } from '@/types/note';
import type { Goal, Milestone } from '@/types/goal';
import type { TimerSession } from '@/types/timer';
import type { Tag, AppSettings } from '@/types/common';

/**
 * Sri's Day Database
 * 
 * Uses Dexie.js to provide a clean API over IndexedDB.
 * Schema indexes are defined for efficient querying.
 * The '++' prefix means auto-increment, '&' means unique.
 */
export class SrisDayDB extends Dexie {
  // Table declarations for TypeScript
  tasks!: Table<Task>;
  taskLists!: Table<TaskList>;
  habits!: Table<Habit>;
  habitLogs!: Table<HabitLog>;
  notes!: Table<Note>;
  goals!: Table<Goal>;
  milestones!: Table<Milestone>;
  timerSessions!: Table<TimerSession>;
  tags!: Table<Tag>;
  settings!: Table<AppSettings>;

  constructor() {
    super('SrisDayDB');

    // Database schema version 1
    this.version(1).stores({
      // Tasks: indexed by listId, status, priority, dueDate, parentId for subtask queries
      tasks: 'id, listId, status, priority, dueDate, parentId, goalId, order, createdAt, updatedAt',
      
      // Task Lists: ordered, with unique names
      taskLists: 'id, &name, order',
      
      // Habits: ordered, with archive filter
      habits: 'id, isArchived, goalId, order',
      
      // Habit Logs: indexed by habitId + date for daily lookups
      habitLogs: 'id, habitId, date, [habitId+date]',
      
      // Notes: searchable by type, date, pinned status
      notes: 'id, type, date, isPinned, isArchived, createdAt',
      
      // Goals: ordered, completion filter
      goals: 'id, isCompleted, targetDate, order',
      
      // Milestones: grouped by goal
      milestones: 'id, goalId, order',
      
      // Timer Sessions: by date and task
      timerSessions: 'id, taskId, type, completedAt',
      
      // Tags: unique names
      tags: 'id, &name',
      
      // Settings: single row
      settings: 'id',
    });
  }
}

// Singleton database instance
export const db = new SrisDayDB();

/**
 * Generate a unique ID using crypto.randomUUID() with fallback
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current ISO datetime string
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Initialize the database with default settings and demo data
 * Called once when the app first loads
 */
export async function initializeDatabase(): Promise<void> {
  // Check if settings already exist (app has been initialized before)
  const existingSettings = await db.settings.get('default');
  if (existingSettings) return;

  // Create default settings
  const defaultSettings: AppSettings = {
    id: 'default',
    theme: 'dark',
    sidebarCollapsed: false,
    pomodoroWorkDuration: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    pomodoroSessionsBeforeLong: 4,
    notificationsEnabled: false,
    dailySummaryTime: '09:00',
    soundEnabled: true,
    googleConnected: false,
    lastSyncAt: null,
  };
  await db.settings.put(defaultSettings);

  // Create default task list (Inbox)
  const inboxId = generateId();
  await db.taskLists.put({
    id: inboxId,
    name: 'Inbox',
    color: '#6366f1',
    icon: 'inbox',
    order: 0,
    isDefault: true,
    createdAt: now(),
    updatedAt: now(),
  });

  // Create "Work" and "Personal" task lists
  const workListId = generateId();
  const personalListId = generateId();
  await db.taskLists.bulkPut([
    {
      id: workListId,
      name: 'Work',
      color: '#3b82f6',
      icon: 'briefcase',
      order: 1,
      isDefault: false,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: personalListId,
      name: 'Personal',
      color: '#10b981',
      icon: 'user',
      order: 2,
      isDefault: false,
      createdAt: now(),
      updatedAt: now(),
    },
  ]);

  // Create default tags
  await db.tags.bulkPut([
    { id: generateId(), name: 'Important', color: '#ef4444', createdAt: now(), updatedAt: now() },
    { id: generateId(), name: 'Quick Win', color: '#22c55e', createdAt: now(), updatedAt: now() },
    { id: generateId(), name: 'Idea', color: '#a855f7', createdAt: now(), updatedAt: now() },
    { id: generateId(), name: 'Learning', color: '#3b82f6', createdAt: now(), updatedAt: now() },
  ]);

  // Create demo tasks
  const todayStr = today();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeek = nextWeekDate.toISOString().split('T')[0];

  const demoTask1 = generateId();
  await db.tasks.bulkPut([
    {
      id: demoTask1,
      listId: inboxId,
      title: '👋 Welcome to Sri\'s Day!',
      description: 'This is a demo task. Click to edit, check to complete, or swipe to delete.',
      priority: 'high' as const,
      status: 'todo' as const,
      dueDate: todayStr,
      dueTime: null,
      tags: [],
      parentId: null,
      order: 0,
      recurring: null,
      completedAt: null,
      goalId: null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      listId: inboxId,
      title: 'Try the Pomodoro Timer ⏱️',
      description: 'Head to the Timer tab and start a 25-minute focus session.',
      priority: 'medium' as const,
      status: 'todo' as const,
      dueDate: todayStr,
      dueTime: '14:00',
      tags: [],
      parentId: null,
      order: 1,
      recurring: null,
      completedAt: null,
      goalId: null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      listId: inboxId,
      title: 'Explore the Habit Tracker',
      description: 'Create your first habit and start building a streak!',
      priority: 'low' as const,
      status: 'todo' as const,
      dueDate: tomorrow,
      dueTime: null,
      tags: [],
      parentId: null,
      order: 2,
      recurring: null,
      completedAt: null,
      goalId: null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: now(),
      updatedAt: now(),
    },
    // Subtask demo
    {
      id: generateId(),
      listId: inboxId,
      title: 'Read the welcome message',
      description: '',
      priority: 'none' as const,
      status: 'todo' as const,
      dueDate: null,
      dueTime: null,
      tags: [],
      parentId: demoTask1,
      order: 0,
      recurring: null,
      completedAt: null,
      goalId: null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      listId: inboxId,
      title: 'Try creating your own task',
      description: '',
      priority: 'none' as const,
      status: 'todo' as const,
      dueDate: null,
      dueTime: null,
      tags: [],
      parentId: demoTask1,
      order: 1,
      recurring: null,
      completedAt: null,
      goalId: null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      listId: workListId,
      title: 'Plan this week\'s priorities',
      description: 'Review your goals and set the top 3 priorities for the week.',
      priority: 'high' as const,
      status: 'todo' as const,
      dueDate: todayStr,
      dueTime: '09:00',
      tags: [],
      parentId: null,
      order: 0,
      recurring: { frequency: 'weekly' as const, interval: 1, daysOfWeek: [1] },
      completedAt: null,
      goalId: null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: now(),
      updatedAt: now(),
    },
  ]);

  // Create demo habits
  await db.habits.bulkPut([
    {
      id: generateId(),
      name: 'Read 30 minutes',
      description: 'Read at least 30 minutes every day',
      frequency: 'daily' as const,
      targetCount: 1,
      color: '#6366f1',
      icon: 'book-open',
      reminderTime: '21:00',
      isArchived: false,
      goalId: null,
      order: 0,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      name: 'Exercise',
      description: 'Workout or physical activity',
      frequency: 'x_per_week' as const,
      targetCount: 4,
      color: '#ef4444',
      icon: 'dumbbell',
      reminderTime: '07:00',
      isArchived: false,
      goalId: null,
      order: 1,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      name: 'Meditate',
      description: '10 minutes of mindfulness',
      frequency: 'daily' as const,
      targetCount: 1,
      color: '#10b981',
      icon: 'brain',
      reminderTime: '06:30',
      isArchived: false,
      goalId: null,
      order: 2,
      createdAt: now(),
      updatedAt: now(),
    },
  ]);

  // Create demo notes
  await db.notes.bulkPut([
    {
      id: generateId(),
      title: 'Welcome to Sri\'s Day Notes!',
      content: '<h2>📝 Your personal notepad</h2><p>Use this space to capture ideas, write journal entries, or keep a scratch pad for quick thoughts.</p><ul><li>Bold, italic, and other formatting supported</li><li>Tag your notes for easy organization</li><li>Pin important notes to the top</li></ul>',
      plainText: 'Your personal notepad. Use this space to capture ideas, write journal entries, or keep a scratch pad for quick thoughts.',
      type: 'note' as const,
      date: null,
      tags: [],
      isPinned: true,
      isArchived: false,
      color: null,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      title: '',
      content: '<h2>Today\'s Reflection</h2><p>How was your day? What went well? What could be improved?</p>',
      plainText: 'Today\'s Reflection. How was your day? What went well? What could be improved?',
      type: 'journal' as const,
      date: todayStr,
      tags: [],
      isPinned: false,
      isArchived: false,
      color: null,
      createdAt: now(),
      updatedAt: now(),
    },
  ]);

  // Create demo goal
  await db.goals.put({
    id: generateId(),
    title: 'Build a Productivity System',
    description: 'Set up and maintain a consistent daily productivity routine using Sri\'s Day.',
    targetDate: nextWeek,
    progress: 10,
    linkedTaskIds: [],
    linkedHabitIds: [],
    isCompleted: false,
    completedAt: null,
    color: '#6366f1',
    order: 0,
    createdAt: now(),
    updatedAt: now(),
  });
}
