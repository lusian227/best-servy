import React from 'react';

interface DashboardProps {
  user?: any;
  projects?: any[];
  decisions?: any[];
  notes?: any[];
  timeline?: any[];
  onSelectWorld?: (world: string) => void;
  onOpenDecisionModal?: () => void;
  onOpenAIChat?: () => void;
  onSelectProject?: (project: any) => void;
}

const Dashboard = ({ user, projects, decisions, notes }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Engineer Dashboard</h1>
        <span className="text-sm text-gray-400">Welcome back, {user?.name || 'Martin'}</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="text-3xl font-bold text-emerald-600">{projects?.length || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-gray-500">Pending Decisions</p>
          <p className="text-3xl font-bold text-amber-600">{decisions?.filter(d => d.status === 'Pending').length || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-gray-500">Open Tasks</p>
          <p className="text-3xl font-bold text-blue-600">5</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-gray-500">AI Insights</p>
          <p className="text-3xl font-bold text-purple-600">3</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Project Alpha: Inspection completed</span>
            <span className="ml-auto text-xs text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Decision #42: Pending approval</span>
            <span className="ml-auto text-xs text-gray-400">5 hours ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Drawing S-101: Revision uploaded</span>
            <span className="ml-auto text-xs text-gray-400">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
