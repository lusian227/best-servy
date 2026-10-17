// src/modules/records/services/RecordService.ts

import { EngineeringRecord, RecordCategory, Discipline, RecordStatus } from "../../../domain/records/EngineeringRecord";
import { RecordRepository } from '../../../repositories/RecordRepository';

const repo = new RecordRepository();

export interface CreateRecordInput {
  projectId: string;
  workspaceId: string;
  workspaceType: string;
  title: string;
  description?: string;
  recordType: string;
  category: RecordCategory;
  discipline: Discipline;
  createdBy: string;
  file?: File;
  metadata?: Record<string, any>;
}

export interface UpdateRecordInput {
  title?: string;
  description?: string;
  recordType?: string;
  category?: RecordCategory;
  discipline?: Discipline;
  status?: RecordStatus;
  updatedBy: string;
  metadata?: Record<string, any>;
}

export class RecordService {
  private idCounter = 1;

  async create(input: CreateRecordInput): Promise<EngineeringRecord> {
    const now = new Date();
    console.log("INPUT");
    console.log(input);

    // ✅ ENSURE workspaceId and projectId are ALWAYS set
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

    // ✅ ALSO check projectId (since projectId is often used as workspaceId)
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

      // populate top-level fields
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storageUrl: storageUrl,

      // keep metadata in sync
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

  private generateRecordNumber(category: RecordCategory): string {
    const prefix = category.slice(0, 3).toUpperCase();
    const num = String(this.idCounter).padStart(3, '0');
    this.idCounter++;
    return prefix + '-' + num;
  }
}