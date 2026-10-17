// src/types/note.ts

import type { SingleSourceLink } from './index';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  tags: string[];
  hasAudio: boolean;
  hasSketch: boolean;
  linkedAssets: SingleSourceLink[];

  userId?: string;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NoteItem = Note;
