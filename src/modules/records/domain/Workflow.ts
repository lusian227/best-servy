// src/modules/records/domain/Workflow.ts

import type { RecordCategory } from "./RecordCategory";

export type WorkflowState =
  | "draft"
  | "under_review"
  | "qa_review"
  | "approved"
  | "issued"
  | "rejected"
  | "superseded"
  | "archived";

export interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  label?: string;
}

export interface RecordWorkflow {
  id: string;
  name: string;
  recordCategory: RecordCategory;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  initialState: WorkflowState;
}

export const DEFAULT_RECORD_WORKFLOW: RecordWorkflow = {
  id: "default-record-workflow",
  name: "Engineering Record Workflow",

  recordCategory: "other",

  states: [
    "draft",
    "under_review",
    "qa_review",
    "approved",
    "issued",
    "rejected",
    "superseded",
    "archived",
  ],

  transitions: [
    {
      from: "draft",
      to: "under_review",
    },
    {
      from: "under_review",
      to: "qa_review",
    },
    {
      from: "qa_review",
      to: "approved",
    },
    {
      from: "approved",
      to: "issued",
    },
    {
      from: "issued",
      to: "superseded",
    },
    {
      from: "issued",
      to: "archived",
    },
    {
      from: "under_review",
      to: "rejected",
    },
  ],

  initialState: "draft",
};