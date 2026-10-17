// src/modules/procurement/pages/SupplierProcurementDetail.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Camera,
    CreditCard,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Plus,
    Share2,
    ExternalLink,
    Copy,
    FileText,
    Image as ImageIcon,
    Video,
    Upload,
    Link as LinkIcon,
} from 'lucide-react';

import type {
    ProcurementRequest,
    ProcurementStatus,
    DeliveryCondition,
    PaymentMethod,
    EvidenceType,
} from '../domain';

import { useProcurement } from '../hooks/useProcurement';

import { supabase } from '../../../lib/supabase';

interface SupplierProcurementDetailProps {
    request: ProcurementRequest;
    workspaceId: string;
    userId: string;
    userCompanyId: string;
    onBack: () => void;
    onRefresh?: () => void;
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
    submitted:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    received:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
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

type SectionKey =
    | 'overview'
    | 'workflow'
    | 'history'
    | 'deliveries'
    | 'evidence'
    | 'share'
    | 'payments';

export function SupplierProcurementDetail({
    request,
    workspaceId,
    userId,
    userCompanyId,  // ✅ ADD THIS
    onBack,
    onRefresh,
}: SupplierProcurementDetailProps) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Human-readable name of the person who accepted the request
    const [acceptedByName, setAcceptedByName] = useState<string | null>(null);
    const [requestedByName, setRequestedByName] = useState<string | null>(null);

    const [showDeliveryForm, setShowDeliveryForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);

    const [expandedSections, setExpandedSections] = useState<
        Record<SectionKey, boolean>
    >({
        overview: true,
        workflow: true,
        history: false,
        deliveries: false,
        evidence: true,
        share: false,
        payments: false,
    });

    const [quantityDelivered, setQuantityDelivered] = useState<number>(
        request.quantity || 0
    );

    const [condition, setCondition] =
        useState<DeliveryCondition>('good');

    const [deliveryNotes, setDeliveryNotes] = useState('');

    const [paymentAmount, setPaymentAmount] = useState<number>(
        request.budget || 0
    );

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>('M-Pesa');

    const [transactionReference, setTransactionReference] = useState('');

    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const [selectedEvidence, setSelectedEvidence] =
        useState<any | null>(null);

    const [shareMessage, setShareMessage] = useState<string | null>(null);

    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const {
        acceptSupplierRequest,  // ✅ NEW - replaces markReceived
        markOrdered,
        markDelivering,
        confirmDelivery,
        completeRequest,
        confirmRequesterReceipt,  // ✅ NEW
        getDeliveries,
        getEvidence,
        uploadEvidence,
        getCalculations,
        getPayments,
        reportPayment,
        getTransactionSummary,
        getStatusHistory,
    } = useProcurement({
        workspaceId,
        autoLoad: false,
    });

    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [evidence, setEvidence] = useState<any[]>([]);
    const [calculations, setCalculations] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);

    // Map of userId → display name, for delivery confirmer/receiver names
    const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});




    useEffect(() => {
        loadData();
    }, [request.id]);

    useEffect(() => {
        const loadAcceptedByName = async () => {
            const userId = request.receivedBy;

            if (!userId) {
                setAcceptedByName(null);
                return;
            }

            // If the request already contains the name, use it
            if (request.assignedSupplierName) {
                setAcceptedByName(request.assignedSupplierName);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('name, email')
                    .eq('id', userId)
                    .maybeSingle();

                if (error) {
                    console.error(
                        'Failed to load accepted-by profile:',
                        error
                    );
                    setAcceptedByName('Unknown user');
                    return;
                }

                setAcceptedByName(
                    data?.name ||
                    data?.email ||
                    'Unknown user'
                );
            } catch (error) {
                console.error(
                    'Error loading accepted-by profile:',
                    error
                );
                setAcceptedByName('Unknown user');
            }
        };

        loadAcceptedByName();
    }, [
        request.receivedBy,
        request.assignedSupplierName,
    ]);

    useEffect(() => {
        const loadRequestedByName = async () => {
            const userId = request.createdBy;

            if (!userId) {
                setRequestedByName('Unknown user');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('name, email')
                    .eq('id', userId)
                    .maybeSingle();

                if (error) {
                    console.error(
                        'Failed to load requester profile:',
                        error
                    );
                    setRequestedByName('Unknown user');
                    return;
                }

                setRequestedByName(
                    data?.name ||
                    data?.email ||
                    'Unknown user'
                );
            } catch (error) {
                console.error(
                    'Error loading requester profile:',
                    error
                );
                setRequestedByName('Unknown user');
            }
        };

        loadRequestedByName();
    }, [request.createdBy]);

    /**
    * Resolve display names for all user UUIDs referenced by
    * deliveries (confirmedBy / receivedBy) and
    * payments (reportedBy / verifiedBy).
    *
    * One batch query for all unique UUIDs — same user_profiles
    * lookup pattern used by requestedByName and acceptedByName.
    */
    useEffect(() => {
        const resolveUserNames = async () => {
            const userIds = Array.from(
                new Set(
                    [
                        ...deliveries.flatMap((d) => [
                            d?.confirmedBy,
                            d?.receivedBy,
                        ]),
                        ...payments.flatMap((p) => [
                            p?.reportedBy,
                            p?.verifiedBy,
                        ]),
                    ].filter(
                        (id): id is string =>
                            typeof id === 'string' && id.length > 0
                    )
                )
            );

            if (userIds.length === 0) {
                return;
            }

            // Skip UUIDs we already have names for
            const missing = userIds.filter((id) => !userNameMap[id]);
            if (missing.length === 0) {
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('id, name, email')
                    .in('id', missing);

                if (error) {
                    console.error(
                        'Failed to load user profiles:',
                        error
                    );
                    return;
                }

                const updates: Record<string, string> = {};

                // Seed every requested id with a default first
                missing.forEach((id) => {
                    updates[id] = 'Unknown user';
                });

                (data ?? []).forEach((profile: any) => {
                    updates[profile.id] =
                        profile.name ||
                        profile.email ||
                        'Unknown user';
                });

                setUserNameMap((prev) => ({ ...prev, ...updates }));
            } catch (err) {
                console.error(
                    'Error loading user profiles:',
                    err
                );
            }
        };

        void resolveUserNames();
    }, [deliveries, payments]);

    const loadData = async () => {
        setLoading(true);

        try {
            const [
                deliveriesData,
                evidenceData,
                calculationsData,
                paymentsData,
                summaryData,
                historyData,
            ] = await Promise.all([
                getDeliveries(request.id),
                getEvidence(request.id),
                getCalculations(request.id),
                getPayments(request.id),
                getTransactionSummary(request.id),
                getStatusHistory(request.id),
            ]);

            setDeliveries(deliveriesData || []);
            setEvidence(evidenceData || []);
            setCalculations(calculationsData || []);
            setPayments(paymentsData || []);
            setSummary(summaryData);
            setStatusHistory(historyData || []);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load procurement data'
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: SectionKey) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleAction = async (
        action: () => Promise<any>,
        successMessage: string
    ) => {
        setLoading(true);
        setError(null);

        try {
            await action();
            await loadData();
            onRefresh?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : `Failed to ${successMessage}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelivery = async () => {
        await handleAction(
            () =>
                confirmDelivery({
                    procurementRequestId: request.id,
                    workspaceId: request.workspaceId!,
                    quantityDelivered,
                    condition,
                    notes: deliveryNotes,
                    userId,
                    deliveryDate: new Date().toISOString(),
                }),
            'confirm delivery'
        );

        setShowDeliveryForm(false);
    };



    const handleReportPayment = async () => {
        await handleAction(
            () =>
                reportPayment({
                    procurementRequestId: request.id,
                    workspaceId: request.workspaceId!,
                    amount: paymentAmount,
                    paymentMethod,
                    transactionReference:
                        transactionReference || undefined,
                    paymentDate,
                    userId,
                }),
            'report payment'
        );

        setShowPaymentForm(false);
    };

    /**
     * Upload evidence.
     *
     * The input can come from:
     * - camera
     * - video camera
     * - normal file picker
     */
    const handleUploadEvidence = async (
        file: File,
        type: EvidenceType
    ) => {
        if (!file) {
            return;
        }

        await handleAction(
            () =>
                uploadEvidence({
                    procurementRequestId: request.id,
                    workspaceId: request.workspaceId,
                    type,
                    file,
                    userId,
                }),
            'upload evidence'
        );

        setShowEvidenceUpload(false);
    };

    /**
     * Camera capture.
     *
     * capture="environment" is defined on the input below.
     * This lets mobile browsers open the rear camera.
     */
    const handleCameraChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const type: EvidenceType =
            file.type.startsWith('video/')
                ? ('delivery_video' as EvidenceType)
                : ('delivery_photo' as EvidenceType);

        await handleUploadEvidence(file, type);

        event.target.value = '';
    };

    /**
     * Normal file upload.
     */
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        let type: EvidenceType = 'invoice' as EvidenceType;

        if (file.type.startsWith('image/')) {
            type = 'delivery_photo' as EvidenceType;
        } else if (file.type.startsWith('video/')) {
            type = 'delivery_video' as EvidenceType;
        } else if (
            file.type === 'application/pdf' ||
            file.name.toLowerCase().includes('invoice')
        ) {
            type = 'invoice' as EvidenceType;
        }

        await handleUploadEvidence(file, type);

        event.target.value = '';
    };

    /**
     * Return the URL that can be opened/shared.
     *
     * Your evidence repository currently appears to expose fileUrl.
     * We also support several common property names so this remains
     * compatible if the repository returns storage_url or url.
     */
    const getEvidenceUrl = (item: any): string | null => {
        return (
            item?.fileUrl ||
            item?.file_url ||
            item?.storageUrl ||
            item?.storage_url ||
            item?.url ||
            null
        );
    };

    /**
     * View evidence.
     */
    const handleViewEvidence = (item: any) => {
        const url = getEvidenceUrl(item);

        if (!url) {
            setError(
                'This evidence does not have a viewable file URL. Check the evidence record and Supabase Storage path.'
            );
            return;
        }

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    /**
     * Native device/browser sharing.
     *
     * On phones this normally opens the system Share Sheet.
     * On desktop browsers that support navigator.share it opens
     * the browser sharing dialog.
     */
    const handleShareEvidence = async (item: any) => {
        const url = getEvidenceUrl(item);

        if (!url) {
            setError(
                'This evidence cannot be shared because no file URL was returned.'
            );
            return;
        }

        const fileName =
            item?.fileName ||
            item?.file_name ||
            item?.name ||
            'Procurement evidence';

        const shareTitle = `${request.title} - Evidence`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: `Evidence for procurement request ${request.reference}: ${fileName}`,
                    url,
                });

                setShareMessage('Evidence shared successfully.');
            } else {
                await navigator.clipboard.writeText(url);
                setShareMessage(
                    'Sharing is not supported by this browser. The evidence link was copied instead.'
                );
            }
        } catch (err) {
            /**
             * AbortError simply means the user closed the share dialog.
             */
            if (
                err instanceof DOMException &&
                err.name === 'AbortError'
            ) {
                return;
            }

            try {
                await navigator.clipboard.writeText(url);

                setShareMessage(
                    'Share dialog was unavailable. The evidence link was copied instead.'
                );
            } catch {
                setError(
                    'Unable to share or copy the evidence link.'
                );
            }
        }

        window.setTimeout(() => {
            setShareMessage(null);
        }, 4000);
    };

    /**
     * Explicit copy-link button.
     */
    const handleCopyEvidenceLink = async (item: any) => {
        const url = getEvidenceUrl(item);

        if (!url) {
            setError(
                'This evidence does not have a shareable URL.'
            );
            return;
        }

        try {
            await navigator.clipboard.writeText(url);

            setShareMessage('Evidence link copied to clipboard.');

            window.setTimeout(() => {
                setShareMessage(null);
            }, 3000);
        } catch {
            setError(
                'Could not copy the evidence link.'
            );
        }
    };

    const formatDate = (date: string) => {
        if (!date) {
            return 'N/A';
        }

        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status: ProcurementStatus) => {
        switch (status) {
            case 'submitted':
                return <Clock className="h-4 w-4" />;

            case 'received':
            case 'order_placed':
                return <CheckCircle className="h-4 w-4" />;

            case 'delivery_scheduled':
            case 'delivering':
                return <Truck className="h-4 w-4" />;

            case 'delivered':
            case 'verified':
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

    const getEvidenceIcon = (item: any) => {
        const mimeType =
            item?.mimeType ||
            item?.mime_type ||
            '';

        const type =
            item?.type ||
            '';

        if (
            mimeType.startsWith('video/') ||
            type === 'delivery_video'
        ) {
            return (
                <Video className="h-5 w-5 text-purple-600" />
            );
        }

        if (
            mimeType.startsWith('image/') ||
            type === 'delivery_photo'
        ) {
            return (
                <ImageIcon className="h-5 w-5 text-emerald-600" />
            );
        }

        return (
            <FileText className="h-5 w-5 text-blue-600" />
        );
    };

    const getEvidenceTypeLabel = (item: any) => {
        if (item?.type === 'delivery_video') {
            return 'Delivery video';
        }

        if (item?.type === 'delivery_photo') {
            return 'Delivery photo';
        }

        if (item?.type === 'invoice') {
            return 'Invoice';
        }

        if (item?.type) {
            return String(item.type)
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (letter: string) =>
                    letter.toUpperCase()
                );
        }

        return 'Evidence';
    };

    const isSupplier = request.supplierCompanyId === userCompanyId;

    const isRequester = userId === request.createdBy;

    console.log('CHECK-RECEIPT', {
        userId,
        createdBy: request.createdBy,
        match: userId === request.createdBy,
        status: request.status,
        isRequester,
        canConfirmReceipt: request.status === 'delivered' && (userId === request.createdBy),
    });

    const canAccept =
        (request.status === 'submitted' || request.status === 'open') &&
        isSupplier &&
        !request.assignedSupplierId;

    const canOrder =
        request.status === 'received' &&  // ✅ Change this to 'received'
        isSupplier;

    const canStartDelivery =
        request.status === 'ordered' &&  // ✅ Changed to 'ordered'
        isSupplier;

    const canConfirmDeliveryAction =
        request.status === 'delivering' &&
        isSupplier;

    // ✅ Requester confirms receipt
    const canConfirmReceipt =
        request.status === 'delivered' &&
        isRequester;

    // ✅ Requester completes
    const canComplete =
        (request.status === 'verified' || request.status === 'payment_pending') &&
        isRequester;

    // ✅ Requester reports payment
    const canReportPaymentAction =
        request.status === 'verified' &&
        isRequester;







    /**
     * Return a human-readable display name for a user UUID.
     *
     * Falls back to "Unknown user" if the profile cannot be resolved.
     */
    const getUserDisplayName = (userId?: string | null): string => {
        if (!userId) {
            return 'Unknown user';
        }
        return userNameMap[userId] || 'Unknown user';
    };


    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {request.title}
                        </h2>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Reference: {request.reference}
                        </p>
                    </div>
                </div>

                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[request.status] ||
                        'bg-slate-100 text-slate-700'
                        }`}
                >
                    {getStatusIcon(request.status)}
                    {statusLabels[request.status] ||
                        request.status}
                </span>
            </div>

            {/* ERROR */}
            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>

                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-xs font-medium hover:underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* SUCCESS SHARE MESSAGE */}
            {shareMessage && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CheckCircle className="h-5 w-5" />
                    <span>{shareMessage}</span>
                </div>
            )}

            {/* OVERVIEW */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('overview')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Overview
                    </h3>

                    {expandedSections.overview ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                </button>

                {expandedSections.overview && (
                    <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Quantity
                                </p>
                                <p className="font-medium">
                                    {request.quantity}{' '}
                                    {request.unit || ''}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Budget
                                </p>
                                <p className="font-medium">
                                    {request.currency || 'KES'}{' '}
                                    {request.budget?.toLocaleString() ||
                                        'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Required Date
                                </p>
                                <p className="font-medium">
                                    {request.requiredDate
                                        ? new Date(
                                            request.requiredDate
                                        ).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Delivery Location
                                </p>
                                <p className="font-medium">
                                    {request.deliveryLocation ||
                                        'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Who requested the procurement */}
                        <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-950/20">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                <span className="font-medium">Requested by:</span>{' '}
                                {requestedByName || 'Unknown user'}
                            </p>

                            {request.createdAt && (
                                <p className="text-xs text-blue-600 dark:text-blue-400/70">
                                    Requested on: {formatDate(request.createdAt)}
                                </p>
                            )}
                        </div>

                        {/* Who accepted the order */}
                        {(acceptedByName || request.receivedBy) && (
                            <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/20">
                                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                    <span className="font-medium">Accepted by:</span>{' '}
                                    {acceptedByName || 'Unknown user'}
                                </p>

                                {request.receivedAt && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400/70">
                                        Accepted on: {formatDate(request.receivedAt)}
                                    </p>
                                )}
                            </div>
                        )}


                        {request.description && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-500">
                                    Description
                                </p>

                                <p className="mt-1 text-sm">
                                    {request.description}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* WORKFLOW */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('workflow')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Workflow
                    </h3>

                    {expandedSections.workflow ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                </button>

                {expandedSections.workflow && (
                    <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        <div className="flex flex-wrap gap-2">
                            {canAccept && (
                                <button
                                    onClick={() =>
                                        handleAction(
                                            () =>
                                                acceptSupplierRequest(  // ✅ Changed from markReceived
                                                    request.id,
                                                    userCompanyId,  // ← supplierCompanyId
                                                    userId
                                                ),
                                            'accept request'
                                        )
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Accept Request
                                </button>
                            )}

                            {canOrder && (
                                <button
                                    onClick={() =>
                                        handleAction(
                                            () =>
                                                markOrdered(
                                                    request.id,
                                                    userId
                                                ),
                                            'confirm order'
                                        )
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <Package className="h-4 w-4" />
                                    Confirm Order
                                </button>
                            )}

                            {canStartDelivery && (
                                <button
                                    onClick={() =>
                                        handleAction(
                                            () =>
                                                markDelivering(
                                                    request.id,
                                                    userId
                                                ),
                                            'start delivery'
                                        )
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                                >
                                    <Truck className="h-4 w-4" />
                                    Start Delivery
                                </button>
                            )}

                            {canConfirmDeliveryAction && (
                                <button
                                    onClick={() =>
                                        setShowDeliveryForm(true)
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Confirm Delivery
                                </button>
                            )}

                            {canConfirmReceipt && (
                                <button
                                    onClick={() =>
                                        handleAction(
                                            () =>
                                                confirmRequesterReceipt(
                                                    request.id,
                                                    request.workspaceId!,
                                                    userId
                                                ),
                                            'confirm receipt'
                                        )
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Confirm Receipt
                                </button>
                            )}



                            {canComplete && (
                                <button
                                    onClick={() =>
                                        handleAction(
                                            () =>
                                                completeRequest(
                                                    request.id,
                                                    userId
                                                ),
                                            'complete'
                                        )
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Complete
                                </button>
                            )}

                            {canReportPaymentAction && (
                                <button
                                    onClick={() =>
                                        setShowPaymentForm(true)
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Report Payment
                                </button>
                            )}
                        </div>

                        {/* DELIVERY FORM */}
                        {showDeliveryForm && (
                            <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                                <h4 className="mb-3 font-medium">
                                    Confirm Delivery
                                </h4>

                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Quantity Delivered
                                        </label>

                                        <input
                                            type="number"
                                            value={quantityDelivered}
                                            onChange={(e) =>
                                                setQuantityDelivered(
                                                    Number(
                                                        e.target.value
                                                    )
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Condition
                                        </label>

                                        <select
                                            value={condition}
                                            onChange={(e) =>
                                                setCondition(
                                                    e.target
                                                        .value as DeliveryCondition
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                                        >
                                            <option value="good">
                                                Good
                                            </option>
                                            <option value="damaged">
                                                Damaged
                                            </option>
                                            <option value="partial">
                                                Partial
                                            </option>
                                            <option value="rejected">
                                                Rejected
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Notes
                                        </label>

                                        <textarea
                                            value={deliveryNotes}
                                            onChange={(e) =>
                                                setDeliveryNotes(
                                                    e.target.value
                                                )
                                            }
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={
                                                handleConfirmDelivery
                                            }
                                            disabled={loading}
                                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                                        >
                                            Confirm
                                        </button>

                                        <button
                                            onClick={() =>
                                                setShowDeliveryForm(
                                                    false
                                                )
                                            }
                                            className="rounded-lg border px-4 py-2 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PAYMENT FORM */}
                        {showPaymentForm && (
                            <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                                <h4 className="mb-3 font-medium">
                                    Report Payment
                                </h4>

                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) =>
                                            setPaymentAmount(
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                        placeholder="Amount"
                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                    />

                                    <select
                                        value={paymentMethod}
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target
                                                    .value as PaymentMethod
                                            )
                                        }
                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <option value="M-Pesa">
                                            M-Pesa
                                        </option>
                                        <option value="Bank Transfer">
                                            Bank Transfer
                                        </option>
                                        <option value="Cash">
                                            Cash
                                        </option>
                                        <option value="Cheque">
                                            Cheque
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>

                                    <input
                                        type="text"
                                        value={
                                            transactionReference
                                        }
                                        onChange={(e) =>
                                            setTransactionReference(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Transaction Reference"
                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                    />

                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) =>
                                            setPaymentDate(
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={
                                                handleReportPayment
                                            }
                                            disabled={loading}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                                        >
                                            Report Payment
                                        </button>

                                        <button
                                            onClick={() =>
                                                setShowPaymentForm(
                                                    false
                                                )
                                            }
                                            className="rounded-lg border px-4 py-2 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* EVIDENCE */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('evidence')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-slate-500" />

                        <h3 className="font-semibold">
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
                        {/* HIDDEN CAMERA INPUT */}
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*,video/*"
                            capture="environment"
                            onChange={handleCameraChange}
                            className="hidden"
                        />

                        {/* HIDDEN FILE INPUT */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*,application/pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div className="mb-5 flex flex-wrap gap-2">
                            {/* CAMERA */}
                            <button
                                onClick={() =>
                                    cameraInputRef.current?.click()
                                }
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                <Camera className="h-4 w-4" />
                                Take Photo / Video
                            </button>

                            {/* FILE UPLOAD */}
                            <button
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Upload className="h-4 w-4" />
                                Upload File
                            </button>
                        </div>

                        {evidence.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                                <Camera className="mx-auto mb-3 h-8 w-8 text-slate-400" />

                                <p className="text-sm font-medium">
                                    No evidence uploaded yet
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Take a photo/video or upload an invoice.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {evidence.map((item) => {
                                    const url =
                                        getEvidenceUrl(item);

                                    const fileName =
                                        item?.fileName ||
                                        item?.file_name ||
                                        item?.name ||
                                        getEvidenceTypeLabel(
                                            item
                                        );

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    {getEvidenceIcon(
                                                        item
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {fileName}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {getEvidenceTypeLabel(
                                                            item
                                                        )}
                                                    </p>

                                                    {item.uploadedAt && (
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {formatDate(
                                                                item.uploadedAt
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {/* VIEW */}
                                                <button
                                                    onClick={() =>
                                                        handleViewEvidence(
                                                            item
                                                        )
                                                    }
                                                    disabled={!url}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    View
                                                </button>

                                                {/* SHARE */}
                                                <button
                                                    onClick={() =>
                                                        handleShareEvidence(
                                                            item
                                                        )
                                                    }
                                                    disabled={!url}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    <Share2 className="h-3.5 w-3.5" />
                                                    Share
                                                </button>

                                                {/* COPY */}
                                                <button
                                                    onClick={() =>
                                                        handleCopyEvidenceLink(
                                                            item
                                                        )
                                                    }
                                                    disabled={!url}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                    Copy Link
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SHARE TAB */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('share')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-slate-500" />

                        <div className="text-left">
                            <h3 className="font-semibold">
                                Share Evidence
                            </h3>

                            <p className="text-xs text-slate-500">
                                Share invoices, photos and delivery videos
                            </p>
                        </div>
                    </div>

                    {expandedSections.share ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                </button>

                {expandedSections.share && (
                    <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        {evidence.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                                <Share2 className="mx-auto mb-2 h-7 w-7 text-slate-400" />

                                <p className="text-sm font-medium">
                                    Nothing to share yet
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Upload evidence first.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {evidence.map((item) => {
                                    const url =
                                        getEvidenceUrl(item);

                                    const fileName =
                                        item?.fileName ||
                                        item?.file_name ||
                                        item?.name ||
                                        'Evidence';

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                                                    {getEvidenceIcon(
                                                        item
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {fileName}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {getEvidenceTypeLabel(
                                                            item
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleShareEvidence(
                                                            item
                                                        )
                                                    }
                                                    disabled={!url}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                    Share
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleCopyEvidenceLink(
                                                            item
                                                        )
                                                    }
                                                    disabled={!url}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    <LinkIcon className="h-4 w-4" />
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* STATUS HISTORY */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('history')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-500" />

                        <h3 className="font-semibold">
                            Status History ({statusHistory.length})
                        </h3>
                    </div>

                    {expandedSections.history ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                </button>

                {expandedSections.history && (
                    <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        {statusHistory.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No status history yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {statusHistory.map(
                                    (entry, index) => (
                                        <div
                                            key={
                                                entry.id ||
                                                index
                                            }
                                            className="flex items-start gap-3"
                                        >
                                            {index === 0 ? (
                                                <CheckCircle className="mt-1 h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <Clock className="mt-1 h-4 w-4 text-slate-400" />
                                            )}

                                            <div>
                                                <p className="text-sm font-medium">
                                                    {statusLabels[
                                                        entry.to
                                                    ] ||
                                                        entry.to}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {formatDate(
                                                        entry.changedAt
                                                    )}

                                                    {entry.changedBy &&
                                                        ` • ${entry.changedBy}`}
                                                </p>

                                                {entry.note && (
                                                    <p className="text-xs text-slate-400">
                                                        {
                                                            entry.note
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* DELIVERIES - UPDATED */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('deliveries')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-slate-500" />
                        <h3 className="font-semibold">
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
                            <p className="text-sm text-slate-500">
                                No deliveries recorded yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {deliveries.map((delivery) => (
                                    <div
                                        key={delivery.id}
                                        className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                                    >
                                        <p className="font-medium">
                                            Delivery #{delivery.deliveryNumber}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {delivery.quantityDelivered}{' '}
                                            {delivery.unit || ''} •{' '}
                                            {delivery.condition}
                                        </p>

                                        {delivery.deliveryDate && (
                                            <p className="text-xs text-slate-400">
                                                {formatDate(delivery.deliveryDate)}
                                            </p>
                                        )}

                                        {/* ✅ Confirmed by */}
                                        {(delivery.confirmedBy || delivery.confirmedAt) && (
                                            <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                                                {delivery.confirmedBy && (
                                                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                                        <span className="font-medium">Confirmed by:</span>{' '}
                                                        {getUserDisplayName(delivery.confirmedBy)}
                                                    </p>
                                                )}
                                                {delivery.confirmedAt && (
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400/70">
                                                        {formatDate(delivery.confirmedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* ✅ Received by */}
                                        {(delivery.receivedBy || delivery.receivedAt) && (
                                            <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/20">
                                                {delivery.receivedBy && (
                                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                                        <span className="font-medium">Received by:</span>{' '}
                                                        {getUserDisplayName(delivery.receivedBy)}
                                                    </p>
                                                )}
                                                {delivery.receivedAt && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400/70">
                                                        {formatDate(delivery.receivedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {delivery.notes && (
                                            <p className="mt-2 text-xs text-slate-500">
                                                {delivery.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* PAYMENTS */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => toggleSection('payments')}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-slate-500" />

                        <h3 className="font-semibold">
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

                        {/* Report Payment button + inline form */}
                        {canReportPaymentAction && (
                            <div className="mb-4">
                                {!showPaymentForm ? (
                                    <button
                                        onClick={() => setShowPaymentForm(true)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Report Payment
                                    </button>
                                ) : (
                                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                                        <h4 className="mb-3 font-medium">
                                            Report Payment
                                        </h4>

                                        <div className="space-y-3">
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) =>
                                                    setPaymentAmount(Number(e.target.value))
                                                }
                                                placeholder="Amount"
                                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                            />

                                            <select
                                                value={paymentMethod}
                                                onChange={(e) =>
                                                    setPaymentMethod(
                                                        e.target.value as PaymentMethod
                                                    )
                                                }
                                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                            >
                                                <option value="M-Pesa">M-Pesa</option>
                                                <option value="Bank Transfer">
                                                    Bank Transfer
                                                </option>
                                                <option value="Cash">Cash</option>
                                                <option value="Cheque">Cheque</option>
                                                <option value="Other">Other</option>
                                            </select>

                                            <input
                                                type="text"
                                                value={transactionReference}
                                                onChange={(e) =>
                                                    setTransactionReference(e.target.value)
                                                }
                                                placeholder="Transaction Reference"
                                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                            />

                                            <input
                                                type="date"
                                                value={paymentDate}
                                                onChange={(e) =>
                                                    setPaymentDate(e.target.value)
                                                }
                                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                            />

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleReportPayment}
                                                    disabled={loading}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                                                >
                                                    Report Payment
                                                </button>

                                                <button
                                                    onClick={() => setShowPaymentForm(false)}
                                                    className="rounded-lg border px-4 py-2 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {payments.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No payments recorded yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">
                                                    {payment.currency}{' '}
                                                    {payment.amount?.toLocaleString()}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    {payment.paymentMethod}{' '}
                                                    •{' '}
                                                    {payment.transactionReference ||
                                                        'No reference'}
                                                </p>

                                                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                                                    {payment.status?.replace(
                                                        '_',
                                                        ' '
                                                    )}
                                                </span>
                                            </div>

                                            <p className="shrink-0 text-xs text-slate-400">
                                                {formatDate(
                                                    payment.paymentDate ||
                                                    payment.createdAt
                                                )}
                                            </p>
                                        </div>

                                        {payment.reportedBy && (
                                            <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/20">
                                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                                    <span className="font-medium">
                                                        Reported by:
                                                    </span>{' '}
                                                    {getUserDisplayName(
                                                        payment.reportedBy
                                                    )}
                                                </p>
                                                {payment.reportedAt && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400/70">
                                                        {formatDate(
                                                            payment.reportedAt
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {payment.verifiedBy && (
                                            <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                                                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                                    <span className="font-medium">
                                                        Verified by:
                                                    </span>{' '}
                                                    {getUserDisplayName(
                                                        payment.verifiedBy
                                                    )}
                                                </p>
                                                {payment.verifiedAt && (
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400/70">
                                                        {formatDate(
                                                            payment.verifiedAt
                                                        )}
                                                    </p>
                                                )}
                                                {payment.verificationNotes && (
                                                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400/70">
                                                        {
                                                            payment.verificationNotes
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {payment.notes && (
                                            <p className="mt-2 text-xs text-slate-500">
                                                {payment.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}