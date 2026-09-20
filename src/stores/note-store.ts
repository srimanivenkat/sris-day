import { create } from 'zustand';
import { db, generateId, now } from '@/lib/db';
import { Note, NoteType } from '@/types';

interface NoteStore {
  notes: Note[];
  loading: boolean;
  activeNoteId: string | null;
  
  loadNotes: () => Promise<void>;
  addNote: (note: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setActiveNote: (id: string | null) => void;
  getNotesByType: (type: NoteType) => Note[];
  getJournalByDate: (date: string) => Note | undefined;
  searchNotes: (query: string) => Note[];
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  loading: true,
  activeNoteId: null,
  
  loadNotes: async () => {
    set({ loading: true });
    try {
      const notes = await db.notes.toArray();
      set({ notes, loading: false });
    } catch (error) {
      console.error('Failed to load notes', error);
      set({ loading: false });
    }
  },
  
  addNote: async (data) => {
    const note: Note = {
      id: generateId(),
      title: '',
      content: '',
      type: 'note',
      isPinned: false,
      tags: [],
      createdAt: now(),
      updatedAt: now(),
      ...data,
    } as Note;
    
    await db.notes.put(note);
    set(state => ({ notes: [...state.notes, note] }));
    return note;
  },
  
  updateNote: async (id, updates) => {
    await db.notes.update(id, { ...updates, updatedAt: now() });
    set(state => ({
      notes: state.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: now() } : n)
    }));
  },
  
  deleteNote: async (id) => {
    await db.notes.delete(id);
    set(state => ({
      notes: state.notes.filter(n => n.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
    }));
  },
  
  togglePin: async (id) => {
    const { notes } = get();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    const isPinned = !note.isPinned;
    await db.notes.update(id, { isPinned, updatedAt: now() });
    
    set({
      notes: notes.map(n => n.id === id ? { ...n, isPinned, updatedAt: now() } : n)
    });
  },
  
  setActiveNote: (id) => {
    set({ activeNoteId: id });
  },
  
  getNotesByType: (type) => {
    return get().notes.filter(n => n.type === type);
  },
  
  getJournalByDate: (date) => {
    return get().notes.find(n => n.type === 'journal' && n.date === date);
  },
  
  searchNotes: (query) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return get().notes.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }
}));
