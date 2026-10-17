import { useMemo } from 'react';
import { useEngineerStore } from '../store/engineerStore';

export const useDecision = (decisionId?: string) => {
  const { decisions } = useEngineerStore();

  const decision = decisionId
    ? decisions.find((d) => d.id === decisionId)
    : null;

  return {
    decision,
    decisions,
  };
};
