import React, { useState } from 'react';
import {
    X,
    Package,
    Calendar,
    MapPin,
    DollarSign,
    FileText,
    Edit,
    Save,
    XCircle,
    CheckCircle,
    AlertCircle,
    Clock,
    User,
    Building2,
    Link,
    FileCheck,
    Award,
    Send,
    RefreshCw,
} from 'lucide-react';

import type { ProcurementRequest } from '../domain';
import { useProcurement } from '../hooks/useProcurement';

interface RequestDetailModalProps {
    request: ProcurementRequest | null;
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: (request: ProcurementRequest) => void;
    onEdit?: (request: ProcurementRequest) => void;
}

type EditMode = 'view' | 'edit';

export function RequestDetailModal({
    request,
    projectId,
    isOpen,
    onClose,
    onUpdated,
    onEdit,
}: RequestDetailModalProps) {
    const { updateRequest, loading, error } = useProcurement({
        projectId,
        autoLoad: false,
    });

    const [mode, setMode] = useState<EditMode>('view');
    const [formError, setFormError] = useState<string | null>(null);

    // Form state for editing
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editQuantity, setEditQuantity] = useState('');
    const [editUnit, setEditUnit] = useState('');
    const [editRequiredDate, setEditRequiredDate] = useState('');
    const [editDeliveryLocation, setEditDeliveryLocation] = useState('');
    const [editBudget, setEditBudget] = useState('');
    const [editCurrency, setEditCurrency] = useState('KES');

    // Initialize edit form when request changes or edit mode opens
    React.useEffect(() => {
        if (request && mode === 'edit') {
            setEditTitle(request.title || '');
            setEditDescription(request.description || '');
            setEditQuantity(request.quantity?.toString() || '');
            setEditUnit(request.unit || '');
            setEditRequiredDate(request.requiredDate || '');
            setEditDeliveryLocation(request.deliveryLocation || '');
            setEditBudget(request.budget?.toString() || '');
            setEditCurrency(request.currency || 'KES');
        }
    }, [request, mode]);

    // Reset to view mode when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setMode('view');
            setFormError(null);
        }
    }, [isOpen]);

    if (!isOpen || !request) {
        return null;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    const formatStatus = (status: string) => {
        return status
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            case 'open':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'rfq_issued':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'quotes_received':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'under_review':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'awarded':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'cancelled':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'completed':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return <Clock className="h-4 w-4" />;
            case 'rfq_issued':
                return <Send className="h-4 w-4" />;
            case 'quotes_received':
                return <FileCheck className="h-4 w-4" />;
            case 'under_review':
                return <AlertCircle className="h-4 w-4" />;
            case 'awarded':
                return <Award className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatCategory = (category: string) => {
        return category
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleEdit = () => {
        setMode('edit');
        setFormError(null);
        onEdit?.(request);
    };

    const handleCancelEdit = () => {
        setMode('view');
        setFormError(null);
    };

    const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!editTitle.trim()) {
            setFormError('Title is required.');
            return;
        }

        try {
            const updated = await updateRequest(request.id, {
                title: editTitle.trim(),
                description: editDescription.trim() || undefined,
                quantity: editQuantity ? Number(editQuantity) : undefined,
                unit: editUnit.trim() || undefined,
                requiredDate: editRequiredDate || undefined,
                deliveryLocation: editDeliveryLocation.trim() || undefined,
                budget: editBudget ? Number(editBudget) : undefined,
                currency: editCurrency || 'KES',
                status: request.status,
            });

            setMode('view');
            onUpdated?.(updated);
        } catch (err) {
            setFormError(
                err instanceof Error ? err.message : 'Failed to update request.'
            );
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

                {/* ======================================================
            HEADER
        ====================================================== */}

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
                            <Package className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Procurement Request
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {request.reference}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {mode === 'view' && (
                            <button
                                type="button"
                                onClick={handleEdit}
                                disabled={loading}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            >
                                <Edit className="h-5 w-5" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ======================================================
            BODY
        ====================================================== */}

                <div className="flex-1 overflow-y-auto p-6">
                    {mode === 'view' ? (
                        /* ==================================================
                           VIEW MODE
                        ================================================== */

                        <div className="space-y-6">

                            {/* Status Badge */}
                            <div className="flex items-center gap-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${getStatusColor(
                                        request.status
                                    )}`}
                                >
                                    {getStatusIcon(request.status)}
                                    {formatStatus(request.status)}
                                </span>

                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatCategory(request.category)}
                                </span>
                            </div>

                            {/* Title */}
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                    Title
                                </p>

                                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                    {request.title}
                                </p>
                            </div>

                            {/* Description */}
                            {request.description && (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-400">
                                        Description
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                        {request.description}
                                    </p>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {request.quantity !== undefined && request.quantity !== null && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Quantity
                                        </p>

                                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                            {request.quantity} {request.unit || ''}
                                        </p>
                                    </div>
                                )}

                                {request.budget !== undefined && request.budget !== null && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Budget
                                        </p>

                                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                            {request.currency} {request.budget.toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {request.requiredDate && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Required Date
                                        </p>

                                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                            {new Date(request.requiredDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {request.deliveryLocation && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Delivery Location
                                        </p>

                                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                            {request.deliveryLocation}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Specifications */}
                            {request.specifications &&
                                Object.keys(request.specifications).length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Specifications
                                        </p>

                                        <div className="mt-2 space-y-1.5">
                                            {Object.entries(request.specifications).map(
                                                ([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                                                    >
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                            {key}:
                                                        </span>

                                                        <span className="text-slate-600 dark:text-slate-400">
                                                            {String(value)}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Linked Items */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {request.linkedDrawingIds &&
                                    request.linkedDrawingIds.length > 0 && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Linked Drawings
                                            </p>

                                            <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                                {request.linkedDrawingIds.length} drawings
                                            </p>
                                        </div>
                                    )}

                                {request.linkedRFIIds &&
                                    request.linkedRFIIds.length > 0 && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Linked RFIs
                                            </p>

                                            <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                                {request.linkedRFIIds.length} RFIs
                                            </p>
                                        </div>
                                    )}
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-400">
                                        Created
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(request.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-400">
                                        Last Updated
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(request.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ==================================================
                           EDIT MODE
                        ================================================== */

                        <form onSubmit={handleSaveEdit} className="space-y-6">
                            {/* Error */}
                            {(formError || error) && (
                                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span>{formError || error}</span>
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Title <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description
                                </label>

                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={3}
                                    disabled={loading}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Quantity & Budget */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Unit
                                    </label>

                                    <input
                                        type="text"
                                        value={editUnit}
                                        onChange={(e) => setEditUnit(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Budget
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={editBudget}
                                        onChange={(e) => setEditBudget(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Currency
                                    </label>

                                    <select
                                        value={editCurrency}
                                        onChange={(e) => setEditCurrency(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="KES">KES</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>

                            {/* Delivery */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Required Date
                                    </label>

                                    <input
                                        type="date"
                                        value={editRequiredDate}
                                        onChange={(e) => setEditRequiredDate(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Delivery Location
                                    </label>

                                    <input
                                        type="text"
                                        value={editDeliveryLocation}
                                        onChange={(e) => setEditDeliveryLocation(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Status (read-only) */}
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                    Status
                                </p>

                                <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                    {formatStatus(request.status)}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}