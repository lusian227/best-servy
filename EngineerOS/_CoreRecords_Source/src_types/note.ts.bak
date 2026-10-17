// src/types/note.ts

export interface SingleSourceLink {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  date: string;
  status?: string;
  author?: string;
}

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
  createdAt?: string;
  updatedAt?: string;
}

export type NoteItem = Note;
