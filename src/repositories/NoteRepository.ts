// src/repositories/NoteRepository.ts

import { NoteItem } from '../types';
import { getNotes, saveNote } from '../lib/storage';
import { IRepository } from './IRepository';

export class NoteRepository implements IRepository<NoteItem> {
  findAll(): NoteItem[] {
    return getNotes();
  }

  findById(id: string): NoteItem | undefined {
    return getNotes().find(n => n.id === id);
  }

  save(note: NoteItem): NoteItem[] {
    return saveNote(note);
  }

  delete(id: string): NoteItem[] {
    // Implementation if needed
    return getNotes();
  }
}
