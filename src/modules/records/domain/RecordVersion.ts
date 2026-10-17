// src/modules/records/domain/RecordVersion.ts

import type { EngineeringRecord } from "./EngineeringRecord";
import type { StoredFile } from "./StoredFile";

export interface RecordVersion {
  id: string;

  recordId: string;

  version: number;
  revision: string;

  files: StoredFile[];

  record?: EngineeringRecord;

  createdAt: Date;
  createdBy: string;

  comment?: string;

  isLatest: boolean;
}