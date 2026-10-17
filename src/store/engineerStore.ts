import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface EngineerState {
  projects: any[];
  currentProjectId: string | null;
  selectedProject: any | null;
  drawings: any[];
  decisions: any[];
  rfis: any[];
  assets: any[];
  reports: any[];
  weather: any | null;
  isLoading: boolean;
  error: string | null;
  setProjects: (projects: any[]) => void;
  setCurrentProject: (projectId: string) => void;
  setDrawings: (drawings: any[]) => void;
  setDecisions: (decisions: any[]) => void;
  setRFIs: (rfis: any[]) => void;
  setAssets: (assets: any[]) => void;
  setReports: (reports: any[]) => void;
  setWeather: (weather: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useEngineerStore = create<EngineerState>()(
  devtools(
    persist(
      (set, get) => ({
        projects: [],
        currentProjectId: null,
        selectedProject: null,
        drawings: [],
        decisions: [],
        rfis: [],
        assets: [],
        reports: [],
        weather: null,
        isLoading: false,
        error: null,
        setProjects: (projects) => set({ projects }),
        setCurrentProject: (projectId) =>
          set((state) => ({
            currentProjectId: projectId,
            selectedProject: state.projects.find((p) => p.id === projectId) || null,
          })),
        setDrawings: (drawings) => set({ drawings }),
        setDecisions: (decisions) => set({ decisions }),
        setRFIs: (rfis) => set({ rfis }),
        setAssets: (assets) => set({ assets }),
        setReports: (reports) => set({ reports }),
        setWeather: (weather) => set({ weather }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        reset: () =>
          set({
            projects: [],
            currentProjectId: null,
            selectedProject: null,
            drawings: [],
            decisions: [],
            rfis: [],
            assets: [],
            reports: [],
            weather: null,
            isLoading: false,
            error: null,
          }),
      }),
      { name: 'engineer-store' }
    ),
    { name: 'EngineerStore' }
  )
);
