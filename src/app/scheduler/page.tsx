'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { DayView } from '@/components/scheduler/day-view';
import { WeekView } from '@/components/scheduler/week-view';

export default function SchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const nextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const prevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const today = () => setCurrentDate(new Date());

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Scheduler</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button variant="ghost" size="icon" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={today} className="font-medium">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {formatDate(currentDate)}
        </h2>
      </div>

      <Tabs defaultValue="day" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mb-4 self-start">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden border rounded-lg bg-card">
          <TabsContent value="day" className="h-full m-0 data-[state=active]:flex flex-col">
            <DayView date={currentDate.toISOString().split('T')[0]} />
          </TabsContent>
          <TabsContent value="week" className="h-full m-0 data-[state=active]:flex flex-col">
            <WeekView weekStart={getWeekStart(currentDate)} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
