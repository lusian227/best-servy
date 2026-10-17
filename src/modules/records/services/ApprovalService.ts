import type { EngineeringRecord } from "../domain";
import { RecordRepository } from "../repositories/RecordRepository";

export interface ApprovalStep {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  completedAt?: Date;
  completedBy?: string;
  approvedBy?: string;    // ✅ ADDED
  approvedAt?: Date;      // ✅ ADDED
  comment?: string;       // ✅ ADDED
}

export interface ApprovalComment {
  id: string;
  author: string;
  text: string;
  createdAt: Date;
}

export interface ApprovalWorkflow {
  recordId: string;
  status: "draft" | "pending" | "approved" | "rejected";
  steps: ApprovalStep[];
  comments: ApprovalComment[];
  currentStep: number;    // ✅ ADDED
}

export class ApprovalService {
  constructor(
    private readonly repository = new RecordRepository()
  ) { }

  async getApprovalStatus(
    recordId: string
  ): Promise<ApprovalWorkflow> {
    const record = await this.repository.findById(recordId);

    if (!record) {
      throw new Error(`Record not found: ${recordId}`);
    }

    // Determine status
    let status: "draft" | "pending" | "approved" | "rejected" = "pending";
    if (record.status === "approved") status = "approved";
    else if (record.status === "rejected") status = "rejected";
    else if (record.status === "draft") status = "draft";
    else status = "pending";

    return {
      recordId: record.id,
      status: status,
      currentStep: 0,  // ✅ ADDED
      steps: [
        {
          id: "approval",
          name: "Record Approval",
          status: record.status === "approved" ? "approved" :
            record.status === "rejected" ? "rejected" : "pending",
          approvedBy: record.updatedBy || undefined,  // ✅ ADDED
          approvedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,  // ✅ ADDED
          comment: undefined,  // ✅ ADDED
        },
      ],
      comments: [],
    };
  }

  async submitForApproval(
    recordId: string,
    submittedBy: string
  ): Promise<EngineeringRecord | null> {
    return this.repository.update(recordId, {
      status: "in_review",
      updatedBy: submittedBy,
    });
  }

  async approveRecord(
    recordId: string,
    approvedBy: string,
    comment?: string
  ): Promise<EngineeringRecord | null> {
    const result = await this.repository.update(recordId, {
      status: "approved",
      updatedBy: approvedBy,
    });

    // If comment provided, we could store it elsewhere
    if (comment && result) {
      // Store comment in metadata or separate collection
      console.log(`Approval comment for ${recordId}: ${comment}`);
    }

    return result;
  }

  async rejectRecord(
    recordId: string,
    rejectedBy: string,
    comment: string
  ): Promise<EngineeringRecord | null> {
    return this.repository.update(recordId, {
      status: "rejected",
      updatedBy: rejectedBy,
    });
  }

  async approve(
    id: string,
    approvedBy: string
  ): Promise<EngineeringRecord | null> {
    return this.approveRecord(id, approvedBy);
  }

  async reject(
    id: string,
    rejectedBy: string
  ): Promise<EngineeringRecord | null> {
    return this.rejectRecord(id, rejectedBy, "");
  }
}

export default ApprovalService;