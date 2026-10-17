// src/modules/records/components/RecordLibrary.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { EngineeringRecord } from '../domain/EngineeringRecord';
import { RecordDetail } from './RecordDetail';

import {
  Search,
  Grid,
  List,
  FolderOpen,
  Calendar,
  User,
  FileText,
  Image,
  Ruler,
  ClipboardList,
  Calculator,
  File,
} from 'lucide-react';

import { useRecordStore } from '../store/recordStore';

type RecordFilter =
  | 'all'
  | 'drawing'
  | 'report'
  | 'photo'
  | 'specification'
  | 'calculation'
  | 'other';

interface RecordLibraryProps {
  /**
   * Optional records supplied by a parent.
   *
   * If omitted, RecordLibrary loads records through recordStore.
   */
  records?: EngineeringRecord[];

  /**
   * Optional parent loading state.
   */
  loading?: boolean;

  /**
   * Workspaces whose records should be displayed.
   */
  workspaceIds: string[];

  /**
   * Optional project filter.
   */
  projectId?: string;
}

/**
 * Explicit Tailwind classes.
 *
 * Do not construct Tailwind classes dynamically such as:
 * text-${color}-500
 *
 * Tailwind cannot reliably detect those classes during build.
 */
const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'drawing':
      return {
        icon: 'text-blue-500',
        badge:
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      };

    case 'report':
      return {
        icon: 'text-emerald-500',
        badge:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      };

    case 'photo':
      return {
        icon: 'text-purple-500',
        badge:
          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      };

    case 'specification':
      return {
        icon: 'text-amber-500',
        badge:
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      };

    case 'calculation':
      return {
        icon: 'text-rose-500',
        badge:
          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      };

    default:
      return {
        icon: 'text-slate-500',
        badge:
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
      };
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'drawing':
      return Ruler;

    case 'report':
      return FileText;

    case 'photo':
      return Image;

    case 'specification':
      return ClipboardList;

    case 'calculation':
      return Calculator;

    default:
      return File;
  }
};

export function RecordLibrary({
  records: parentRecords,
  loading: parentLoading = false,
  workspaceIds,
  projectId,
}: RecordLibraryProps) {
  const [selectedRecord, setSelectedRecord] =
    useState<EngineeringRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [viewMode, setViewMode] =
    useState<'grid' | 'list'>('grid');

  const [filter, setFilter] =
    useState<RecordFilter>('all');

  const {
    records: storeRecords,
    loading: storeLoading,
    error: storeError,
    load,
    deleteRecord,
  } = useRecordStore();

  /**
   * Stable workspace key.
   *
   * This prevents the effect from depending directly on a
   * newly-created array reference.
   */
  const workspaceKey = useMemo(
    () => workspaceIds.join('|'),
    [workspaceIds]
  );

  /**
   * Load records from the store whenever the workspace changes.
   *
   * The RecordService already supports:
   *
   * getRecords(filters)
   *
   * and RecordRepository.findAll(filters).
   *
   * Therefore the workspace filter belongs in the store/service
   * loading pipeline rather than requiring the parent to provide
   * the records manually.
   */
  useEffect(() => {
    if (workspaceIds.length === 0) {
      return;
    }

    void load({
      workspaceIds,
    });
  }, [load, workspaceKey]);

  /**
   * Decide where records come from.
   *
   * If a parent explicitly supplies records, use those.
   * Otherwise use the Zustand store.
   */
  const records = parentRecords ?? storeRecords;

  /**
   * Combined loading state.
   */
  const loading = parentLoading || storeLoading;

  /**
   * Apply UI-level filtering.
   *
   * Workspace filtering is also kept here as a defensive measure.
   */
  const filteredRecords = useMemo(() => {
    let filtered = records;

    /**
     * Workspace filter
     */
    if (workspaceIds.length > 0) {
      filtered = filtered.filter(
        record =>
          record.workspaceId !== null &&
          workspaceIds.includes(record.workspaceId ?? '')
      );
    }

    /**
     * Project filter
     */
    if (projectId) {
      filtered = filtered.filter(
        (record) => record.projectId === projectId
      );
    }

    /**
     * Category filter
     */
    if (filter !== 'all') {
      filtered = filtered.filter(
        (record) => record.category === filter
      );
    }

    /**
     * Search filter
     */
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((record) => {
        const title =
          record.title?.toLowerCase() ?? '';

        const recordNumber =
          record.recordNumber?.toLowerCase() ?? '';

        const description =
          record.description?.toLowerCase() ?? '';

        const tags =
          record.tags ?? [];

        return (
          title.includes(query) ||
          recordNumber.includes(query) ||
          description.includes(query) ||
          tags.some((tag) =>
            tag.toLowerCase().includes(query)
          )
        );
      });
    }

    return filtered;
  }, [
    records,
    workspaceIds,
    projectId,
    filter,
    searchQuery,
  ]);

  /**
   * Delete a record.
   *
   * recordStore.deleteRecord()
   * └── RecordService.delete()
   *     └── RecordRepository.delete()
   */
  const handleDeleteRecord = async (
    record: EngineeringRecord
  ) => {
    try {
      await deleteRecord(record.id);

      setSelectedRecord(null);
    } catch (error) {
      console.error(
        'Failed to delete record:',
        error
      );

      alert(
        'Failed to delete record. Please try again.'
      );
    }
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400">
          Loading records...
        </div>
      </div>
    );
  }

  /**
   * Store/service error
   */
  if (storeError) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <div className="max-w-md text-center">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Unable to load records
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {storeError}
          </p>

          <button
            onClick={() => {
              if (workspaceIds.length > 0) {
                void load({
                  workspaceIds,
                });
              }
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* ============================================================
          LIBRARY
      ============================================================ */}

      <div className="flex-1 flex flex-col">
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Record Library
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredRecords.length} records

                {projectId && (
                  <span className="ml-2 text-xs text-blue-500">
                    Project: {projectId}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
                />
              </div>

              {/* Category */}

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as RecordFilter
                  )
                }
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">
                  All Categories
                </option>

                <option value="drawing">
                  Drawings
                </option>

                <option value="report">
                  Reports
                </option>

                <option value="photo">
                  Photos
                </option>

                <option value="specification">
                  Specifications
                </option>

                <option value="calculation">
                  Calculations
                </option>

                <option value="other">
                  Other
                </option>
              </select>

              {/* View mode */}

              <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setViewMode('grid')
                  }
                  className={`p-2 transition ${viewMode === 'grid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode('list')
                  }
                  className={`p-2 transition ${viewMode === 'list'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================
            CONTENT
        ========================================================== */}

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
              <FolderOpen className="w-16 h-16 mb-3 opacity-50" />

              <p className="text-lg font-medium">
                No records found
              </p>

              <p className="text-sm">
                {projectId
                  ? 'No records for this project yet.'
                  : workspaceIds.length === 0
                    ? 'No workspaces available for this company.'
                    : 'Upload your first record to get started'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* ========================================================
               GRID VIEW
            ======================================================== */

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record) => {
                const CategoryIcon =
                  getCategoryIcon(
                    record.category
                  );

                const styles =
                  getCategoryStyles(
                    record.category
                  );

                return (
                  <div
                    key={record.id}
                    onClick={() =>
                      setSelectedRecord(record)
                    }
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <CategoryIcon
                        className={`w-8 h-8 ${styles.icon}`}
                      />

                      <span
                        className={`px-2 py-0.5 text-xs rounded ${styles.badge}`}
                      >
                        {record.category}
                      </span>
                    </div>

                    <h3 className="font-medium text-slate-900 dark:text-white truncate">
                      {record.title}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {record.recordNumber}
                    </p>

                    {record.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                        {record.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />

                        {record.createdBy}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />

                        {new Date(
                          record.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================
               LIST VIEW
            ======================================================== */

            <div className="space-y-2">
              {filteredRecords.map((record) => {
                const CategoryIcon =
                  getCategoryIcon(
                    record.category
                  );

                const styles =
                  getCategoryStyles(
                    record.category
                  );

                return (
                  <div
                    key={record.id}
                    onClick={() =>
                      setSelectedRecord(record)
                    }
                    className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:shadow transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <CategoryIcon
                        className={`w-6 h-6 ${styles.icon}`}
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 dark:text-white truncate">
                          {record.title}
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {record.recordNumber} •{' '}
                          {record.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {new Date(
                          record.createdAt
                        ).toLocaleDateString()}
                      </span>

                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        v{record.version}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          RECORD DETAIL
      ============================================================ */}

      {selectedRecord && (
        <div className="w-96 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto">
          <RecordDetail
            record={selectedRecord}
            onClose={() =>
              setSelectedRecord(null)
            }
            onDownload={() => {
              const storageUrl =
                selectedRecord.metadata?.storageUrl;

              if (
                storageUrl &&
                typeof storageUrl === 'string'
              ) {
                window.open(
                  storageUrl,
                  '_blank'
                );
              }
            }}
            onDelete={handleDeleteRecord}
          />
        </div>
      )}
    </div>
  );
}