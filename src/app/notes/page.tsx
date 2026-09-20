'use client';

import { useState, useEffect } from 'react';
import { useNoteStore } from '@/stores/note-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { NoteCard } from '@/components/notes/note-card';
import { NoteEditor } from '@/components/notes/note-editor';
import { JournalView } from '@/components/notes/journal-view';
import { RichEditor } from '@/components/notes/rich-editor';

export default function NotesPage() {
  const { notes, loadNotes, addNote, updateNote } = useNoteStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const filteredNotes = notes.filter(n => n.type === 'note' && (n.title.toLowerCase().includes(search.toLowerCase()) || n.plainText.toLowerCase().includes(search.toLowerCase())));
  const scratchNote = notes.find(n => n.type === 'scratch');

  const handleCreateNote = async () => {
    const note = await addNote({
      title: '',
      content: '',
      plainText: '',
      type: 'note',
      tags: [],
      isPinned: false
    });
    setEditingNoteId(note.id);
  };

  const handleScratchChange = (html: string, plainText: string) => {
    if (scratchNote) {
      updateNote(scratchNote.id, { content: html, plainText });
    } else {
      addNote({
        title: 'Scratch Pad',
        content: html,
        plainText,
        type: 'scratch',
        tags: [],
        isPinned: false
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes & Journal</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="scratch">Scratch Pad</TabsTrigger>
          </TabsList>
          
          {activeTab === 'notes' && (
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  className="pl-8"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateNote}>
                <Plus className="h-4 w-4 mr-2" /> New Note
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="notes" className="flex-1 overflow-y-auto m-0 outline-none">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 pb-12">
            {filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} onClick={() => setEditingNoteId(note.id)} />
            ))}
            {filteredNotes.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                No notes found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="journal" className="flex-1 m-0 h-full">
          <JournalView />
        </TabsContent>

        <TabsContent value="scratch" className="flex-1 m-0 h-full border rounded-lg bg-card">
          <RichEditor 
            content={scratchNote?.content || ''} 
            onChange={handleScratchChange} 
            placeholder="Jot down quick thoughts here... (auto-saves)"
          />
        </TabsContent>
      </Tabs>

      {editingNoteId && (
        <NoteEditor noteId={editingNoteId} onClose={() => setEditingNoteId(null)} />
      )}
    </div>
  );
}
