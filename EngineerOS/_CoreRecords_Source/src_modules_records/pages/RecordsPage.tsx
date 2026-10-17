// src/modules/records/pages/RecordsPage.tsx

import React, { useState } from 'react';
import { RecordLibrary } from '../components/RecordLibrary';
import { UploadCenter } from '../components/UploadCenter';
import { useRecords } from '../hooks/useRecords';
import { OwnerType } from '../domain';

interface RecordsPageProps {
    workspaceId: string;
    projectId?: string;
    ownerType?: OwnerType;
    ownerId?: string;
    currentUserId: string;
}

export function RecordsPage({
    workspaceId,
    projectId,
    ownerType = 'project',
    ownerId,
    currentUserId,
}: RecordsPageProps) {
    const [showUpload, setShowUpload] = useState(false);

    const {
        records,
        loading,
        refresh,
        createRecordWithFile,
        archive,
        restore,
        approve,
    } = useRecords({
        workspaceId,
        projectId,
        ownerType,
        ownerId,
    });

    const handleUploadComplete = () => {
        refresh();
        setShowUpload(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">📋 Records</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {loading ? 'Loading...' : `${records.length} records found`}
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
                records={records}
                loading={loading}
                onRefresh={refresh}
                onArchive={archive}
                onRestore={restore}
                onApprove={approve}
            />

            {showUpload && (
                <UploadCenter
                    workspaceId={workspaceId}
                    projectId={projectId || workspaceId}
                    ownerType={ownerType}
                    ownerId={ownerId || projectId || workspaceId}
                    onUploadComplete={handleUploadComplete}
                    onClose={() => setShowUpload(false)}
                    createRecordWithFile={createRecordWithFile}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}