// src/pages/Company/CompanyDashboard.tsx

import React, { useState } from 'react';
import { useCompanyStore } from '../../stores/companyStore';
import { CompanyProfile } from '../../components/company/CompanyProfile';
import { CompanyMetrics } from '../../components/company/CompanyMetrics';
import { CompanyActivity } from '../../components/company/CompanyActivity';
import { PeopleList } from '../../components/company/PeopleList';
import { CompanySwitcher } from '../../components/company/CompanySwitcher';
import { CompanyFormModal } from '../../components/company/CompanyFormModal';
import { Users, Activity, Plus, Layers } from 'lucide-react';

interface CompanyDashboardProps {
  onNavigate: (world: string, context?: any) => void;
  onOpenProject: (project: any) => void;
}

export function CompanyDashboard({
  onNavigate,
  onOpenProject,
}: CompanyDashboardProps) {
  // ============================================================
  // STATE
  // ============================================================

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // ============================================================
  // COMPANY STORE
  // App.tsx already loads company data after authentication.
  // This component ONLY reads from the store.
  // ============================================================

  const {
    companies,
    activeCompanyId,
    company,
    members,
    workspaces,
    activity,
    metrics,
    loading,
    switchCompany,
    createCompany,
    addMember,
    removeMember,
  } = useCompanyStore();

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleAddMember = () => {
    const name = prompt('Enter member name:');
    if (!name) return;

    const email = prompt('Enter member email:') || `${name.toLowerCase().replace(/\s/g, '.')}@engineeros.com`;
    const role = prompt('Enter role (admin/manager/engineer/viewer):') || 'engineer';

    addMember({
      userId: `user-${Date.now()}`,
      name,
      email,
      role: role as any,
      title: prompt('Enter title:') || 'Engineer',
      department: prompt('Enter department:') || 'Engineering',
      joinedAt: new Date().toISOString(),
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          COMPANY SWITCHER + ADD COMPANY BUTTON
      ====================================================== */}

      <div className="flex items-center justify-between">
        <CompanySwitcher
          companies={companies}
          activeCompanyId={activeCompanyId}
          onSwitchCompany={switchCompany}
        />

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {companies.length} companies
          </span>

          <button
            type="button"
            onClick={() => setIsCompanyModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition"
          >
            <Plus size={14} />
            Add Company
          </button>
        </div>
      </div>

      {/* ======================================================
          COMPANY PROFILE
      ====================================================== */}

      <CompanyProfile
        company={company}
        onEdit={() => console.log('Edit company clicked')}
      />

      {/* ======================================================
          METRICS
      ====================================================== */}

      <CompanyMetrics
        metrics={metrics}
        loading={loading}
        onNavigate={onNavigate}
      />

      {/* ======================================================
          TWO COLUMN LAYOUT
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* People Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-emerald-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">People</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({members.length})
              </span>
            </div>
            <button
              onClick={handleAddMember}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs transition"
            >
              <Plus size={12} /> Add Member
            </button>
          </div>
          <PeopleList
            members={members}
            loading={loading}
            onRemoveMember={removeMember}
          />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({activity.length})
            </span>
          </div>
          <CompanyActivity activities={activity} loading={loading} />
        </div>

      </div>

      {/* ======================================================
          WORKSPACES
      ====================================================== */}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Workspaces</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({workspaces.length})
          </span>
        </div>

        {workspaces.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            No workspaces created yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() =>
                  onNavigate('workspace', {
                    workspaceId: workspace.id,
                  })
                }
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500/30 transition cursor-pointer"
              >
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {workspace.name}
                </h4>
                {workspace.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {workspace.description}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Created {new Date(workspace.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================
          ADD COMPANY MODAL
      ====================================================== */}

      <CompanyFormModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSave={createCompany}  // ✅ No userId needed - Supabase handles auth
      />

    </div>
  );
}

export default CompanyDashboard;