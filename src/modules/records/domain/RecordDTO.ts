// src/modules/records/domain/RecordDTO.ts

import type { EngineeringRecord } from './EngineeringRecord';

export interface RecordDTO extends EngineeringRecord {
    _links?: {
        self: { href: string };
        project?: { href: string };
        workspace?: { href: string };
    };
}

export interface CreateRecordDTO {
    workspaceId?: string | null;
    projectId?: string | null;
    ownerType?: string;
    ownerId?: string | null;
    title: string;
    description?: string | null;
    category: string;
    discipline: string;
    metadata?: Record<string, unknown>;
    createdBy: string;
}

export interface UpdateRecordDTO {
    title?: string;
    description?: string | null;
    category?: string;
    discipline?: string;
    status?: string;
    metadata?: Record<string, unknown>;
    updatedBy: string;
}