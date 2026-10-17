import type { RecordCategory } from './RecordCategory';
import type { RecordStatus } from './RecordStatus';


export type OwnerType =
  | 'company'
  | 'workspace'
  | 'project'
  | 'folder'
  | 'knowledge'
  | 'workItem'
  | 'user'
  | 'team'
  | 'system';


// ✅ Re-export for backward compatibility
export type { RecordCategory, RecordStatus };

// ✅ Add Discipline export
export type Discipline =
  | "structural"
  | "architectural"
  | "mep"
  | "civil"
  | "geotechnical"
  | "surveying"
  | "survey"
  | "electrical"
  | "mechanical"
  | "plumbing"
  | "fire"
  | "general"
  | "quantity_surveying"      // ✅ ADD
  | "environmental"           // ✅ ADD
  | "project_management"      // ✅ ADD
  | "other";

export interface EngineeringRecord {
  id: string;
  recordNumber: string;
  title: string;
  description?: string;
  workspaceId: string | null;
  projectId: string | null;
  ownerType: OwnerType;
  ownerId: string | null;
  category: RecordCategory;
  discipline: Discipline;

  revision: string;
  version: number;
  isLatest: boolean;
  status: RecordStatus;
  fileIds: string[];
  fileId: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  storageUrl: string | null;
  thumbnailUrl: string | null;
  relatedRecordIds: string[];
  dependencies: string[];
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateRecordInput {
  workspaceId?: string | null;
  projectId?: string | null;
  ownerType?: OwnerType;
  ownerId?: string | null;
  title: string;
  description?: string | null;
  category: RecordCategory;
  discipline: Discipline;
  metadata?: Record<string, unknown>;
  createdBy: string;
}

export interface UpdateRecordInput {
  title?: string;
  description?: string | null;
  category?: RecordCategory;
  discipline?: Discipline;
  status?: RecordStatus;
  metadata?: Record<string, unknown>;
  updatedBy: string;
}

export interface RecordSearchFilters {
  workspaceId?: string;
  workspaceIds?: string[];
  projectId?: string;
  ownerType?: OwnerType;
  ownerId?: string;
  category?: RecordCategory;
  discipline?: string;
  status?: RecordStatus;
  createdBy?: string;
  searchTerm?: string;
}
