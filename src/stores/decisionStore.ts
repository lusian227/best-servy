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
  loadDecisionsByCompany: (companyId: string) => void;
  saveDecision: (decision: DecisionItem) => void;
  approveDecision: (id: string) => void;
  getDecisionsByProject: (projectId: string) => DecisionItem[];
  getDecisionsByCompany: (companyId: string) => DecisionItem[];
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

  loadDecisionsByCompany: (companyId: string) => {
    set({ loading: true });
    try {
      const allDecisions = decisionRepo.findAll();
      const companyDecisions = allDecisions.filter(
        (d) => d.companyId === companyId
      );
      set({ decisions: companyDecisions, loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load decisions for company',
      });
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
      // ✅ FIXED: Use lowercase to match DecisionItem
      const updated = { ...decision, status: 'approved' as const };
      decisionRepo.save(updated);
      set({ decisions: decisionRepo.findAll() });
    }
  },

  getDecisionsByProject: (projectId) => {
    return get().decisions.filter((d) => d.projectId === projectId);
  },

  getDecisionsByCompany: (companyId: string) => {
    return get().decisions.filter((d) => d.companyId === companyId);
  },
}));