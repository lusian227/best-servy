import { useMemo } from 'react';
import { useEngineerStore } from '../store/engineerStore';

export const useDrawing = (drawingId?: string) => {
  const { drawings } = useEngineerStore();

  const drawing = drawingId
    ? drawings.find((d) => d.id === drawingId)
    : null;

  return {
    drawing,
    drawings,
  };
};
