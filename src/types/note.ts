// ============================================
// Note type definitions
// ============================================
import { BaseEntity, NoteType, DateString } from './common';

/** A note / journal entry */
export interface Note extends BaseEntity {
  title: string;
  content: string;           // HTML content from TipTap editor
  plainText: string;         // Plain text version for search
  type: NoteType;            // 'note' | 'journal' | 'scratch'
  date: DateString | null;   // For journal entries (YYYY-MM-DD)
  tags: string[];            // Tag IDs
  isPinned: boolean;
  isArchived: boolean;
  color: string | null;      // Optional card background color
}
