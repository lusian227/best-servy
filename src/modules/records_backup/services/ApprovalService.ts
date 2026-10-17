// src/modules/records/services/ApprovalService.ts

import { EngineeringRecord } from "../../../domain/records/EngineeringRecord";
import { RecordRepository } from '../../../repositories/RecordRepository';

export interface ApprovalStep {
  id: string;
  name: string;
  approverRole: string;
  order: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedBy?: string;
  approvedAt?: Date;
  comment?: string;
}

export interface ApprovalWorkflow {
  id: string;
  recordId: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';
  steps: ApprovalStep[];
  currentStep: number;
  submittedBy: string;
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  comments: string[];
}

const repo = new RecordRepository();

// In-memory workflows (would be Supabase in production)
let workflows: ApprovalWorkflow[] = [];

export class ApprovalService {
  private defaultSteps: Omit<ApprovalStep, 'status'>[] = [
    { id: 'step-1', name: 'Engineering Review', approverRole: 'senior_engineer', order: 0 },
    { id: 'step-2', name: 'QA Review', approverRole: 'qa_lead', order: 1 },
    { id: 'step-3', name: 'Project Manager Approval', approverRole: 'project_manager', order: 2 },
  ];

  async getWorkflow(recordId: string): Promise<ApprovalWorkflow | null> {
    const existing = workflows.find(w => w.recordId === recordId);
    if (existing) return existing;

    // Check if record exists
    const record = await repo.findById(recordId);
    if (!record) return null;

    // Check if record is already approved or rejected
    if (record.status === 'approved' || record.status === 'rejected') {
      return {
        id: 'wf-' + Date.now(),
        recordId: recordId,
        status: record.status === 'approved' ? 'approved' : 'rejected',
        steps: this.defaultSteps.map((step, index) => ({
          ...step,
          status: record.status === 'approved' ? 'approved' : (index === 0 ? 'rejected' : 'pending'),
          approvedBy: record.status === 'approved' ? ['john.doe@example.com', 'jane.smith@example.com', 'bob.wilson@example.com'][index] : undefined,
          approvedAt: record.status === 'approved' ? new Date(Date.now() - (3 - index) * 86400000) : undefined,
        })),
        currentStep: record.status === 'approved' ? 3 : 0,
        submittedBy: record.createdBy,
        submittedAt: record.createdAt,
        approvedAt: record.status === 'approved' ? new Date() : undefined,
        rejectedAt: record.status === 'rejected' ? new Date() : undefined,
        comments: [],
      };
    }

    return null;
  }

  async submitForApproval(recordId: string, submittedBy: string): Promise<{ record: EngineeringRecord; workflow: ApprovalWorkflow }> {
    const record = await repo.findById(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    if (record.status === 'approved') {
      throw new Error('Record is already approved');
    }

    // Create workflow
    const workflow: ApprovalWorkflow = {
      id: 'wf-' + Date.now(),
      recordId: recordId,
      status: 'submitted',
      steps: this.defaultSteps.map(step => ({
        ...step,
        status: step.order === 0 ? 'pending' : 'pending',
      })),
      currentStep: 0,
      submittedBy: submittedBy,
      submittedAt: new Date(),
      comments: [],
    };

    // Update record status
    const updatedRecord = {
      ...record,
      status: 'under_review' as any,
      updatedAt: new Date(),
      updatedBy: submittedBy,
    };

    await repo.save(updatedRecord);
    workflows.push(workflow);

    return { record: updatedRecord, workflow };
  }

  async approveStep(
    recordId: string,
    stepId: string,
    approver: string,
    comment?: string
  ): Promise<ApprovalWorkflow> {
    const workflow = workflows.find(w => w.recordId === recordId);
    if (!workflow) {
      throw new Error('No workflow found for this record');
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    step.status = 'approved';
    step.approvedBy = approver;
    step.approvedAt = new Date();
    step.comment = comment;

    // Move to next step
    workflow.currentStep = workflow.steps.findIndex(s => s.status === 'pending');
    if (workflow.currentStep === -1) {
      // All steps approved
      workflow.status = 'approved';
      workflow.approvedAt = new Date();

      const record = await repo.findById(recordId);
      if (record) {
        const updated = { ...record, status: 'approved' as any, updatedAt: new Date(), updatedBy: approver };
        await repo.save(updated);
      }
    } else {
      workflow.status = 'in_review';
    }

    if (comment) {
      workflow.comments.push(comment);
    }

    return workflow;
  }

  async approveRecord(
    recordId: string,
    approver: string,
    comment?: string
  ): Promise<{ record: EngineeringRecord; workflow: ApprovalWorkflow }> {
    // Find current step and approve it
    const workflow = workflows.find(w => w.recordId === recordId);
    if (!workflow) {
      throw new Error('No workflow found for this record');
    }

    const currentStep = workflow.steps.find(s => s.status === 'pending');
    if (!currentStep) {
      throw new Error('No pending steps found');
    }

    const updated = await this.approveStep(recordId, currentStep.id, approver, comment);
    const record = await repo.findById(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    return { record, workflow: updated };
  }

  async rejectRecord(
    recordId: string,
    rejecter: string,
    reason: string
  ): Promise<{ record: EngineeringRecord; workflow: ApprovalWorkflow }> {
    const workflow = workflows.find(w => w.recordId === recordId);
    if (!workflow) {
      throw new Error('No workflow found for this record');
    }

    workflow.status = 'rejected';
    workflow.rejectedAt = new Date();
    workflow.comments.push('Rejected: ' + reason);

    // Reject current pending step
    const currentStep = workflow.steps.find(s => s.status === 'pending');
    if (currentStep) {
      currentStep.status = 'rejected';
      currentStep.approvedBy = rejecter;
      currentStep.approvedAt = new Date();
      currentStep.comment = reason;
    }

    const record = await repo.findById(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    const updated = { ...record, status: 'rejected' as any, updatedAt: new Date(), updatedBy: rejecter };
    await repo.save(updated);

    return { record: updated, workflow };
  }

  async getApprovalStatus(recordId: string): Promise<ApprovalWorkflow | null> {
    return await this.getWorkflow(recordId);
  }
}
