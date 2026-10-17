// src/types/workspace.ts

export type WorkspaceType = 
  | 'project'      // Engineering project
  | 'personal'     // Personal knowledge library
  | 'student'      // Student project
  | 'company'      // Company knowledge base
  | 'team'         // Team workspace
  | 'research'     // Research workspace
  | 'laboratory';  // Lab workspace

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
}
