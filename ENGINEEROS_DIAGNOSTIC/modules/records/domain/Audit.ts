export interface AuditTrail {
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  history: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  recordId: string;
  action: AuditAction;
  performedBy: string;
  performedAt: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  VERSION = "version",
  APPROVE = "approve",
  REJECT = "reject",
  COMMENT = "comment",
  ANNOTATE = "annotate",
  LINK = "link",
  UNLINK = "unlink",
  DOWNLOAD = "download",
  UPLOAD = "upload",
  VIEW = "view"
}
