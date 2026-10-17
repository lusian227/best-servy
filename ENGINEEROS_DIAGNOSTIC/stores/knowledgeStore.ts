// src/stores/knowledgeStore.ts

import { create } from 'zustand';
import { LessonItem } from '../types';
import { getLessons, saveLesson } from '../lib/storage';

interface KnowledgeState {
  lessons: LessonItem[];
  loading: boolean;
  error: string | null;
  loadLessons: () => void;
  saveLesson: (lesson: LessonItem) => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  lessons: [],
  loading: false,
  error: null,
  loadLessons: () => {
    set({ loading: true });
    try {
      const lessons = getLessons();
      set({ lessons, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to load lessons' });
    }
  },
  saveLesson: (lesson) => {
    try {
      saveLesson(lesson);
      set({ lessons: getLessons() });
    } catch (error) {
      set({ error: 'Failed to save lesson' });
    }
  },
}));
