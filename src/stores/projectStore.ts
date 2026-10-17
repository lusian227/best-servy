// src/stores/projectStore.ts

import { create } from 'zustand';
import { ProjectItem } from '../types';
import { ProjectRepository } from '../repositories/ProjectRepository';

const projectRepo = new ProjectRepository();

// ============================================================
// PROJECT STORE
// ============================================================

interface ProjectStore {
  projects: ProjectItem[];
  selectedProject: ProjectItem | null;
  loading: boolean;
  error: string | null;

  loadProjectsByWorkspace: (workspaceId: string) => void;
  loadProjectsByCompany: (companyId: string) => void;
  loadProjectsByUser: (userId: string) => void;

  setSelectedProject: (project: ProjectItem | null) => void;

  saveProject: (project: ProjectItem) => void;

  getProject: (id: string) => ProjectItem | undefined;

  deleteProject: (id: string) => Promise<boolean>;
}

// ============================================================
// STORE
// ============================================================

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // ----------------------------------------------------------
  // INITIAL STATE
  // ----------------------------------------------------------

  projects: [],

  selectedProject: null,

  loading: false,

  error: null,

  // ==========================================================
  // LOAD BY WORKSPACE
  // ==========================================================

  loadProjectsByWorkspace: (workspaceId: string) => {
    if (!workspaceId) {
      console.warn(
        '[ProjectStore] loadProjectsByWorkspace called without workspaceId'
      );

      set({
        projects: [],
        selectedProject: null,
        loading: false,
        error: null,
      });

      return;
    }

    try {
      set({
        loading: true,
        error: null,
      });

      const projects = projectRepo.findByWorkspaceId(workspaceId);

      console.log(
        '[ProjectStore] Workspace:',
        workspaceId
      );

      console.log(
        '[ProjectStore] Projects:',
        projects
      );

      // ------------------------------------------------------
      // IMPORTANT:
      // [] IS A VALID RESULT.
      //
      // Never keep projects from another workspace.
      // ------------------------------------------------------

      set({
        projects: projects ?? [],
        selectedProject: null,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error(
        '[ProjectStore] Failed to load workspace projects:',
        error
      );

      set({
        projects: [],
        selectedProject: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load workspace projects',
      });
    }
  },

  // ==========================================================
  // LOAD BY COMPANY
  // ==========================================================

  loadProjectsByCompany: (companyId: string) => {
    if (!companyId) {
      console.warn(
        '[ProjectStore] loadProjectsByCompany called without companyId'
      );

      set({
        projects: [],
        selectedProject: null,
        loading: false,
        error: null,
      });

      return;
    }

    try {
      set({
        loading: true,
        error: null,
      });

      const projects =
        projectRepo.findByCompanyId(companyId);

      console.log(
        '[ProjectStore] Company:',
        companyId
      );

      console.log(
        '[ProjectStore] Projects:',
        projects
      );

      set({
        projects: projects ?? [],
        selectedProject: null,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error(
        '[ProjectStore] Failed to load company projects:',
        error
      );

      set({
        projects: [],
        selectedProject: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load company projects',
      });
    }
  },

  // ==========================================================
  // LOAD BY USER
  // ==========================================================

  loadProjectsByUser: (userId: string) => {
    if (!userId) {
      console.warn(
        '[ProjectStore] loadProjectsByUser called without userId'
      );

      set({
        projects: [],
        selectedProject: null,
        loading: false,
        error: null,
      });

      return;
    }

    try {
      set({
        loading: true,
        error: null,
      });

      const projects =
        projectRepo.findByUserId(userId);

      console.log(
        '[ProjectStore] User:',
        userId
      );

      console.log(
        '[ProjectStore] Projects:',
        projects
      );

      set({
        projects: projects ?? [],
        selectedProject: null,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error(
        '[ProjectStore] Failed to load user projects:',
        error
      );

      set({
        projects: [],
        selectedProject: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load user projects',
      });
    }
  },

  // ==========================================================
  // SELECT PROJECT
  // ==========================================================

  setSelectedProject: (project) => {
    set({
      selectedProject: project,
    });
  },

  // ==========================================================
  // SAVE PROJECT
  // ==========================================================

  saveProject: (project) => {
    try {
      set({
        loading: true,
        error: null,
      });

      // Persist through repository
      projectRepo.save(project);

      const currentProjects = get().projects;

      const exists = currentProjects.some(
        (p) => p.id === project.id
      );

      const updatedProjects = exists
        ? currentProjects.map((p) =>
          p.id === project.id
            ? project
            : p
        )
        : [...currentProjects, project];

      set({
        projects: updatedProjects,
        selectedProject: project,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error(
        '[ProjectStore] Failed to save project:',
        error
      );

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save project',
      });
    }
  },

  // ==========================================================
  // GET PROJECT
  // ==========================================================

  getProject: (id) => {
    return get().projects.find(
      (project) => project.id === id
    );
  },

  // ==========================================================
  // DELETE PROJECT
  // ==========================================================

  deleteProject: async (id) => {
    try {
      set({
        loading: true,
        error: null,
      });

      projectRepo.deletePermanent(id);

      const updatedProjects =
        get().projects.filter(
          (project) => project.id !== id
        );

      const selectedProject =
        get().selectedProject;

      set({
        projects: updatedProjects,
        selectedProject:
          selectedProject?.id === id
            ? null
            : selectedProject,
        loading: false,
        error: null,
      });

      return true;

    } catch (error) {
      console.error(
        '[ProjectStore] Failed to delete project:',
        error
      );

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete project',
      });

      return false;
    }
  },
}));