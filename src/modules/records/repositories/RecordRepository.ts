// src/modules/records/repositories/RecordRepository.ts

import { supabase } from "../../../lib/supabase";

import { generateUUID } from '../../../utils/uuid';

import type {
  EngineeringRecord,
  CreateRecordInput,
  UpdateRecordInput,
  RecordSearchFilters,
} from "../domain";

export class RecordRepository {

  async findById(
    id: string
  ): Promise<EngineeringRecord | null> {

    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    // ✅ FIXED: Removed invalid 'payload' reference
    if (error) {
      console.error("========== RECORD FIND FAILED ==========");
      console.error("Supabase error:", error);
      console.error("code:", error.code);
      console.error("message:", error.message);
      console.error("details:", error.details);
      console.error("hint:", error.hint);
      console.error("record id:", id);
      console.error("=========================================");
      throw error;
    }

    if (!data) {
      return null;
    }

    return this.mapFromDatabase(data);
  }


  async findAll(
    filters?: RecordSearchFilters
  ): Promise<EngineeringRecord[]> {

    let query = supabase
      .from("records")
      .select("*");


    if (filters?.workspaceId) {
      query = query.eq(
        "workspace_id",
        filters.workspaceId
      );
    }

    if (filters?.workspaceIds && filters.workspaceIds.length > 0) {
      query = query.in(
        "workspace_id",
        filters.workspaceIds
      );
    }


    if (filters?.projectId) {
      query = query.eq(
        "project_id",
        filters.projectId
      );
    }


    if (filters?.ownerType) {
      query = query.eq(
        "owner_type",
        filters.ownerType
      );
    }


    if (filters?.ownerId) {
      query = query.eq(
        "owner_id",
        filters.ownerId
      );
    }


    if (filters?.category) {
      query = query.eq(
        "category",
        filters.category
      );
    }


    if (filters?.discipline) {
      query = query.eq(
        "discipline",
        filters.discipline
      );
    }


    if (filters?.status) {
      query = query.eq(
        "status",
        filters.status
      );
    }


    if (filters?.createdBy) {
      query = query.eq(
        "created_by",
        filters.createdBy
      );
    }


    if (filters?.searchTerm) {

      const search = filters.searchTerm
        .trim()
        .replace(/[%_]/g, "");

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,record_number.ilike.%${search}%,description.ilike.%${search}%`
        );
      }
    }


    const {
      data,
      error,
    } = await query.order(
      "created_at",
      { ascending: false }
    );


    if (error) {
      console.error(
        "RecordRepository.findAll:",
        error
      );

      throw error;
    }


    return (data ?? []).map(
      row => this.mapFromDatabase(row)
    );
  }


  async create(
    input: CreateRecordInput
  ): Promise<EngineeringRecord> {

    const id = generateUUID();
    const now = new Date().toISOString();


    const payload = {
      id,
      workspace_id: input.workspaceId ?? null,
      project_id: input.projectId ?? null,
      owner_type: input.ownerType ?? 'knowledge',
      owner_id: input.ownerId ?? null,

      record_number: `REC-${Date.now()}`,

      title: input.title,

      description:
        input.description ?? null,

      category: input.category,

      discipline: input.discipline,

      revision: "A",

      version: 1,

      is_latest: true,

      status: "draft",

      file_ids: [],

      file_id: null,

      file_name: null,

      file_size: null,

      mime_type: null,

      storage_url: null,

      thumbnail_url: null,

      metadata: input.metadata ?? {},

      related_record_ids: [],

      dependencies: [],

      tags: [],

      created_at: now,

      updated_at: now,

      created_by: input.createdBy,

      updated_by: input.createdBy,
    };

    // ✅ LOG THE PAYLOAD BEFORE INSERT
    console.log("📤 RECORD CREATE PAYLOAD:", JSON.stringify(payload, null, 2));

    const {
      data,
      error,
    } = await supabase
      .from("records")
      .insert(payload)
      .select("*")
      .single();


    if (error) {

      console.error("========== RECORD CREATE FAILED ==========");
      console.error("Supabase error:", error);
      console.error("code:", error.code);
      console.error("message:", error.message);
      console.error("details:", error.details);
      console.error("hint:", error.hint);
      console.error("payload:", JSON.stringify(payload, null, 2));
      console.error("==========================================");

      throw error;
    }


    return this.mapFromDatabase(data);
  }


  async update(
    id: string,
    input: UpdateRecordInput
  ): Promise<EngineeringRecord> {

    const payload: Record<string, unknown> = {
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString(),
    };


    if (input.title !== undefined) {
      payload.title = input.title;
    }


    if (input.description !== undefined) {
      payload.description =
        input.description;
    }


    if (input.category !== undefined) {
      payload.category =
        input.category;
    }


    if (input.discipline !== undefined) {
      payload.discipline =
        input.discipline;
    }


    if (input.status !== undefined) {
      payload.status =
        input.status;
    }


    if (input.metadata !== undefined) {
      payload.metadata =
        input.metadata;
    }


    const {
      data,
      error,
    } = await supabase
      .from("records")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();


    if (error) {

      console.error(
        "RecordRepository.update:",
        error
      );

      throw error;
    }


    return this.mapFromDatabase(data);
  }


  async archive(
    id: string
  ): Promise<EngineeringRecord> {

    return this.update(id, {
      status: "archived",
      updatedBy: "system",
    });
  }


  async restore(
    id: string
  ): Promise<EngineeringRecord> {

    return this.update(id, {
      status: "draft",
      updatedBy: "system",
    });
  }


  // ✅ ADDED: updateFile method for file upload
  async updateFile(
    id: string,
    file: File,
    storageUrl: string,
    userId: string = "system",
    storagePath?: string
  ): Promise<EngineeringRecord> {
    // Check if record exists
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Record ${id} not found`);
    }

    const fileId = `file-${Date.now()}`;

    const finalStoragePath =
      storagePath ||
      existing.metadata?.storagePath ||
      '';

    const payload = {
      file_ids: [...existing.fileIds, fileId],

      file_id: fileId,

      file_name: file.name,

      file_size: file.size,

      mime_type: file.type,

      storage_url: storageUrl,

      metadata: {
        ...existing.metadata,

        storageUrl: storageUrl,

        storagePath: finalStoragePath,

        fileId: fileId,

        originalFileName: file.name,

        fileName: file.name,

        mimeType: file.type,

        fileSize: file.size,

        uploadedAt: new Date().toISOString(),

        uploadedBy: userId,
      },

      updated_at: new Date().toISOString(),

      updated_by: userId,
    };

    const { data, error } = await supabase
      .from("records")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("RecordRepository.updateFile:", error);
      throw error;
    }

    return this.mapFromDatabase(data);
  }

  // ============================================================
  // DELETE BY PROJECT - ADDED
  // ============================================================

  async deleteByProject(
    projectId: string
  ): Promise<void> {
    console.log(
      `🗑️ Deleting all records for project: ${projectId}`
    );

    const { error } = await supabase
      .from("records")
      .delete()
      .eq("project_id", projectId);

    if (error) {
      console.error(
        "RecordRepository.deleteByProject:",
        error
      );
      throw error;
    }

    console.log(
      `✅ Successfully deleted all records for project: ${projectId}`
    );
  }

  // ============================================================
  // DELETE BY ID - ADDED
  // ============================================================

  async delete(id: string): Promise<void> {
    console.log(`🗑️ RecordRepository: Deleting record: ${id}`);

    const { error } = await supabase
      .from("records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("RecordRepository.delete:", error);
      throw error;
    }

    console.log(`✅ RecordRepository: Record deleted: ${id}`);
  }


  private mapFromDatabase(
    row: any
  ): EngineeringRecord {

    return {
      id: row.id,

      recordNumber:
        row.record_number,

      title:
        row.title,

      description:
        row.description ?? undefined,

      workspaceId:
        row.workspace_id,

      projectId:
        row.project_id,

      ownerType:
        row.owner_type,

      ownerId:
        row.owner_id,

      category:
        row.category,

      discipline:
        row.discipline,

      revision:
        row.revision,

      version:
        row.version,

      isLatest:
        row.is_latest,

      status:
        row.status,

      fileIds:
        row.file_ids ?? [],

      fileId:
        row.file_id ?? null,

      fileName:
        row.file_name ?? null,

      fileSize:
        row.file_size ?? null,

      mimeType:
        row.mime_type ?? null,

      storageUrl:
        row.storage_url ?? null,

      thumbnailUrl:
        row.thumbnail_url ?? null,

      relatedRecordIds:
        row.related_record_ids ?? [],

      dependencies:
        row.dependencies ?? [],

      tags:
        row.tags ?? [],

      metadata:
        row.metadata ?? {},

      createdAt:
        new Date(row.created_at),

      updatedAt:
        new Date(row.updated_at),

      createdBy:
        row.created_by,

      updatedBy:
        row.updated_by,
    };
  }
}


export default RecordRepository;