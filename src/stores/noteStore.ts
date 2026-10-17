// src/stores/noteStore.ts

import { create } from 'zustand';
import { NoteItem } from '../types';
import { NoteRepository } from '../repositories';

const noteRepo = new NoteRepository();

interface NoteState {
  notes: NoteItem[];
  loading: boolean;
  error: string | null;
  loadNotes: () => void;
  saveNote: (note: NoteItem) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  loading: false,
  error: null,

  loadNotes: () => {
    set({ loading: true });
    try {
      const notes = noteRepo.findAll();
      set({ notes, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to load notes' });
    }
  },

  saveNote: (note) => {
    try {
      noteRepo.save(note);
      set({ notes: noteRepo.findAll() });
    } catch (error) {
      set({ error: 'Failed to save note' });
    }
  },
}));
