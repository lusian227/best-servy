import { ApprovalComment } from "../services";

// ✅ Keep your existing interface
export interface ApprovalFlow {
    id: string;
    recordId: string;
    versionId: string;
    status: ApprovalStatus;
    workflow: ApprovalStep[];
    currentStep: number;
    createdBy: string;
    createdAt: Date;
    completedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    comments: ApprovalComment[];
    metadata?: Record<string, any>;
}

export interface ApprovalStep {
    id: string;
    name: string;
    approverRole: string;
    required: boolean;
    completed: boolean;
    completedBy?: string;
    completedAt?: Date;
    approvedBy?: string;     // ✅ EXISTS
    approvedAt?: Date;       // ✅ EXISTS
    comment?: string;        // ✅ EXISTS
}

export enum ApprovalStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'
}

// ✅ ADD THIS: Export as ApprovalWorkflow for component compatibility
export type ApprovalWorkflow = ApprovalFlow;

// ✅ Also export the enum as type for compatibility
export type ApprovalStatusType = ApprovalStatus;