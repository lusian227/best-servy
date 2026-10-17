// src/stores/uiStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';
export type World = 'workspace' | 'projects' | 'knowledge' | 'marketplace' | 'ai' | 'company' | 'records';

interface UIState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeWorld: World;
  setActiveWorld: (world: World) => void;
  decisionModalOpen: boolean;
  setDecisionModalOpen: (open: boolean) => void;
  aiChatOpen: boolean;
  setAiChatOpen: (open: boolean) => void;
  supabaseModalOpen: boolean;
  setSupabaseModalOpen: (open: boolean) => void;
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
  tracePanelOpen: boolean;
  setTracePanelOpen: (open: boolean) => void;
  traceRootAsset: { id: string; type: string; title: string; subtitle?: string };
  setTraceRootAsset: (asset: { id: string; type: string; title: string; subtitle?: string }) => void;
  // ✅ ADD THESE TWO LINES
  traceLinks: any[];
  setTraceLinks: (links: any[]) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      activeWorld: 'workspace',
      setActiveWorld: (world) => set({ activeWorld: world }),
      decisionModalOpen: false,
      setDecisionModalOpen: (open) => set({ decisionModalOpen: open }),
      aiChatOpen: false,
      setAiChatOpen: (open) => set({ aiChatOpen: open }),
      supabaseModalOpen: false,
      setSupabaseModalOpen: (open) => set({ supabaseModalOpen: open }),
      uploadModalOpen: false,
      setUploadModalOpen: (open) => set({ uploadModalOpen: open }),
      tracePanelOpen: false,
      setTracePanelOpen: (open) => set({ tracePanelOpen: open }),
      traceRootAsset: {
        id: 'draw-101',
        type: 'drawing',
        title: 'S-101-REV4.pdf',
        subtitle: 'Foundation Pile & Cap Framing Plan',
      },
      setTraceRootAsset: (asset) => set({ traceRootAsset: asset }),
      // ✅ ADD THESE TWO LINES
      traceLinks: [],
      setTraceLinks: (links) => set({ traceLinks: links }),
    }),
    {
      name: 'engineeros-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        activeWorld: state.activeWorld,
      }),
    }
  )
);