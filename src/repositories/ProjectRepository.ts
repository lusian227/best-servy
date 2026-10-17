// src/repositories/ProjectRepository.ts

import { ProjectItem } from '../types';

import {
  getProjects,
  saveProject,
  deleteProjectCascade,
} from '../lib/storage';

import { IRepository } from './IRepository';

export class ProjectRepository
  implements IRepository<ProjectItem> {

  // ==========================================================
  // FIND ALL
  // ==========================================================

  findAll(): ProjectItem[] {
    return getProjects();
  }

  // ==========================================================
  // FIND BY USER
  // ==========================================================

  findByUserId(
    userId: string
  ): ProjectItem[] {

    if (!userId) {
      return [];
    }

    return getProjects().filter(
      (project) =>
        project.createdBy === userId
    );
  }

  // ==========================================================
  // FIND BY COMPANY
  // ==========================================================

  findByCompanyId(
    companyId: string
  ): ProjectItem[] {

    if (!companyId) {
      return [];
    }

    return getProjects().filter(
      (project) =>
        project.companyId === companyId
    );
  }

  // ==========================================================
  // FIND BY WORKSPACE
  // ==========================================================

  findByWorkspaceId(
    workspaceId: string
  ): ProjectItem[] {

    if (!workspaceId) {
      return [];
    }

    return getProjects().filter(
      (project) =>
        project.workspaceId === workspaceId
    );
  }

  // ==========================================================
  // FIND BY ID
  // ==========================================================

  findById(
    id: string
  ): ProjectItem | undefined {

    return getProjects().find(
      (project) =>
        project.id === id
    );
  }

  // ==========================================================
  // SAVE
  // ==========================================================

  save(
    project: ProjectItem
  ): ProjectItem[] {

    return saveProject(project);
  }

  // ==========================================================
  // PERMANENT DELETE
  // ==========================================================

  deletePermanent(
    id: string
  ): ProjectItem[] {

    return deleteProjectCascade(id);
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  delete(
    id: string
  ): ProjectItem[] {

    return this.deletePermanent(id);
  }
}