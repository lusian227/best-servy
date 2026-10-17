// src/modules/records/domain/RecordLink.ts

export interface RecordLink {
  id: string;
  sourceRecordId: string;
  targetRecordId: string;
  relation: LinkRelation;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
}

export enum LinkRelation {
  PARENT = 'parent',
  CHILD = 'child',
  REFERENCE = 'reference',
  DERIVED_FROM = 'derived_from',
  IMPLEMENTS = 'implements',
  SUPERSEDES = 'supersedes',
  RELATED = 'related',
  CONTAINS = 'contains',
  PART_OF = 'part_of',
  DEPENDS_ON = 'depends_on',
  USED_IN = 'used_in',
  REFERENCED_BY = 'referenced_by',
  ATTACHMENT = 'attachment'
}
