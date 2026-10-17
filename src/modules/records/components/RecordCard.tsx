// src/modules/records/components/RecordCard.tsx

import React from 'react';
import { EngineeringRecord, RecordStatus } from '../domain/EngineeringRecord';

interface RecordCardProps {
  record: EngineeringRecord;
  onClick?: () => void;
}

const statusColors: Record<RecordStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  in_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  qa_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  issued: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  under_construction: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  superseded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  obsolete: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export function RecordCard({ record, onClick }: RecordCardProps) {
  const statusColor = statusColors[record.status] || 'bg-gray-100 text-gray-700';
  const fileCount = record.fileIds?.length || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">{record.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{record.recordNumber}</p>
        </div>
        <span className={'text-xs px-2 py-1 rounded-full ' + statusColor}>
          {record.status.replace('_', ' ')}
        </span>
      </div>

      {record.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
          {record.description}
        </p>
      )}

      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span>{record.category}</span>
        <span>•</span>
        <span>{record.discipline}</span>
        <span>•</span>
        <span>v{record.version}</span>
        {fileCount > 0 && (
          <>
            <span>•</span>
            <span>{fileCount} file(s)</span>
          </>
        )}
      </div>

      {/* ✅ Show file IDs count only (not file objects) */}
      {fileCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
            {fileCount} file(s) attached
          </span>
        </div>
      )}
    </div>
  );
}