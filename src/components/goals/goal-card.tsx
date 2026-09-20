'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MoreVertical, Calendar, CheckSquare } from 'lucide-react';
import { MilestoneList } from '@/components/goals/milestone-list';
import { cn } from '@/lib/utils';

export function GoalCard({ goal, milestones }: { goal: any, milestones: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const progress = totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100);

  const calculateDaysLeft = (dateString?: string) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? `${days} days left` : 'Overdue';
  };

  const daysLeft = calculateDaysLeft(goal.targetDate);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md" style={{ borderTop: `4px solid ${goal.color || 'var(--primary)'}` }}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle>{goal.title}</CardTitle>
            <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 flex-grow space-y-4">
        {daysLeft && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            {daysLeft}
          </div>
        )}
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckSquare className="h-4 w-4" />
          <span>{completedMilestones} / {totalMilestones} Milestones</span>
        </div>
      </CardContent>
      
      <div className="px-6 py-2 border-t bg-muted/20">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full flex justify-between p-0 h-auto hover:bg-transparent"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-sm font-medium">Checklist</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <div className="px-6 pb-4 pt-2 bg-muted/10">
          <MilestoneList goalId={goal.id} milestones={milestones} />
        </div>
      )}
    </Card>
  );
}
