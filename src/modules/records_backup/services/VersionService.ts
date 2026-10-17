// src/modules/records/services/VersionService.ts

import { EngineeringRecord } from "../../../domain/records/EngineeringRecord";
import { RecordRepository } from '../../../repositories/RecordRepository';

export interface VersionEntry {
  id: string;
  recordId: string;
  version: number;
  revision: string;
  title: string;
  status: string;
  changedBy: string;
  changedAt: Date;
  changes: string[];
  fileId?: string;
  fileName?: string;
}

const repo = new RecordRepository();

// In-memory version storage (would be Supabase in production)
let versionHistory: VersionEntry[] = [];

export class VersionService {

  async getVersions(recordId: string): Promise<VersionEntry[]> {
    // Check if we have versions in memory
    const existing = versionHistory.filter(v => v.recordId === recordId);
    if (existing.length > 0) {
      return existing.sort((a, b) => b.version - a.version);
    }

    // Generate mock versions based on record
    const record = await repo.findById(recordId);
    if (!record) return [];

    const versions: VersionEntry[] = [];
    const statuses = ['draft', 'under_review', 'approved', 'issued'];
    const users = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Johnson', 'Martin Vance'];
    const changeDescriptions = [
      'Initial creation',
      'Updated title and description',
      'Added new files',
      'Submitted for review',
      'Approved and issued',
      'Revised based on feedback',
      'Final version approved'
    ];

    // Create mock versions (3-5 versions)
    const numVersions = Math.min(record.version || 5, 5);

    for (let i = 1; i <= numVersions; i++) {
      const date = new Date(record.createdAt || new Date());
      date.setDate(date.getDate() - (numVersions - i) * 7);

      versions.push({
        id: 'ver-' + Date.now() + '-' + i,
        recordId: recordId,
        version: i,
        revision: i === 1 ? 'REV0' : 'REV' + (i - 1),
        title: i === 1 ? record.title : record.title + ' (v' + i + ')',
        status: statuses[Math.min(i - 1, statuses.length - 1)],
        changedBy: users[i % users.length],
        changedAt: date,
        changes: changeDescriptions.slice(0, i),
        fileId: record.fileId,
        fileName: record.fileName,
      });
    }

    // Store in memory
    versionHistory = [...versionHistory, ...versions];
    return versions.sort((a, b) => b.version - a.version);
  }

  async getVersion(recordId: string, versionNumber: number): Promise<VersionEntry | undefined> {
    const versions = await this.getVersions(recordId);
    return versions.find(v => v.version === versionNumber);
  }

  async restoreVersion(recordId: string, versionNumber: number): Promise<EngineeringRecord | null> {
    const versions = await this.getVersions(recordId);
    const version = versions.find(v => v.version === versionNumber);
    if (!version) return null;

    const record = await repo.findById(recordId);
    if (!record) return null;

    // Create a new version by restoring from the old one
    const restored: EngineeringRecord = {
      ...record,
      title: version.title,
      status: version.status as any,
      version: record.version + 1,
      revision: 'REV' + (record.version),
      updatedAt: new Date(),
      updatedBy: 'Version Restore',
      description: record.description + ' (Restored from v' + versionNumber + ')',
    };

    const saved = await repo.save(restored);

    // Add to version history
    versionHistory.push({
      id: 'ver-' + Date.now(),
      recordId: recordId,
      version: saved.version,
      revision: saved.revision,
      title: saved.title,
      status: saved.status,
      changedBy: 'System (Restore)',
      changedAt: new Date(),
      changes: ['Restored from version ' + versionNumber],
      fileId: saved.fileId,
      fileName: saved.fileName,
    });

    return saved;
  }
}
