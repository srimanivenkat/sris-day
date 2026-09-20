import { create } from 'zustand';
import { db, generateId, now, today } from '@/lib/db';
import { Habit, HabitLog, HeatmapDay } from '@/types';

interface HabitStore {
  habits: Habit[];
  habitLogs: HabitLog[];
  loading: boolean;
  
  loadHabits: () => Promise<void>;
  loadLogs: (startDate?: string, endDate?: string) => Promise<void>;
  addHabit: (habit: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  getStreak: (habitId: string) => number;
  getLongestStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days: number) => number;
  getTodayProgress: () => { completed: number; total: number };
  getHeatmapData: (habitId?: string) => HeatmapDay[];
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  habitLogs: [],
  loading: true,
  
  loadHabits: async () => {
    set({ loading: true });
    try {
      const habits = await db.habits.toArray();
      set({ habits, loading: false });
    } catch (error) {
      console.error('Failed to load habits', error);
      set({ loading: false });
    }
  },
  
  loadLogs: async (startDate, endDate) => {
    try {
      let logs = await db.habitLogs.toArray();
      if (startDate) logs = logs.filter(l => l.date >= startDate);
      if (endDate) logs = logs.filter(l => l.date <= endDate);
      set({ habitLogs: logs });
    } catch (error) {
      console.error('Failed to load habit logs', error);
    }
  },
  
  addHabit: async (data) => {
    const habit: Habit = {
      id: generateId(),
      name: '',
      color: '#000000',
      icon: 'star',
      frequency: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      createdAt: now(),
      updatedAt: now(),
      ...data,
    } as Habit;
    
    await db.habits.put(habit);
    set(state => ({ habits: [...state.habits, habit] }));
  },
  
  updateHabit: async (id, updates) => {
    await db.habits.update(id, { ...updates, updatedAt: now() });
    set(state => ({
      habits: state.habits.map(h => h.id === id ? { ...h, ...updates, updatedAt: now() } : h)
    }));
  },
  
  deleteHabit: async (id) => {
    await db.habits.delete(id);
    const logsToDelete = get().habitLogs.filter(l => l.habitId === id).map(l => l.id);
    await db.habitLogs.bulkDelete(logsToDelete);
    
    set(state => ({
      habits: state.habits.filter(h => h.id !== id),
      habitLogs: state.habitLogs.filter(l => l.habitId !== id)
    }));
  },
  
  toggleHabit: async (habitId, date) => {
    const { habitLogs } = get();
    const existingLog = habitLogs.find(l => l.habitId === habitId && l.date === date);
    
    if (existingLog) {
      await db.habitLogs.delete(existingLog.id);
      set({ habitLogs: habitLogs.filter(l => l.id !== existingLog.id) });
    } else {
      const newLog: HabitLog = {
        id: generateId(),
        habitId,
        date,
        completed: true,
        count: 1,
        completedAt: now(),
      };
      await db.habitLogs.put(newLog);
      set({ habitLogs: [...habitLogs, newLog] });
    }
  },
  
  getStreak: (habitId) => {
    const { habitLogs } = get();
    const logs = habitLogs.filter(l => l.habitId === habitId && l.completed).map(l => l.date).sort().reverse();
    
    let streak = 0;
    const current = new Date();
    current.setHours(0,0,0,0);
    
    const todayStr = today();
    const yesterday = new Date(current);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (logs.length === 0) return 0;
    if (logs[0] !== todayStr && logs[0] !== yesterdayStr) return 0;
    
    let checkDate = new Date(logs[0]);
    for (const logDate of logs) {
      if (logDate === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  },
  
  getLongestStreak: (habitId) => {
    const { habitLogs } = get();
    const logs = habitLogs.filter(l => l.habitId === habitId && l.completed).map(l => l.date).sort();
    
    if (logs.length === 0) return 0;
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < logs.length; i++) {
      const prevDate = new Date(logs[i-1]);
      const currDate = new Date(logs[i]);
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(longestStreak, currentStreak);
  },
  
  getCompletionRate: (habitId, days) => {
    const { habitLogs } = get();
    const msPerDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(Date.now() - days * msPerDay).toISOString().split('T')[0];
    
    const relevantLogs = habitLogs.filter(l => l.habitId === habitId && l.date >= startDate && l.completed);
    return Math.round((relevantLogs.length / days) * 100);
  },
  
  getTodayProgress: () => {
    const { habits, habitLogs } = get();
    const todayStr = today();
    const todayDayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    
    const applicableHabits = habits.filter(h => h.frequency.includes(todayDayOfWeek as any));
    if (applicableHabits.length === 0) return { completed: 0, total: 0 };
    
    const completedCount = habitLogs.filter(l => l.date === todayStr && l.completed && applicableHabits.some(h => h.id === l.habitId)).length;
    
    return { completed: completedCount, total: applicableHabits.length };
  },
  
  getHeatmapData: (habitId) => {
    const { habitLogs } = get();
    const heatmap: Record<string, number> = {};
    const msPerDay = 24 * 60 * 60 * 1000;
    const oneYearAgo = new Date(Date.now() - 365 * msPerDay).toISOString().split('T')[0];
    
    const logs = habitId 
      ? habitLogs.filter(l => l.habitId === habitId && l.date >= oneYearAgo && l.completed)
      : habitLogs.filter(l => l.date >= oneYearAgo && l.completed);
      
    logs.forEach(l => {
      heatmap[l.date] = (heatmap[l.date] || 0) + 1;
    });
    
    return Object.entries(heatmap).map(([date, count]): HeatmapDay => {
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count >= 4) level = 4;
      return { date, count, level };
    });
  }
}));
