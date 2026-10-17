import React, { useState } from 'react';
import { ProjectItem, DecisionItem, SingleSourceLink, DrawingItem } from '../../types';
import { DrawingStudio } from './DrawingStudio';
import { DecisionLog } from './DecisionLog';
import { ProjectHealth } from './ProjectHealth';
import ProjectFormModal from '../../components/projects/ProjectFormModal';
import {
  Briefcase,
  Layers,
  Bookmark,
  Activity,
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit2,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

type ProjectView = 'overview' | 'decisions' | 'drawings' | 'health';

interface ProjectDetailProps {
  project: ProjectItem | null;
  decisions: DecisionItem[];
  drawings: DrawingItem[];  // ðŸ‘ˆ ADDED
  onBack: () => void;
  onOpenDecisionModal: () => void;
  onOpenTrace: (
    root: { id: string; type: string; title: string; subtitle?: string },
    links: SingleSourceLink[]
  ) => void;
  onSaveProject: (project: any) => void;
  onApproveDecision?: (decisionId: string) => void;
  onUploadDrawing: () => void;  // ðŸ‘ˆ ADDED
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  decisions,
  drawings,  // ðŸ‘ˆ ADDED
  onBack,
  onOpenDecisionModal,
  onOpenTrace,
  onSaveProject,
  onApproveDecision,
  onUploadDrawing,  // ðŸ‘ˆ ADDED
}) => {
  const [projectView, setProjectView] = useState<ProjectView>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // âœ… SAFETY CHECK
  if (!project) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-6 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>
        <div className="rounded-xl border border-red-500 bg-red-50 dark:bg-red-950/30 p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Project Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No project has been selected.</p>
        </div>
      </div>
    );
  }

  const projectDecisions = decisions.filter((d) => d.projectId === project.id || d.projectName === project.name);
  console.table(
    drawings.map((d) => ({
      id: d.id,
      projectId: d.projectId,
      title: d.title,
    }))
  );

  const projectDrawings = drawings.filter((d) => {
    console.log(
      "Comparing",
      d.projectId,
      "===",
      project.id
    );
    return d.projectId === project.id;
  });

  console.log("Filtered drawings:", projectDrawings);
  console.log("Current project", project.id, project.name);
  console.log("Matching decisions", decisions.filter(d => d.projectId === project.id));
  console.log("Matching drawings", projectDrawings.length);  // ðŸ‘ˆ ADDED

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-500';
      case 'Design Phase':
        return 'bg-amber-500';
      case 'Inspection':
        return 'bg-purple-500';
      case 'Completed':
        return 'bg-emerald-500';
      case 'Delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Render Overview
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Project Scope & Engineering Summary</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.description || 'No description available for this project.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Budget & Cashflow Burn</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">TOTAL BUDGET</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  ${(project.budget / 1e6).toFixed(2)}M
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">TOTAL EXPENDITURE</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  ${(project.spent / 1e6).toFixed(2)}M
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">REMAINING CONTINGENCY</span>
                <span className="text-base font-bold text-amber-500">
                  ${((project.budget - project.spent) / 1e6).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Project Stats</h3>
          <div className="space-y-3">
            <div
              onClick={() => setProjectView('decisions')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Decisions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{projectDecisions.length}</p>
                </div>
                <Bookmark className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-[10px] text-emerald-500 mt-1">Click to view â†’</p>
            </div>

            <div
              onClick={() => setProjectView('drawings')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Drawings</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{projectDrawings.length}</p>
                </div>
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-[10px] text-emerald-500 mt-1">Click to view â†’</p>
            </div>

            <div
              onClick={() => setProjectView('health')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Health</p>
                  <p className="text-2xl font-bold text-emerald-500">{project.health?.overall || 85}%</p>
                </div>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-[10px] text-emerald-500 mt-1">Click to view â†’</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (projectView !== 'overview') {
              setProjectView('overview');
            } else {
              onBack();
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {projectView === 'overview' ? 'Back to Projects Directory' : 'Back to Project Hub'}
        </button>

        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800">
          Project Hub: {project.code}
        </span>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className={`px-2 py-0.5 rounded ${getStatusColor(project.status)} text-white`}>
              {project.status}
            </span>
            <span>{project.client}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{project.name}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Target: {project.expectedCompletion}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Lead: {project.leadEngineer}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition flex items-center gap-2"
          >
            <Edit2 size={16} />
            Edit Project
          </button>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">PROJECT HEALTH</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{project.health?.overall || 85}%</span>
          </div>
        </div>
      </div>

      {projectView === 'overview' && renderOverview()}

      {projectView === 'drawings' && (
        <DrawingStudio
          drawings={projectDrawings}
          onOpenTrace={onOpenTrace}
          onBack={() => setProjectView("overview")}
          onUploadDrawing={onUploadDrawing}
        />
      )}

      {projectView === 'decisions' && (
        <DecisionLog
          decisions={projectDecisions}
          
          onOpenModal={onOpenDecisionModal}
          onOpenTrace={onOpenTrace}
          onApproveDecision={onApproveDecision}
        />
      )}

      {projectView === 'health' && (
        <ProjectHealth
          health={project.health}
          
        />
      )}

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={onSaveProject}
        project={project}
      />
    </div>
  );
};
