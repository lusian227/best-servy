// src/components/projects/ProjectsDashboard.tsx

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  ArrowRight,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react';

import { ProjectItem } from '../../types';
import ProjectFormModal from './ProjectFormModal';
import { useCompanyStore } from '../../stores/companyStore';

interface ProjectsDashboardProps {
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
  onSaveProject: (project: ProjectItem) => void;
  onDeleteProject: (id: string) => Promise<boolean>;
  workspaceId: string;  // ← ADD 
  userId: string;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  onSelectProject,
  onSaveProject,
  onDeleteProject,
  workspaceId,  // ← ADD THIS
  userId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState<ProjectItem | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] =
    useState<ProjectItem | null>(null);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // ============================================================
  // GET ACTIVE COMPANY
  // ============================================================

  const { activeCompanyId } = useCompanyStore();

  // ============================================================
  // FILTER PROJECTS BY COMPANY
  // ============================================================

  const companyProjects = useMemo(() => {
    if (!activeCompanyId) return projects;
    return projects.filter((p) => p.companyId === activeCompanyId);
  }, [projects, activeCompanyId]);

  // ============================================================
  // FILTER PROJECTS (Search + Status)
  // ============================================================

  const filtered = companyProjects.filter((project) => {
    if (
      statusFilter !== 'All' &&
      project.status !== statusFilter
    ) {
      return false;
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();

      return (
        project.name.toLowerCase().includes(query) ||
        project.code.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // ============================================================
  // CREATE / EDIT PROJECT
  // ============================================================

  const handleOpenModal = (project?: ProjectItem) => {
    if (project) {
      setEditingProject(project);
    } else {
      setEditingProject(null);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  // ============================================================
  // DELETE PROJECT
  // ============================================================

  const handleDeleteClick = (project: ProjectItem) => {
    setDeleteConfirm(project);
    setDeleteCode('');
    setDeleteError('');
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
    setDeleteCode('');
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) {
      return;
    }

    if (!onDeleteProject) {
      setDeleteError(
        'Project deletion is currently unavailable.'
      );
      return;
    }

    // Project code must match exactly
    if (deleteCode !== deleteConfirm.code) {
      setDeleteError(
        `Project code does not match. Type "${deleteConfirm.code}" to confirm.`
      );
      return;
    }

    try {
      const success = await onDeleteProject(deleteConfirm.id);

      if (success) {
        setDeleteConfirm(null);
        setDeleteCode('');
        setDeleteError('');
      } else {
        setDeleteError(
          'The project could not be deleted. Please try again.'
        );
      }
    } catch (error) {
      console.error('Failed to delete project:', error);

      setDeleteError(
        'An unexpected error occurred while deleting the project.'
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-emerald-500" />

            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Site Projects & Governance
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Enterprise Project Portfolio
            <span className="ml-2 text-sm font-mono text-slate-400">
              ({companyProjects.length})
            </span>
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Site progress, project health scorecards, budget
            tracking & Single Source Connected decision logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* ======================================================
          SEARCH + FILTER
      ====================================================== */}

      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">

        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

          <input
            type="text"
            placeholder="Search projects by code, name, or location..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            'All',
            'In Progress',
            'Design Phase',
            'Inspection',
            'Completed',
            'Delayed',
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${statusFilter === status
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================
          PROJECT GRID
      ====================================================== */}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
          <Briefcase className="w-8 h-8 mx-auto text-slate-400 mb-3" />

          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            No projects found
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeCompanyId ? 'No projects for this company.' : 'Try changing your search or status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filtered.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
            >

              {/* ==================================================
                  PROJECT CONTENT
              ================================================== */}

              <div>

                {/* PROJECT IMAGE */}
                <div className="relative h-40 bg-slate-800 overflow-hidden">

                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
                      No Image
                    </div>
                  )}

                  {/* PROJECT CODE */}
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-emerald-400 font-mono border border-slate-700">
                    {project.code}
                  </span>

                  {/* HEALTH */}
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono shadow">
                    Health {project.health?.overall ?? 85}%
                  </span>

                  {/* EDIT BUTTON */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenModal(project);
                    }}
                    className="absolute bottom-3 right-3 p-1.5 bg-black/60 hover:bg-emerald-600 rounded-lg transition-colors"
                    title="Edit Project"
                  >
                    <Edit2
                      size={16}
                      className="text-white"
                    />
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteClick(project);
                    }}
                    className="absolute bottom-3 right-12 p-1.5 bg-black/60 hover:bg-red-600 rounded-lg transition-colors"
                    title="Permanently Delete Project"
                  >
                    <Trash2
                      size={16}
                      className="text-white"
                    />
                  </button>
                </div>

                {/* PROJECT DETAILS */}
                <div className="p-4 space-y-3">

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                      {project.name}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />

                      <span className="truncate">
                        {project.location}
                      </span>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-mono">
                      <span>
                        Construction Progress
                      </span>

                      <span className="font-bold text-slate-900 dark:text-white">
                        {project.progress}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{
                          width: `${project.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* BUDGET / SPENT */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-mono">

                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        BUDGET
                      </span>

                      <span className="font-bold text-slate-900 dark:text-white">
                        ${(project.budget / 1e6).toFixed(1)}M
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        SPENT
                      </span>

                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ${(project.spent / 1e6).toFixed(1)}M
                      </span>
                    </div>

                  </div>
                </div>
              </div>

              {/* ==================================================
                  PROJECT FOOTER
              ================================================== */}

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">

                <span className="text-slate-500 dark:text-slate-400 font-mono truncate mr-2">
                  Lead:{' '}
                  {project.leadEngineer?.split(',')[0] ||
                    'Unknown'}
                </span>

                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 whitespace-nowrap">
                  Open Project Hub
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={onSaveProject}
        project={editingProject}
        workspaceId={workspaceId}
        userId={userId}
      />

      {/* ======================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-500/20"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Permanently Delete Project
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Destructive action
                </p>
              </div>

            </div>

            {/* WARNING */}
            <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                This action cannot be undone.
              </p>
            </div>

            {/* PROJECT INFO */}
            <div className="mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You are about to permanently delete:
              </p>

              <span className="block mt-1 font-semibold text-slate-900 dark:text-white">
                {deleteConfirm.name}
              </span>

              <span className="block text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                {deleteConfirm.code}
              </span>
            </div>

            {/* WHAT GETS DELETED */}
            <div className="mb-4">

              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                The following project data will be removed:
              </p>

              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                <li>• Project</li>
                <li>• Project drawings</li>
                <li>• Project decisions</li>
                <li>• Project notes</li>
              </ul>

              <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                Records stored in Supabase and future work
                items are not deleted by this operation yet.
              </p>

            </div>

            {/* CONFIRMATION */}
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type the project code to confirm
            </label>

            <div className="mb-2">
              <span className="inline-block font-mono text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded">
                {deleteConfirm.code}
              </span>
            </div>

            <input
              type="text"
              value={deleteCode}
              onChange={(event) => {
                setDeleteCode(event.target.value);
                setDeleteError('');
              }}
              placeholder={deleteConfirm.code}
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
            />

            {/* ERROR */}
            {deleteError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {deleteError}
              </p>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-5">

              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={
                  deleteCode !== deleteConfirm.code
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 size={16} />
                Permanently Delete
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};