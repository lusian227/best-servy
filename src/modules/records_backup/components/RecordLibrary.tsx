// src/modules/records/components/RecordLibrary.tsx

import React, { useState, useEffect } from 'react';
import { EngineeringRecord } from '../../../domain/records/EngineeringRecord';
import { RecordService } from '../services/RecordService';
import { RecordDetail } from './RecordDetail';
import { Search, Grid, List, FolderOpen, Calendar, User } from 'lucide-react';

const recordService = new RecordService();

interface RecordLibraryProps {
  workspaceId: string;
}

export function RecordLibrary({ workspaceId }: RecordLibraryProps) {
  const [records, setRecords] = useState<EngineeringRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EngineeringRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<EngineeringRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'drawing' | 'report' | 'photo' | 'other'>('all');

  useEffect(() => {
    loadRecords();
  }, [workspaceId]);

  useEffect(() => {
    applyFilters();
  }, [records, searchQuery, filter]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      console.log("📚 RecordLibrary - workspaceId prop:", workspaceId);
      const allRecords = await recordService.getByWorkspace(workspaceId);
      console.log("📚 RecordLibrary - records loaded:", allRecords.length);
      setRecords(allRecords);
      setFilteredRecords(allRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = records;

    if (filter !== 'all') {
      filtered = filtered.filter(r => r.category === filter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.recordNumber.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredRecords(filtered);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drawing': return '📐';
      case 'report': return '📄';
      case 'photo': return '📷';
      case 'specification': return '📋';
      case 'calculation': return '🧮';
      default: return '📎';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'drawing': return 'blue';
      case 'report': return 'emerald';
      case 'photo': return 'purple';
      case 'specification': return 'amber';
      case 'calculation': return 'rose';
      default: return 'slate';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400">Loading records...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Record Library</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredRecords.length} records
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="drawing">Drawings</option>
                <option value="report">Reports</option>
                <option value="photo">Photos</option>
                <option value="specification">Specifications</option>
                <option value="calculation">Calculations</option>
                <option value="other">Other</option>
              </select>

              <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={"p-2 transition " + (viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700')}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={"p-2 transition " + (viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
              <FolderOpen className="w-16 h-16 mb-3 opacity-50" />
              <p className="text-lg font-medium">No records found</p>
              <p className="text-sm">Upload your first record to get started</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{getCategoryIcon(record.category)}</span>
                    <span className={"px-2 py-0.5 text-xs rounded bg-" + getCategoryColor(record.category) + "-100 text-" + getCategoryColor(record.category) + "-700 dark:bg-" + getCategoryColor(record.category) + "-900/30 dark:text-" + getCategoryColor(record.category) + "-400"}>
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
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:shadow transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{getCategoryIcon(record.category)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {record.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {record.recordNumber} • {record.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      v{record.version}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedRecord && (
        <div className="w-96 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto">
          <RecordDetail
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onDownload={() => {
              if (selectedRecord.metadata?.storageUrl) {
                window.open(selectedRecord.metadata.storageUrl, '_blank');
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
