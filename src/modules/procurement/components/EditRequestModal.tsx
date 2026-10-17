import React, { useState, useEffect } from 'react';
import {
    X,
    Package,
    Calendar,
    MapPin,
    DollarSign,
    FileText,
    Save,
    AlertCircle,
    Plus,
    Trash2,
} from 'lucide-react';

import { useProcurement } from '../hooks/useProcurement';
import { generateUUID } from '../../../utils/uuid';  // ✅ ADD THIS

import type {
    ProcurementCategory,
    ProcurementRequest,
} from '../domain';

interface EditRequestModalProps {
    isOpen: boolean;
    request: ProcurementRequest | null;
    projectId?: string;
    onClose: () => void;
    onUpdated?: (request: ProcurementRequest) => void;
}

interface SpecificationRow {
    id: string;
    key: string;
    value: string;
}

export function EditRequestModal({
    isOpen,
    request,
    projectId,
    onClose,
    onUpdated,
}: EditRequestModalProps) {
    const { updateRequest, loading, error } = useProcurement({
        projectId: projectId || '',
        autoLoad: false,
    });

    const [formError, setFormError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ProcurementCategory>('material');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [requiredDate, setRequiredDate] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [budget, setBudget] = useState('');
    const [currency, setCurrency] = useState('KES');
    const [specifications, setSpecifications] = useState<SpecificationRow[]>([
        { id: generateUUID(), key: '', value: '' },  // ✅ FIXED
    ]);

    // Initialize form when request changes
    useEffect(() => {
        if (request && isOpen) {
            setTitle(request.title || '');
            setDescription(request.description || '');
            setCategory(request.category || 'material');
            setQuantity(request.quantity?.toString() || '');
            setUnit(request.unit || '');
            setRequiredDate(request.requiredDate || '');
            setDeliveryLocation(request.deliveryLocation || '');
            setBudget(request.budget?.toString() || '');
            setCurrency(request.currency || 'KES');

            // Initialize specifications from request
            if (request.specifications && Object.keys(request.specifications).length > 0) {
                const specs = Object.entries(request.specifications).map(([key, value]) => ({
                    id: generateUUID(),  // ✅ FIXED
                    key,
                    value: String(value),
                }));
                setSpecifications(specs);
            } else {
                setSpecifications([{ id: generateUUID(), key: '', value: '' }]);  // ✅ FIXED
            }

            setFormError(null);
        }
    }, [request, isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormError(null);
        }
    }, [isOpen]);

    if (!isOpen || !request) {
        return null;
    }

    // ============================================================
    // SPECIFICATIONS
    // ============================================================

    const addSpecification = () => {
        setSpecifications((prev) => [
            ...prev,
            { id: generateUUID(), key: '', value: '' },  // ✅ FIXED
        ]);
    };

    const removeSpecification = (id: string) => {
        setSpecifications((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((item) => item.id !== id);
        });
    };

    const updateSpecification = (
        id: string,
        field: 'key' | 'value',
        value: string
    ) => {
        setSpecifications((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
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
            setFormError('Procurement request title is required.');
            return;
        }

        if (!description.trim()) {
            setFormError('Please provide a description.');
            return;
        }

        const parsedQuantity = quantity.trim() !== ''
            ? Number(quantity)
            : undefined;

        const parsedBudget = budget.trim() !== ''
            ? Number(budget)
            : undefined;

        if (parsedQuantity !== undefined && (isNaN(parsedQuantity) || parsedQuantity < 0)) {
            setFormError('Quantity must be a valid positive number.');
            return;
        }

        if (parsedBudget !== undefined && (isNaN(parsedBudget) || parsedBudget < 0)) {
            setFormError('Budget must be a valid positive number.');
            return;
        }

        // Build specifications object
        const specificationObject: Record<string, unknown> = {};
        specifications.forEach((item) => {
            const key = item.key.trim();
            const value = item.value.trim();
            if (key) {
                specificationObject[key] = value;
            }
        });

        try {
            const updated = await updateRequest(request.id, {
                title: title.trim(),
                description: description.trim(),
                category,
                quantity: parsedQuantity,
                unit: unit.trim() || undefined,
                requiredDate: requiredDate || undefined,
                deliveryLocation: deliveryLocation.trim() || undefined,
                budget: parsedBudget,
                currency: currency || 'KES',
                specifications: specificationObject,
                status: request.status, // Keep existing status
            });

            onUpdated?.(updated);
            onClose();
        } catch (err) {
            setFormError(
                err instanceof Error ? err.message : 'Failed to update procurement request.'
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
                            <Package className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Edit Procurement Request
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {request.reference}
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

                        {/* BASIC INFORMATION */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Basic Information
                                </h3>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Request Title <span className="text-red-500">*</span>
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
                                    Description <span className="text-red-500">*</span>
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the procurement requirement..."
                                    rows={4}
                                    disabled={loading}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Category + Currency */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Procurement Category
                                    </label>

                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as ProcurementCategory)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="material">Material</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="professional">Professional</option>
                                        <option value="service">Service</option>
                                        <option value="technology">Technology</option>
                                        <option value="energy">Energy</option>
                                        <option value="transport">Transport</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Currency
                                    </label>

                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="KES">KES — Kenyan Shilling</option>
                                        <option value="USD">USD — US Dollar</option>
                                        <option value="EUR">EUR — Euro</option>
                                        <option value="GBP">GBP — British Pound</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* QUANTITY & BUDGET */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                Quantity & Budget
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
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
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        placeholder="e.g. tonnes, pcs, m³"
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Budget
                                    </label>

                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            placeholder="0.00"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* DELIVERY REQUIREMENTS */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                Delivery Requirements
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            Required Date
                                        </span>
                                    </label>

                                    <input
                                        type="date"
                                        value={requiredDate}
                                        onChange={(e) => setRequiredDate(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            Delivery Location
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={deliveryLocation}
                                        onChange={(e) => setDeliveryLocation(e.target.value)}
                                        placeholder="e.g. Main construction site"
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* SPECIFICATIONS */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Specifications
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Add or update technical requirements for suppliers.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Specification
                                </button>
                            </div>

                            <div className="space-y-3">
                                {specifications.map((specification) => (
                                    <div
                                        key={specification.id}
                                        className="grid grid-cols-[1fr_1fr_auto] gap-3"
                                    >
                                        <input
                                            type="text"
                                            value={specification.key}
                                            onChange={(e) =>
                                                updateSpecification(
                                                    specification.id,
                                                    'key',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Specification (e.g. Grade)"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />

                                        <input
                                            type="text"
                                            value={specification.value}
                                            onChange={(e) =>
                                                updateSpecification(
                                                    specification.id,
                                                    'value',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Requirement (e.g. Y16)"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeSpecification(specification.id)}
                                            disabled={loading || specifications.length === 1}
                                            className="rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* TECHNICAL NOTE */}
                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                Technical specifications, drawings, RFIs, and linked
                                project records can be attached after the procurement
                                request has been created.
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
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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

            </div>
        </div>
    );
}