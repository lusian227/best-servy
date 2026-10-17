// src/stores/marketplaceStore.ts

import { create } from 'zustand';
import { MarketplaceListing } from '../types';
import { getListings, saveListing } from '../lib/storage';

interface MarketplaceState {
  listings: MarketplaceListing[];
  loading: boolean;
  error: string | null;
  loadListings: () => void;
  saveListing: (listing: MarketplaceListing) => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  listings: [],
  loading: false,
  error: null,
  loadListings: () => {
    set({ loading: true });
    try {
      const listings = getListings();
      set({ listings, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to load listings' });
    }
  },
  saveListing: (listing) => {
    try {
      saveListing(listing);
      set({ listings: getListings() });
    } catch (error) {
      set({ error: 'Failed to save listing' });
    }
  },
}));
