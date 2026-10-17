// src/modules/workspaces/components/WorkspaceDashboard.tsx

import React, { useState } from 'react';
import { Workspace } from '../../../domain/workspaces/Workspace';
import { RecordLibrary } from '../../records/components/RecordLibrary';
import { RecordUpload } from '../../records/components/RecordUpload';
import { FolderOpen, Upload, Users, FileText, Activity, Settings, Grid, List } from 'lucide-react';

interface WorkspaceDashboardProps {
  workspace: Workspace;
}

export function WorkspaceDashboard({ workspace }: WorkspaceDashboardProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'activity' | 'members'>('records');

  const stats = {
    records: 0,
    members: workspace.members?.length || 0,
    files: 0,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Workspace Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{workspace.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Record
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Records</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.records}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Members</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.members}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Files</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.files}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <RecordLibrary workspaceId={workspace.id} />
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <RecordUpload
          workspaceId={workspace.id}
          parentType="workspace"
          parentId={workspace.id}
          onUploadComplete={() => {
            setShowUpload(false);
            window.location.reload(); // Refresh to show new record
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
