import React, { useState } from 'react';
import { useProject } from '../../hooks/useProject';
import { ProjectItem, DecisionItem, SingleSourceLink } from '../../types';
import { DrawingStudio } from './DrawingStudio';
import { DecisionLog } from './DecisionLog';
import ProjectHealth from './ProjectHealth';
import ProjectFormModal from '../../components/projects/ProjectFormModal';
import { ProcurementPage } from '../../modules/procurement/pages/ProcurementPage';

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
} from 'lucide-react';

type ProjectView =
  | 'overview'
  | 'decisions'
  | 'drawings'
  | 'health'
  | 'procurement';

interface ProjectDetailProps {
  decisions: DecisionItem[];
  onBack: () => void;
  onOpenDecisionModal: () => void;
  onOpenTrace: (
    root: {
      id: string;
      type: string;
      title: string;
      subtitle?: string;
    },
    links: SingleSourceLink[]
  ) => void;
  onSaveProject: (project: any) => void;
  onApproveDecision?: (decisionId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  decisions,
  onBack,
  onOpenDecisionModal,
  onOpenTrace,
  onSaveProject,
  onApproveDecision,
}) => {
  const { project } = useProject();

  const [projectView, setProjectView] =
    useState<ProjectView>('overview');

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const projectDecisions = decisions.filter(
    (d) =>
      d.projectId === project.id ||
      d.projectName === project.name
  );

  // ============================================================
  // STATUS COLOR
  // ============================================================

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

  // ============================================================
  // OVERVIEW
  // ============================================================

  const renderOverview = () => (
    <div className="space-y-6">
      {/* ========================================================
          OVERVIEW CONTENT
      ======================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ======================================================
            LEFT SIDE
        ====================================================== */}

        <div className="lg:col-span-2 space-y-6">

          {/* Project Scope */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Project Scope & Engineering Summary
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.description ||
                'No description available for this project.'}
            </p>
          </div>

          {/* Budget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Budget & Cashflow Burn
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">

              {/* Total Budget */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">
                  TOTAL BUDGET
                </span>

                <span className="text-base font-bold text-slate-900 dark:text-white">
                  ${(project.budget / 1e6).toFixed(2)}M
                </span>
              </div>

              {/* Expenditure */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">
                  TOTAL EXPENDITURE
                </span>

                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  ${(project.spent / 1e6).toFixed(2)}M
                </span>
              </div>

              {/* Remaining */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">
                  REMAINING CONTINGENCY
                </span>

                <span className="text-base font-bold text-amber-500">
                  ${(
                    (project.budget - project.spent) /
                    1e6
                  ).toFixed(2)}
                  M
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ======================================================
            PROJECT STATS
        ====================================================== */}

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Project Stats
          </h3>

          <div className="space-y-3">

            {/* ==================================================
                DECISIONS
            ================================================== */}

            <div
              onClick={() => setProjectView('decisions')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Decisions
                  </p>

                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {projectDecisions.length}
                  </p>
                </div>

                <Bookmark className="w-5 h-5 text-emerald-500" />
              </div>

              <p className="text-[10px] text-emerald-500 mt-1">
                Click to view →
              </p>
            </div>

            {/* ==================================================
                DRAWINGS
            ================================================== */}

            <div
              onClick={() => setProjectView('drawings')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Drawings
                  </p>

                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    34
                  </p>
                </div>

                <Layers className="w-5 h-5 text-blue-500" />
              </div>

              <p className="text-[10px] text-emerald-500 mt-1">
                Click to view →
              </p>
            </div>

            {/* ==================================================
                HEALTH
            ================================================== */}

            <div
              onClick={() => setProjectView('health')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Health
                  </p>

                  <p className="text-2xl font-bold text-emerald-500">
                    {project.health?.overall || 85}%
                  </p>
                </div>

                <Activity className="w-5 h-5 text-emerald-500" />
              </div>

              <p className="text-[10px] text-emerald-500 mt-1">
                Click to view →
              </p>
            </div>

            {/* ==================================================
                PROCUREMENT
            ================================================== */}

            <div
              onClick={() => setProjectView('procurement')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Procurement
                  </p>

                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    —
                  </p>
                </div>

                <Briefcase className="w-5 h-5 text-amber-500" />
              </div>

              <p className="text-[10px] text-emerald-500 mt-1">
                Click to view →
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ========================================================
          NAVIGATION HEADER
      ======================================================== */}

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

          {projectView === 'overview'
            ? 'Back to Projects Directory'
            : 'Back to Project Hub'}
        </button>

        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800">
          Project Hub: {project.code}
        </span>

      </div>

      {/* ========================================================
          HERO CARD
      ======================================================== */}

      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">

        <div className="space-y-2">

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">

            <span
              className={`px-2 py-0.5 rounded ${getStatusColor(
                project.status
              )} text-white`}
            >
              {project.status}
            </span>

            <span>{project.client}</span>

          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {project.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono pt-1">

            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {project.location}
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Target: {project.expectedCompletion}
            </span>

            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Lead: {project.leadEngineer}
            </span>

          </div>
        </div>

        {/* ======================================================
            HERO ACTIONS
        ====================================================== */}

        <div className="flex items-center gap-3 shrink-0">

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition flex items-center gap-2"
          >
            <Edit2 size={16} />
            Edit Project
          </button>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">

            <span className="text-[10px] text-slate-400 block font-mono">
              PROJECT HEALTH
            </span>

            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {project.health?.overall || 85}%
            </span>

          </div>

        </div>
      </div>

      {/* ========================================================
          VIEWS
      ======================================================== */}

      {projectView === 'overview' && renderOverview()}

      {/* ========================================================
          DRAWINGS
      ======================================================== */}

      {projectView === 'drawings' && (
        <DrawingStudio
          onOpenTrace={onOpenTrace}
          onBack={() => setProjectView('overview')}
          onUploadDrawing={() => {
            console.log('OPEN DRAWING MODAL');
          }}
        />
      )}

      {/* ========================================================
          DECISIONS
      ======================================================== */}

      {projectView === 'decisions' && (
        <DecisionLog
          decisions={projectDecisions}
          onBack={() => setProjectView('overview')}
          onOpenModal={onOpenDecisionModal}
          onOpenTrace={onOpenTrace}
          onApproveDecision={onApproveDecision}
        />
      )}

      {/* ========================================================
          HEALTH
      ======================================================== */}

      {projectView === 'health' && (
        <ProjectHealth
          health={project.health}
        />
      )}

      {/* ========================================================
          PROCUREMENT
      ======================================================== */}

      {projectView === 'procurement' && (
        <ProcurementPage
          projectId={project.id}
        />
      )}

      {/* ========================================================
          EDIT PROJECT MODAL
      ======================================================== */}

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={onSaveProject}
        project={project}
        workspaceId={project.workspaceId || 'default-workspace'}
        userId={'current-user-id'}
      />

    </div>
  );
};