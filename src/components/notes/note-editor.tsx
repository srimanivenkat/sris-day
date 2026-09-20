'use client';

import { useState, useEffect } from 'react';
import { useNoteStore } from '@/stores/note-store';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichEditor } from './rich-editor';
import { Pin, Trash2 } from 'lucide-react';

interface NoteEditorProps {
  noteId: string;
  onClose: () => void;
}

export function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const { notes, updateNote, deleteNote } = useNoteStore();
  const note = notes.find(n => n.id === noteId);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned || false);
    }
  }, [note]);

  if (!note) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateNote(noteId, { title: e.target.value });
  };

  const handleContentChange = (html: string, plainText: string) => {
    setContent(html);
    updateNote(noteId, { content: html, plainText });
  };

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    updateNote(noteId, { isPinned: !isPinned });
  };

  const handleDelete = () => {
    deleteNote(noteId);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <Input 
            value={title} 
            onChange={handleTitleChange} 
            placeholder="Note Title" 
            className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleTogglePin} className={isPinned ? 'text-primary' : 'text-muted-foreground'}>
              <Pin className="h-5 w-5" fill={isPinned ? 'currentColor' : 'none'} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden bg-background">
          <RichEditor 
            content={content} 
            onChange={handleContentChange} 
            placeholder="Start writing..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
