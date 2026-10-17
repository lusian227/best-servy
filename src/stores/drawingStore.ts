// src/stores/drawingStore.ts

import { create } from 'zustand';
import { DrawingItem } from '../types';
import { DrawingRepository } from '../repositories';

const drawingRepo = new DrawingRepository();

interface DrawingState {
  drawings: DrawingItem[];
  loading: boolean;
  error: string | null;
  loadDrawings: () => void;
  saveDrawing: (drawing: DrawingItem) => void;
  getDrawingsByProject: (projectId: string) => DrawingItem[];
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  drawings: [],
  loading: false,
  error: null,

  loadDrawings: () => {
    set({ loading: true });
    try {
      const drawings = drawingRepo.findAll();
      set({ drawings, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to load drawings' });
    }
  },

  saveDrawing: (drawing) => {
    try {
      const updated = drawingRepo.save(drawing);
      set({ drawings: updated });
    } catch (error) {
      set({ error: 'Failed to save drawing' });
    }
  },

  getDrawingsByProject: (projectId) => {
    return get().drawings.filter((d) => d.projectId === projectId);
  },
}));
