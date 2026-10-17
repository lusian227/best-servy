// src/stores/decisionStore.ts

import { create } from 'zustand';
import { DecisionItem } from '../types';
import { DecisionRepository } from '../repositories';

const decisionRepo = new DecisionRepository();

interface DecisionState {
  decisions: DecisionItem[];
  loading: boolean;
  error: string | null;
  loadDecisions: () => void;
  saveDecision: (decision: DecisionItem) => void;
  approveDecision: (id: string) => void;
  getDecisionsByProject: (projectId: string) => DecisionItem[];
}

export const useDecisionStore = create<DecisionState>((set, get) => ({
  decisions: [],
  loading: false,
  error: null,

  loadDecisions: () => {
    set({ loading: true });
    try {
      const decisions = decisionRepo.findAll();
      set({ decisions, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to load decisions' });
    }
  },

  saveDecision: (decision) => {
    try {
      const updated = decisionRepo.save(decision);
      set({ decisions: updated });
    } catch (error) {
      set({ error: 'Failed to save decision' });
    }
  },

  approveDecision: (id) => {
    const { decisions } = get();
    const decision = decisions.find(d => d.id === id);
    if (decision) {
      const updated = { ...decision, status: 'Approved' as const };
      decisionRepo.save(updated);
      set({ decisions: decisionRepo.findAll() });
    }
  },

  getDecisionsByProject: (projectId) => {
    return get().decisions.filter((d) => d.projectId === projectId);
  },
}));
