"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface TaskFiltersProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  onClear: () => void;
}

export default function TaskFilters({ sortBy, setSortBy, filterPriority, setFilterPriority, onClear }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 bg-muted/30 p-2 rounded-md">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dueDate">Due Date</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="created">Created</SelectItem>
          <SelectItem value="alpha">Alphabetical</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterPriority} onValueChange={setFilterPriority}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Filter Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>

      {(sortBy !== "dueDate" || filterPriority !== "all") && (
        <Button variant="ghost" size="sm" className="h-8 text-xs px-2 gap-1 text-muted-foreground" onClick={onClear}>
          <X className="h-3 w-3" /> Clear
        </Button>
      )}
    </div>
  );
}
