// src/stores/projectStore.ts

import { create } from 'zustand';
import { ProjectItem } from '../types';
import { ProjectRepository } from '../repositories';

const projectRepo = new ProjectRepository();

interface ProjectState {
  projects: ProjectItem[];
  selectedProject: ProjectItem | null;
  loading: boolean;
  error: string | null;
  loadProjects: () => void;
  setSelectedProject: (project: ProjectItem | null) => void;
  saveProject: (project: ProjectItem) => void;
  getProject: (id: string) => ProjectItem | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,

  loadProjects: () => {
    set({ loading: true });
    try {
      const projects = projectRepo.findAll();
      set({ projects, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Failed to load projects' });
    }
  },

  setSelectedProject: (project) => {
    set({ selectedProject: project });
  },

  saveProject: (project) => {
    try {
      const updated = projectRepo.save(project);
      set({ projects: updated });
      const { selectedProject } = get();
      if (selectedProject?.id === project.id) {
        const updatedProject = updated.find(p => p.id === project.id);
        if (updatedProject) set({ selectedProject: updatedProject });
      }
    } catch (error) {
      set({ error: 'Failed to save project' });
    }
  },

  getProject: (id) => {
    return get().projects.find(p => p.id === id);
  },
}));
