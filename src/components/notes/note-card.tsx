'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Pin } from 'lucide-react';

interface NoteCardProps {
  note: any;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const date = new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card 
      className="break-inside-avoid cursor-pointer hover:scale-[1.02] transition-transform duration-200 relative overflow-hidden group"
      onClick={onClick}
    >
      {note.color && (
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: note.color }} />
      )}
      <CardContent className="p-5">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {note.title || 'Untitled'}
          </h3>
          {note.isPinned && <Pin className="h-4 w-4 text-primary shrink-0" fill="currentColor" />}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-4 mb-4 whitespace-pre-wrap">
          {note.plainText || 'No content...'}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 text-xs text-muted-foreground border-t">
          <span>{date}</span>
          {note.tags?.length > 0 && (
            <div className="flex gap-1">
              {note.tags.slice(0, 2).map((tag: string) => (
                <span key={tag} className="bg-secondary px-2 py-0.5 rounded-full text-[10px]">
                  {tag}
                </span>
              ))}
              {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
