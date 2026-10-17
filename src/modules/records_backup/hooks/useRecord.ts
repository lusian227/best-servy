// src/modules/records/hooks/useRecord.ts

import { useEffect } from "react";
import { useRecordStore } from "../store/recordStore";
import { CreateRecordInput, UpdateRecordInput } from "../services/RecordService";

export function useRecords() {
  const {
    records,
    loading,
    error,
    searchTerm,
    loadRecords,
    searchRecords,
    setSearchTerm,
    getFilteredRecords,
  } = useRecordStore();

  useEffect(() => {
    loadRecords();
  }, []);

  return {
    records: getFilteredRecords(),
    allRecords: records,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    searchRecords,
    refresh: loadRecords,
  };
}

export function useRecord(id?: string) {
  const {
    selectedRecord,
    loading,
    error,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    uploadFile,
    setSelectedRecord,
  } = useRecordStore();

  useEffect(() => {
    if (id) {
      getRecord(id);
    }
  }, [id]);

  // ✅ NEW: uploadFileWithUrl - accepts file and storageUrl
  const uploadFileWithUrl = async (recordId: string, file: File, storageUrl: string) => {
    return await uploadFile(recordId, file, storageUrl);
  };

  return {
    record: selectedRecord,
    loading,
    error,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    uploadFile: uploadFileWithUrl, // ✅ Replace with the new version
    setSelectedRecord,
    refresh: () => id && getRecord(id),
  };
}