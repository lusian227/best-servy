// src/modules/records/components/VersionTimeline.tsx

import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, User, Calendar, ChevronDown, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { VersionService, VersionEntry } from '../services/VersionService';

interface VersionTimelineProps {
  recordId: string;
  onRestore?: (version: number) => void;
}

export function VersionTimeline({ recordId, onRestore }: VersionTimelineProps) {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);
  const versionService = new VersionService();

  useEffect(() => {
    loadVersions();
  }, [recordId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await versionService.getVersions(recordId);
      setVersions(data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: number) => {
    if (!confirm('Restore to version ' + version + '? This will create a new version.')) return;
    
    setRestoring(version);
    try {
      await versionService.restoreVersion(recordId, version);
      await loadVersions();
      if (onRestore) onRestore(version);
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert('Failed to restore version. Please try again.');
    } finally {
      setRestoring(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
      under_review: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      issued: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
        <p className="text-sm">No version history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-sm">Version History</span>
          <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {versions.length} versions
          </span>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="space-y-0 pl-4">
          {versions.map((version, index) => {
            const isLatest = index === 0;
            const isRestoring = restoring === version.version;
            
            return (
              <div
                key={version.id}
                className={'relative pl-6 pb-4 last:pb-0 ' + (!isLatest ? 'border-l-2 border-slate-200 dark:border-slate-700' : '')}
              >
                <div className={'absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ' + (isLatest ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600')} />
                
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={'font-medium text-sm ' + (isLatest ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300')}>
                        {isLatest ? 'Current: ' : ''}Version {version.version}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{version.revision}</span>
                      <span className={'text-xs px-1.5 py-0.5 rounded ' + getStatusColor(version.status)}>
                        {version.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {version.changedBy}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(version.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {version.changes.length > 0 && (
                      <ul className="mt-1 text-xs text-slate-500 list-disc list-inside">
                        {version.changes.slice(-2).map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {!isLatest && (
                    <button
                      onClick={() => handleRestore(version.version)}
                      disabled={isRestoring}
                      className={'px-3 py-1 text-xs rounded transition flex items-center gap-1 whitespace-nowrap ' + (
                        isRestoring
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/40'
                      )}
                    >
                      {isRestoring ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      {isRestoring ? 'Restoring...' : 'Restore'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
