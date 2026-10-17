// src/pages/Workspace/Dashboard.tsx

import React from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useDecisionStore } from '../../stores/decisionStore';
import { useCompanyStore } from '../../stores/companyStore';

import { World } from '../../types';  // ✅ ADD THIS IMPORT

interface DashboardProps {
  user?: any;
  projects?: any[];
  decisions?: any[];
  notes?: any[];
  timeline?: any[];
  onSelectWorld?: (world: World) => void;  // ✅ Changed from string to World
  onOpenDecisionModal?: () => void;
  onOpenAIChat?: () => void;
  onSelectProject?: (project: any) => void;
}

const Dashboard = ({
  user,
  projects: propProjects,
  decisions: propDecisions,
  notes = [],
  onSelectWorld,
  onOpenDecisionModal,
  onOpenAIChat,
  onSelectProject,
}: DashboardProps) => {
  // Use props if provided, otherwise fallback to stores
  const { projects: storeProjects } = useProjectStore();
  const { decisions: storeDecisions } = useDecisionStore();
  const { activeCompanyId } = useCompanyStore();

  const projects = propProjects || storeProjects || [];
  const decisions = propDecisions || storeDecisions || [];

  // Filter for active company
  const companyProjects = projects.filter(p => p.companyId === activeCompanyId);
  const companyDecisions = decisions.filter(d => d.companyId === activeCompanyId);

  const pendingDecisions = companyDecisions.filter(d => d.status === 'Pending' || d.status === 'draft');
  const recentActivity = [...companyDecisions, ...companyProjects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Engineer Dashboard</h1>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {user?.name || 'Martin'}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Projects</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {companyProjects.filter(p => p.status !== 'Completed').length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Pending Decisions</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {pendingDecisions.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Projects</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {companyProjects.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Company</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {activeCompanyId ? '✅' : '❌'}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400">
                  {item.title || item.name || 'Activity'}
                </span>
                <span className="ml-auto text-xs text-slate-400">
                  {item.updatedAt || item.createdAt
                    ? new Date(item.updatedAt || item.createdAt).toLocaleDateString()
                    : 'Recently'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {onSelectProject && companyProjects.slice(0, 3).map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition text-left"
          >
            <h3 className="font-medium text-slate-900 dark:text-white">{project.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{project.code}</p>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;