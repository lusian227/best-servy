// src/domain/workspaces/Workspace.ts

export type WorkspaceType =
  | 'project'
  | 'personal'
  | 'student'
  | 'company'
  | 'team'
  | 'research'
  | 'laboratory';

export interface Workspace {
  id: string;
  type: WorkspaceType;
  name: string;
  description?: string;
  ownerId: string;
  members?: string[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowSharing: boolean;
  defaultView: 'grid' | 'list';
  theme?: 'light' | 'dark' | 'system';
}

export interface WorkspaceStats {
  totalRecords: number;
  totalWorkItems: number;
  totalFiles: number;
  recentActivity: WorkspaceActivity[];
}

export interface WorkspaceActivity {
  id: string;
  type: 'record_created' | 'work_item_created' | 'file_uploaded' | 'comment_added';
  description: string;
  performedBy: string;
  performedAt: Date;
  targetId: string;
  targetType: 'record' | 'work_item' | 'file';
}

export const workspaceLabels: Record<WorkspaceType, string> = {
  project: 'Project',
  personal: 'Personal Library',
  student: 'Student Project',
  company: 'Company Workspace',
  team: 'Team Workspace',
  research: 'Research Workspace',
  laboratory: 'Laboratory Workspace',
};

export const workspaceIcons: Record<WorkspaceType, string> = {
  project: '📁',
  personal: '👤',
  student: '🎓',
  company: '🏢',
  team: '👥',
  research: '🔬',
  laboratory: '🧪',
};

export const workspaceColors: Record<WorkspaceType, string> = {
  project: 'blue',
  personal: 'emerald',
  student: 'purple',
  company: 'indigo',
  team: 'orange',
  research: 'cyan',
  laboratory: 'rose',
};
