// src/repositories/ProjectRepository.ts

import { ProjectItem } from '../types';
import { getProjects, saveProject } from '../lib/storage';
import { IRepository } from './IRepository';

export class ProjectRepository implements IRepository<ProjectItem> {
  findAll(): ProjectItem[] {
    return getProjects();
  }

  findById(id: string): ProjectItem | undefined {
    return getProjects().find(p => p.id === id);
  }

  save(project: ProjectItem): ProjectItem[] {
    return saveProject(project);
  }

  delete(id: string): ProjectItem[] {
    // For now, just return all projects
    // Implement actual delete when needed
    return getProjects();
  }
}
