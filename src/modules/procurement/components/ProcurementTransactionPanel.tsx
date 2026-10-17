// src/modules/procurement/components/ProcurementTransactionPanel.tsx

import React, { useState, useEffect } from 'react';
import {
    Truck,
    CreditCard,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    FileText,
    Camera,
    Trash2,
} from 'lucide-react';
import { useProcurement } from '../hooks/useProcurement';
import { DeliveryModal } from './DeliveryModal';
import { PaymentModal } from './PaymentModal';
import { EvidenceUpload } from './EvidenceUpload';
import type { ProcurementRequest, ProcurementTransactionSummary } from '../domain';

interface ProcurementTransactionPanelProps {
    requestId: string;
    workspaceId: string;
    userId: string;
    userCompanyId: string;
    onRefresh?: () => void;
    onClose?: () => void;
}

const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    received: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ordered: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivering: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    payment_pending: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    open: 'Open',
    submitted: 'Submitted',
    received: 'Received',
    ordered: 'Ordered',
    delivering: 'Delivering',
    delivered: 'Delivered',
    verified: 'Verified',
    payment_pending: 'Payment Pending',
    paid: 'Paid',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
};

const statusOrder = [
    'submitted',
    'received',
    'ordered',
    'delivering',
    'delivered',
    'verified',
    'payment_pending',
    'paid',
    'completed',
];

export function ProcurementTransactionPanel({
    requestId,
    workspaceId,
    userId,
    userCompanyId,
    onRefresh,
    onClose,
}: ProcurementTransactionPanelProps) {
    const [summary, setSummary] = useState<ProcurementTransactionSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showEvidenceModal, setShowEvidenceModal] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        deliveries: true,
        evidence: true,
        payments: true,
    });

    const {
        getTransactionSummary,
        confirmDelivery,
        confirmRequesterReceipt,
        reportPayment,
        verifyPayment,
        rejectPayment,
        completeRequest,
        uploadEvidence,
        deleteEvidence,
    } = useProcurement({
        workspaceId,
        autoLoad: false,
    });

    useEffect(() => {
        loadSummary();
    }, [requestId]);

    const loadSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTransactionSummary(requestId);
            setSummary(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load transaction');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleConfirmDelivery = async (data: {
        quantityDelivered: number;
        condition: 'good' | 'damaged' | 'partial' | 'rejected';
        notes?: string;
    }) => {
        if (!workspaceId) {
            setError('Cannot confirm delivery: workspace ID is missing.');
            return;
        }

        setError(null);

        try {
            await confirmDelivery({
                procurementRequestId: requestId,
                workspaceId,
                ...data,
                userId,
            });

            setShowDeliveryModal(false);
            await loadSummary();
            onRefresh?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to confirm delivery.'
            );
            throw err;
        }
    };

    const handleReportPayment = async (data: {
        amount: number;
        currency: string;
        paymentMethod: 'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Other';
        transactionReference?: string;
        paymentDate: string;
        notes?: string;
    }) => {
        await reportPayment({
            procurementRequestId: requestId,
            workspaceId,
            ...data,
            userId,
        });
        await loadSummary();
        onRefresh?.();
    };

    const handleCompleteRequest = async () => {
        if (!window.confirm('Mark this procurement request as completed?')) {
            return;
        }

        setError(null);

        try {
            await completeRequest(requestId, userId);
            await loadSummary();
            onRefresh?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to complete procurement request.'
            );
        }
    };

    const handleVerifyPayment = async (paymentId: string) => {
        const notes = window.prompt('Optional verification notes:', '');
        if (notes === null) return;
        if (!window.confirm('Verify this payment claim?')) return;

        setError(null);

        try {
            await verifyPayment(paymentId, userId, notes.trim() || undefined);
            await loadSummary();
            onRefresh?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to verify payment.'
            );
        }
    };

    const handleRejectPayment = async (paymentId: string) => {
        const reason = window.prompt(
            'Enter the reason for rejecting this payment claim:'
        );
        if (reason === null) return;

        if (!reason.trim()) {
            setError('A rejection reason is required.');
            return;
        }

        if (!window.confirm('Reject this payment claim?')) return;

        setError(null);

        try {
            await rejectPayment(paymentId, userId, reason.trim());
            await loadSummary();
            onRefresh?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to reject payment.'
            );
        }
    };

    const handleUploadEvidence = async (data: {
        file: File;
        type: 'delivery_photo' | 'delivery_note' | 'invoice' | 'payment_receipt' | 'calculation' | 'other';
        description?: string;
    }) => {
        await uploadEvidence({
            procurementRequestId: requestId,
            workspaceId,
            ...data,
            userId,
        });
        await loadSummary();
        onRefresh?.();
    };

    const handleDeleteEvidence = async (id: string, storagePath: string) => {
        await deleteEvidence(id, storagePath);
        await loadSummary();
        onRefresh?.();
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading transaction...</p>
                </div>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error || 'Transaction not found'}</span>
                </div>
            </div>
        );
    }

    const { request, deliveries, evidence, payments, orderedQuantity, deliveredQuantity, deliveryPercentage } = summary;

    const canConfirmDelivery =
        request.status === 'order_placed' || request.status === 'delivering';
    const canReportPayment = request.status === 'verified';
    const canUploadEvidence = request.status !== 'cancelled' && request.status !== 'rejected';

    const canConfirmReceipt =
        request.status === 'delivered' &&
        userId === request.createdBy;

    const canCompleteRequest =
        request.status === 'paid' &&
        userId === request.createdBy;

    return (
        <div className="space-y-6">
            {/* Status Timeline */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-2">
                    {statusOrder.map((status, index) => {
                        const isCompleted = statusOrder.indexOf(request.status) >= index;
                        const isCurrent = request.status === status;

                        return (
                            <React.Fragment key={status}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${isCompleted
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                    </div>
                                    <span
                                        className={`text-xs font-medium ${isCurrent
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : isCompleted
                                                ? 'text-slate-700 dark:text-slate-300'
                                                : 'text-slate-400 dark:text-slate-500'
                                            }`}
                                    >
                                        {statusLabels[status]}
                                    </span>
                                </div>
                                {index < statusOrder.length - 1 && (
                                    <div
                                        className={`h-0.5 w-6 ${statusOrder.indexOf(request.status) > index
                                            ? 'bg-emerald-600'
                                            : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ordered</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {orderedQuantity} {request.unit || ''}
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Delivered</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {deliveredQuantity} {request.unit || ''}
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Progress</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {Math.round(deliveryPercentage)}%
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                {canConfirmDelivery && (
                    <button
                        onClick={() => setShowDeliveryModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <Truck className="h-4 w-4" />
                        Confirm Delivery
                    </button>
                )}

                {canConfirmReceipt && (
                    <button
                        onClick={async () => {
                            setError(null);
                            try {
                                await confirmRequesterReceipt(
                                    requestId,
                                    workspaceId,
                                    userId
                                );
                                await loadSummary();
                                onRefresh?.();
                            } catch (err) {
                                setError(
                                    err instanceof Error
                                        ? err.message
                                        : 'Failed to confirm receipt.'
                                );
                            }
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Confirm Receipt
                    </button>
                )}

                {canReportPayment && (
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <CreditCard className="h-4 w-4" />
                        Report Payment
                    </button>
                )}

                {canCompleteRequest && (
                    <button
                        onClick={handleCompleteRequest}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Complete Request
                    </button>
                )}

                {canUploadEvidence && (
                    <button
                        onClick={() => setShowEvidenceModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <Camera className="h-4 w-4" />
                        Upload Evidence
                    </button>
                )}
            </div>

            {/* Deliveries Section */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('deliveries')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-slate-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Deliveries ({deliveries.length})
                        </h3>
                    </div>
                    {expandedSections.deliveries ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                </button>
                {expandedSections.deliveries && (
                    <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        {deliveries.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No deliveries recorded yet</p>
                        ) : (
                            <div className="space-y-4">
                                {deliveries.map((delivery) => (
                                    <div key={delivery.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    Delivery #{delivery.deliveryNumber}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {delivery.quantityDelivered} {delivery.unit || ''} • {delivery.condition}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(delivery.deliveryDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {delivery.notes && (
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {delivery.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Evidence Section */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('evidence')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Evidence ({evidence.length})
                        </h3>
                    </div>
                    {expandedSections.evidence ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                </button>
                {expandedSections.evidence && (
                    <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        {evidence.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No evidence uploaded yet</p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {evidence.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                                            {item.type === 'delivery_photo' ? (
                                                <Camera className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                {item.fileName || item.type.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(item.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {item.fileUrl && (
                                            <a
                                                href={item.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                                            >
                                                View
                                            </a>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Delete this evidence?')) {
                                                    handleDeleteEvidence(item.id, item.storagePath || '');
                                                }
                                            }}
                                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payments Section */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('payments')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-slate-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Payments ({payments.length})
                        </h3>
                    </div>
                    {expandedSections.payments ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                </button>
                {expandedSections.payments && (
                    <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        {payments.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No payments recorded yet</p>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => {
                                    const canVerifyPayment =
                                        payment.status === 'reported' &&
                                        request.status === 'payment_pending' &&
                                        userId === request.receivedBy;

                                    return (
                                        <div key={payment.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {payment.currency} {payment.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {payment.paymentMethod} • {payment.transactionReference || 'No reference'}
                                                    </p>
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${payment.status === 'verified'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : payment.status === 'pending_verification' || payment.status === 'reported'
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                                : payment.status === 'rejected'
                                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                    >
                                                        {payment.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="shrink-0 text-xs text-slate-400">
                                                    {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {canVerifyPayment && (
                                                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                                                    <button
                                                        onClick={() => handleVerifyPayment(payment.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        Verify Payment
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectPayment(payment.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Reject Payment
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <DeliveryModal
                isOpen={showDeliveryModal}
                requestId={requestId}
                requestTitle={request.title}
                quantityOrdered={request.quantity || undefined}
                unit={request.unit || undefined}
                onClose={() => setShowDeliveryModal(false)}
                onConfirm={handleConfirmDelivery}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                requestId={requestId}
                requestTitle={request.title}
                budget={request.budget || undefined}
                onClose={() => setShowPaymentModal(false)}
                onReport={handleReportPayment}
            />

            <EvidenceUpload
                isOpen={showEvidenceModal}
                requestId={requestId}
                workspaceId={workspaceId}
                onClose={() => setShowEvidenceModal(false)}
                onUpload={handleUploadEvidence}
                existingEvidence={evidence}
                onDelete={handleDeleteEvidence}
            />
        </div>
    );
}