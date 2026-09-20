"use client";

import { useEffect, useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useTaskStore } from "@/stores/task-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import TaskItem from "@/components/tasks/task-item";
import TaskForm from "@/components/tasks/task-form";
import TaskFilters from "@/components/tasks/task-filters";
import { Task } from "@/types";
import { isToday, isFuture, isPast } from "date-fns";

export default function TasksPage() {
  const { tasks, taskLists, loadTasks, loadTaskLists, reorderTasks } = useTaskStore();
  const { newTaskOpen, setNewTaskOpen } = useUiStore();
  
  const [activeTab, setActiveTab] = useState("all");
  const [selectedList, setSelectedList] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState("dueDate");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    loadTasks();
    loadTaskLists();
  }, [loadTasks, loadTaskLists]);

  useEffect(() => {
    if (newTaskOpen) {
      setEditingTask(undefined);
      setIsFormOpen(true);
      setNewTaskOpen(false);
    }
  }, [newTaskOpen, setNewTaskOpen]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by list
    if (selectedList !== "all") {
      result = result.filter(t => t.listId === selectedList);
    }

    // Filter by tab
    if (activeTab === "today") {
      result = result.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== 'completed');
    } else if (activeTab === "upcoming") {
      result = result.filter(t => t.dueDate && isFuture(new Date(t.dueDate)) && t.status !== 'completed');
    } else if (activeTab === "completed") {
      result = result.filter(t => t.status === 'completed');
    } else {
      result = result.filter(t => t.status !== 'completed');
    }

    // Filter by priority
    if (filterPriority !== "all") {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Sort
    return result.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "priority") {
        const pValues: Record<string, number> = { high: 3, medium: 2, low: 1, none: 0 };
        return (pValues[b.priority] || 0) - (pValues[a.priority] || 0);
      }
      if (sortBy === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, selectedList, activeTab, filterPriority, sortBy]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (sortBy !== "dueDate") return; // Only allow drag drop on certain sorts maybe, or just allow it
    
    // Simplistic reordering logic for this specific filtered view
    // In a real app, you might want to reorder the entire list or update positions
    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Map to IDs and call reorder
    const updatedOrder = items.map((t, index) => ({ id: t.id, order: index }));
    // If your store supports it: reorderTasks(updatedOrder);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">Manage your daily tasks and projects</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select List" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lists</SelectItem>
              {taskLists.map(list => (
                <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }} className="gap-1">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mb-4 self-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TaskFilters 
          sortBy={sortBy} setSortBy={setSortBy}
          filterPriority={filterPriority} setFilterPriority={setFilterPriority}
          onClear={() => { setSortBy("dueDate"); setFilterPriority("all"); }}
        />

        <div className="flex-1 overflow-y-auto pr-2 pb-20">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/10 rounded-lg border border-dashed">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Plus className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-medium mb-1">No tasks found</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                You don't have any tasks in this view. Create a new task to get started!
              </p>
              <Button onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }} className="mt-4 gap-2" variant="outline">
                <Plus className="h-4 w-4" /> Create Task
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="task-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-1 bg-card rounded-lg border shadow-sm"
                  >
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                          >
                            <TaskItem task={task} onEdit={() => handleEdit(task)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </Tabs>

      <TaskForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        task={editingTask}
        defaultListId={selectedList !== "all" ? selectedList : undefined}
      />
    </div>
  );
}
