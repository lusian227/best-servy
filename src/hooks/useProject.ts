import { useEffect, useMemo } from 'react';
import { useEngineerStore } from '../store/engineerStore';

export const useProject = (projectId?: string) => {
  const {
    projects,
    selectedProject,
    currentProjectId,
    setCurrentProject,
    isLoading,
    error,
  } = useEngineerStore();

  const project = projectId
    ? projects.find((p) => p.id === projectId)
    : selectedProject;

  const id = projectId || currentProjectId;

  useEffect(() => {
    if (id) {
      setCurrentProject(id);
    }
  }, [id, setCurrentProject]);

  const healthStatus = useMemo(() => {
    if (!project?.health) return 'Unknown';
    if (project.health.overall >= 90) return 'Excellent';
    if (project.health.overall >= 75) return 'Healthy';
    if (project.health.overall >= 50) return 'Warning';
    return 'Critical';
  }, [project]);

  return {
    project,
    projects,
    healthStatus,
    isLoading,
    error,
    setCurrentProject,
  };
};
