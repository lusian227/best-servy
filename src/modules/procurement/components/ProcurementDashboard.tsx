// src/modules/procurement/components/ProcurementDashboard.tsx

import React, { useMemo, useState, useEffect } from 'react';

import {
    Package,
    FileText,
    FileCheck,
    Award,
    Plus,
    Clock,
    AlertCircle,
    Calendar,
    MapPin,
    Search,
    Filter,
    ChevronRight,
    RefreshCw,
    Truck,
} from 'lucide-react';

import { useProcurement } from '../hooks/useProcurement';

// ✅ IMPORT YOUR UI STORE HERE (Zustand or similar)
import { useUIStore } from '../../../stores';

import type {
    ProcurementRequest,
    ProcurementCategory,
} from '../domain';

interface ProcurementDashboardProps {
    projectId?: string;
    workspaceId?: string;
    onOpenRequest?: (
        request: ProcurementRequest
    ) => void;
    onCreateRequest?: () => void;
}

export function ProcurementDashboard({
    projectId,
    workspaceId,
    onOpenRequest,
    onCreateRequest,
}: ProcurementDashboardProps) {
    const [searchTerm, setSearchTerm] =
        useState('');

    const [categoryFilter, setCategoryFilter] =
        useState<
            ProcurementCategory | 'all'
        >('all');

    // ✅ GET CURRENT USER FROM UI STORE
    const user = useUIStore((state) => state.currentUser);
    // OR if your store uses it differently, check your store file. 
    // It might be: const user = useUIStore((state) => state.user);

    const {
        requests,
        rfqs,
        awards,
        loading,
        error,
        loadAll,
    } = useProcurement({
        projectId: projectId || '',
        workspaceId: workspaceId,
        userId: user?.id,  // ✅ Now this will work!
        autoLoad: true,
    });

    // ✅ Debug: Log when requests change
    useEffect(() => {
        console.log('📊 ProcurementDashboard: requests updated:', requests.length);
    }, [requests]);

    // ============================================================
    // FILTER REQUESTS
    // ============================================================

    const filteredRequests = useMemo(() => {
        const search =
            searchTerm.trim().toLowerCase();

        return requests.filter((request) => {
            const matchesSearch =
                !search ||
                request.title
                    .toLowerCase()
                    .includes(search) ||
                // ✅ Fixed null safety
                (request.reference ?? '')
                    .toLowerCase()
                    .includes(search) ||
                // ✅ Fixed null safety
                (request.description ?? '')
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                categoryFilter === 'all' ||
                // ✅ Fixed null safety
                (request.category ?? '') ===
                categoryFilter;

            return (
                matchesSearch &&
                matchesCategory
            );
        });
    }, [
        requests,
        searchTerm,
        categoryFilter,
    ]);

    // ============================================================
    // STATISTICS
    // ============================================================

    const openRequests = useMemo(
        () =>
            requests.filter(
                (request) =>
                    request.status === 'open' ||
                    request.status ===
                    'rfq_issued'
            ),
        [requests]
    );

    const requestsUnderReview =
        useMemo(
            () =>
                requests.filter(
                    (request) =>
                        request.status ===
                        'quotes_received' ||
                        request.status ===
                        'under_review'
                ),
            [requests]
        );

    const totalBudget = useMemo(
        () =>
            requests.reduce(
                (total, request) =>
                    total +
                    (request.budget ?? 0),
                0
            ),
        [requests]
    );

    // ============================================================
    // STATUS DISPLAY
    // ============================================================

    const getStatusClasses = (
        status: ProcurementRequest['status']
    ) => {
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

    const formatStatus = (
        status: ProcurementRequest['status']
    ) => {
        return status
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    // ============================================================
    // CATEGORY DISPLAY
    // ============================================================

    const formatCategory = (
        category: ProcurementCategory
    ) => {
        return category
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    // ============================================================
    // REQUEST ACTION LABEL
    // ============================================================

    const getActionLabel = (
        request: ProcurementRequest
    ) => {
        switch (request.status) {
            case 'open':
                return 'View Details';

            case 'rfq_issued':
                return 'View RFQ';

            case 'quotes_received':
                return 'Compare Quotes';

            case 'under_review':
                return 'Review';

            case 'awarded':
                return 'View Award';

            case 'completed':
                return 'View Details';

            default:
                return 'View Details';
        }
    };

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading && requests.length === 0) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Loading procurement...
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // ERROR STATE
    // ============================================================

    if (error && requests.length === 0) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
                <div className="flex flex-col items-center text-center">
                    <AlertCircle className="mb-3 h-10 w-10 text-red-500" />

                    <h3 className="font-semibold text-red-800 dark:text-red-300">
                        Unable to load procurement
                    </h3>

                    <p className="mt-1 max-w-lg text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => void loadAll()}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================
    // DASHBOARD
    // ============================================================

    return (
        <div className="space-y-6">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
                            <Package className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Procurement
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Manage project procurement,
                                RFQs, quotations and awards
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* ✅ ADD THIS: Supplier View Button */}
                    <button
                        type="button"
                        onClick={() => {
                            // Import and use UI store to switch world
                            import('../../../stores').then(module => {
                                module.useUIStore.setState({ activeWorld: 'supplier_procurement' });
                            });
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <Truck className="h-4 w-4" />
                        Supplier View
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (onCreateRequest) {
                                onCreateRequest();
                            }
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                    >
                        <Plus className="h-4 w-4" />
                        New Request
                    </button>
                </div>
            </div>

            {/* ==================================================
                ERROR BANNER
            ================================================== */}

            {error && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />

                        <p className="text-sm text-red-700 dark:text-red-400">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadAll()}
                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-red-700 hover:underline dark:text-red-400"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                    </button>
                </div>
            )}

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Total Requests */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Total Requests
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                {requests.length}
                            </p>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-900/20">
                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Open / RFQ */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Open / RFQ
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                {openRequests.length}
                            </p>
                        </div>

                        <div className="rounded-lg bg-amber-50 p-2.5 dark:bg-amber-900/20">
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                {/* Under Review */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Under Review
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                {requestsUnderReview.length}
                            </p>
                        </div>

                        <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-900/20">
                            <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Awards */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Awards
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                {awards.length}
                            </p>
                        </div>

                        <div className="rounded-lg bg-purple-50 p-2.5 dark:bg-purple-900/20">
                            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================================
                PROCUREMENT OVERVIEW
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                RFQs
                            </p>

                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {rfqs.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-slate-400" />

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                Awards
                            </p>

                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {awards.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <FileCheck className="h-5 w-5 text-slate-400" />

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                Request Budget
                            </p>

                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                KES{' '}
                                {totalBudget.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================================
                SEARCH + FILTERS
            ================================================== */}

            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                        placeholder="Search procurement requests..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />

                    <select
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(
                                event.target.value as
                                | ProcurementCategory
                                | 'all'
                            )
                        }
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    >
                        <option value="all">
                            All Categories
                        </option>

                        <option value="material">
                            Materials
                        </option>

                        <option value="equipment">
                            Equipment
                        </option>

                        <option value="professional">
                            Professional
                        </option>

                        <option value="service">
                            Services
                        </option>

                        <option value="technology">
                            Technology
                        </option>

                        <option value="energy">
                            Energy
                        </option>

                        <option value="transport">
                            Transport
                        </option>
                    </select>
                </div>
            </div>

            {/* ==================================================
                REQUESTS HEADER
            ================================================== */}

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Procurement Requests
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {filteredRequests.length} of{' '}
                        {requests.length} requests
                    </p>
                </div>
            </div>

            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {filteredRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                    <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />

                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                        No procurement requests
                    </h3>

                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                        {searchTerm ||
                            categoryFilter !== 'all'
                            ? 'No requests match the current search or category filter.'
                            : 'Create your first procurement request to begin the procurement workflow.'}
                    </p>

                    {!searchTerm &&
                        categoryFilter === 'all' && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onCreateRequest) {
                                        onCreateRequest();
                                    }
                                }}
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                <Plus className="h-4 w-4" />
                                New Request
                            </button>
                        )}
                </div>
            ) : (
                /* ==================================================
                   REQUEST LIST
                ================================================== */

                <div className="space-y-3">
                    {filteredRequests.map(
                        (request) => (
                            <button
                                key={request.id}
                                type="button"
                                onClick={() =>
                                    onOpenRequest?.(
                                        request
                                    )
                                }
                                className="group w-full rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-emerald-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}

                                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 sm:flex">
                                        <Package className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    </div>

                                    {/* Main Content */}

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                {
                                                    request.reference
                                                }
                                            </span>

                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClasses(
                                                    request.status
                                                )}`}
                                            >
                                                {formatStatus(
                                                    request.status
                                                )}
                                            </span>

                                            <span className="text-xs text-slate-400">
                                                {formatCategory(
                                                    request.category
                                                )}
                                            </span>
                                        </div>

                                        <h4 className="mt-2 font-semibold text-slate-900 dark:text-white">
                                            {
                                                request.title
                                            }
                                        </h4>

                                        {request.description && (
                                            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                                {
                                                    request.description
                                                }
                                            </p>
                                        )}

                                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                                            {request.quantity !==
                                                undefined &&
                                                request.quantity !==
                                                null && (
                                                    <span>
                                                        {
                                                            request.quantity
                                                        }{' '}
                                                        {
                                                            request.unit
                                                        }
                                                    </span>
                                                )}

                                            {request.budget !==
                                                undefined &&
                                                request.budget !==
                                                null && (
                                                    <span>
                                                        {
                                                            request.currency
                                                        }{' '}
                                                        {request.budget.toLocaleString()}
                                                    </span>
                                                )}

                                            {request.requiredDate && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />

                                                    {new Date(
                                                        request.requiredDate
                                                    ).toLocaleDateString()}
                                                </span>
                                            )}

                                            {request.deliveryLocation && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />

                                                    {
                                                        request.deliveryLocation
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action */}

                                    <div className="hidden shrink-0 items-center gap-2 sm:flex">
                                        <span className="text-xs font-medium text-emerald-600 opacity-0 transition group-hover:opacity-100 dark:text-emerald-400">
                                            {getActionLabel(
                                                request
                                            )}
                                        </span>

                                        <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:text-slate-600" />
                                    </div>
                                </div>
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}