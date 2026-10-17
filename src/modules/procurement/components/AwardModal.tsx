import React, { useState, useEffect } from 'react';
import {
    X,
    Award,
    FileText,
    Building2,
    DollarSign,
    Calendar,
    User,
    CheckCircle,
    AlertCircle,
    Save,
    Download,
    Send,
} from 'lucide-react';

import { useProcurement } from '../hooks/useProcurement';
import type { Quotation, RFQ } from '../domain';

interface AwardModalProps {
    isOpen: boolean;
    quotation: Quotation | null;
    rfq: RFQ | null;
    projectId: string;
    onClose: () => void;
    onAwarded?: () => void;
}

export function AwardModal({
    isOpen,
    quotation,
    rfq,
    projectId,
    onClose,
    onAwarded,
}: AwardModalProps) {
    const { createAward, loading, error } = useProcurement({
        projectId,
        autoLoad: false,
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [purchaseOrderRef, setPurchaseOrderRef] = useState('');
    const [contractRef, setContractRef] = useState('');
    const [notes, setNotes] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && quotation) {
            // Generate purchase order reference
            const poNumber = `PO-${Date.now().toString().slice(-6)}`;
            setPurchaseOrderRef(poNumber);
            setContractRef(`CON-${Date.now().toString().slice(-6)}`);
            setNotes('');
            setFormError(null);
            setSuccess(false);
        }
    }, [isOpen, quotation]);

    if (!isOpen || !quotation || !rfq) {
        return null;
    }

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!purchaseOrderRef.trim()) {
            setFormError('Purchase Order reference is required.');
            return;
        }

        try {
            await createAward({
                quotationId: quotation.id,
                rfqId: rfq.id,
                projectId: projectId,
                providerName: quotation.providerName,
                title: `Award: ${rfq.title}`,
                description: `Awarded to ${quotation.providerName} for ${rfq.title}\n\nTotal: ${quotation.currency} ${quotation.total.toLocaleString()}`,
                amount: quotation.total,
                currency: quotation.currency || 'KES',
                purchaseOrderReference: purchaseOrderRef.trim(),
                contractReference: contractRef.trim() || undefined,
                approvedBy: 'current-user-id', // TODO: Get from auth
                approvedAt: new Date().toISOString(),
                notes: notes.trim() || undefined,
            });

            setSuccess(true);
            setTimeout(() => {
                onAwarded?.();
                onClose();
            }, 1500);
        } catch (err) {
            setFormError(
                err instanceof Error ? err.message : 'Failed to create award.'
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
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

                {/* ======================================================
            HEADER
        ====================================================== */}

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/10">
                            <Award className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Award Procurement
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {rfq.reference} — {quotation.providerName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading || success}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* ======================================================
            CONTENT
        ====================================================== */}

                {success ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                            Award Created Successfully!
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Purchase Order {purchaseOrderRef} has been issued to {quotation.providerName}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            The award has been recorded and linked to the project.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                        <div className="space-y-6 p-6">

                            {/* ==================================================
                  SUMMARY
              ================================================== */}

                            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Supplier</p>
                                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                            {quotation.providerName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
                                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-emerald-500" />
                                            {quotation.currency} {quotation.total.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">RFQ Reference</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{rfq.reference}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Delivery Terms</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {quotation.deliveryTerms || 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* ==================================================
                  ERROR
              ================================================== */}

                            {(formError || error) && (
                                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span>{formError || error}</span>
                                </div>
                            )}

                            {/* ==================================================
                  AWARD DETAILS
              ================================================== */}

                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-500" />
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Award Details
                                    </h3>
                                </div>

                                {/* Purchase Order Reference */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Purchase Order Reference <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={purchaseOrderRef}
                                        onChange={(e) => setPurchaseOrderRef(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        placeholder="e.g. PO-2024-001"
                                    />
                                </div>

                                {/* Contract Reference */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Contract Reference
                                    </label>
                                    <input
                                        type="text"
                                        value={contractRef}
                                        onChange={(e) => setContractRef(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        placeholder="e.g. CON-2024-001"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Notes
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        disabled={loading}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        placeholder="Add any additional notes about this award..."
                                    />
                                </div>
                            </section>

                            {/* ==================================================
                  SUMMARY BOX
              ================================================== */}

                            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                            About to Award
                                        </p>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                            This will create a formal award record and generate a purchase order.
                                            The award will be linked to the project and can be tracked in the procurement dashboard.
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* ====================================================
                FOOTER
            ==================================================== */}

                        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Awarding...
                                    </>
                                ) : (
                                    <>
                                        <Award className="h-4 w-4" />
                                        Issue Award
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                )}

            </div>
        </div>
    );
}