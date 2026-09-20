"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore } from "@/stores/task-store";
import { format, isToday, isPast } from "date-fns";
import SubtaskList from "./subtask-list";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
}

export default function TaskItem({ task, onEdit }: TaskItemProps) {
  const { toggleTask, deleteTask, getSubtasks } = useTaskStore();
  const [expanded, setExpanded] = useState(false);

  const isCompleted = task.status === 'completed';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-transparent";
    }
  };

  const getDueColor = (dateString?: string | null) => {
    if (!dateString) return "bg-secondary text-secondary-foreground";
    const date = new Date(dateString);
    if (isPast(date) && !isToday(date)) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (isToday(date)) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-secondary text-secondary-foreground";
  };

  const subtasks = getSubtasks(task.id);
  const subtaskCount = subtasks.length;
  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col border-b last:border-0 bg-background/50 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3 p-3">
        <div className="flex items-center gap-2">
          {subtaskCount > 0 ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          
          <div className="relative flex items-center justify-center">
            <Checkbox 
              checked={isCompleted} 
              onCheckedChange={() => toggleTask(task.id)} 
              className="z-10"
            />
            {isCompleted && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="absolute inset-0 bg-primary/20 rounded-sm z-0" 
              />
            )}
          </div>
        </div>

        <div className={cn("w-1 h-8 rounded-full", getPriorityColor(task.priority))} />

        <div 
          className="flex-1 cursor-pointer flex flex-col md:flex-row md:items-center gap-2"
          onClick={onEdit}
        >
          <span className={cn(
            "text-sm font-medium transition-all",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </span>
          
          <div className="flex items-center gap-2 flex-wrap">
            {task.dueDate && (
              <Badge variant="outline" className={cn("text-[10px] h-5", getDueColor(task.dueDate))}>
                {format(new Date(task.dueDate), "MMM d")}
              </Badge>
            )}
            
            {subtaskCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                {completedSubtasks}/{subtaskCount}
              </Badge>
            )}
            
            {task.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] h-5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => deleteTask(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && subtaskCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-14 pr-4 pb-3">
              <SubtaskList parentId={task.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
