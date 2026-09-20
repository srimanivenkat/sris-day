'use client';

import { useState, useMemo, useEffect } from 'react';
import { useNoteStore } from '@/stores/note-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { RichEditor } from './rich-editor';
import { today } from '@/lib/db';

export function JournalView() {
  const { notes, addNote, updateNote } = useNoteStore();
  const [currentDateStr, setCurrentDateStr] = useState(today());

  const journalEntry = useMemo(() => {
    return notes.find(n => n.type === 'journal' && n.date === currentDateStr);
  }, [notes, currentDateStr]);

  const handleDateChange = (days: number) => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() + days);
    setCurrentDateStr(d.toISOString().split('T')[0]);
  };

  const handleContentChange = (html: string, plainText: string) => {
    if (journalEntry) {
      updateNote(journalEntry.id, { content: html, plainText });
    } else {
      addNote({
        title: `Journal - ${currentDateStr}`,
        content: html,
        plainText,
        type: 'journal',
        date: currentDateStr,
        tags: [],
        isPinned: false
      });
    }
  };

  const formattedDate = new Date(currentDateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col h-full border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-muted/10">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleDateChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleDateChange(1)} disabled={currentDateStr === today()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDateStr(today())} disabled={currentDateStr === today()} className="ml-2">
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {formattedDate}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <RichEditor 
          key={currentDateStr} // force remount on date change
          content={journalEntry?.content || ''} 
          onChange={handleContentChange} 
          placeholder={`Write your journal entry for ${formattedDate}...`}
        />
      </div>
    </div>
  );
}
