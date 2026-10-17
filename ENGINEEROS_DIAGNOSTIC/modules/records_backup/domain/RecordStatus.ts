// src/modules/records/domain/RecordStatus.ts

export enum RecordStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  QA_REVIEW = 'qa_review',
  APPROVED = 'approved',
  ISSUED = 'issued',
  UNDER_CONSTRUCTION = 'under_construction',
  SUPERSEDED = 'superseded',
  ARCHIVED = 'archived',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold',
  OBSOLETE = 'obsolete'
}

export enum WorkflowState {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  QA_CHECK = 'qa_check',
  APPROVED = 'approved',
  ISSUED = 'issued',
  IN_CONSTRUCTION = 'in_construction',
  COMPLETED = 'completed',
  SUPERSEDED = 'superseded',
  ARCHIVED = 'archived',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold'
}
