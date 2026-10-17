// src/domain/verify.ts

import { Workspace, WorkspaceType } from './workspaces/Workspace';
import { WorkItem, WorkItemType } from './work-items/WorkItem';
import {
  EngineeringRecord,
  RecordCategory,
  Discipline,
  OwnerType,
} from "../modules/records/domain/EngineeringRecord";
import {
  StoredFile,
  FileType,
} from '../modules/records/domain';

export function verifyDomain() {
  console.log('?? Verifying domain models...');

  // Create test objects
  const workspace: Workspace = {
    id: 'ws-001',
    type: 'project' as WorkspaceType,
    name: 'Test Project',
    ownerId: 'user-001',
    settings: {
      isPublic: false,
      allowComments: true,
      allowSharing: true,
      defaultView: 'list',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const workItem: WorkItem = {
    id: 'wi-001',
    workspaceId: workspace.id,
    type: 'inspection' as WorkItemType,
    title: 'Foundation Inspection',
    occurredAt: new Date(),
    performedBy: 'user-001',
    recordIds: [],
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-001',
    updatedBy: 'user-001',
    timeline: [],
  };

  const record: EngineeringRecord = {
    id: 'rec-001',
    workspaceId: workspace.id,
    projectId: null,                    // ✅ ADDED
    ownerType: 'workItem',              // ✅ CHANGED from parentType
    ownerId: workItem.id,               // ✅ CHANGED from parentId
    title: 'Inspection Report',
    recordNumber: 'INS-001',
    category: 'report' as RecordCategory,
    discipline: 'structural' as Discipline,
    revision: 'REV0',
    version: 1,
    isLatest: true,
    status: 'draft',
    fileIds: [],
    fileId: null,                       // ✅ ADDED
    fileName: null,                     // ✅ ADDED
    fileSize: null,                     // ✅ ADDED
    mimeType: null,                     // ✅ ADDED
    storageUrl: null,                   // ✅ ADDED
    thumbnailUrl: null,                 // ✅ ADDED
    relatedRecordIds: [],
    dependencies: [],
    tags: ['foundation', 'inspection'],
    metadata: {
      inspectionType: 'Foundation',
      inspector: 'John Doe',
      findings: 3,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-001',
    updatedBy: 'user-001',
  };

  // ? FIXED: checksum is a direct property, NOT inside metadata
  const file: StoredFile = {
    id: 'file-001',
    recordId: record.id,
    versionId: 'version-001',
    filename: 'inspection_report.pdf',
    mimeType: 'application/pdf',
    extension: 'pdf',
    size: 2450000,
    storageUrl: 'https://storage.example.com/inspection_report.pdf',
    thumbnailUrl: undefined,
    previewUrl: undefined,
    checksum: 'sha256-abc123...',  // ? Direct property
    isPrimary: true,
    fileType: 'original' as FileType,
    processingStatus: 'completed',
    processingError: undefined,
    metadata: {
      hasOcr: false,
      pageCount: 4,
      custom: {},
      // ? checksum REMOVED from metadata
    },
    uploadedBy: 'user-001',
    uploadedAt: new Date(),
  };

  console.log('? Workspace:', workspace.name);
  console.log('? WorkItem:', workItem.title);
  console.log('? Record:', record.title);
  console.log('? File:', file.filename);
  console.log('? Domain models verified!');
}