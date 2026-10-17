// src/modules/records/hooks/useRecords.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { EngineeringRecord, CreateRecordInput, UpdateRecordInput, RecordSearchFilters, OwnerType, RecordStatus } from '../domain';
import { RecordService } from '../services/RecordService';
import { RecordsUploadManager } from '../services/UploadManager';

// ============================================================
// useRecords - For listing/filtering records
// ============================================================

interface UseRecordsOptions {
  workspaceId?: string;
  projectId?: string;
  ownerType?: OwnerType;
  ownerId?: string;
  autoLoad?: boolean;
}

export function useRecords(options: UseRecordsOptions = {}) {
  const {
    workspaceId,
    projectId,
    ownerType,
    ownerId,
    autoLoad = true,
  } = options;

  const service = useMemo(() => new RecordService(), []);
  const uploadManager = useMemo(() => new RecordsUploadManager(service), [service]);

  const [records, setRecords] = useState<EngineeringRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<EngineeringRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ============================================================
  // LOAD RECORDS - Using service.getByWorkspace/getByProject/getByOwner
  // ============================================================

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedRecords: EngineeringRecord[] = [];

      if (ownerType && ownerId) {
        // ✅ Uses getByOwner (matches RecordService)
        fetchedRecords = await service.getByOwner(ownerType, ownerId);
      } else if (projectId) {
        // ✅ Uses getByProject (matches RecordService)
        fetchedRecords = await service.getByProject(projectId);
      } else if (workspaceId) {
        // ✅ Uses getByWorkspace (matches RecordService)
        fetchedRecords = await service.getByWorkspace(workspaceId);
      } else {
        fetchedRecords = await service.getAll();
      }

      setRecords(fetchedRecords);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, projectId, ownerType, ownerId, service]);

  // ============================================================
  // CRUD OPERATIONS
  // ============================================================

  const createRecord = useCallback(async (input: CreateRecordInput) => {
    const record = await service.create(input);
    setRecords(prev => [...prev, record]);
    return record;
  }, [service]);

  const updateRecord = useCallback(async (id: string, input: UpdateRecordInput) => {
    const updated = await service.update(id, input);
    if (updated) {
      setRecords(prev => prev.map(r => r.id === id ? updated : r));
    }
    return updated;
  }, [service]);

  const deleteRecord = useCallback(async (id: string) => {
    const success = await service.delete(id);
    if (success) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
    return success;
  }, [service]);

  // ============================================================
  // FILE UPLOAD - Single transaction
  // ============================================================

  const createRecordWithFile = useCallback(async (input: CreateRecordInput, file: File) => {
    const userId = 'current-user'; // Replace with auth
    const record = await uploadManager.createRecordWithFile(input, file, userId);
    setRecords(prev => [...prev, record]);
    return record;
  }, [uploadManager]);

  // ============================================================
  // STATUS OPERATIONS - Using RecordStatus type, no 'any'
  // ============================================================

  const changeStatus = useCallback(async (id: string, status: RecordStatus) => {
    const userId = 'current-user'; // Replace with auth
    const updated = await service.changeStatus(id, status, userId);
    if (updated) {
      setRecords(prev => prev.map(r => r.id === id ? updated : r));
    }
    return updated;
  }, [service]);

  const archive = useCallback(async (id: string) => changeStatus(id, 'archived' as RecordStatus), [changeStatus]);
  const restore = useCallback(async (id: string) => changeStatus(id, 'draft' as RecordStatus), [changeStatus]);
  const approve = useCallback(async (id: string) => changeStatus(id, 'approved' as RecordStatus), [changeStatus]);

  // ============================================================
  // SEARCH - Single source of truth (server-side search)
  // ============================================================

  // ✅ Server-side search with filters - uses advancedSearch
  const search = useCallback(async (filters: RecordSearchFilters) => {
    setLoading(true);
    try {
      const results = await service.advancedSearch(filters);
      setRecords(results);
      return results;
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [service]);

  // ✅ Server-side text search - uses search(query: string)
  const searchRecords = useCallback(async (query: string) => {
    setSearchTerm(query);
    setLoading(true);
    try {
      let results: EngineeringRecord[];
      if (query.trim()) {
        results = await service.search(query);
      } else {
        // Reload all records when search is cleared
        await loadRecords();
        return records;
      }
      setRecords(results);
      return results;
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, loadRecords, records]);

  // ============================================================
  // REFRESH
  // ============================================================

  const refresh = useCallback(() => loadRecords(), [loadRecords]);

  // ============================================================
  // AUTO-LOAD
  // ============================================================

  useEffect(() => {
    if (autoLoad) loadRecords();
  }, [autoLoad, loadRecords]);

  // ============================================================
  // RETURN - Clean API
  // ============================================================

  return {
    // Data
    records,
    loading,
    error,
    selectedRecord,
    setSelectedRecord,

    // Load/Refresh
    loadRecords,
    refresh,

    // CRUD
    createRecord,
    updateRecord,
    deleteRecord,

    // File operations
    createRecordWithFile,

    // Status operations
    changeStatus,
    archive,
    restore,
    approve,

    // Search
    search,
    searchRecords,
    searchTerm,
    setSearchTerm,
  };
}