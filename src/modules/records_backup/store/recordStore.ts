// src/modules/records/store/recordStore.ts

import { create } from 'zustand';
import { EngineeringRecord } from "../../../domain/records/EngineeringRecord";
import { RecordService, CreateRecordInput, UpdateRecordInput } from '../services/RecordService';
import { sampleRecords } from '../data/sampleRecords';

const recordService = new RecordService();

// Initialize with sample records
const initialRecords = sampleRecords;

interface RecordState {
  records: EngineeringRecord[];
  selectedRecord: EngineeringRecord | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;

  loadRecords: () => Promise<void>;
  getRecord: (id: string) => Promise<EngineeringRecord | undefined>;
  createRecord: (input: CreateRecordInput) => Promise<EngineeringRecord | undefined>;
  updateRecord: (id: string, input: UpdateRecordInput) => Promise<EngineeringRecord | undefined>;
  deleteRecord: (id: string) => Promise<boolean>;
  uploadFile: (
    recordId: string,
    file: File,
    storageUrl: string
  ) => Promise<EngineeringRecord | undefined>;
  searchRecords: (query: string) => Promise<EngineeringRecord[]>;
  setSelectedRecord: (record: EngineeringRecord | null) => void;
  setSearchTerm: (term: string) => void;
  getFilteredRecords: () => EngineeringRecord[];
}

export const useRecordStore = create<RecordState>((set, get) => ({
  records: initialRecords,
  selectedRecord: null,
  loading: false,
  error: null,
  searchTerm: '',

  loadRecords: async () => {
    set({ loading: true, error: null });
    try {
      const records = await recordService.getAll();
      console.log("📦 Loaded records from database:", records);
      console.log("📦 Record count:", records.length);

      if (records && records.length > 0) {
        console.log("✅ Setting records from database");
        set({ records, loading: false });
      } else {
        console.log("⚠️ No records from database. Using sample records.");
        set({ records: initialRecords, loading: false });
      }
    } catch (error) {
      console.error("❌ Failed to load records:", error);
      set({ error: 'Failed to load records', loading: false });
    }
  },

  getRecord: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const record = await recordService.getById(id);
      if (record) {
        set({ selectedRecord: record, loading: false });
      } else {
        // Check sample records
        const sample = initialRecords.find(r => r.id === id);
        if (sample) {
          set({ selectedRecord: sample, loading: false });
        } else {
          set({ error: 'Record not found', loading: false });
        }
      }
      return record || initialRecords.find(r => r.id === id);
    } catch (error) {
      set({ error: 'Failed to get record', loading: false });
      return undefined;
    }
  },

  createRecord: async (input: CreateRecordInput) => {
    set({ loading: true, error: null });
    try {
      const record = await recordService.create(input);
      if (record) {
        set((state) => ({
          records: [...state.records, record],
          loading: false,
        }));
        return record;
      }
      set({ loading: false });
      return undefined;
    } catch (error) {
      set({ error: 'Failed to create record', loading: false });
      return undefined;
    }
  },

  updateRecord: async (id: string, input: UpdateRecordInput) => {
    set({ loading: true, error: null });
    try {
      const record = await recordService.update(id, input);
      if (record) {
        set((state) => ({
          records: state.records.map(r => r.id === id ? record : r),
          selectedRecord: state.selectedRecord?.id === id ? record : state.selectedRecord,
          loading: false,
        }));
        return record;
      }
      set({ loading: false });
      return undefined;
    } catch (error) {
      set({ error: 'Failed to update record', loading: false });
      return undefined;
    }
  },

  deleteRecord: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const success = await recordService.delete(id);
      if (success) {
        set((state) => ({
          records: state.records.filter(r => r.id !== id),
          selectedRecord: state.selectedRecord?.id === id ? null : state.selectedRecord,
          loading: false,
        }));
        return true;
      }
      set({ loading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete record', loading: false });
      return false;
    }
  },

  uploadFile: async (
    recordId: string,
    file: File,
    storageUrl: string
  ) => {
    set({ loading: true, error: null });
    try {
      const record = await recordService.upload(
        recordId,
        file,
        storageUrl
      );
      if (record) {
        set((state) => ({
          records: state.records.map(r => r.id === recordId ? record : r),
          selectedRecord: state.selectedRecord?.id === recordId ? record : state.selectedRecord,
          loading: false,
        }));
        return record;
      }
      set({ loading: false });
      return undefined;
    } catch (error) {
      set({ error: 'Failed to upload file', loading: false });
      return undefined;
    }
  },

  searchRecords: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const results = await recordService.search(query);
      set({ records: results, loading: false });
      return results;
    } catch (error) {
      set({ error: 'Failed to search records', loading: false });
      return [];
    }
  },

  setSelectedRecord: (record) => {
    set({ selectedRecord: record });
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  getFilteredRecords: () => {
    const { records, searchTerm } = get();
    if (!searchTerm.trim()) return records;
    const lower = searchTerm.toLowerCase();
    return records.filter(r =>
      r.title.toLowerCase().includes(lower) ||
      r.recordNumber.toLowerCase().includes(lower) ||
      r.description?.toLowerCase().includes(lower)
    );
  },
}));
