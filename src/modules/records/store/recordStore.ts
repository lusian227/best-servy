// src/modules/records/store/recordStore.ts

import { create } from "zustand";

import { RecordService } from "../services/RecordService";

import type {
  EngineeringRecord,
  CreateRecordInput,
  UpdateRecordInput,
  RecordSearchFilters,
} from "../domain";

interface RecordStore {
  records: EngineeringRecord[];
  loading: boolean;
  error: string | null;

  load: (
    filters?: RecordSearchFilters
  ) => Promise<void>;

  createRecord: (
    input: CreateRecordInput
  ) => Promise<EngineeringRecord>;

  updateRecord: (
    id: string,
    input: UpdateRecordInput
  ) => Promise<EngineeringRecord | null>;

  archive: (
    id: string
  ) => Promise<EngineeringRecord | null>;

  restore: (
    id: string
  ) => Promise<EngineeringRecord | null>;

  uploadFile: (
    id: string,
    file: File,
    storageUrl: string
  ) => Promise<EngineeringRecord>;

  // ✅ ADD THIS
  deleteRecord: (
    id: string
  ) => Promise<void>;

  deleteByProject: (
    projectId: string
  ) => Promise<void>;
}

const service = new RecordService();

export const useRecordStore = create<RecordStore>((set) => ({
  records: [],
  loading: false,
  error: null,

  // -----------------------------------------
  // LOAD RECORDS
  // -----------------------------------------
  load: async (filters) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const records =
        await service.getRecords(filters);

      set({
        records,
        loading: false,
      });
    } catch (error) {
      console.error(
        "recordStore.load:",
        error
      );

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load records",
      });
    }
  },

  // -----------------------------------------
  // CREATE RECORD
  // -----------------------------------------
  createRecord: async (input) => {
    const record =
      await service.createRecord(input);

    set((state) => ({
      records: [
        ...state.records,
        record,
      ],
    }));

    return record;
  },

  // -----------------------------------------
  // UPDATE RECORD
  // -----------------------------------------
  updateRecord: async (id, input) => {
    const record =
      await service.updateRecord(
        id,
        input
      );

    if (!record) {
      return null;
    }

    set((state) => ({
      records: state.records.map((r) =>
        r.id === id
          ? record
          : r
      ),
    }));

    return record;
  },

  // -----------------------------------------
  // ARCHIVE
  // -----------------------------------------
  archive: async (id) => {
    const record =
      await service.archiveRecord(id);

    if (!record) {
      return null;
    }

    set((state) => ({
      records: state.records.map((r) =>
        r.id === id
          ? record
          : r
      ),
    }));

    return record;
  },

  // -----------------------------------------
  // RESTORE
  // -----------------------------------------
  restore: async (id) => {
    const record =
      await service.restoreRecord(id);

    if (!record) {
      return null;
    }

    set((state) => ({
      records: state.records.map((r) =>
        r.id === id
          ? record
          : r
      ),
    }));

    return record;
  },

  // -----------------------------------------
  // UPLOAD FILE
  // -----------------------------------------
  uploadFile: async (
    id,
    file,
    storageUrl
  ) => {
    const record =
      await service.uploadFile(
        id,
        file,
        storageUrl
      );

    set((state) => ({
      records: state.records.map((r) =>
        r.id === id
          ? record
          : r
      ),
    }));

    return record;
  },

  // ============================================================
  // DELETE BY PROJECT - ADDED
  // ============================================================

  deleteByProject: async (projectId: string) => {
    console.log(
      `🗑️ recordStore: Deleting records for project: ${projectId}`
    );

    try {
      set({
        loading: true,
        error: null,
      });

      await service.deleteByProject(projectId);

      set((state) => ({
        records: state.records.filter(
          (record) => record.projectId !== projectId
        ),
        loading: false,
      }));

      console.log(
        `✅ recordStore: Deleted records for project: ${projectId}`
      );
    } catch (error) {
      console.error(
        "recordStore.deleteByProject:",
        error
      );

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete records for project",
      });

      throw error;
    }
  },

  // ============================================================
  // DELETE RECORD - ADDED
  // ============================================================

  deleteRecord: async (id: string) => {
    console.log(
      `🗑️ recordStore: Deleting record: ${id}`
    );

    try {
      set({
        loading: true,
        error: null,
      });

      await service.delete(id);

      set((state) => ({
        records: state.records.filter(
          (record) => record.id !== id
        ),
        loading: false,
      }));

      console.log(
        `✅ recordStore: Record deleted: ${id}`
      );
    } catch (error) {
      console.error(
        "recordStore.deleteRecord:",
        error
      );

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete record",
      });

      throw error;
    }
  },
}));