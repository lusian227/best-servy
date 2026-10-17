// src/modules/records/services/RecordService.ts

import { RecordRepository } from "../repositories/RecordRepository";

import type {
  EngineeringRecord,
  CreateRecordInput,
  UpdateRecordInput,
  RecordSearchFilters,
} from "../domain";

export type {
  CreateRecordInput,
  UpdateRecordInput,
  RecordSearchFilters,
} from "../domain";

export class RecordService {
  constructor(
    private readonly repository = new RecordRepository()
  ) { }

  async getRecord(
    id: string
  ): Promise<EngineeringRecord | null> {
    return this.repository.findById(id);
  }

  async getById(
    id: string
  ): Promise<EngineeringRecord | null> {
    return this.repository.findById(id);
  }

  async getRecords(
    filters?: RecordSearchFilters
  ): Promise<EngineeringRecord[]> {
    return this.repository.findAll(filters);
  }

  async getByWorkspace(
    workspaceId: string
  ): Promise<EngineeringRecord[]> {
    return this.repository.findAll({ workspaceId });
  }

  async getByWorkspaces(
    workspaceIds: string[]
  ): Promise<EngineeringRecord[]> {
    if (workspaceIds.length === 0) {
      return [];
    }

    return this.repository.findAll({
      workspaceIds,
    });
  }

  async createRecord(
    input: CreateRecordInput
  ): Promise<EngineeringRecord> {
    return this.repository.create(input);
  }

  async create(
    input: CreateRecordInput
  ): Promise<EngineeringRecord> {
    return this.repository.create(input);
  }

  async updateRecord(
    id: string,
    input: UpdateRecordInput
  ): Promise<EngineeringRecord | null> {
    return this.repository.update(id, input);
  }

  async update(
    id: string,
    input: UpdateRecordInput
  ): Promise<EngineeringRecord | null> {
    return this.repository.update(id, input);
  }

  async archiveRecord(
    id: string
  ): Promise<EngineeringRecord | null> {
    return this.repository.archive(id);
  }

  async restoreRecord(
    id: string
  ): Promise<EngineeringRecord | null> {
    return this.repository.restore(id);
  }

  async restore(
    id: string
  ): Promise<EngineeringRecord | null> {
    return this.repository.restore(id);
  }

  // ✅ ADD THIS METHOD
  async uploadFile(
    id: string,
    file: File,
    storageUrl: string,
    userId: string = "system",
    storagePath?: string
  ): Promise<EngineeringRecord> {
    return this.repository.updateFile(
      id,
      file,
      storageUrl,
      userId,
      storagePath
    );
  }

  // ============================================================
  // DELETE BY PROJECT - ADDED
  // ============================================================

  async deleteByProject(
    projectId: string
  ): Promise<void> {
    console.log(
      `🗑️ RecordService: Deleting records for project: ${projectId}`
    );

    await this.repository.deleteByProject(projectId);
  }

  // ============================================================
  // DELETE RECORD - ADD THIS
  // ============================================================

  async deleteRecord(
    id: string
  ): Promise<void> {
    console.log(
      `🗑️ RecordService: Deleting record: ${id}`
    );

    return this.repository.delete(id);
  }

  // ============================================================
  // DELETE BY ID - ADDED
  // ============================================================

  async delete(
    id: string
  ): Promise<void> {
    console.log(
      `🗑️ RecordService: Deleting record (alias): ${id}`
    );

    return this.repository.delete(id);
  }
}

export default RecordService;