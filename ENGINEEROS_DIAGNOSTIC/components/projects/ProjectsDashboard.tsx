import React, { useState } from 'react';
import { ProjectItem } from '../../types';
import { Briefcase, Search, Plus, ArrowRight, MapPin, Edit2 } from 'lucide-react';
import ProjectFormModal from './ProjectFormModal';

interface ProjectsDashboardProps {
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
  onSaveProject: (project: ProjectItem) => void;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  onSelectProject,
  onSaveProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    }
    return true;
  });

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

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Active Site Projects & Governance</span>
          </div>
          <h2 className="text-xl font-bold">Enterprise Project Portfolio ({projects.length})</h2>
          <p className="text-xs text-slate-300 mt-1">
            Site progress, project health scorecards, budget tracking & Single Source Connected decision logs.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by code, name, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'In Progress', 'Design Phase', 'Inspection', 'Completed', 'Delayed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${statusFilter === st
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-40 bg-slate-800 overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
                    No Image
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-emerald-400 font-mono border border-slate-700">
                  {project.code}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono shadow">
                  Health {project.health?.overall || 85}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(project);
                  }}
                  className="absolute bottom-3 right-3 p-1.5 bg-black/60 hover:bg-emerald-600 rounded-lg transition-colors"
                  title="Edit Project"
                >
                  <Edit2 size={16} className="text-white" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{project.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-mono">
                    <span>Construction Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">BUDGET</span>
                    <span className="font-bold text-slate-900 dark:text-white">${(project.budget / 1e6).toFixed(1)}M</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SPENT</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${(project.spent / 1e6).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                Lead: {project.leadEngineer?.split(',')[0] || 'Unknown'}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline">
                Open Project Hub <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={onSaveProject}
        project={editingProject}
      />
    </div>
  );
};
