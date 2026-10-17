import { useMemo } from 'react';
import { useEngineerStore } from '../store/engineerStore';

export const useRFI = (rfiId?: string) => {
  const { rfis } = useEngineerStore();

  const rfi = rfiId
    ? rfis.find((r) => r.id === rfiId)
    : null;

  return {
    rfi,
    rfis,
  };
};
