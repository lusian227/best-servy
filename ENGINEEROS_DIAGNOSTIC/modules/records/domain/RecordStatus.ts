// src/modules/records/domain/RecordStatus.ts

export type {
  RecordStatus,
} from '../../../domain/records/EngineeringRecord';

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
  ON_HOLD = 'on_hold',
}