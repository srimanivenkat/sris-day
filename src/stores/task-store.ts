import { create } from 'zustand';
import { db, generateId, now, today } from '@/lib/db';
import { Task, TaskList, TaskFilter, TaskSort } from '@/types';

interface TaskStore {
  tasks: Task[];
  taskLists: TaskList[];
  loading: boolean;
  filter: TaskFilter;
  sort: TaskSort;
  undoStack: Task[][];
  redoStack: Task[][];
  
  loadTasks: () => Promise<void>;
  loadTaskLists: () => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  addTaskList: (name: string, color: string, icon: string) => Promise<TaskList>;
  deleteTaskList: (id: string) => Promise<void>;
  setFilter: (filter: Partial<TaskFilter>) => void;
  setSort: (sort: TaskSort) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  getSubtasks: (parentId: string) => Task[];
  getTasksByDate: (date: string) => Task[];
  getTasksDueToday: () => Task[];
  getCompletedCount: (days: number) => Promise<number>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  taskLists: [],
  loading: true,
  filter: {} as TaskFilter,
  sort: { field: 'createdAt', direction: 'desc' } as TaskSort,
  undoStack: [],
  redoStack: [],
  
  loadTasks: async () => {
    set({ loading: true });
    try {
      const tasks = await db.tasks.toArray();
      set({ tasks, loading: false });
    } catch (error) {
      console.error('Failed to load tasks', error);
      set({ loading: false });
    }
  },
  
  loadTaskLists: async () => {
    try {
      const taskLists = await db.taskLists.toArray();
      set({ taskLists });
    } catch (error) {
      console.error('Failed to load task lists', error);
    }
  },
  
  addTask: async (data) => {
    const { tasks, undoStack } = get();
    const task: Task = {
      id: generateId(),
      title: '',
      status: 'todo',
      createdAt: now(),
      updatedAt: now(),
      ...data,
    } as Task;
    
    set({ undoStack: [...undoStack, tasks], redoStack: [] });
    await db.tasks.put(task);
    set({ tasks: [...tasks, task] });
    return task;
  },
  
  updateTask: async (id, updates) => {
    const { tasks, undoStack } = get();
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: now() } : t);
    
    set({ undoStack: [...undoStack, tasks], redoStack: [] });
    await db.tasks.update(id, { ...updates, updatedAt: now() });
    set({ tasks: updatedTasks });
  },
  
  deleteTask: async (id) => {
    const { tasks, undoStack } = get();
    const updatedTasks = tasks.filter(t => t.id !== id);
    
    set({ undoStack: [...undoStack, tasks], redoStack: [] });
    await db.tasks.delete(id);
    set({ tasks: updatedTasks });
  },
  
  toggleTask: async (id) => {
    const { tasks, undoStack } = get();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const completedAt = newStatus === 'completed' ? now() : null;
    
    const updatedTask: Task = { ...task, status: newStatus as Task['status'], completedAt, updatedAt: now() };
    const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t);
    
    set({ undoStack: [...undoStack, tasks], redoStack: [] });
    await db.tasks.update(id, { status: newStatus, completedAt, updatedAt: now() });
    set({ tasks: updatedTasks });
  },
  
  reorderTasks: async (newTasks) => {
    const { tasks, undoStack } = get();
    set({ undoStack: [...undoStack, tasks], redoStack: [] });
    
    await Promise.all(newTasks.map((t, i) => db.tasks.update(t.id, { order: i })));
    
    const updatedIds = new Set(newTasks.map(t => t.id));
    const otherTasks = tasks.filter(t => !updatedIds.has(t.id));
    
    set({ tasks: [...newTasks, ...otherTasks] });
  },
  
  addTaskList: async (name, color, icon) => {
    const { taskLists } = get();
    const list: TaskList = {
      id: generateId(),
      name,
      color,
      icon,
      order: taskLists.length,
      isDefault: taskLists.length === 0,
      createdAt: now(),
      updatedAt: now()
    };
    
    await db.taskLists.put(list);
    set({ taskLists: [...taskLists, list] });
    return list;
  },
  
  deleteTaskList: async (id) => {
    const { taskLists } = get();
    await db.taskLists.delete(id);
    set({ taskLists: taskLists.filter(l => l.id !== id) });
  },
  
  setFilter: (filterUpdates) => {
    set({ filter: { ...get().filter, ...filterUpdates } });
  },
  
  setSort: (sort) => {
    set({ sort });
  },
  
  undo: async () => {
    const { tasks, undoStack, redoStack } = get();
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    set({ 
      undoStack: newUndoStack, 
      redoStack: [...redoStack, tasks],
      tasks: previousState
    });
    
    await db.tasks.clear();
    await db.tasks.bulkAdd(previousState);
  },
  
  redo: async () => {
    const { tasks, undoStack, redoStack } = get();
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    set({ 
      undoStack: [...undoStack, tasks], 
      redoStack: newRedoStack,
      tasks: nextState
    });
    
    await db.tasks.clear();
    await db.tasks.bulkAdd(nextState);
  },
  
  getSubtasks: (parentId) => {
    return get().tasks.filter(t => t.parentId === parentId);
  },
  
  getTasksByDate: (date) => {
    return get().tasks.filter(t => t.dueDate && t.dueDate.startsWith(date));
  },
  
  getTasksDueToday: () => {
    const todayStr = today();
    return get().tasks.filter(t => t.dueDate && t.dueDate.startsWith(todayStr) && t.status !== 'completed');
  },
  
  getCompletedCount: async (days) => {
    const { tasks } = get();
    const msPerDay = 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - days * msPerDay).toISOString();
    return tasks.filter(t => t.status === 'completed' && t.completedAt && t.completedAt >= cutoff).length;
  }
}));
