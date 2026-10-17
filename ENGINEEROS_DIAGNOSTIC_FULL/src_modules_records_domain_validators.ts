// src/modules/records/domain/validators.ts

import { CreateRecordInput, UpdateRecordInput } from './types';

export class RecordValidator {
    static validateCreate(input: CreateRecordInput): void {
        if (!input.workspaceId) {
            throw new Error('workspaceId is required');
        }
        if (!input.projectId) {
            throw new Error('projectId is required');
        }
        if (!input.title || input.title.trim().length === 0) {
            throw new Error('title is required');
        }
        if (input.title.length > 255) {
            throw new Error('title must be less than 255 characters');
        }
        if (!input.category) {
            throw new Error('category is required');
        }
        if (!input.discipline) {
            throw new Error('discipline is required');
        }
        if (!input.createdBy) {
            throw new Error('createdBy is required');
        }
    }

    static validateUpdate(input: UpdateRecordInput): void {
        if (input.title && input.title.trim().length === 0) {
            throw new Error('title cannot be empty');
        }
        if (input.title && input.title.length > 255) {
            throw new Error('title must be less than 255 characters');
        }
        if (!input.updatedBy) {
            throw new Error('updatedBy is required');
        }
    }

    static validateStatusTransition(
        currentStatus: string,
        newStatus: string
    ): boolean {
        const validTransitions: Record<string, string[]> = {
            draft: ['under_review', 'archived'],
            under_review: ['qa_review', 'rejected', 'archived'],
            qa_review: ['approved', 'rejected', 'archived'],
            approved: ['issued', 'archived'],
            issued: ['under_construction', 'superseded', 'archived'],
            under_construction: ['approved', 'archived'],
            superseded: ['archived'],
            archived: ['draft'],
            rejected: ['draft'],
            on_hold: ['draft', 'under_review'],
            obsolete: ['archived'],
        };

        const allowed = validTransitions[currentStatus] || [];
        return allowed.includes(newStatus);
    }
}