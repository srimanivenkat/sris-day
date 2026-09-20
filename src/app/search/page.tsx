'use client';

// ============================================
// Global Search Page
// ============================================
// Search across all tasks, notes, goals, and habits

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckSquare,
  NotebookPen,
  Target,
  Flame,
  X,
  ArrowRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskStore } from '@/stores/task-store';
import { useNoteStore } from '@/stores/note-store';
import { useGoalStore } from '@/stores/goal-store';
import { useHabitStore } from '@/stores/habit-store';
import { cn, truncate, formatRelativeDate } from '@/lib/utils';
import Link from 'next/link';

type SearchResultType = 'task' | 'note' | 'goal' | 'habit';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  date?: string;
  status?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const { tasks, loadTasks } = useTaskStore();
  const { notes, loadNotes } = useNoteStore();
  const { goals, loadGoals } = useGoalStore();
  const { habits, loadHabits } = useHabitStore();

  useEffect(() => {
    loadTasks();
    loadNotes();
    loadGoals();
    loadHabits();
  }, [loadTasks, loadNotes, loadGoals, loadHabits]);

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      const q = searchQuery.toLowerCase();
      const found: SearchResult[] = [];

      // Search tasks
      tasks.forEach((task) => {
        if (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q)
        ) {
          found.push({
            id: task.id,
            type: 'task',
            title: task.title,
            description: truncate(task.description, 80),
            date: task.dueDate || undefined,
            status: task.status,
          });
        }
      });

      // Search notes
      notes.forEach((note) => {
        if (
          note.title.toLowerCase().includes(q) ||
          note.plainText.toLowerCase().includes(q)
        ) {
          found.push({
            id: note.id,
            type: 'note',
            title: note.title || 'Untitled Note',
            description: truncate(note.plainText, 80),
            date: note.date || undefined,
          });
        }
      });

      // Search goals
      goals.forEach((goal) => {
        if (
          goal.title.toLowerCase().includes(q) ||
          goal.description.toLowerCase().includes(q)
        ) {
          found.push({
            id: goal.id,
            type: 'goal',
            title: goal.title,
            description: truncate(goal.description, 80),
            date: goal.targetDate,
            status: goal.isCompleted ? 'completed' : 'active',
          });
        }
      });

      // Search habits
      habits.forEach((habit) => {
        if (
          habit.name.toLowerCase().includes(q) ||
          habit.description.toLowerCase().includes(q)
        ) {
          found.push({
            id: habit.id,
            type: 'habit',
            title: habit.name,
            description: habit.description,
          });
        }
      });

      setResults(found);
    },
    [tasks, notes, goals, habits]
  );

  useEffect(() => {
    const debounce = setTimeout(() => performSearch(query), 200);
    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  const filteredResults =
    activeTab === 'all'
      ? results
      : results.filter((r) => r.type === activeTab);

  const typeIcon = (type: SearchResultType) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case 'note':
        return <NotebookPen className="h-4 w-4 text-purple-500" />;
      case 'goal':
        return <Target className="h-4 w-4 text-orange-500" />;
      case 'habit':
        return <Flame className="h-4 w-4 text-red-500" />;
    }
  };

  const typeLabel = (type: SearchResultType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const resultCounts = {
    all: results.length,
    task: results.filter((r) => r.type === 'task').length,
    note: results.filter((r) => r.type === 'note').length,
    goal: results.filter((r) => r.type === 'goal').length,
    habit: results.filter((r) => r.type === 'habit').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Search</h1>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search tasks, notes, goals, habits..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-xs text-muted-foreground mt-2">
          Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+K</kbd> to open search from anywhere
        </p>
      </div>

      {/* Results */}
      {query.trim() && (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All ({resultCounts.all})
              </TabsTrigger>
              <TabsTrigger value="task">
                Tasks ({resultCounts.task})
              </TabsTrigger>
              <TabsTrigger value="note">
                Notes ({resultCounts.note})
              </TabsTrigger>
              <TabsTrigger value="goal">
                Goals ({resultCounts.goal})
              </TabsTrigger>
              <TabsTrigger value="habit">
                Habits ({resultCounts.habit})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredResults.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Try a different search term
                  </p>
                </motion.div>
              ) : (
                filteredResults.map((result, i) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{typeIcon(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm truncate">
                                {result.title}
                              </h3>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {typeLabel(result.type)}
                              </Badge>
                            </div>
                            {result.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {result.description}
                              </p>
                            )}
                            {result.date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatRelativeDate(result.date)}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Empty state when no query */}
      {!query.trim() && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground">
            Start typing to search across all your data
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Tasks', 'Notes', 'Goals', 'Habits'].map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
