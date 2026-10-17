// src/lib/localDB.ts - COMPLETELY CLEAN - NO SYNC QUEUE

import Dexie, { Table } from 'dexie';
import { EngineeringRecord } from '../domain/records/EngineeringRecord';

export class EngineerOSDB extends Dexie {
  records!: Table<EngineeringRecord, string>;

  constructor() {
    super('EngineerOS');
    this.version(1).stores({
      records: 'id, projectId, title, category, status, discipline, updatedAt',
    });
  }
}

export const db = new EngineerOSDB();

// Only keep what's needed for the Records module
export async function saveRecordOffline(record: EngineeringRecord): Promise<void> {
  try {
    await db.records.put(record);
  } catch (error) {
    console.error('Failed to save record offline:', error);
  }
}

export async function getRecordsOffline(): Promise<EngineeringRecord[]> {
  try {
    return await db.records.toArray();
  } catch (error) {
    console.error('Failed to get records offline:', error);
    return [];
  }
}

export async function getRecordOffline(id: string): Promise<EngineeringRecord | undefined> {
  try {
    return await db.records.get(id);
  } catch (error) {
    console.error('Failed to get record offline:', error);
    return undefined;
  }
}

export async function deleteRecordOffline(id: string): Promise<void> {
  try {
    await db.records.delete(id);
  } catch (error) {
    console.error('Failed to delete record offline:', error);
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnline(callback: () => void): void {
  window.addEventListener('online', callback);
}

export function onOffline(callback: () => void): void {
  window.addEventListener('offline', callback);
}

// NO syncQueue - removed entirely
