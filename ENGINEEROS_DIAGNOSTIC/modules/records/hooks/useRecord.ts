// src/modules/records/hooks/useRecord.ts

import { useState, useEffect, useCallback } from 'react';
import { EngineeringRecord, CreateRecordInput, UpdateRecordInput, RecordStatus } from '../domain';
import { recordService } from '../services/RecordService';
import { RecordsUploadManager } from '../services/UploadManager';

// ✅ Singleton upload manager
const uploadManager = new RecordsUploadManager(recordService);

// ✅ Get current user from auth (replace with actual auth)
const getCurrentUserId = (): string => {
  // TODO: Replace with useAuth() from your auth context
  return 'user-001';
};

export function useRecord(id?: string) {
  const [selectedRecord, setSelectedRecord] = useState<EngineeringRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // LOAD RECORD
  // ============================================================

  const getRecord = useCallback(async (recordId: string) => {
    setLoading(true);
    setError(null);
    try {
      const record = await recordService.getById(recordId);
      setSelectedRecord(record || null);
      return record;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // CRUD OPERATIONS - With loading/error handling
  // ============================================================

  const createRecord = useCallback(async (input: CreateRecordInput) => {
    setLoading(true);
    setError(null);
    try {
      const record = await recordService.create(input);
      setSelectedRecord(record);
      return record;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRecord = useCallback(async (id: string, input: UpdateRecordInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await recordService.update(id, input);
      if (updated) {
        setSelectedRecord(updated);
      }
      return updated;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await recordService.delete(id);
      if (success && selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
      return success;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRecord]);

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

  const uploadFile = useCallback(async (recordId: string, file: File, storageUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const userId = getCurrentUserId();
      const fileInfo = {
        fileId: 'file-' + Date.now(),
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storageUrl: storageUrl,
      };
      const updated = await recordService.attachFile(recordId, fileInfo, userId);
      if (updated) {
        setSelectedRecord(updated);
      }
      return updated;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecordWithFile = useCallback(async (input: CreateRecordInput, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const userId = getCurrentUserId();
      const record = await uploadManager.createRecordWithFile(input, file, userId);
      setSelectedRecord(record);
      return record;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // STATUS OPERATIONS
  // ============================================================

  const changeStatus = useCallback(async (id: string, status: RecordStatus) => {
    setLoading(true);
    setError(null);
    try {
      const userId = getCurrentUserId();
      const updated = await recordService.changeStatus(id, status, userId);
      if (updated) {
        setSelectedRecord(updated);
      }
      return updated;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const archive = useCallback(async (id: string) => changeStatus(id, 'archived' as RecordStatus), [changeStatus]);
  const restore = useCallback(async (id: string) => changeStatus(id, 'draft' as RecordStatus), [changeStatus]);
  const approve = useCallback(async (id: string) => changeStatus(id, 'approved' as RecordStatus), [changeStatus]);

  // ============================================================
  // REFRESH - Clean, always returns Promise
  // ============================================================

  const refresh = useCallback(async () => {
    if (!id) return;
    return getRecord(id);
  }, [id, getRecord]);

  // ============================================================
  // AUTO-LOAD
  // ============================================================

  useEffect(() => {
    if (id) {
      getRecord(id);
    }
  }, [id, getRecord]);

  // ============================================================
  // RETURN - Clean API
  // ============================================================

  return {
    // Data
    record: selectedRecord,
    loading,
    error,
    setSelectedRecord,

    // CRUD
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,

    // File operations
    uploadFile,
    createRecordWithFile,

    // Status operations
    changeStatus,
    archive,
    restore,
    approve,

    // Refresh
    refresh,
    reload: refresh,
  };
}