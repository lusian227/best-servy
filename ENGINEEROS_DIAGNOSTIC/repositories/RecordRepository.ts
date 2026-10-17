// src/repositories/RecordRepository.ts

import { EngineeringRecord } from '../domain/records/EngineeringRecord';
import { supabase } from '../lib/supabase';

export class RecordRepository {
  private useSupabase: boolean = import.meta.env.VITE_USE_SUPABASE === 'true';

  async findAll(): Promise<EngineeringRecord[]> {
    if (!this.useSupabase) {
      console.warn('⚠️ Supabase is disabled. Using in-memory data.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      return data?.map((item) => this.mapFromSupabase(item)) || [];
    } catch (error) {
      console.error('Failed to fetch records:', error);
      return [];
    }
  }

  async findById(id: string): Promise<EngineeringRecord | undefined> {
    if (!this.useSupabase) return undefined;

    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return undefined;
      }

      return data ? this.mapFromSupabase(data) : undefined;
    } catch (error) {
      console.error('Failed to fetch record:', error);
      return undefined;
    }
  }

  async save(record: EngineeringRecord): Promise<EngineeringRecord> {
    if (!this.useSupabase) {
      console.warn('⚠️ Supabase is disabled. Record not saved.');
      return record;
    }

    try {
      const supabaseRecord = this.mapToSupabase(record);
      console.log('📤 Saving to Supabase:', supabaseRecord);

      console.log("===== SUPABASE PAYLOAD =====");
      console.log(JSON.stringify(supabaseRecord, null, 2));

      const { data, error } = await supabase
        .from('records')
        .upsert(supabaseRecord)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error details:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        console.error('❌ Error code:', error.code);
        return record;
      }

      console.log('✅ Record saved successfully:', data);
      return data ? this.mapFromSupabase(data) : record;
    } catch (error) {
      console.error('❌ Failed to save record:', error);
      return record;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.useSupabase) {
      console.warn('⚠️ Supabase is disabled. Record not deleted.');
      return false;
    }

    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete record:', error);
      return false;
    }
  }

  async search(query: string): Promise<EngineeringRecord[]> {
    if (!this.useSupabase) {
      console.warn('⚠️ Supabase is disabled. Search not available.');
      return [];
    }

    if (!query || query.trim() === '') {
      return await this.findAll();
    }

    try {
      const searchTerm = query.trim();
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .or(
          'title.ilike.%' + searchTerm + '%,' +
          'record_number.ilike.%' + searchTerm + '%,' +
          'description.ilike.%' + searchTerm + '%'
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      return data?.map((item) => this.mapFromSupabase(item)) || [];
    } catch (error) {
      console.error('Failed to search records:', error);
      return [];
    }
  }

  private mapFromSupabase(data: any): EngineeringRecord {
    return {
      id: data.id,
      projectId: data.project_id,
      workspaceId: data.project_id,
      parentId: data.project_id,
      parentType: data.parent_type ?? "workspace",
      recordNumber: data.record_number,
      title: data.title,
      description: data.description,
      category: data.category,
      discipline: data.discipline,
      revision: data.revision,
      version: data.version,
      isLatest: true,
      status: data.status,
      fileIds: data.file_id ? [data.file_id] : [],
      fileId: data.file_id,
      fileName: data.file_name,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      storageUrl: data.storage_url,
      thumbnailUrl: data.thumbnail_url,
      metadata: data.metadata || {},
      relatedRecordIds: [],
      dependencies: [],
      tags: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  private mapToSupabase(record: EngineeringRecord): any {
    // Get project_id from workspaceId or metadata
    const projectId =
      record.projectId ??
      record.workspaceId ??
      record.parentId ??
      record.metadata?.projectId ??
      null;

    // Get file_id from fileIds array or metadata
    const fileId =
      record.fileId ??
      record.fileIds?.[0] ??
      record.metadata?.fileId ??
      record.metadata?.fileIds?.[0] ??
      null;

    return {
      id: record.id,
      project_id: projectId,
      record_number: record.recordNumber,
      title: record.title,
      description: record.description,
      category: record.category,
      discipline: record.discipline,
      revision: record.revision,
      version: record.version,
      status: record.status,
      file_id: fileId,
      file_name:
        record.fileName ??
        record.metadata?.originalName ??
        record.metadata?.originalFileName ??
        record.metadata?.fileName ??
        null,
      file_size: record.fileSize ?? record.metadata?.fileSize ?? record.metadata?.size ?? null,
      mime_type: record.mimeType ?? record.metadata?.mimeType ?? record.metadata?.fileType ?? null,
      storage_url: record.storageUrl ?? record.metadata?.storageUrl ?? null,
      thumbnail_url: record.metadata?.thumbnailUrl ?? null,
      metadata: record.metadata,
      created_by: record.createdBy,
      updated_by: record.updatedBy,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    };
  }
}