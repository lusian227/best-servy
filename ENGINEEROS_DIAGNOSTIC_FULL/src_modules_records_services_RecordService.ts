// src/modules/records/services/RecordService.ts

import type {
  EngineeringRecord,
  RecordCategory,
  Discipline,
  RecordStatus,
  CreateRecordInput,
  UpdateRecordInput,
  RecordSearchFilters,
} from '../../../domain/records/EngineeringRecord';
import { RecordRepository } from '../../../repositories/RecordRepository';

const repo = new RecordRepository();





// ✅ NEW: Search filters interface
export interface RecordSearchFilters {
  workspaceId?: string;
  projectId?: string;
  ownerType?: string;
  ownerId?: string;
  category?: RecordCategory;
  discipline?: Discipline;
  status?: RecordStatus;
  searchTerm?: string;
  tag?: string;
  fromDate?: Date;
  toDate?: Date;
  createdBy?: string;
}

export class RecordService {
  private idCounter = 1;

  // ============================================================
  // YOUR EXISTING CODE - UNCHANGED
  // ============================================================

  async create(input: CreateRecordInput): Promise<EngineeringRecord> {
    const now = new Date();
    console.log("INPUT");
    console.log(input);

    const workspaceId = input.workspaceId || input.projectId || 'unknown';
    const projectId = input.projectId || input.workspaceId || 'unknown';

    const record: EngineeringRecord = {
      id: 'rec-' + Date.now().toString(36) + '-' + String(this.idCounter++).padStart(4, '0'),
      projectId: projectId,
      workspaceId: workspaceId,
      parentType: 'workspace',
      parentId: workspaceId,
      title: input.title,
      description: input.description,
      recordNumber: this.generateRecordNumber(input.category),
      category: input.category,
      discipline: input.discipline,
      revision: 'REV0',
      version: 1,
      isLatest: true,
      status: 'draft' as RecordStatus,
      fileIds: [],
      metadata: {
        ...(input.metadata || {}),
      },
      relatedRecordIds: [],
      dependencies: [],
      tags: [],
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
    };

    console.log("===== RECORD BEFORE SAVE =====");
    console.log(JSON.stringify(record, null, 2));

    const saved = await repo.save(record);

    console.log("===== RECORD AFTER SAVE =====");
    console.log(saved);

    console.log('📄 Record created:', saved.recordNumber);

    return saved;
  }

  async getAll(): Promise<EngineeringRecord[]> {
    return await repo.findAll();
  }

  async getByWorkspace(workspaceId: string): Promise<EngineeringRecord[]> {
    console.log("🔍 getByWorkspace - workspaceId:", workspaceId);

    const records = await repo.findAll();

    console.log("🔍 getByWorkspace - Total records:", records.length);
    console.log("🔍 getByWorkspace - All records:", records.map(r => ({
      id: r.id,
      workspaceId: r.workspaceId,
      projectId: r.projectId,
      title: r.title
    })));

    const filtered = records.filter(r =>
      r.workspaceId === workspaceId ||
      r.projectId === workspaceId ||
      r.parentId === workspaceId
    );

    console.log("🔍 getByWorkspace - Filtered count:", filtered.length);

    return filtered;
  }

  async getById(id: string): Promise<EngineeringRecord | undefined> {
    return await repo.findById(id);
  }

  async search(query: string): Promise<EngineeringRecord[]> {
    return await repo.search(query);
  }

  async update(
    id: string,
    input: UpdateRecordInput
  ): Promise<EngineeringRecord | undefined> {

    const existing = await repo.findById(id);
    if (!existing) return undefined;

    const updated: EngineeringRecord = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      category: input.category ?? existing.category,
      discipline: input.discipline ?? existing.discipline,
      status: input.status ?? existing.status,
      metadata: input.metadata
        ? { ...existing.metadata, ...input.metadata }
        : existing.metadata,
      updatedAt: new Date(),
      updatedBy: input.updatedBy,
      version: existing.version + 1,
    };

    console.log("===== UPDATED RECORD =====");
    console.log(JSON.stringify(updated, null, 2));

    const saved = await repo.save(updated);

    console.log("===== UPDATED RECORD =====");
    console.log(JSON.stringify(updated, null, 2));

    console.log("✏️ Record updated:", saved.recordNumber);

    return saved;
  }

  async upload(recordId: string, file: File, storageUrl: string): Promise<EngineeringRecord | undefined> {
    const record = await repo.findById(recordId);
    if (!record) return undefined;

    const fileId = 'file-' + Date.now();

    const updated: EngineeringRecord = {
      ...record,

      fileIds: [...record.fileIds, fileId],
      fileId: fileId,

      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storageUrl: storageUrl,

      metadata: {
        ...record.metadata,
        storageUrl,
        originalFileName: file.name,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      },

      updatedAt: new Date(),
    };

    const saved = await repo.save(updated);
    console.log('📎 File uploaded to record:', saved.recordNumber);
    return saved;
  }

  // ============================================================
  // ✅ NEW METHODS (ADDED - NOT REPLACING ANYTHING)
  // ============================================================

  /**
   * Get records by project ID
   * Uses existing getByWorkspace pattern
   */
  async getByProject(projectId: string): Promise<EngineeringRecord[]> {
    console.log("🔍 getByProject - projectId:", projectId);
    const records = await repo.findAll();
    const filtered = records.filter(r => r.projectId === projectId);
    console.log("🔍 getByProject - Filtered count:", filtered.length);
    return filtered;
  }

  /**
   * Get records by owner (drawing, inspection, decision, etc.)
   */
  async getByOwner(ownerType: string, ownerId: string): Promise<EngineeringRecord[]> {
    console.log("🔍 getByOwner - ownerType:", ownerType, "ownerId:", ownerId);
    const records = await repo.findAll();
    // Use metadata for owner tracking since your current model doesn't have ownerType/ownerId
    const filtered = records.filter(r =>
      r.metadata?.ownerType === ownerType &&
      r.metadata?.ownerId === ownerId
    );
    console.log("🔍 getByOwner - Filtered count:", filtered.length);
    return filtered;
  }

  /**
   * Advanced search with multiple filters
   */
  async advancedSearch(filters: RecordSearchFilters): Promise<EngineeringRecord[]> {
    console.log("🔍 advancedSearch - filters:", filters);
    let records = await repo.findAll();

    if (filters.workspaceId) {
      records = records.filter(r => r.workspaceId === filters.workspaceId);
    }
    if (filters.projectId) {
      records = records.filter(r => r.projectId === filters.projectId);
    }
    if (filters.category) {
      records = records.filter(r => r.category === filters.category);
    }
    if (filters.discipline) {
      records = records.filter(r => r.discipline === filters.discipline);
    }
    if (filters.status) {
      records = records.filter(r => r.status === filters.status);
    }
    if (filters.tag) {
      records = records.filter(
        r => !!filters.tag && !!r.tags && r.tags.includes(filters.tag)
      );
    }
    if (filters.createdBy) {
      records = records.filter(r => r.createdBy === filters.createdBy);
    }
    if (filters.fromDate) {
      records = records.filter(r => new Date(r.createdAt) >= filters.fromDate!);
    }
    if (filters.toDate) {
      records = records.filter(r => new Date(r.createdAt) <= filters.toDate!);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      records = records.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.recordNumber.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term)
      );
    }

    console.log("🔍 advancedSearch - Filtered count:", records.length);
    return records;
  }

  /**
   * Change record status with validation
   */
  async changeStatus(id: string, newStatus: RecordStatus, userId: string): Promise<EngineeringRecord | undefined> {
    const existing = await repo.findById(id);
    if (!existing) return undefined;

    // Simple status validation
    const validTransitions: Record<string, string[]> = {
      'draft': ['under_review', 'archived'],
      'under_review': ['qa_review', 'rejected', 'archived'],
      'qa_review': ['approved', 'rejected', 'archived'],
      'approved': ['issued', 'archived'],
      'issued': ['under_construction', 'superseded', 'archived'],
      'under_construction': ['approved', 'archived'],
      'superseded': ['archived'],
      'archived': ['draft'],
      'rejected': ['draft'],
      'on_hold': ['draft', 'under_review'],
      'obsolete': ['archived'],
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      console.warn(`⚠️ Invalid status transition from ${existing.status} to ${newStatus}`);
      return existing;
    }

    const updated: EngineeringRecord = {
      ...existing,
      status: newStatus,
      updatedAt: new Date(),
      updatedBy: userId,
    };

    return await repo.save(updated);
  }

  /**
   * Archive a record
   */
  async archive(id: string, userId: string): Promise<EngineeringRecord | undefined> {
    return this.changeStatus(id, 'archived' as RecordStatus, userId);
  }

  /**
   * Restore an archived record
   */
  async restore(id: string, userId: string): Promise<EngineeringRecord | undefined> {
    return this.changeStatus(id, 'draft' as RecordStatus, userId);
  }

  /**
   * Approve a record
   */
  async approve(id: string, userId: string): Promise<EngineeringRecord | undefined> {
    return this.changeStatus(id, 'approved' as RecordStatus, userId);
  }

  /**
   * Attach file to record (alternative to upload() with different signature)
   */
  async attachFile(
    recordId: string,
    fileInfo: {
      fileId: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      storageUrl: string;
      thumbnailUrl?: string;
    },
    userId: string
  ): Promise<EngineeringRecord | undefined> {
    const existing = await repo.findById(recordId);
    if (!existing) return undefined;

    const updated: EngineeringRecord = {
      ...existing,
      fileId: fileInfo.fileId,
      fileName: fileInfo.fileName,
      fileSize: fileInfo.fileSize,
      mimeType: fileInfo.mimeType,
      storageUrl: fileInfo.storageUrl,
      thumbnailUrl: fileInfo.thumbnailUrl || null,
      fileIds: [...(existing.fileIds || []), fileInfo.fileId],
      metadata: {
        ...existing.metadata,
        storageUrl: fileInfo.storageUrl,
        fileId: fileInfo.fileId,
        originalFileName: fileInfo.fileName,
        fileName: fileInfo.fileName,
        mimeType: fileInfo.mimeType,
        fileSize: fileInfo.fileSize,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userId,
      },
      updatedAt: new Date(),
      updatedBy: userId,
    };

    return await repo.save(updated);
  }

  /**
   * Get recent records
   */
  async getRecent(limit: number = 10): Promise<EngineeringRecord[]> {
    const records = await repo.findAll();
    return records
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Delete a record permanently
   */
  async delete(id: string): Promise<boolean> {
    const record = await this.getById(id);
    if (!record) {
      console.warn(`⚠️ Record ${id} not found for deletion`);
      return false;
    }

    // Use the repository's delete method
    const success = await repo.delete(id);

    if (success) {
      console.log(`🗑️ Record ${id} deleted successfully`);
    } else {
      console.warn(`⚠️ Failed to delete record ${id}`);
    }

    return success;
  }

  // ============================================================
  // YOUR EXISTING PRIVATE METHOD - UNCHANGED
  // ============================================================

  private generateRecordNumber(category: RecordCategory): string {
    const prefix = category.slice(0, 3).toUpperCase();
    const num = String(this.idCounter).padStart(3, '0');
    this.idCounter++;
    return prefix + '-' + num;
  }
}
export const recordService = new RecordService();