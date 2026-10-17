// src/modules/records/pages/RecordsPage.tsx

import React, { useState, useEffect } from 'react';
import { RecordLibrary } from '../components/RecordLibrary';
import { UploadCenter } from '../components/UploadCenter';
import { RecordService } from '../services/RecordService';
import { OwnerType } from '../domain';
import { useCompanyStore } from '../../../stores/companyStore';

const recordService = new RecordService();

interface RecordsPageProps {
    workspaceId?: string;
    projectId?: string;
    ownerType?: OwnerType;
    ownerId?: string;
    currentUserId: string;
}

export function RecordsPage({
    workspaceId: propWorkspaceId,
    projectId,
    ownerType = 'project',
    ownerId,
    currentUserId,
}: RecordsPageProps) {
    const [showUpload, setShowUpload] = useState(false);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { activeCompanyId, workspaces } = useCompanyStore();

    // ============================================================
    // DERIVE EFFECTIVE WORKSPACE IDS
    // ============================================================

    const effectiveWorkspaceIds = (() => {
        if (propWorkspaceId) {
            return [propWorkspaceId];
        }
        if (activeCompanyId && workspaces.length > 0) {
            return workspaces
                .map((w) => w.id)
                .filter((id): id is string => Boolean(id));  // ← FILTER OUT UNDEFINED
        }
        return [];
    })();

    // ============================================================
    // LOAD RECORDS
    // ============================================================

    const loadRecords = async () => {
        if (effectiveWorkspaceIds.length === 0) {
            setRecords([]);
            return;
        }

        setLoading(true);
        try {
            const allRecords = await recordService.getByWorkspaces(effectiveWorkspaceIds);
            console.log('📚 RecordsPage - records loaded:', allRecords.length);
            setRecords(allRecords);
        } catch (error) {
            console.error('Failed to load records:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [effectiveWorkspaceIds.join(','), projectId]);

    // ============================================================
    // LOGGING
    // ============================================================

    useEffect(() => {

        if (!activeCompanyId) return;
        console.log('📚 RecordsPage - activeCompanyId:', activeCompanyId);
        console.log('📚 RecordsPage - workspaces:', workspaces);
        console.log('📚 RecordsPage - effectiveWorkspaceIds:', effectiveWorkspaceIds);
        console.log('📚 RecordsPage - projectId:', projectId);
    }, [activeCompanyId, workspaces, effectiveWorkspaceIds, projectId]);

    // ============================================================
    // HANDLE UPLOAD COMPLETE
    // ============================================================

    const handleUploadComplete = async (recordId: string) => {
        console.log('✅ Record upload completed:', recordId);
        await loadRecords();
        setShowUpload(false);
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">📋 Records</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {loading ? 'Loading...' : `${records.length} records found`}
                        {activeCompanyId && (
                            <span className="ml-2 text-xs text-emerald-500">
                                • Company: {activeCompanyId}
                            </span>
                        )}
                        {effectiveWorkspaceIds.length > 0 && (
                            <span className="ml-2 text-xs text-slate-400">
                                • {effectiveWorkspaceIds.length} workspace{effectiveWorkspaceIds.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {projectId && (
                            <span className="ml-2 text-xs text-blue-500">
                                • Project: {projectId}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setShowUpload(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                    + New Record
                </button>
            </div>

            <RecordLibrary
                records={records || []}  // ← ADD THIS FALLBACK
                loading={loading}
                workspaceIds={effectiveWorkspaceIds}
                projectId={projectId}
            />

            {showUpload && (
                <UploadCenter
                    workspaceId={effectiveWorkspaceIds.length > 0 ? effectiveWorkspaceIds[0] : ''}
                    projectId={projectId || ''}
                    ownerType={projectId ? 'project' : 'folder'}  // ← ✅ 'folder' IS ALLOWED
                    ownerId={projectId || activeCompanyId || ''}   // ← FIXED
                    onUploadComplete={handleUploadComplete}
                    onClose={() => setShowUpload(false)}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}