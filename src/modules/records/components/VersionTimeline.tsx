// src/modules/records/components/VersionTimeline.tsx
import React from 'react';

interface VersionEntry {
  id: string;
  version: number;
  status: string;
  changedBy: string;
  changedAt: Date;
  changes: string[];
}

interface VersionTimelineProps {
  versions: VersionEntry[];
  onRestore?: (version: VersionEntry) => void;
}

export function VersionTimeline({ versions, onRestore }: VersionTimelineProps) {
  if (!versions || versions.length === 0) {
    return <div className="text-sm text-gray-500">No versions available</div>;
  }

  return (
    <div className="space-y-2">
      {versions.map((version) => (
        <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <span className="font-medium">v{version.version}</span>
            <span className="ml-2 text-sm text-gray-500">{version.status}</span>
            <span className="ml-2 text-sm text-gray-400">by {version.changedBy}</span>
          </div>
          <div className="text-sm text-gray-400">
            {new Date(version.changedAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}