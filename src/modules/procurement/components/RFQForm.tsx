import React, { useState, useEffect } from 'react';
import {
    X,
    Send,
    Plus,
    Trash2,
    Users,
    Calendar,
    FileText,
    AlertCircle,
    UserPlus,
    UserMinus,
} from 'lucide-react';

import { useProcurement } from '../hooks/useProcurement';
import { generateUUID } from '../../../utils/uuid';  // ✅ ADD THIS

import type {
    ProcurementRequest,
    RFQ,
    RFQSupplier,
    RFQSupplierStatus,
} from '../domain';

interface RFQFormProps {
    isOpen: boolean;
    request: ProcurementRequest | null;
    projectId?: string;
    onClose: () => void;
    onCreated?: (rfq: RFQ) => void;
}

interface SupplierInput {
    id: string;
    name: string;
    email?: string;
}

export function RFQForm({
    isOpen,
    request,
    projectId,
    onClose,
    onCreated,
}: RFQFormProps) {
    const { createRFQ, loading, error } = useProcurement({
        projectId: projectId || '',
        autoLoad: false,
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [terms, setTerms] = useState('');
    const [suppliers, setSuppliers] = useState<SupplierInput[]>([
        { id: generateUUID(), name: '', email: '' },  // ✅ FIXED
    ]);

    // Initialize form when request changes
    useEffect(() => {
        if (request && isOpen) {
            setTitle(`RFQ: ${request.title}`);
            setDescription(`Request for Quotation for: ${request.title}\n\n${request.description || ''}`);

            // Set default deadline to 7 days from now
            const defaultDeadline = new Date();
            defaultDeadline.setDate(defaultDeadline.getDate() + 7);
            setDeadline(defaultDeadline.toISOString().split('T')[0]);

            setTerms('Standard terms and conditions apply. Delivery to project site.');
            setSuppliers([{ id: generateUUID(), name: '', email: '' }]);  // ✅ FIXED
            setFormError(null);
        }
    }, [request, isOpen]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormError(null);
        }
    }, [isOpen]);

    if (!isOpen || !request) {
        return null;
    }

    // ============================================================
    // SUPPLIER MANAGEMENT
    // ============================================================

    const addSupplier = () => {
        setSuppliers((prev) => [
            ...prev,
            { id: generateUUID(), name: '', email: '' },  // ✅ FIXED
        ]);
    };

    const removeSupplier = (id: string) => {
        setSuppliers((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((s) => s.id !== id);
        });
    };

    const updateSupplier = (
        id: string,
        field: 'name' | 'email',
        value: string
    ) => {
        setSuppliers((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, [field]: value } : s
            )
        );
    };

    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        // Validation
        if (!title.trim()) {
            setFormError('RFQ title is required.');
            return;
        }

        if (!deadline) {
            setFormError('Please specify a deadline for suppliers.');
            return;
        }

        // Validate at least one supplier with a name
        const validSuppliers = suppliers.filter((s) => s.name.trim());
        if (validSuppliers.length === 0) {
            setFormError('Please add at least one supplier.');
            return;
        }

        // Build supplier list for RFQ
        const rfqSuppliers: RFQSupplier[] = validSuppliers.map((s) => ({
            id: s.id,
            supplierName: s.name.trim(),
            invitedAt: new Date().toISOString(),
            responded: false,
            status: 'invited' as RFQSupplierStatus,
            email: s.email?.trim() || undefined,
        }));

        try {
            const rfq = await createRFQ({
                requestId: request.id,
                projectId: request.projectId,
                title: title.trim(),
                description: description.trim() || '',
                suppliers: rfqSuppliers,
                deadline: deadline,
                terms: terms.trim() || undefined,
                issuedAt: undefined,
                closedAt: undefined,
                createdBy: undefined,
            });

            onCreated?.(rfq);
            onClose();
        } catch (err) {
            setFormError(
                err instanceof Error ? err.message : 'Failed to create RFQ.'
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

                {/* HEADER */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/10">
                            <Send className="h-5 w-5 text-amber-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Create RFQ
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {request.reference} — {request.title}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="space-y-6 p-6">

                        {/* ERROR DISPLAY */}
                        {(formError || error) && (
                            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span>{formError || error}</span>
                            </div>
                        )}

                        {/* REQUEST INFO */}
                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Request Reference</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{request.reference}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                                    <p className="font-medium text-slate-900 dark:text-white capitalize">{request.category}</p>
                                </div>
                                {request.quantity && (
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Quantity</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{request.quantity} {request.unit || ''}</p>
                                    </div>
                                )}
                                {request.budget && (
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Budget</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{request.currency} {request.budget.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* RFQ DETAILS */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    RFQ Details
                                </h3>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    RFQ Title <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    disabled={loading}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Deadline + Terms */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            Deadline <span className="text-red-500">*</span>
                                        </span>
                                    </label>

                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Terms & Conditions
                                    </label>

                                    <input
                                        type="text"
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                        placeholder="e.g. Delivery within 14 days of PO"
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* SUPPLIERS */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-500" />
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                            Suppliers
                                        </h3>
                                        <span className="text-xs text-slate-400">
                                            ({suppliers.filter((s) => s.name.trim()).length} added)
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Invite suppliers to submit quotations.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSupplier}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Add Supplier
                                </button>
                            </div>

                            <div className="space-y-3">
                                {suppliers.map((supplier) => (
                                    <div
                                        key={supplier.id}
                                        className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start"
                                    >
                                        <input
                                            type="text"
                                            value={supplier.name}
                                            onChange={(e) =>
                                                updateSupplier(
                                                    supplier.id,
                                                    'name',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Supplier name *"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />

                                        <input
                                            type="email"
                                            value={supplier.email || ''}
                                            onChange={(e) =>
                                                updateSupplier(
                                                    supplier.id,
                                                    'email',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Email (optional)"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeSupplier(supplier.id)}
                                            disabled={loading || suppliers.length === 1}
                                            className="rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {suppliers.filter((s) => s.name.trim()).length === 0 && (
                                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/20">
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        <AlertCircle className="inline h-4 w-4 mr-1.5" />
                                        Add at least one supplier to create the RFQ.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* TECHNICAL NOTE */}
                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                Once the RFQ is issued, suppliers will be able to submit quotations.
                                You can track responses and compare quotes from the procurement dashboard.
                            </p>
                        </section>

                    </div>

                    {/* FOOTER */}
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
                            disabled={loading || suppliers.filter((s) => s.name.trim()).length === 0}
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Issue RFQ
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}