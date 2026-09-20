// ============================================
// Application constants and configuration
// ============================================

/** Application metadata */
export const APP_NAME = "Sri's Day";
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Your personal productivity companion';

/** Navigation items for sidebar and bottom nav */
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'layout-dashboard', shortcut: '1' },
  { href: '/tasks', label: 'Tasks', icon: 'check-square', shortcut: '2' },
  { href: '/scheduler', label: 'Scheduler', icon: 'calendar-clock', shortcut: '3' },
  { href: '/habits', label: 'Habits', icon: 'flame', shortcut: '4' },
  { href: '/notes', label: 'Notes', icon: 'notebook-pen', shortcut: '5' },
  { href: '/goals', label: 'Goals', icon: 'target', shortcut: '6' },
  { href: '/timer', label: 'Timer', icon: 'timer', shortcut: '7' },
  { href: '/calendar', label: 'Calendar', icon: 'calendar', shortcut: '8' },
] as const;

/** Mobile bottom nav - subset of nav items */
export const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Home', icon: 'layout-dashboard' },
  { href: '/tasks', label: 'Tasks', icon: 'check-square' },
  { href: '/habits', label: 'Habits', icon: 'flame' },
  { href: '/notes', label: 'Notes', icon: 'notebook-pen' },
  { href: '/timer', label: 'Timer', icon: 'timer' },
] as const;

/** Priority configuration */
export const PRIORITIES = [
  { value: 'high', label: 'High', color: '#ef4444', bgColor: 'bg-red-500/10', textColor: 'text-red-500' },
  { value: 'medium', label: 'Medium', color: '#eab308', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-500' },
  { value: 'low', label: 'Low', color: '#22c55e', bgColor: 'bg-green-500/10', textColor: 'text-green-500' },
  { value: 'none', label: 'None', color: '#6b7280', bgColor: 'bg-gray-500/10', textColor: 'text-gray-500' },
] as const;

/** Default Pomodoro settings */
export const DEFAULT_POMODORO = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
} as const;

/** Habit frequency options */
export const HABIT_FREQUENCIES = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'x_per_week', label: 'X times per week' },
] as const;

/** Recurring task options */
export const RECURRING_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
] as const;

/** Color palette for tags, habits, lists */
export const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#78716c', '#64748b',
] as const;

/** Days of week */
export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Months */
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** Keyboard shortcuts */
export const KEYBOARD_SHORTCUTS = [
  { key: 'k', modifier: 'ctrl', action: 'search', description: 'Open search' },
  { key: 'n', modifier: 'ctrl', action: 'new-task', description: 'New task' },
  { key: 'n', modifier: 'ctrl+shift', action: 'new-note', description: 'New note' },
  { key: 'z', modifier: 'ctrl', action: 'undo', description: 'Undo' },
  { key: 'z', modifier: 'ctrl+shift', action: 'redo', description: 'Redo' },
  { key: ' ', modifier: '', action: 'timer-toggle', description: 'Start/pause timer (on timer page)' },
] as const;

/** Google API scopes */
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

/** Empty state messages */
export const EMPTY_STATES = {
  tasks: {
    title: 'No tasks yet',
    description: 'Create your first task to get started on your productive day!',
    icon: 'check-square',
  },
  habits: {
    title: 'No habits yet',
    description: 'Build positive habits by tracking them daily. Start with something small!',
    icon: 'flame',
  },
  notes: {
    title: 'No notes yet',
    description: 'Capture your thoughts, ideas, and reflections here.',
    icon: 'notebook-pen',
  },
  goals: {
    title: 'No goals yet',
    description: 'Set meaningful goals and break them into achievable milestones.',
    icon: 'target',
  },
  search: {
    title: 'No results found',
    description: 'Try a different search term or check your filters.',
    icon: 'search',
  },
} as const;
