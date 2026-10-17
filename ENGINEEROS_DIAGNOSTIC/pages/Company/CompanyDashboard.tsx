import React from 'react';
import { Users, Building2, BarChart, Clock } from 'lucide-react';

interface CompanyDashboardProps {
  user: any;
}

const CompanyDashboard = ({ user }: CompanyDashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Workspace</h1>
        <span className="text-sm text-gray-400">{user?.company || 'Your Company'}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <Building2 className="text-emerald-500 mb-2" size={24} />
          <p className="text-sm text-gray-400">Departments</p>
          <p className="text-2xl font-bold">6</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <Users className="text-blue-500 mb-2" size={24} />
          <p className="text-sm text-gray-400">Employees</p>
          <p className="text-2xl font-bold">42</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <BarChart className="text-amber-500 mb-2" size={24} />
          <p className="text-sm text-gray-400">Active Projects</p>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <Clock className="text-purple-500 mb-2" size={24} />
          <p className="text-sm text-gray-400">Hours Tracked</p>
          <p className="text-2xl font-bold">1,248</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold mb-4">Recent Company Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
            <span>New employee joined: Sarah Kimani - Structural Engineer</span>
            <span className="text-xs text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
            <span>Project Alpha: Client meeting scheduled for Friday</span>
            <span className="text-xs text-gray-400">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Monthly report generated: July 2026</span>
            <span className="text-xs text-gray-400">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
