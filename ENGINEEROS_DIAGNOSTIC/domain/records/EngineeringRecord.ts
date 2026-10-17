// src/domain/records/EngineeringRecord.ts

export type RecordCategory =
    | 'drawing'
    | 'specification'
    | 'report'
    | 'photo'
    | 'calculation'
    | 'rfi'
    | 'contract'
    | 'submittal'
    | 'model'
    | 'document'
    | 'spreadsheet'
    | 'presentation'
    | 'research'
    | 'other';

export type Discipline =
    | 'structural'
    | 'architectural'
    | 'mep'
    | 'civil'
    | 'geotechnical'
    | 'environmental'
    | 'fire_protection'
    | 'interior'
    | 'landscape'
    | 'acoustical'
    | 'telecommunications'
    | 'security'
    | 'surveying'
    | 'hydrology'
    | 'transportation'
    | 'other';

export type RecordStatus =
    | 'draft'
    | 'under_review'
    | 'qa_review'
    | 'approved'
    | 'issued'
    | 'under_construction'
    | 'superseded'
    | 'archived'
    | 'rejected'
    | 'on_hold'
    | 'obsolete';

export type OwnerType =
    | 'workspace'
    | 'project'
    | 'company'
    | 'user';

export interface EngineeringRecord {
    id: string;

    projectId: string;
    workspaceId: string;

    parentType: 'workspace' | 'workItem';
    parentId: string;

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
    primaryFileId?: string;

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

export const recordCategoryLabels: Record<RecordCategory, string> = {
    drawing: 'Drawing',
    specification: 'Specification',
    report: 'Report',
    photo: 'Photo',
    calculation: 'Calculation',
    rfi: 'RFI',
    contract: 'Contract',
    submittal: 'Submittal',
    model: 'Model',
    document: 'Document',
    spreadsheet: 'Spreadsheet',
    presentation: 'Presentation',
    research: 'Research',
    other: 'Other',
};

export const disciplineLabels: Record<Discipline, string> = {
    structural: 'Structural',
    architectural: 'Architectural',
    mep: 'MEP',
    civil: 'Civil',
    geotechnical: 'Geotechnical',
    environmental: 'Environmental',
    fire_protection: 'Fire Protection',
    interior: 'Interior',
    landscape: 'Landscape',
    acoustical: 'Acoustical',
    telecommunications: 'Telecommunications',
    security: 'Security',
    surveying: 'Surveying',
    hydrology: 'Hydrology',
    transportation: 'Transportation',
    other: 'Other',
};