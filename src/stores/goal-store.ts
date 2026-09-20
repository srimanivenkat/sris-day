import { create } from 'zustand';
import { db, generateId, now } from '@/lib/db';
import { Goal, Milestone } from '@/types';

interface GoalStore {
  goals: Goal[];
  milestones: Milestone[];
  loading: boolean;
  
  loadGoals: () => Promise<void>;
  addGoal: (goal: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMilestone: (goalId: string, title: string) => Promise<void>;
  toggleMilestone: (id: string) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  getMilestonesByGoal: (goalId: string) => Milestone[];
  calculateProgress: (goalId: string) => number;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  milestones: [],
  loading: true,
  
  loadGoals: async () => {
    set({ loading: true });
    try {
      const [goals, milestones] = await Promise.all([
        db.goals.toArray(),
        db.milestones.toArray()
      ]);
      set({ goals, milestones, loading: false });
    } catch (error) {
      console.error('Failed to load goals', error);
      set({ loading: false });
    }
  },
  
  addGoal: async (data) => {
    const goal: Goal = {
      id: generateId(),
      title: '',
      description: '',
      targetDate: '',
      color: '#000000',
      status: 'in_progress',
      createdAt: now(),
      updatedAt: now(),
      ...data,
    } as Goal;
    
    await db.goals.put(goal);
    set(state => ({ goals: [...state.goals, goal] }));
  },
  
  updateGoal: async (id, updates) => {
    await db.goals.update(id, { ...updates, updatedAt: now() });
    set(state => ({
      goals: state.goals.map(g => g.id === id ? { ...g, ...updates, updatedAt: now() } : g)
    }));
  },
  
  deleteGoal: async (id) => {
    await db.goals.delete(id);
    
    const { milestones } = get();
    const milestonesToDelete = milestones.filter(m => m.goalId === id).map(m => m.id);
    await db.milestones.bulkDelete(milestonesToDelete);
    
    set(state => ({
      goals: state.goals.filter(g => g.id !== id),
      milestones: state.milestones.filter(m => m.goalId !== id)
    }));
  },
  
  addMilestone: async (goalId, title) => {
    const { milestones } = get();
    const goalMilestones = milestones.filter(m => m.goalId === goalId);
    const milestone: Milestone = {
      id: generateId(),
      goalId,
      title,
      isCompleted: false,
      completedAt: null,
      order: goalMilestones.length,
      createdAt: now(),
      updatedAt: now()
    };
    
    await db.milestones.put(milestone);
    set(state => ({ milestones: [...state.milestones, milestone] }));
  },
  
  toggleMilestone: async (id) => {
    const { milestones } = get();
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) return;
    
    const isCompleted = !milestone.isCompleted;
    const completedAt = isCompleted ? now() : null;
    await db.milestones.update(id, { isCompleted, completedAt, updatedAt: now() });
    
    set({
      milestones: milestones.map(m => m.id === id ? { ...m, isCompleted, completedAt, updatedAt: now() } : m)
    });
  },
  
  deleteMilestone: async (id) => {
    await db.milestones.delete(id);
    set(state => ({
      milestones: state.milestones.filter(m => m.id !== id)
    }));
  },
  
  getMilestonesByGoal: (goalId) => {
    return get().milestones.filter(m => m.goalId === goalId);
  },
  
  calculateProgress: (goalId) => {
    const goalMilestones = get().milestones.filter(m => m.goalId === goalId);
    if (goalMilestones.length === 0) return 0;
    
    const completedCount = goalMilestones.filter(m => m.isCompleted).length;
    return Math.round((completedCount / goalMilestones.length) * 100);
  }
}));
