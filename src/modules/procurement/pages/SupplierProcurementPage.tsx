// src/modules/procurement/pages/SupplierProcurementPage.tsx

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';

import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    MapPin,
    DollarSign,
    Search,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';

import type {
    ProcurementRequest,
    ProcurementStatus,
} from '../domain';

import { useProcurement } from '../hooks/useProcurement';

interface SupplierProcurementPageProps {
    supplierCompanyId: string;
    workspaceId: string;
    onOpenRequest?: (request: ProcurementRequest) => void;
}

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    open: 'Open',
    submitted: 'Submitted',
    received: 'Received',
    supplier_selected: 'Supplier Selected',
    awarded: 'Awarded',
    order_placed: 'Order Placed',
    delivery_scheduled: 'Delivery Scheduled',
    delivering: 'Delivering',
    delivered: 'Delivered',
    verified: 'Verified',
    payment_pending: 'Payment Pending',
    paid: 'Paid',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
};

const statusColors: Record<string, string> = {
    draft:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',

    open:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',

    submitted:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',

    received:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',

    supplier_selected:
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',

    awarded:
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',

    order_placed:
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',

    delivery_scheduled:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',

    delivering:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',

    delivered:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',

    verified:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',

    payment_pending:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',

    paid:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',

    completed:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',

    cancelled:
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

    rejected:
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const getStatusIcon = (status: ProcurementStatus) => {
    switch (status) {
        case 'submitted':
        case 'open':
            return <Clock className="h-4 w-4" />;

        case 'received':
        case 'supplier_selected':
        case 'awarded':
        case 'order_placed':
            return <CheckCircle className="h-4 w-4" />;

        case 'delivery_scheduled':
        case 'delivering':
            return <Truck className="h-4 w-4" />;

        case 'delivered':
        case 'verified':
            return <CheckCircle className="h-4 w-4" />;

        case 'paid':
        case 'completed':
            return <CheckCircle className="h-4 w-4" />;

        case 'cancelled':
        case 'rejected':
            return <XCircle className="h-4 w-4" />;

        default:
            return <Clock className="h-4 w-4" />;
    }
};

export function SupplierProcurementPage({
    supplierCompanyId,
    workspaceId,
    onOpenRequest,
}: SupplierProcurementPageProps) {
    /*
     * IMPORTANT:
     * All hooks are declared before any conditional return.
     * This prevents React hook-order errors.
     */

    const [requests, setRequests] = useState<ProcurementRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [stats, setStats] = useState({
        new: 0,
        confirmed: 0,
        delivering: 0,
        delivered: 0,
    });

    const { getSupplierRequests } = useProcurement({
        workspaceId,
        autoLoad: false,
    });

    /*
     * Load supplier requests.
     *
     * useCallback makes the function reference stable when its
     * dependencies have not changed.
     */
    const loadRequests = useCallback(async () => {
        if (!supplierCompanyId) {
            setRequests([]);
            setStats({
                new: 0,
                confirmed: 0,
                delivering: 0,
                delivered: 0,
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getSupplierRequests(supplierCompanyId);

            setRequests(data);

            const newCount = data.filter(
                (request) =>
                    request.status === 'open' ||
                    request.status === 'submitted'
            ).length;

            const confirmedCount = data.filter(
                (request) =>
                    request.status === 'received' ||
                    request.status === 'supplier_selected' ||
                    request.status === 'awarded' ||
                    request.status === 'order_placed'
            ).length;

            const deliveringCount = data.filter(
                (request) =>
                    request.status === 'delivery_scheduled' ||
                    request.status === 'delivering'
            ).length;

            const deliveredCount = data.filter(
                (request) =>
                    request.status === 'delivered' ||
                    request.status === 'verified'
            ).length;

            setStats({
                new: newCount,
                confirmed: confirmedCount,
                delivering: deliveringCount,
                delivered: deliveredCount,
            });
        } catch (err) {
            console.error(
                '[SupplierProcurementPage] Failed to load requests:',
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load procurement requests'
            );
        } finally {
            setLoading(false);
        }
    }, [supplierCompanyId, getSupplierRequests]);

    /*
     * Reload whenever the supplier changes.
     */
    useEffect(() => {
        void loadRequests();
    }, [loadRequests]);

    /*
     * Memoized search filtering.
     */
    const filteredRequests = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return requests;
        }

        return requests.filter((request) => {
            return (
                request.title?.toLowerCase().includes(query) ||
                request.reference?.toLowerCase().includes(query) ||
                request.description?.toLowerCase().includes(query)
            );
        });
    }, [requests, searchQuery]);

    const formatDate = useCallback((date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }, []);

    /*
     * Conditional rendering happens ONLY after all hooks.
     */

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Loading procurement requests...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />

                <span>{error}</span>

                <button
                    type="button"
                    onClick={() => void loadRequests()}
                    className="ml-auto rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Supplier Procurement
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Procurement requests assigned to your company
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        New
                    </p>

                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.new}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Confirmed
                    </p>

                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.confirmed}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Delivering
                    </p>

                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.delivering}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Delivered
                    </p>

                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.delivered}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                    type="text"
                    placeholder="Search procurement requests..."
                    value={searchQuery}
                    onChange={(event) =>
                        setSearchQuery(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
            </div>

            {/* Requests */}
            {filteredRequests.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                    <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />

                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        {searchQuery
                            ? 'No procurement requests match your search.'
                            : 'No procurement requests assigned to your company yet.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredRequests.map((request) => (
                        <button
                            type="button"
                            key={request.id}
                            onClick={() =>
                                onOpenRequest?.(request)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[
                                                request.status
                                            ] ||
                                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                }`}
                                        >
                                            {getStatusIcon(
                                                request.status
                                            )}

                                            {statusLabels[
                                                request.status
                                            ] || request.status}
                                        </span>

                                        <span className="text-xs text-slate-400">
                                            {request.reference}
                                        </span>
                                    </div>

                                    <h3 className="mt-1 font-medium text-slate-900 dark:text-white">
                                        {request.title}
                                    </h3>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                        <span>
                                            Quantity:{' '}
                                            {request.quantity}{' '}
                                            {request.unit || ''}
                                        </span>

                                        {request.requiredDate && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />

                                                Required:{' '}
                                                {formatDate(
                                                    request.requiredDate
                                                )}
                                            </span>
                                        )}

                                        {request.deliveryLocation && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />

                                                {
                                                    request.deliveryLocation
                                                }
                                            </span>
                                        )}

                                        {request.budget != null && (
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-3.5 w-3.5" />

                                                {request.currency ||
                                                    'KES'}{' '}
                                                {request.budget.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}