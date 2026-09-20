import { create } from 'zustand';
import { db, generateId, now, today } from '@/lib/db';
import { TimerState, TimerSessionType, TimerConfig, TimerSession } from '@/types';

interface TimerStore {
  state: TimerState;
  sessionType: TimerSessionType;
  timeRemaining: number;
  totalTime: number;
  sessionsCompleted: number;
  currentTaskId: string | null;
  config: TimerConfig;
  todaySessions: TimerSession[];
  
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
  setCurrentTask: (taskId: string | null) => void;
  updateConfig: (config: Partial<TimerConfig>) => void;
  completeSession: () => Promise<void>;
  loadTodaySessions: () => Promise<void>;
  getTodayFocusTime: () => number;
}

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  state: 'idle',
  sessionType: 'work',
  timeRemaining: DEFAULT_CONFIG.workDuration,
  totalTime: DEFAULT_CONFIG.workDuration,
  sessionsCompleted: 0,
  currentTaskId: null,
  config: DEFAULT_CONFIG,
  todaySessions: [],
  
  start: () => {
    set({ state: 'running' });
  },
  
  pause: () => {
    set({ state: 'paused' });
  },
  
  resume: () => {
    set({ state: 'running' });
  },
  
  reset: () => {
    const { sessionType, config } = get();
    const duration = sessionType === 'work' ? config.workDuration : 
                     sessionType === 'short_break' ? config.shortBreakDuration : 
                     config.longBreakDuration;
    set({ state: 'idle', timeRemaining: duration, totalTime: duration });
  },
  
  skip: () => {
    const { sessionType, sessionsCompleted, config } = get();
    
    let nextType: TimerSessionType;
    let nextCompleted = sessionsCompleted;
    
    if (sessionType === 'work') {
      nextCompleted++;
      if (nextCompleted % config.sessionsBeforeLongBreak === 0) {
        nextType = 'long_break';
      } else {
        nextType = 'short_break';
      }
    } else {
      nextType = 'work';
    }
    
    const duration = nextType === 'work' ? config.workDuration : 
                     nextType === 'short_break' ? config.shortBreakDuration : 
                     config.longBreakDuration;
                     
    set({
      state: 'idle',
      sessionType: nextType,
      sessionsCompleted: nextCompleted,
      timeRemaining: duration,
      totalTime: duration
    });
  },
  
  tick: () => {
    const { timeRemaining, state, completeSession } = get();
    if (state !== 'running') return;
    
    if (timeRemaining <= 1) {
      completeSession();
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },
  
  setCurrentTask: (taskId) => {
    set({ currentTaskId: taskId });
  },
  
  updateConfig: (newConfig) => {
    set(state => {
      const config = { ...state.config, ...newConfig };
      
      let timeRemaining = state.timeRemaining;
      let totalTime = state.totalTime;
      
      if (state.state === 'idle') {
        const duration = state.sessionType === 'work' ? config.workDuration : 
                         state.sessionType === 'short_break' ? config.shortBreakDuration : 
                         config.longBreakDuration;
        timeRemaining = duration;
        totalTime = duration;
      }
      
      return { config, timeRemaining, totalTime };
    });
  },
  
  completeSession: async () => {
    const { sessionType, totalTime, currentTaskId, todaySessions } = get();
    
    const session: TimerSession = {
      id: generateId(),
      type: sessionType,
      duration: totalTime,
      actualDuration: totalTime,
      taskId: currentTaskId,
      startTime: new Date(Date.now() - totalTime * 1000).toISOString(),
      endTime: now(),
      completedAt: now(),
      createdAt: now(),
      updatedAt: now()
    };
    
    try {
      await db.timerSessions.put(session);
      set({ todaySessions: [...todaySessions, session] });
    } catch (e) {
      console.error('Failed to log timer session', e);
    }
    
    get().skip();
    
    const { config, sessionType: newType } = get();
    
    if ((newType === 'work' && config.autoStartWork) || 
        (newType !== 'work' && config.autoStartBreaks)) {
      set({ state: 'running' });
    } else {
      set({ state: 'idle' });
    }
  },
  
  loadTodaySessions: async () => {
    try {
      const todayStr = today();
      const allSessions = await db.timerSessions.toArray();
      const todaySessions = allSessions.filter(s => s.endTime.startsWith(todayStr));
      set({ todaySessions });
    } catch (e) {
      console.error('Failed to load today timer sessions', e);
    }
  },
  
  getTodayFocusTime: () => {
    const { todaySessions } = get();
    const workSessions = todaySessions.filter(s => s.type === 'work');
    const totalSeconds = workSessions.reduce((acc, s) => acc + s.duration, 0);
    return Math.round(totalSeconds / 60);
  }
}));
