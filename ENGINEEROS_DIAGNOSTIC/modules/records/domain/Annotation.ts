export interface Annotation {
  id: string;
  recordId: string;
  versionId: string;
  page?: number;
  type: AnnotationType;
  content: string;
  position?: { x: number; y: number; width?: number; height?: number };
  createdBy: string;
  createdAt: Date;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  parentId?: string;
  replies?: Annotation[];
}

export enum AnnotationType {
  COMMENT = "comment",
  HIGHLIGHT = "highlight",
  MARKUP = "markup",
  STAMP = "stamp",
  MEASUREMENT = "measurement",
  NOTE = "note",
  ISSUE = "issue",
  QUESTION = "question"
}
