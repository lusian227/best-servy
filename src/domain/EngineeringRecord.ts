// src/modules/records/domain/EngineeringRecord.ts

export type RecordCategory =
    | 'drawing'
    | 'specification'
    | 'report'
    | 'photo'
    | 'calculation'
    | 'rfi'
    | 'contract'
    | 'other';

export type RecordStatus =
    | 'draft'
    | 'submitted'
    | 'in_review'
    | 'qa_review'
    | 'approved'
    | 'issued'
    | 'under_construction'
    | 'superseded'
    | 'archived'
    | 'rejected'
    | 'on_hold'
    | 'obsolete';

export type Discipline =
    | 'structural'
    | 'architectural'
    | 'mep'
    | 'civil'
    | 'geotechnical'
    | 'other';

export type OwnerType =
    | 'company'
    | 'workspace'
    | 'project'
    | 'drawing'
    | 'inspection'
    | 'knowledge';

export interface CreateRecordInput {
    workspaceId: string;
    projectId?: string | null;
    ownerType?: string;
    ownerId?: string | null;
    title: string;
    description?: string | null;
    category: RecordCategory;
    discipline: Discipline;
    createdBy: string;
    updatedBy?: string;
    metadata?: Record<string, any>;
}

export interface UpdateRecordInput {
    title?: string;
    description?: string | null;
    category?: RecordCategory;
    discipline?: Discipline;
    status?: RecordStatus;
    metadata?: Record<string, any>;
    updatedBy: string;
}

export interface EngineeringRecord {
    id: string;
    workspaceId: string | null;
    projectId: string | null;
    ownerType?: string | null;
    ownerId?: string | null;
    title: string;
    description?: string;
    recordNumber: string;
    category: RecordCategory;
    discipline: Discipline;
    revision: string;
    version: number;
    isLatest: boolean;
    status: RecordStatus;
    fileIds: string[];
    fileId?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    mimeType?: string | null;
    storageUrl?: string | null;
    thumbnailUrl?: string | null;
    metadata: Record<string, any>;
    relatedRecordIds: string[];
    dependencies: string[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface RecordSearchFilters {
    workspaceId?: string;
    workspaceIds?: string[];
    projectId?: string;
    ownerType?: string;
    ownerId?: string;
    category?: RecordCategory;
    discipline?: Discipline;
    status?: RecordStatus;
    searchTerm?: string;
    tag?: string;
    fromDate?: Date;
    toDate?: Date;
    createdBy?: string;
}