import type { EngineeringRecord } from "../domain";
import { RecordRepository } from "../repositories/RecordRepository";

export interface VersionChange {
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface VersionEntry {
  id: string;
  recordId: string;
  version: number;
  revision: string;
  createdAt: Date;
  createdBy: string;
  changes: VersionChange[];
  record: EngineeringRecord;
}

export class VersionService {
  constructor(
    private readonly repository = new RecordRepository()
  ) { }

  async getLatest(
    recordId: string
  ): Promise<EngineeringRecord | null> {
    return this.repository.findById(recordId);
  }

  async getVersions(
    recordId: string
  ): Promise<VersionEntry[]> {
    const record = await this.repository.findById(recordId);

    if (!record) {
      return [];
    }

    return [
      {
        id: `${record.id}-v${record.version}`,
        recordId: record.id,
        version: record.version,
        revision: record.revision,
        createdAt: record.updatedAt,
        createdBy: record.updatedBy,
        changes: [],
        record,
      },
    ];
  }

  async restoreVersion(
    recordId: string,
    version: VersionEntry
  ): Promise<EngineeringRecord | null> {
    return this.repository.update(recordId, {
      title: version.record.title,
      description: version.record.description,
      category: version.record.category,
      discipline: version.record.discipline,
      metadata: version.record.metadata,
      updatedBy: "system",
    });
  }
}

export default VersionService;