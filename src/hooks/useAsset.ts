import { useMemo } from 'react';
import { useEngineerStore } from '../store/engineerStore';

export const useAsset = (assetId?: string) => {
  const { assets } = useEngineerStore();

  const asset = assetId
    ? assets.find((a) => a.id === assetId)
    : null;

  return {
    asset,
    assets,
  };
};
