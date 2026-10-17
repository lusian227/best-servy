// src/modules/procurement/pages/ProcurementPage.tsx

import React, { useState, useEffect } from 'react';
import { ProcurementDashboard } from '../components/ProcurementDashboard';
import { CreateRequestModal } from '../components/CreateRequestModal';
import { EditRequestModal } from '../components/EditRequestModal';
import { RFQForm } from '../components/RFQForm';
import { ProcurementTransactionPanel } from '../components/ProcurementTransactionPanel';
import { useCompanyStore } from '../../../stores/companyStore';
import { useAuth } from '../../../contexts/AuthContext';
import type { ProcurementRequest } from '../domain';

interface ProcurementPageProps {
    projectId?: string;
}

export function ProcurementPage({ projectId }: ProcurementPageProps) {
    const { activeCompanyId, workspaces, loading: companyLoading } = useCompanyStore();
    const { user } = useAuth();

    const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
    const [editingRequest, setEditingRequest] = useState<ProcurementRequest | null>(null);
    const [rfqRequest, setRfqRequest] = useState<ProcurementRequest | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRFQForm, setShowRFQForm] = useState(false);
    const [showTransactionPanel, setShowTransactionPanel] = useState(false);

    const [refreshKey, setRefreshKey] = useState(0);

    const workspaceId = workspaces[0]?.id;

    useEffect(() => {
        console.log('🏢 ProcurementPage: Company State:', {
            activeCompanyId,
            workspaces,
            companyLoading,
            workspacesCount: workspaces?.length || 0,
        });
    }, [activeCompanyId, workspaces, companyLoading]);

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleOpenRequest = (request: ProcurementRequest) => {
        setSelectedRequest(request);
        setShowTransactionPanel(true);
    };

    const handleEditRequest = (request: ProcurementRequest) => {
        setEditingRequest(request);
        setShowEditModal(true);
    };

    const handleCreateRFQ = (request: ProcurementRequest) => {
        setRfqRequest(request);
        setShowRFQForm(true);
    };

    const handleRequestUpdated = () => {
        setShowEditModal(false);
        setEditingRequest(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleRFQCreated = () => {
        setShowRFQForm(false);
        setRfqRequest(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleRequestCreated = () => {
        setShowCreateModal(false);
        setRefreshKey(prev => prev + 1);
    };

    const handleTransactionRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    // ============================================================
    // RENDER
    // ============================================================

    if (companyLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading company data...</p>
                </div>
            </div>
        );
    }

    if (!activeCompanyId || workspaces.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <span className="text-2xl">🏢</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Company Found</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Please create a company before managing procurement requests.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ======================================================
                DASHBOARD
            ====================================================== */}

            <ProcurementDashboard
                key={refreshKey}
                projectId={projectId}
                workspaceId={workspaceId}
                onOpenRequest={handleOpenRequest}
                onCreateRequest={() => setShowCreateModal(true)}
            />

            {/* ======================================================
                CREATE REQUEST MODAL
            ====================================================== */}

            <CreateRequestModal
                isOpen={showCreateModal}
                projectId={projectId || undefined}
                workspaceId={workspaceId || undefined}
                onClose={() => setShowCreateModal(false)}
                onCreated={handleRequestCreated}
            />

            {/* ======================================================
                EDIT REQUEST MODAL
            ====================================================== */}

            <EditRequestModal
                isOpen={showEditModal}
                request={editingRequest}
                projectId={projectId}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingRequest(null);
                }}
                onUpdated={handleRequestUpdated}
            />

            {/* ======================================================
                RFQ FORM
            ====================================================== */}

            <RFQForm
                isOpen={showRFQForm}
                request={rfqRequest}
                projectId={projectId}
                onClose={() => {
                    setShowRFQForm(false);
                    setRfqRequest(null);
                }}
                onCreated={handleRFQCreated}
            />

            {/* ======================================================
                TRANSACTION PANEL (Main Workflow)
            ====================================================== */}

            {selectedRequest && showTransactionPanel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {selectedRequest.title}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Reference: {selectedRequest.reference}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowTransactionPanel(false);
                                    setSelectedRequest(null);
                                }}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <ProcurementTransactionPanel
                                requestId={selectedRequest.id}
                                workspaceId={workspaceId || ''}
                                userId={user?.id || ''}
                                userCompanyId={activeCompanyId || ''}  // ✅ Use activeCompanyId instead
                                onRefresh={handleTransactionRefresh}
                                onClose={() => {
                                    setShowTransactionPanel(false);
                                    setSelectedRequest(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}