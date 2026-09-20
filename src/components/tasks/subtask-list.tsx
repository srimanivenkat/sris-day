"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { cn } from "@/lib/utils";

interface SubtaskListProps {
  parentId: string;
}

export default function SubtaskList({ parentId }: SubtaskListProps) {
  const { getSubtasks, addTask, toggleTask, deleteTask, taskLists } = useTaskStore();
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const subtasks = getSubtasks(parentId);

  // Find the parent task's listId for creating subtasks in the same list
  const parentTask = useTaskStore.getState().tasks.find(t => t.id === parentId);
  const listId = parentTask?.listId || taskLists[0]?.id || '';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      await addTask({
        title: newTitle.trim(),
        parentId,
        listId,
        priority: 'none',
        status: 'todo',
        description: '',
        tags: [],
        dueDate: null,
        dueTime: null,
        recurring: null,
        completedAt: null,
        goalId: null,
        scheduledStart: null,
        scheduledEnd: null,
      });
      setNewTitle("");
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        {subtasks.map((subtask) => (
          <li key={subtask.id} className="flex items-center gap-3 group py-1">
            <Checkbox 
              checked={subtask.status === 'completed'} 
              onCheckedChange={() => toggleTask(subtask.id)} 
              className="h-4 w-4"
            />
            <span className={cn(
              "text-sm flex-1",
              subtask.status === 'completed' && "line-through text-muted-foreground"
            )}>
              {subtask.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
              onClick={() => deleteTask(subtask.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </li>
        ))}
      </ul>
      
      {isAdding ? (
        <form onSubmit={handleAdd} className="flex items-center gap-2 mt-2">
          <Input 
            autoFocus
            className="h-7 text-sm"
            placeholder="Subtask title..." 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => !newTitle && setIsAdding(false)}
          />
          <Button type="submit" size="sm" className="h-7 text-xs px-2">Add</Button>
        </form>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-muted-foreground mt-1 gap-1 px-2"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-3 w-3" /> Add Subtask
        </Button>
      )}
    </div>
  );
}
