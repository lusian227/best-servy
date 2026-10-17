// src/modules/records/domain/RecordStatus.ts

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