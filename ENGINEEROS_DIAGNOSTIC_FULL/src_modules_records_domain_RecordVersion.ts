export interface RecordVersion {
  id: string;
  recordId: string;
  version: number;
  revision: string;
  changelog?: string;
  files: StoredFile[];
  createdBy: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}
