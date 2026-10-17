// src/stores/calculationStore.ts

import { create } from 'zustand';
import { CalculationHistory } from '../types';
import { getCalculations, saveCalculation } from '../lib/storage';

interface CalculationState {
  calculations: CalculationHistory[];
  loading: boolean;
  error: string | null;
  loadCalculations: () => void;
  saveCalculation: (calc: CalculationHistory) => void;
}

export const useCalculationStore = create<CalculationState>((set) => ({
  calculations: [],
  loading: false,
  error: null,
  loadCalculations: () => {
    set({ loading: true });
    try {
      const calculations = getCalculations();
      set({ calculations, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to load calculations' });
    }
  },
  saveCalculation: (calc) => {
    try {
      saveCalculation(calc);
      set({ calculations: getCalculations() });
    } catch (error) {
      set({ error: 'Failed to save calculation' });
    }
  },
}));
