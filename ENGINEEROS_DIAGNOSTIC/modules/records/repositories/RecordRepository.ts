// src/modules/records/repositories/RecordRepository.ts

import { MemoryRepository } from '../../../core/repositories/MemoryRepository';
import { EngineeringRecord, RecordSearchFilters } from '../domain';

export class RecordRepository extends MemoryRepository<EngineeringRecord> {
    async search(filters: RecordSearchFilters): Promise<EngineeringRecord[]> {
        let results = this.entities;

        if (filters.workspaceId) {
            results = results.filter(r => r.workspaceId === filters.workspaceId);
        }
        if (filters.projectId) {
            results = results.filter(r => r.projectId === filters.projectId);
        }
        if (filters.ownerType && filters.ownerId) {
            results = results.filter(r => r.ownerType === filters.ownerType && r.ownerId === filters.ownerId);
        }
        if (filters.category) {
            results = results.filter(r => r.category === filters.category);
        }
        if (filters.discipline) {
            results = results.filter(r => r.discipline === filters.discipline);
        }
        if (filters.status) {
            results = results.filter(r => r.status === filters.status);
        }
        if (filters.tag) {
            results = results.filter(r => r.tags.includes(filters.tag!));
        }
        if (filters.createdBy) {
            results = results.filter(r => r.createdBy === filters.createdBy);
        }
        if (filters.fromDate) {
            results = results.filter(r => r.createdAt >= filters.fromDate!);
        }
        if (filters.toDate) {
            results = results.filter(r => r.createdAt <= filters.toDate!);
        }
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            results = results.filter(r =>
                r.title.toLowerCase().includes(term) ||
                r.recordNumber.toLowerCase().includes(term) ||
                r.description?.toLowerCase().includes(term)
            );
        }

        return results;
    }

    async findByWorkspace(workspaceId: string): Promise<EngineeringRecord[]> {
        return this.filterByField('workspaceId', workspaceId);
    }

    async findByProject(projectId: string): Promise<EngineeringRecord[]> {
        return this.filterByField('projectId', projectId);
    }

    async getRecent(limit: number = 10): Promise<EngineeringRecord[]> {
        return this.entities
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    async getLatest(projectId?: string): Promise<EngineeringRecord | undefined> {
        const filtered = projectId
            ? this.entities.filter(r => r.projectId === projectId)
            : this.entities;

        return filtered
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
    }
}